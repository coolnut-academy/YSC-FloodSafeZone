/* ==========================================================================
   APP MAIN CONTROLLER (PURE LIGHT LABORATORY DASHBOARD)
   ========================================================================== */

const App = {
  state: {
    lambda: 5.0,
    waterScale: 1.0,
    debris: 0.15,
    powerP: 1.5,
    weights: [0.35, 0.25, 0.25, 0.15],
    selectedZoneId: null,
    selectedEdge: null,
    currentScenario: "s2"
  },

  computedEdges: [],
  routeResults: {},
  topsisData: null,
  solverComparison: [],

  init() {
    MapVisualizer.init(
      "maplibreContainer",
      edge => this.openEdgeInspector(edge),
      zoneId => this.selectShelter(zoneId)
    );

    this.bindEvents();
    this.recomputeAll();
    this.fetchLiveAPIData();
  },

  // Central Pipeline Execution with Real-Time Timing
  recomputeAll() {
    const t0 = performance.now();

    // 1. Read input values from Settings Drawer
    this.state.lambda = parseFloat(document.getElementById("paramLambda").value);
    this.state.waterScale = parseFloat(document.getElementById("paramWater").value);
    this.state.debris = parseFloat(document.getElementById("paramDebris").value);
    this.state.powerP = parseFloat(document.getElementById("paramPowerP").value);

    const w1 = parseFloat(document.getElementById("weightW1").value);
    const w2 = parseFloat(document.getElementById("weightW2").value);
    const w3 = parseFloat(document.getElementById("weightW3").value);
    const w4 = parseFloat(document.getElementById("weightW4").value);
    this.state.weights = [w1, w2, w3, w4];

    // Update UI numerical labels
    document.getElementById("valLambda").textContent = this.state.lambda.toFixed(2);
    document.getElementById("valWater").textContent = this.state.waterScale.toFixed(2) + "×";
    document.getElementById("valDebris").textContent = this.state.debris.toFixed(2);
    document.getElementById("valPowerP").textContent = this.state.powerP.toFixed(2);

    const sumW = w1 + w2 + w3 + w4;
    document.getElementById("valW1").textContent = (w1 / sumW).toFixed(2);
    document.getElementById("valW2").textContent = (w2 / sumW).toFixed(2);
    document.getElementById("valW3").textContent = (w3 / sumW).toFixed(2);
    document.getElementById("valW4").textContent = (w4 / sumW).toFixed(2);

    // 2. Compute FHEG Edges
    this.computedEdges = MAEHONGSON_EDGES.map(base => {
      const u = MAEHONGSON_NODES[base.from];
      const v = MAEHONGSON_NODES[base.to];
      const length = FHEG_Math.haversine(u.lat, u.lon, v.lat, v.lon);
      const slope = FHEG_Math.calculateSlope(u.z, v.z, length);

      const he = base.baseDepth * this.state.waterScale;
      const ve = base.baseVelocity * Math.sqrt(this.state.waterScale);
      const De = this.state.debris * (base.floodRisk === "safe" ? 0.0 : (base.floodRisk === "low" ? 0.4 : 1.0));

      const He = FHEG_Math.calculateHazard(he, ve, De);
      const feasible = FHEG_Math.isFeasible(He, CONFIG.Hc);
      const phi = feasible ? FHEG_Math.hazardAttenuation(He, this.state.powerP) : 0;
      const baseSpeed = FHEG_Math.toblerSpeed(slope);
      const effectiveSpeed = FHEG_Math.effectiveSpeed(slope, He, this.state.powerP);
      const te = feasible ? FHEG_Math.calculateTravelTime(length, effectiveSpeed) : Infinity;
      const re = feasible ? FHEG_Math.calculateRiskTerm(te, He, CONFIG.defaultQ, CONFIG.Hc) : Infinity;
      const weight = feasible ? FHEG_Math.calculateEdgeWeight(te, re, this.state.lambda) : Infinity;

      return {
        ...base,
        length,
        slope,
        he,
        ve,
        De,
        He,
        feasible,
        phi,
        baseSpeed,
        effectiveSpeed,
        te,
        re,
        weight
      };
    });

    // 3. Solve Path to all Shelters using A* and Dijkstra
    const shelters = ["Z1", "Z2", "Z3", "Z4"];
    this.routeResults = {};
    this.solverComparison = [];

    shelters.forEach(zId => {
      const aStar = GraphSolvers.aStar("S", zId, MAEHONGSON_NODES, this.computedEdges);
      const dijkstra = GraphSolvers.dijkstra("S", zId, MAEHONGSON_NODES, this.computedEdges);

      let totalDist = 0;
      let totalTime = 0;
      let totalRisk = 0;

      if (aStar.path.length > 1) {
        for (let i = 0; i < aStar.path.length - 1; i++) {
          const u = aStar.path[i];
          const v = aStar.path[i + 1];
          const edge = this.computedEdges.find(e => e.from === u && e.to === v);
          if (edge) {
            totalDist += edge.length;
            totalTime += edge.te;
            totalRisk += edge.re;
          }
        }
      }

      this.routeResults[zId] = {
        zoneId: zId,
        name: MAEHONGSON_NODES[zId].name,
        feasible: aStar.cost < Infinity,
        cost: aStar.cost,
        path: aStar.path,
        distance: totalDist,
        travelTime: totalTime,
        riskTime: totalRisk,
        aStarResult: aStar,
        dijkstraResult: dijkstra
      };

      const diff = Math.abs(aStar.cost - dijkstra.cost);
      this.solverComparison.push({
        zoneId: zId,
        aStarCost: aStar.cost,
        dijkstraCost: dijkstra.cost,
        diff: isFinite(diff) ? diff : 0,
        aStarNodes: aStar.expandedNodes,
        dijkstraNodes: dijkstra.expandedNodes,
        runtime: (aStar.runtimeMs + dijkstra.runtimeMs) / 2,
        verified: isFinite(aStar.cost) ? (diff < CONFIG.toleranceEpsilon) : true
      });
    });

    // 4. TOPSIS Multi-Criteria Safe-Zone Ranking
    this.topsisData = TOPSIS_Engine.compute(
      shelters,
      MAEHONGSON_NODES,
      this.routeResults,
      this.state.weights
    );

    // Auto-select optimal route if none selected
    const feasibleRoutes = Object.values(this.routeResults).filter(r => r.feasible);
    if (feasibleRoutes.length > 0) {
      if (!this.state.selectedZoneId || !this.routeResults[this.state.selectedZoneId]?.feasible) {
        feasibleRoutes.sort((a, b) => a.cost - b.cost);
        this.state.selectedZoneId = feasibleRoutes[0].zoneId;
      }
    } else {
      this.state.selectedZoneId = null;
    }

    const t1 = performance.now();
    const execTime = (t1 - t0);

    // 5. Update Visualizers, KPI cards, and Map
    this.renderUI(execTime);
  },

  renderUI(execTimeMs) {
    const feasibleCount = this.computedEdges.filter(e => e.feasible).length;
    const bestRoute = this.state.selectedZoneId ? this.routeResults[this.state.selectedZoneId] : null;
    const rank1Item = this.topsisData?.results?.find(r => r.rank === 1);

    // Update Top KPI Cards
    LiveComputeAnim.updateKPIs(
      execTimeMs,
      feasibleCount,
      bestRoute?.cost,
      rank1Item,
      this.state.selectedZoneId,
      this.routeResults
    );

    // Render 3D Map
    MapVisualizer.renderNetwork(
      MAEHONGSON_NODES,
      this.computedEdges,
      this.topsisData,
      this.state.selectedZoneId,
      this.routeResults
    );

    // Render Tables
    this.renderRouteTable();
    this.renderTOPSISTables();
    this.renderVerificationTable();

    // Render Charts
    ChartVisualizer.renderSwitching("switchingChart", this.routeResults, this.state.lambda);
    ChartVisualizer.renderSensitivity("sensitivityFloodChart", "attenuationChart", this.state.powerP);

    // Render KaTeX Math
    if (window.renderMathInElement) {
      renderMathInElement(document.body, {
        delimiters: [
          { left: "$$", right: "$$", display: true },
          { left: "$", right: "$", display: false }
        ]
      });
    }
  },

  renderRouteTable() {
    const tbody = document.getElementById("routeTableBody");
    if (!tbody) return;
    tbody.innerHTML = "";

    const sorted = Object.values(this.routeResults).sort((a, b) => (a.cost || 9999) - (b.cost || 9999));

    sorted.forEach(r => {
      const tr = document.createElement("tr");
      const isSelected = this.state.selectedZoneId === r.zoneId;
      if (isSelected) tr.className = "selected-row";

      const topsis = this.topsisData?.results?.find(t => t.zoneId === r.zoneId);
      const statusBadge = !r.feasible
        ? '<span class="badge badge-red">BLOCKED</span>'
        : (isSelected ? '<span class="badge badge-cyan">OPTIMAL</span>' : '<span class="badge badge-green">FEASIBLE</span>');

      tr.innerHTML = `
        <td><strong>${r.zoneId}</strong></td>
        <td style="font-family:inherit;">${r.name}</td>
        <td>${r.feasible ? r.distance.toFixed(0) + " m" : "—"}</td>
        <td>${r.feasible ? r.travelTime.toFixed(2) + " min" : "—"}</td>
        <td>${r.feasible ? r.riskTime.toFixed(2) + " min-eq" : "—"}</td>
        <td><strong>${r.feasible ? r.cost.toFixed(2) : "—"}</strong></td>
        <td>${topsis ? topsis.closeness.toFixed(4) + ` (#${topsis.rank})` : "—"}</td>
        <td>${statusBadge}</td>
      `;

      tr.style.cursor = "pointer";
      tr.onclick = () => {
        if (r.feasible) {
          this.selectShelter(r.zoneId);
        }
      };
      tbody.appendChild(tr);
    });
  },

  renderTOPSISTables() {
    const rawBody = document.getElementById("topsisRawBody");
    const resBody = document.getElementById("topsisResultBody");
    if (!rawBody || !resBody || !this.topsisData) return;

    rawBody.innerHTML = "";
    resBody.innerHTML = "";

    this.topsisData.results.forEach(t => {
      const rawTr = document.createElement("tr");
      rawTr.innerHTML = `
        <td><strong>${t.zoneId}</strong> (${MAEHONGSON_NODES[t.zoneId].name.split(" ")[0]})</td>
        <td>${t.raw[0] > 500 ? "Infeasible" : t.raw[0].toFixed(2)}</td>
        <td>${t.raw[1].toFixed(1)} m</td>
        <td>${t.raw[2].toFixed(0)} m</td>
        <td>${t.raw[3].toLocaleString()} คน</td>
      `;
      rawBody.appendChild(rawTr);

      const resTr = document.createElement("tr");
      resTr.innerHTML = `
        <td><strong>${t.zoneId}</strong></td>
        <td>${t.dPlus.toFixed(4)}</td>
        <td>${t.dMinus.toFixed(4)}</td>
        <td><strong style="color:var(--cyan-primary);">${t.closeness.toFixed(4)}</strong></td>
        <td><span class="badge ${t.rank === 1 ? 'badge-cyan' : 'badge-green'}">RANK #${t.rank}</span></td>
      `;
      resBody.appendChild(resTr);
    });
  },

  renderVerificationTable() {
    const tbody = document.getElementById("solverVerifyBody");
    if (!tbody) return;
    tbody.innerHTML = "";

    let allPassed = true;
    let maxError = 0;

    this.solverComparison.forEach(s => {
      if (!s.verified) allPassed = false;
      if (s.diff > maxError) maxError = s.diff;

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><strong>${s.zoneId}</strong></td>
        <td>${isFinite(s.aStarCost) ? s.aStarCost.toFixed(6) : "Infinity"}</td>
        <td>${isFinite(s.dijkstraCost) ? s.dijkstraCost.toFixed(6) : "Infinity"}</td>
        <td>${s.diff.toExponential(4)}</td>
        <td>${s.aStarNodes}</td>
        <td>${s.dijkstraNodes}</td>
        <td>${s.runtime.toFixed(2)} ms</td>
        <td>${s.verified ? '<span class="badge badge-green">PASS</span>' : '<span class="badge badge-red">FAIL</span>'}</td>
      `;
      tbody.appendChild(tr);
    });

    document.getElementById("verifyOverallBadge").textContent = allPassed ? "PASS (100%)" : "FAIL";
    document.getElementById("verifyOverallBadge").style.color = allPassed ? "var(--green-primary)" : "var(--red-primary)";
    document.getElementById("verifyMaxError").textContent = maxError.toExponential(4);
  },

  selectShelter(zoneId) {
    if (this.routeResults[zoneId]?.feasible) {
      this.state.selectedZoneId = zoneId;
      MapVisualizer.renderNetwork(
        MAEHONGSON_NODES,
        this.computedEdges,
        this.topsisData,
        this.state.selectedZoneId,
        this.routeResults
      );
      this.renderRouteTable();
      LiveComputeAnim.updateKPIs(
        0.8,
        this.computedEdges.filter(e => e.feasible).length,
        this.routeResults[zoneId].cost,
        this.topsisData?.results?.find(r => r.rank === 1),
        this.state.selectedZoneId,
        this.routeResults
      );
    }
  },

  openEdgeInspector(edge) {
    this.state.selectedEdge = edge;
    document.getElementById("inspectEdgeId").textContent = edge.id;
    document.getElementById("inspectFrom").textContent = `${edge.from} (${MAEHONGSON_NODES[edge.from].name})`;
    document.getElementById("inspectTo").textContent = `${edge.to} (${MAEHONGSON_NODES[edge.to].name})`;
    document.getElementById("inspectLength").textContent = `${edge.length.toFixed(1)} m`;
    document.getElementById("inspectElevation").textContent = `${MAEHONGSON_NODES[edge.from].z.toFixed(1)}m → ${MAEHONGSON_NODES[edge.to].z.toFixed(1)}m`;
    document.getElementById("inspectSlope").textContent = `${(edge.slope * 100).toFixed(2)}%`;

    document.getElementById("inspectDepth").textContent = `${edge.he.toFixed(2)} m`;
    document.getElementById("inspectVelocity").textContent = `${edge.ve.toFixed(2)} m/s`;
    document.getElementById("inspectDebris").textContent = edge.De.toFixed(2);
    document.getElementById("inspectHazard").textContent = edge.He.toFixed(4);

    const badge = document.getElementById("inspectFeasibleBadge");
    if (edge.feasible) {
      badge.className = "badge badge-green";
      badge.textContent = "FEASIBLE (H < 1.25)";
    } else {
      badge.className = "badge badge-red";
      badge.textContent = "BLOCKED (H ≥ 1.25)";
    }

    const calcText = `
[Step 1: Topography & Slope]
  s_e = (z_j - z_i) / L_e = (${MAEHONGSON_NODES[edge.to].z.toFixed(1)} - ${MAEHONGSON_NODES[edge.from].z.toFixed(1)}) / ${edge.length.toFixed(1)} = ${(edge.slope * 100).toFixed(2)}%

[Step 2: Flood Hazard Function]
  H_e = h_e * (v_e + 0.5) + D_e
      = ${edge.he.toFixed(2)} * (${edge.ve.toFixed(2)} + 0.5) + ${edge.De.toFixed(2)}
      = ${edge.He.toFixed(4)}
  Feasibility: H_e ${edge.feasible ? '<' : '≥'} 1.25 ==> ${edge.feasible ? 'INCLUDED IN G_F' : 'REMOVED / CUTOFF'}

[Step 3: Attenuation & Walking Speed]
  phi_p(H_e) = ((1.25 - ${edge.He.toFixed(3)}) / (1.25 - 0.25))^p = ${edge.phi.toFixed(4)}
  Base Speed (Tobler) = ${edge.baseSpeed.toFixed(1)} m/min (${(edge.baseSpeed * 0.06).toFixed(2)} km/h)
  Effective Speed u_e = ${edge.effectiveSpeed.toFixed(1)} m/min (${(edge.effectiveSpeed * 0.06).toFixed(2)} km/h)

[Step 4: Cost Calculation]
  Travel Time t_e = L_e / u_e = ${edge.length.toFixed(1)} / ${edge.effectiveSpeed.toFixed(1)} = ${edge.te.toFixed(3)} min
  Risk Time r_e   = ${isFinite(edge.re) ? edge.re.toFixed(3) + ' min-eq' : 'Infinity'}
  FHEG Weight w_e = t_e + λ * r_e = ${isFinite(edge.weight) ? edge.weight.toFixed(3) : 'Infinity'}
    `;

    document.getElementById("inspectCalcText").textContent = calcText;
    document.getElementById("modalEdgeInspector").classList.add("open");
  },

  async fetchLiveAPIData() {
    try {
      const floodUrl = `${CONFIG.apis.flood}?latitude=${CONFIG.studyArea.lat}&longitude=${CONFIG.studyArea.lon}&daily=river_discharge&forecast_days=1`;
      const weatherUrl = `${CONFIG.apis.weather}?latitude=${CONFIG.studyArea.lat}&longitude=${CONFIG.studyArea.lon}&current=precipitation`;

      const [floodRes, weatherRes] = await Promise.all([
        fetch(floodUrl).then(r => r.json()).catch(() => null),
        fetch(weatherUrl).then(r => r.json()).catch(() => null)
      ]);

      if (floodRes?.daily?.river_discharge?.[0]) {
        const discharge = floodRes.daily.river_discharge[0];
        document.getElementById("kpiPaiFlow").textContent = `${discharge.toFixed(1)} m³/s`;
      }
    } catch (err) {
      console.warn("Live API ingestion fallback:", err);
    }
  },

  bindEvents() {
    // Preset Buttons
    document.querySelectorAll(".preset-btn-chip").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".preset-btn-chip").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        const p = btn.dataset.preset;
        this.state.currentScenario = p;

        if (p === "s1") {
          document.getElementById("paramLambda").value = 2.0;
          document.getElementById("paramWater").value = 0.65;
          document.getElementById("paramDebris").value = 0.05;
        } else if (p === "s2") {
          document.getElementById("paramLambda").value = 5.0;
          document.getElementById("paramWater").value = 1.0;
          document.getElementById("paramDebris").value = 0.15;
        } else if (p === "s3") {
          document.getElementById("paramLambda").value = 12.0;
          document.getElementById("paramWater").value = 1.65;
          document.getElementById("paramDebris").value = 0.40;
        }
        this.recomputeAll();
      });
    });

    // Zone Filter Pills
    document.getElementById("pillRedZone").addEventListener("click", function() {
      const active = MapVisualizer.toggleZone("red");
      this.classList.toggle("active", active);
    });
    document.getElementById("pillYellowZone").addEventListener("click", function() {
      const active = MapVisualizer.toggleZone("yellow");
      this.classList.toggle("active", active);
    });
    document.getElementById("pillGreenZone").addEventListener("click", function() {
      const active = MapVisualizer.toggleZone("green");
      this.classList.toggle("active", active);
    });

    // 2D / 3D Toggle
    document.getElementById("btnToggle3D").addEventListener("click", function() {
      const is3D = MapVisualizer.toggle3DView();
      this.textContent = is3D ? "3D View (55°)" : "2D Top-Down";
    });

    document.getElementById("btnResetMap").addEventListener("click", () => {
      MapVisualizer.resetCenter();
    });

    // Simulation Button
    document.getElementById("btnSimulateSolver").addEventListener("click", () => {
      if (this.state.selectedZoneId && this.routeResults[this.state.selectedZoneId]?.aStarResult) {
        LiveComputeAnim.simulateSearch(
          MapVisualizer,
          this.routeResults[this.state.selectedZoneId].aStarResult,
          MAEHONGSON_NODES
        );
      }
    });

    // Settings Drawer Controls
    const drawerSettings = document.getElementById("drawerSettings");
    document.getElementById("btnOpenSettings").onclick = () => drawerSettings.classList.add("open");
    document.getElementById("btnCloseSettings").onclick = () => drawerSettings.classList.remove("open");
    document.getElementById("btnApplySettings").onclick = () => {
      this.recomputeAll();
      drawerSettings.classList.remove("open");
    };

    // Live update sliders inside drawer
    ["paramLambda", "paramWater", "paramDebris", "paramPowerP", "weightW1", "weightW2", "weightW3", "weightW4"].forEach(id => {
      document.getElementById(id).addEventListener("input", () => {
        this.recomputeAll();
      });
    });

    // Math Proofs Drawer
    const drawerMath = document.getElementById("drawerMathProofs");
    document.getElementById("btnOpenMathDrawer").onclick = () => drawerMath.classList.add("open");
    document.getElementById("btnCloseMathDrawer").onclick = () => drawerMath.classList.remove("open");

    // Modal Events
    const modalSources = document.getElementById("modalDataSources");
    document.getElementById("btnDataSources").onclick = () => modalSources.classList.add("open");
    document.getElementById("btnCloseSources").onclick = () => modalSources.classList.remove("open");
    document.getElementById("btnCloseSourcesBottom").onclick = () => modalSources.classList.remove("open");

    const modalInspector = document.getElementById("modalEdgeInspector");
    document.getElementById("btnCloseInspector").onclick = () => modalInspector.classList.remove("open");
    document.getElementById("btnCloseInspectorBottom").onclick = () => modalInspector.classList.remove("open");

    // Exporter
    document.getElementById("btnExportData").onclick = () => {
      ResearchExporter.exportEvidence(
        this.computedEdges,
        this.routeResults,
        this.topsisData,
        this.solverComparison,
        this.state
      );
    };

    // Deck Tabs
    document.querySelectorAll(".deck-tab-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".deck-tab-btn").forEach(b => b.classList.remove("active"));
        document.querySelectorAll(".deck-pane-content").forEach(c => c.classList.remove("active"));

        btn.classList.add("active");
        const tabId = btn.dataset.tab;
        document.getElementById(tabId).classList.add("active");

        ChartVisualizer.resizeAll();
      });
    });
  }
};

// Startup
window.addEventListener("DOMContentLoaded", () => {
  App.init();
});
