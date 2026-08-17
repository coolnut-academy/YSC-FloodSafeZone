/* ==========================================================================
   3D MAP ENGINE (MAPLIBRE GL JS WITH TRUE 3D SATELLITE TERRAIN MESH)
   ========================================================================== */

const MapVisualizer = {
  map: null,
  markers: [],
  currentMode: "3d-mountain", // '3d-mountain' | '3d-valley' | '2d-top'
  currentLayer: "satellite",
  terrainEnabled: true,
  zoneVisibility: {
    red: true,
    yellow: true,
    green: true
  },

  init(containerId, onEdgeClick, onShelterClick) {
    this.onEdgeClick = onEdgeClick;
    this.onShelterClick = onShelterClick;

    const defaultSatellite = CONFIG.tileLayers["satellite"];

    // Build MapLibre Style with True 3D Satellite Raster + 3D Terrain DEM Mesh
    const styleSpec = {
      version: 8,
      sources: {
        "satellite-raster": {
          type: "raster",
          tiles: defaultSatellite.tiles,
          tileSize: 256,
          attribution: defaultSatellite.attribution
        },
        "terrain-dem": {
          type: "raster-dem",
          tiles: CONFIG.terrain.tiles,
          encoding: CONFIG.terrain.encoding,
          tileSize: 256,
          maxzoom: CONFIG.terrain.maxzoom
        }
      },
      layers: [
        {
          id: "satellite-layer",
          type: "raster",
          source: "satellite-raster",
          minzoom: 0,
          maxzoom: 19
        }
      ],
      terrain: {
        source: "terrain-dem",
        exaggeration: CONFIG.terrain.exaggeration
      },
      sky: {
        "sky-color": "#87ceeb",
        "sky-horizon-blend": 0.5,
        "horizon-color": "#ffffff",
        "horizon-fog-blend": 0.5,
        "fog-color": "#ffffff",
        "fog-ground-blend": 0.5
      }
    };

    this.map = new maplibregl.Map({
      container: containerId,
      style: styleSpec,
      center: [CONFIG.studyArea.lon, CONFIG.studyArea.lat],
      zoom: CONFIG.studyArea.zoom,
      pitch: CONFIG.studyArea.pitch,
      bearing: CONFIG.studyArea.bearing,
      maxPitch: 85,
      antialias: true
    });

    this.map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "bottom-right");

    this.map.on("load", () => {
      this.setupLayers();
      if (this.pendingRender) {
        this.pendingRender();
        this.pendingRender = null;
      }
    });
  },

  setupLayers() {
    if (!this.map) return;

    // 1. Add Flood Inundation Risk Zones GeoJSON Source
    if (!this.map.getSource("flood-zones-source")) {
      this.map.addSource("flood-zones-source", {
        type: "geojson",
        data: FLOOD_ZONES_GEOJSON
      });

      // Red Zone (Severe Inundation)
      this.map.addLayer({
        id: "zone-red-fill",
        type: "fill",
        source: "flood-zones-source",
        filter: ["==", "zoneType", "red"],
        paint: {
          "fill-color": "#ef4444",
          "fill-opacity": 0.38
        }
      });
      this.map.addLayer({
        id: "zone-red-line",
        type: "line",
        source: "flood-zones-source",
        filter: ["==", "zoneType", "red"],
        paint: {
          "line-color": "#ef4444",
          "line-width": 3,
          "line-dasharray": [3, 2]
        }
      });

      // Yellow Zone (Moderate Flood Caution)
      this.map.addLayer({
        id: "zone-yellow-fill",
        type: "fill",
        source: "flood-zones-source",
        filter: ["==", "zoneType", "yellow"],
        paint: {
          "fill-color": "#f59e0b",
          "fill-opacity": 0.30
        }
      });
      this.map.addLayer({
        id: "zone-yellow-line",
        type: "line",
        source: "flood-zones-source",
        filter: ["==", "zoneType", "yellow"],
        paint: {
          "line-color": "#f59e0b",
          "line-width": 2.5
        }
      });

      // Green Zone (Highland Safe Plateaus)
      this.map.addLayer({
        id: "zone-green-fill",
        type: "fill",
        source: "flood-zones-source",
        filter: ["==", "zoneType", "green"],
        paint: {
          "fill-color": "#10b981",
          "fill-opacity": 0.30
        }
      });
      this.map.addLayer({
        id: "zone-green-line",
        type: "line",
        source: "flood-zones-source",
        filter: ["==", "zoneType", "green"],
        paint: {
          "line-color": "#10b981",
          "line-width": 2.5
        }
      });

      // Add interactive hover popup for zones
      const zonePopup = new maplibregl.Popup({ closeButton: false, closeOnClick: false });
      ["zone-red-fill", "zone-yellow-fill", "zone-green-fill"].forEach(layerId => {
        this.map.on("mousemove", layerId, e => {
          this.map.getCanvas().style.cursor = "pointer";
          const props = e.features[0].properties;
          zonePopup.setLngLat(e.lngLat)
            .setHTML(`
              <div style="font-family:sans-serif;font-size:12px;padding:4px;">
                <strong style="color:${layerId.includes('red') ? '#ef4444' : (layerId.includes('yellow') ? '#d97706' : '#10b981')}">${props.name}</strong><br>
                ระดับอันตราย: <strong>${props.hazardLevel}</strong><br>
                ความลึกน้ำ: <strong>${props.waterDepth}</strong><br>
                <span style="color:#64748b;font-size:11px;">${props.description}</span>
              </div>
            `).addTo(this.map);
        });

        this.map.on("mouseleave", layerId, () => {
          this.map.getCanvas().style.cursor = "";
          zonePopup.remove();
        });
      });
    }

    // 2. Add Road Network Edges Source
    if (!this.map.getSource("road-edges-source")) {
      this.map.addSource("road-edges-source", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] }
      });

      this.map.addLayer({
        id: "road-edges-layer",
        type: "line",
        source: "road-edges-source",
        paint: {
          "line-color": ["get", "color"],
          "line-width": ["get", "width"],
          "line-opacity": 0.9
        }
      });

      // Edge click inspector listener
      this.map.on("click", "road-edges-layer", e => {
        if (e.features && e.features[0] && this.onEdgeClick) {
          const edgeId = e.features[0].properties.id;
          const foundEdge = this.lastComputedEdges?.find(item => item.id === edgeId);
          if (foundEdge) this.onEdgeClick(foundEdge);
        }
      });

      this.map.on("mouseenter", "road-edges-layer", () => this.map.getCanvas().style.cursor = "pointer");
      this.map.on("mouseleave", "road-edges-layer", () => this.map.getCanvas().style.cursor = "");
    }

    // 3. Add Optimal Evacuation Path (3D Neon Polyline with Glow Casing)
    if (!this.map.getSource("optimal-path-source")) {
      this.map.addSource("optimal-path-source", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] }
      });

      this.map.addLayer({
        id: "optimal-path-glow",
        type: "line",
        source: "optimal-path-source",
        paint: {
          "line-color": "#00d2ff",
          "line-width": 12,
          "line-opacity": 0.5,
          "line-blur": 4
        }
      });

      this.map.addLayer({
        id: "optimal-path-core",
        type: "line",
        source: "optimal-path-source",
        paint: {
          "line-color": "#ffffff",
          "line-width": 5,
          "line-opacity": 1.0
        }
      });
    }

    // 4. Add Solver Node Exploration Animation Source
    if (!this.map.getSource("solver-sim-source")) {
      this.map.addSource("solver-sim-source", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] }
      });

      this.map.addLayer({
        id: "solver-sim-layer",
        type: "circle",
        source: "solver-sim-source",
        paint: {
          "circle-radius": 10,
          "circle-color": "#00d2ff",
          "circle-stroke-width": 3,
          "circle-stroke-color": "#ffffff",
          "circle-opacity": 0.95
        }
      });
    }
  },

  set3DCameraMode(mode) {
    if (!this.map) return;
    this.currentMode = mode;

    if (mode === "3d-mountain") {
      // Look from the river valley up towards Wat Phra That Doi Kong Mu mountain ridge
      this.map.flyTo({
        center: [97.9625, 19.3000],
        zoom: 14.5,
        pitch: 65,
        bearing: -35,
        duration: 1400
      });
    } else if (mode === "3d-valley") {
      // Overview of the entire Mae Hong Son municipal basin
      this.map.flyTo({
        center: [CONFIG.studyArea.lon, CONFIG.studyArea.lat],
        zoom: 14.2,
        pitch: 50,
        bearing: 0,
        duration: 1400
      });
    } else if (mode === "2d-top") {
      // 2D Orthographic Top-down perspective
      this.map.flyTo({
        center: [CONFIG.studyArea.lon, CONFIG.studyArea.lat],
        zoom: 14.8,
        pitch: 0,
        bearing: 0,
        duration: 1200
      });
    }
  },

  setTerrainExaggeration(val) {
    if (!this.map) return;
    this.map.setTerrain({ source: "terrain-dem", exaggeration: parseFloat(val) });
  },

  switchTileLayer(type) {
    if (!this.map) return;
    this.currentLayer = type;
    const tileInfo = CONFIG.tileLayers[type] || CONFIG.tileLayers["satellite"];

    if (this.map.getSource("satellite-raster")) {
      this.map.removeLayer("satellite-layer");
      this.map.removeSource("satellite-raster");

      this.map.addSource("satellite-raster", {
        type: "raster",
        tiles: tileInfo.tiles,
        tileSize: 256,
        attribution: tileInfo.attribution
      });

      this.map.addLayer({
        id: "satellite-layer",
        type: "raster",
        source: "satellite-raster",
        minzoom: 0,
        maxzoom: 19
      }, "zone-red-fill");
    }
  },

  toggleZone(zoneType) {
    this.zoneVisibility[zoneType] = !this.zoneVisibility[zoneType];
    const visible = this.zoneVisibility[zoneType] ? "visible" : "none";

    if (this.map.getLayer(`zone-${zoneType}-fill`)) {
      this.map.setLayoutProperty(`zone-${zoneType}-fill`, "visibility", visible);
      this.map.setLayoutProperty(`zone-${zoneType}-line`, "visibility", visible);
    }
    return this.zoneVisibility[zoneType];
  },

  resetCenter() {
    if (!this.map) return;
    this.set3DCameraMode("3d-mountain");
  },

  renderNetwork(nodes, computedEdges, topsisData, selectedZoneId, routeResults) {
    this.lastComputedEdges = computedEdges;

    if (!this.map || !this.map.isStyleLoaded()) {
      this.pendingRender = () => this.renderNetwork(nodes, computedEdges, topsisData, selectedZoneId, routeResults);
      return;
    }

    // 1. Update Road Edges GeoJSON
    const edgeFeatures = computedEdges.map(e => {
      const u = nodes[e.from];
      const v = nodes[e.to];
      let color = "#10b981"; // Safe Feasible
      let width = 3.5;

      if (!e.feasible) {
        color = "#ef4444"; // Cutoff removed
        width = 4.5;
      } else if (e.He >= 0.6) {
        color = "#f59e0b"; // Moderate Caution
        width = 3.5;
      }

      return {
        type: "Feature",
        properties: { id: e.id, color, width },
        geometry: {
          type: "LineString",
          coordinates: [[u.lon, u.lat], [v.lon, v.lat]]
        }
      };
    });

    const edgeSource = this.map.getSource("road-edges-source");
    if (edgeSource) {
      edgeSource.setData({ type: "FeatureCollection", features: edgeFeatures });
    }

    // 2. Update Optimal Path GeoJSON
    const pathSource = this.map.getSource("optimal-path-source");
    if (pathSource) {
      if (selectedZoneId && routeResults[selectedZoneId]?.feasible) {
        const path = routeResults[selectedZoneId].path;
        const coords = path.map(id => [nodes[id].lon, nodes[id].lat]);
        pathSource.setData({
          type: "FeatureCollection",
          features: [{
            type: "Feature",
            geometry: { type: "LineString", coordinates: coords }
          }]
        });
      } else {
        pathSource.setData({ type: "FeatureCollection", features: [] });
      }
    }

    // 3. Update 3D HTML Markers for Start Point and Candidate Safe Zones
    this.markers.forEach(m => m.remove());
    this.markers = [];

    Object.values(nodes).forEach(n => {
      if (n.type === "shelter") {
        const topsisItem = topsisData?.results?.find(r => r.zoneId === n.id);
        const rankText = topsisItem ? `Rank #${topsisItem.rank}` : "";
        const isSelected = selectedZoneId === n.id;

        const el = document.createElement("div");
        el.className = "marker-3d-shelter";
        el.innerHTML = `<span>${n.id}</span>`;
        if (isSelected) {
          el.style.transform = "scale(1.3)";
          el.style.background = "#0284c7";
          el.style.boxShadow = "0 0 20px #0284c7, 0 4px 12px rgba(0,0,0,0.5)";
        }

        const popup = new maplibregl.Popup({ offset: 25 }).setHTML(`
          <div style="font-family:sans-serif;font-size:12px;padding:4px;">
            <strong style="color:#0284c7;font-size:13px;">${n.name}</strong><br>
            ระดับความสูง: <strong>${n.z}m MSL (Copernicus DEM)</strong><br>
            ระยะห่างแม่น้ำปาย: <strong>${n.riverDist}m</strong><br>
            ความจุรองรับ: <strong>${n.capacity.toLocaleString()} คน</strong><br>
            <span style="color:#10b981;font-weight:800;">${rankText} (TOPSIS Closeness: ${topsisItem ? topsisItem.closeness.toFixed(4) : '—'})</span>
          </div>
        `);

        el.addEventListener("click", () => {
          if (this.onShelterClick) this.onShelterClick(n.id);
        });

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([n.lon, n.lat])
          .setPopup(popup)
          .addTo(this.map);

        this.markers.push(marker);
      } else if (n.type === "start") {
        const el = document.createElement("div");
        el.className = "marker-3d-start";
        el.innerHTML = `<span>S</span>`;

        const popup = new maplibregl.Popup({ offset: 25 }).setHTML(`
          <div style="font-family:sans-serif;font-size:12px;padding:4px;">
            <strong style="color:#f59e0b;">จุดเริ่มต้นจำลอง (Start Point S)</strong><br>
            ระดับความสูง: <strong>${n.z}m MSL</strong>
          </div>
        `);

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([n.lon, n.lat])
          .setPopup(popup)
          .addTo(this.map);

        this.markers.push(marker);
      }
    });
  }
};
