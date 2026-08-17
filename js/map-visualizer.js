/* ==========================================================================
   MAP VISUALIZER (LEAFLET GIS ENGINE WITH GLOWING ROUTE RENDERERS)
   ========================================================================== */

const MapVisualizer = {
  map: null,
  layers: {
    baseTiles: null,
    edgesLayer: null,
    nodesLayer: null,
    sheltersLayer: null,
    optimalPathLayer: null,
    simulationLayer: null
  },

  init(containerId, onEdgeClick, onShelterClick) {
    this.map = L.map(containerId, {
      center: [CONFIG.studyArea.lat, CONFIG.studyArea.lon],
      zoom: CONFIG.studyArea.defaultZoom,
      zoomControl: true
    });

    this.layers.edgesLayer = L.layerGroup().addTo(this.map);
    this.layers.nodesLayer = L.layerGroup().addTo(this.map);
    this.layers.sheltersLayer = L.layerGroup().addTo(this.map);
    this.layers.optimalPathLayer = L.polyline([], {
      color: "#00d2ff",
      weight: 7,
      opacity: 0.95,
      className: "neon-path"
    }).addTo(this.map);
    this.layers.simulationLayer = L.layerGroup().addTo(this.map);

    this.switchTileLayer("carto-dark");
    this.onEdgeClick = onEdgeClick;
    this.onShelterClick = onShelterClick;
  },

  switchTileLayer(type) {
    if (this.layers.baseTiles) {
      this.map.removeLayer(this.layers.baseTiles);
    }

    const tileInfo = CONFIG.tileLayers[type] || CONFIG.tileLayers["carto-dark"];
    this.layers.baseTiles = L.tileLayer(tileInfo.url, {
      maxZoom: tileInfo.maxZoom,
      attribution: tileInfo.attribution
    }).addTo(this.map);
  },

  resetCenter() {
    if (this.map) {
      this.map.setView([CONFIG.studyArea.lat, CONFIG.studyArea.lon], CONFIG.studyArea.defaultZoom);
    }
  },

  renderNetwork(nodes, computedEdges, topsisData, selectedZoneId, routeResults) {
    if (!this.map) return;

    this.layers.edgesLayer.clearLayers();
    this.layers.nodesLayer.clearLayers();
    this.layers.sheltersLayer.clearLayers();

    // 1. Draw Edges with Hazard-Aware Colors & Dash
    computedEdges.forEach(e => {
      const u = nodes[e.from];
      const v = nodes[e.to];
      const coords = [[u.lat, u.lon], [v.lat, v.lon]];

      let color = "#10b981"; // Feasible Low Hazard
      let dashArray = null;
      let weight = 3.5;
      let opacity = 0.75;

      if (!e.feasible) {
        color = "#ef4444"; // Removed Infeasible Cutoff
        dashArray = "6, 6";
        weight = 4.5;
        opacity = 0.9;
      } else if (e.He >= 0.6) {
        color = "#f59e0b"; // Moderate Hazard
        weight = 4.0;
      }

      const poly = L.polyline(coords, { color, dashArray, weight, opacity });
      poly.bindTooltip(`
        <div style="font-family:sans-serif;font-size:12px;">
          <strong>Edge ${e.id}</strong> (${e.from} &rarr; ${e.to})<br>
          Hazard H = <strong>${e.He.toFixed(3)}</strong><br>
          Speed = ${e.effectiveSpeed.toFixed(1)} m/min (${(e.effectiveSpeed * 0.06).toFixed(2)} km/h)<br>
          Status: <span style="color:${e.feasible ? '#10b981' : '#ef4444'};font-weight:700;">${e.feasible ? 'FEASIBLE' : 'BLOCKED (H ≥ 1.25)'}</span>
        </div>
      `, { sticky: true });

      poly.on("click", () => {
        if (this.onEdgeClick) this.onEdgeClick(e);
      });

      this.layers.edgesLayer.addLayer(poly);
    });

    // 2. Draw Junction Nodes, Start Point, and Candidate Shelters
    Object.values(nodes).forEach(n => {
      if (n.type === "shelter") {
        const topsisItem = topsisData?.results?.find(r => r.zoneId === n.id);
        const rankText = topsisItem ? `Rank #${topsisItem.rank} (${topsisItem.closeness.toFixed(3)})` : "";
        const isSelected = selectedZoneId === n.id;

        const marker = L.circleMarker([n.lat, n.lon], {
          radius: isSelected ? 14 : 11,
          fillColor: "#10b981",
          color: isSelected ? "#00d2ff" : "#ffffff",
          weight: isSelected ? 4 : 2.5,
          fillOpacity: 0.95,
          className: "pulse-marker-shelter"
        });

        marker.bindTooltip(`
          <div style="font-family:sans-serif;font-size:12px;">
            <strong style="color:#10b981;font-size:13px;">${n.name}</strong><br>
            Elevation: <strong>${n.z}m MSL</strong><br>
            River Buffer: <strong>${n.riverDist}m</strong><br>
            Capacity: <strong>${n.capacity} ppl</strong><br>
            <span style="color:#00d2ff;font-weight:700;">${rankText}</span>
          </div>
        `, { permanent: false });

        marker.on("click", () => {
          if (this.onShelterClick) this.onShelterClick(n.id);
        });

        this.layers.sheltersLayer.addLayer(marker);
      } else if (n.type === "start") {
        const marker = L.circleMarker([n.lat, n.lon], {
          radius: 11,
          fillColor: "#f59e0b",
          color: "#ffffff",
          weight: 3,
          fillOpacity: 0.95,
          className: "pulse-marker-start"
        });

        marker.bindTooltip(`<strong>${n.name}</strong><br>จุดเริ่มต้นจำลองการอพยพ`, { permanent: false });
        this.layers.nodesLayer.addLayer(marker);
      } else {
        const marker = L.circleMarker([n.lat, n.lon], {
          radius: 5,
          fillColor: "#64748b",
          color: "#ffffff",
          weight: 1.5,
          fillOpacity: 0.85
        });
        marker.bindTooltip(`<strong>Node ${n.id}</strong><br>${n.name}<br>Elev: ${n.z}m`, { sticky: true });
        this.layers.nodesLayer.addLayer(marker);
      }
    });

    // 3. Highlight Optimal Path
    if (selectedZoneId && routeResults[selectedZoneId]?.feasible) {
      const path = routeResults[selectedZoneId].path;
      const polyCoords = path.map(id => [nodes[id].lat, nodes[id].lon]);
      this.layers.optimalPathLayer.setLatLngs(polyCoords);
    } else {
      this.layers.optimalPathLayer.setLatLngs([]);
    }
  }
};
