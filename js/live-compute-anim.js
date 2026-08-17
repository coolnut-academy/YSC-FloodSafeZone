/* ==========================================================================
   LIVE COMPUTATION ANIMATION & SOLVER VISUALIZER (PITCH SHOWCASE)
   ========================================================================== */

const LiveComputeAnim = {
  isSimulating: false,

  // Update ticker numbers with a micro-pulse highlight
  updateTicker(execTimeMs, feasibleCount, optimalCost, topsisRank1) {
    const elTime = document.getElementById("tickerExecTime");
    const elFeasible = document.getElementById("tickerFeasible");
    const elCost = document.getElementById("tickerOptimalCost");
    const elRank1 = document.getElementById("tickerRank1");

    if (elTime) elTime.textContent = `${execTimeMs.toFixed(2)} ms`;
    if (elFeasible) elFeasible.textContent = `${feasibleCount} / 42 Edges`;
    if (elCost) elCost.textContent = isFinite(optimalCost) ? optimalCost.toFixed(2) : "Infinity";
    if (elRank1) elRank1.textContent = topsisRank1 || "—";
  },

  // Animate node exploration step-by-step on Leaflet Map
  async simulateSearch(mapVisualizer, solverResult, nodes) {
    if (this.isSimulating || !solverResult || !solverResult.history) return;
    this.isSimulating = true;

    const layer = mapVisualizer.layers.simulationLayer;
    layer.clearLayers();

    const btn = document.getElementById("btnSimulateSolver");
    if (btn) {
      btn.innerHTML = `<span>⏳ Exploring Nodes...</span>`;
      btn.disabled = true;
    }

    for (let i = 0; i < solverResult.history.length; i++) {
      const step = solverResult.history[i];
      const node = nodes[step.node];

      const circle = L.circleMarker([node.lat, node.lon], {
        radius: 8,
        fillColor: "#00d2ff",
        color: "#ffffff",
        weight: 2,
        fillOpacity: 0.85
      });
      circle.bindTooltip(`Step ${step.step}: Expanding ${step.node}`, { permanent: false });
      layer.addLayer(circle);

      await new Promise(r => setTimeout(r, 90));
    }

    // Flash optimal path
    if (btn) {
      btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg> Simulate Search Flow`;
      btn.disabled = false;
    }

    this.isSimulating = false;
  }
};
