/* ==========================================================================
   CHART VISUALIZER (ROUTE SWITCHING & SENSITIVITY CURVES)
   ========================================================================== */

const ChartVisualizer = {
  charts: {
    switching: null,
    sensitivityFlood: null,
    attenuation: null
  },

  // Render Analytical Route Switching Plot with current Lambda marker
  renderSwitching(canvasId, routeResults, currentLambda, onLambdaChange) {
    const ctx = document.getElementById(canvasId)?.getContext("2d");
    if (!ctx) return;

    const lambdaRange = [];
    for (let l = 0; l <= 25; l += 1) lambdaRange.push(l);

    const colors = ["#00d2ff", "#10b981", "#a855f7", "#f59e0b"];
    const datasets = Object.values(routeResults).map((r, i) => {
      return {
        label: `${r.zoneId} (${r.name.split(" ")[0]})`,
        data: lambdaRange.map(l => r.feasible ? (r.travelTime + l * r.riskTime) : null),
        borderColor: colors[i % colors.length],
        backgroundColor: colors[i % colors.length],
        borderWidth: 2.2,
        tension: 0.1,
        pointRadius: 0
      };
    });

    if (this.charts.switching) this.charts.switching.destroy();

    this.charts.switching = new Chart(ctx, {
      type: "line",
      data: { labels: lambdaRange, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: {
            position: "top",
            labels: { color: "#c9d8e8", font: { family: "Inter", size: 11.5 } }
          },
          tooltip: {
            callbacks: {
              title: items => `Risk Preference λ = ${items[0].label}`,
              label: item => ` ${item.dataset.label}: Cost = ${item.raw !== null ? item.raw.toFixed(2) : 'Infeasible'}`
            }
          }
        },
        scales: {
          x: {
            title: { display: true, text: "Risk Preference Parameter (λ)", color: "#7991ab" },
            grid: { color: "rgba(255,255,255,0.06)" },
            ticks: { color: "#7991ab" }
          },
          y: {
            title: { display: true, text: "FHEG Route Cost W_λ(P)", color: "#7991ab" },
            grid: { color: "rgba(255,255,255,0.06)" },
            ticks: { color: "#7991ab" },
            min: 0
          }
        }
      }
    });
  },

  // Render Sensitivity Curves (Flood Depth Scale & Speed Attenuation)
  renderSensitivity(floodCanvasId, attenCanvasId, currentP) {
    // 1. Flood Depth Scale vs Feasible Edges
    const ctxFlood = document.getElementById(floodCanvasId)?.getContext("2d");
    if (ctxFlood) {
      const waterScales = [0.4, 0.6, 0.8, 1.0, 1.2, 1.4, 1.6, 1.8, 2.0, 2.2];
      const feasibleCounts = waterScales.map(scale => {
        let count = 0;
        MAEHONGSON_EDGES.forEach(b => {
          const H = (b.baseDepth * scale) * (b.baseVelocity * Math.sqrt(scale) + 0.5) + 0.15;
          if (H < CONFIG.Hc) count++;
        });
        return count;
      });

      if (this.charts.sensitivityFlood) this.charts.sensitivityFlood.destroy();
      this.charts.sensitivityFlood = new Chart(ctxFlood, {
        type: "line",
        data: {
          labels: waterScales.map(s => s.toFixed(1) + "×"),
          datasets: [{
            label: "Feasible Edges (H_e < 1.25)",
            data: feasibleCounts,
            borderColor: "#00d2ff",
            backgroundColor: "rgba(0, 210, 255, 0.15)",
            fill: true,
            tension: 0.2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { title: { display: true, text: "Flood Intensity Multiplier", color: "#7991ab" }, ticks: { color: "#7991ab" } },
            y: { title: { display: true, text: "Feasible Edges Count", color: "#7991ab" }, ticks: { color: "#7991ab" }, min: 0, max: 42 }
          }
        }
      });
    }

    // 2. Speed Attenuation Curve \phi_p(H)
    const ctxAtten = document.getElementById(attenCanvasId)?.getContext("2d");
    if (ctxAtten) {
      const hRange = [];
      for (let h = 0; h <= 1.4; h += 0.05) hRange.push(h);

      const p1 = hRange.map(h => FHEG_Math.hazardAttenuation(h, 1.0));
      const pCur = hRange.map(h => FHEG_Math.hazardAttenuation(h, currentP));
      const p2 = hRange.map(h => FHEG_Math.hazardAttenuation(h, 2.0));

      if (this.charts.attenuation) this.charts.attenuation.destroy();
      this.charts.attenuation = new Chart(ctxAtten, {
        type: "line",
        data: {
          labels: hRange.map(h => h.toFixed(2)),
          datasets: [
            { label: `Current p = ${currentP.toFixed(1)}`, data: pCur, borderColor: "#00d2ff", borderWidth: 3 },
            { label: "p = 1.0 (Linear)", data: p1, borderColor: "#7991ab", borderDash: [4, 4], borderWidth: 1.5 },
            { label: "p = 2.0 (Quadratic)", data: p2, borderColor: "#a855f7", borderDash: [4, 4], borderWidth: 1.5 }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { labels: { color: "#c9d8e8", font: { size: 11 } } } },
          scales: {
            x: { title: { display: true, text: "Hazard Level (H_e)", color: "#7991ab" }, ticks: { color: "#7991ab" } },
            y: { title: { display: true, text: "Speed Factor φ_p(H)", color: "#7991ab" }, ticks: { color: "#7991ab" }, min: 0, max: 1.05 }
          }
        }
      });
    }
  },

  resizeAll() {
    Object.values(this.charts).forEach(c => {
      if (c) c.resize();
    });
  }
};
