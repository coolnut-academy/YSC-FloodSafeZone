/* ==========================================================================
   LIVE COMPUTATION ANIMATION & 3D SEARCH FLOW SIMULATION
   ========================================================================== */

const LiveComputeAnim = {
  isSimulating: false,

  // Update top KPI cards and Live ticker with timing
  updateKPIs(execTimeMs, feasibleCount, optimalCost, topsisRank1Item, selectedZoneId, routeResults) {
    const elZone = document.getElementById("kpiSelectedZone");
    const elEta = document.getElementById("kpiEta");
    const elVerified = document.getElementById("kpiVerified");

    const bestRoute = selectedZoneId ? routeResults[selectedZoneId] : null;

    if (elZone) {
      elZone.textContent = bestRoute ? `${bestRoute.zoneId}: ${bestRoute.name.split(" ")[0]}` : "None";
    }
    if (elEta) {
      elEta.textContent = (bestRoute && bestRoute.feasible) ? `${bestRoute.travelTime.toFixed(2)} min` : "No Path";
    }
    if (elVerified) {
      elVerified.textContent = `A* = Dijkstra (${execTimeMs.toFixed(2)} ms)`;
    }
  },

  // Animate node expansion step-by-step on 3D Map
  async simulateSearch(mapVisualizer, solverResult, nodes) {
    if (this.isSimulating || !solverResult || !solverResult.history || !mapVisualizer.map) return;
    this.isSimulating = true;

    const btn = document.getElementById("btnSimulateSolver");
    if (btn) {
      btn.innerHTML = `<span>⏳ Exploring 3D Graph...</span>`;
      btn.disabled = true;
    }

    const simFeatures = [];
    const source = mapVisualizer.map.getSource("solver-sim-source");

    for (let i = 0; i < solverResult.history.length; i++) {
      const step = solverResult.history[i];
      const node = nodes[step.node];

      simFeatures.push({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [node.lon, node.lat]
        },
        properties: { step: step.step, node: step.node }
      });

      if (source) {
        source.setData({ type: "FeatureCollection", features: [...simFeatures] });
      }

      await new Promise(r => setTimeout(r, 110));
    }

    await new Promise(r => setTimeout(r, 600));

    // Clear simulation points
    if (source) {
      source.setData({ type: "FeatureCollection", features: [] });
    }

    if (btn) {
      btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg> Simulate Search Flow`;
      btn.disabled = false;
    }

    this.isSimulating = false;
  }
};
