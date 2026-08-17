/* ==========================================================================
   CONFIG & 3D GEOSPATIAL MAP DEFINITIONS (SATELLITE & 3D TERRAIN MESH)
   ========================================================================== */

const CONFIG = {
  // Model Constants from Canonical Blueprint
  Hc: 1.25, // Critical Hazard Threshold (Cutoff)
  H0: 0.25, // Attenuation Lower Boundary
  defaultP: 1.5, // Attenuation Curvature
  defaultQ: 1.25, // Risk Sensitivity Curvature
  toleranceEpsilon: 1e-6, // Numerical verification tolerance

  // Coordinates of Mae Hong Son Municipal Study Area
  studyArea: {
    name: "เทศบาลเมืองแม่ฮ่องสอน, ประเทศไทย",
    lat: 19.3015,
    lon: 97.9640,
    zoom: 14.6,
    pitch: 62, // 3D Mountain Perspective
    bearing: -28 // 3D Camera Rotation towards Doi Kong Mu & Pai River Valley
  },

  // 100% Free Satellite & Vector Tile Layer Styles
  tileLayers: {
    "satellite": {
      name: "ESRI World Imagery (3D Satellite)",
      tiles: ["https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"],
      maxzoom: 19,
      attribution: "© ESRI World Imagery, Maxar, Earthstar Geographics"
    },
    "voyager": {
      name: "CartoDB Voyager (Light Vector)",
      tiles: ["https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png",
              "https://b.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png"],
      maxzoom: 19,
      attribution: "© CARTO, © OpenStreetMap"
    },
    "osm": {
      name: "OpenStreetMap Standard",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      maxzoom: 19,
      attribution: "© OpenStreetMap contributors"
    },
    "opentopo": {
      name: "OpenTopoMap (Contours)",
      tiles: ["https://a.tile.opentopomap.org/{z}/{x}/{y}.png"],
      maxzoom: 17,
      attribution: "© OpenTopoMap, © OpenStreetMap"
    }
  },

  // 100% Free Global 3D Terrain DEM Tiles (AWS Open Data Terrarium Mesh)
  terrain: {
    tiles: ["https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png"],
    encoding: "terrarium",
    tileSize: 256,
    maxzoom: 15,
    exaggeration: 1.6 // Dramatic 3D mountain relief for Mae Hong Son valley
  },

  // Open APIs (100% Free Public Endpoints)
  apis: {
    elevation: "https://api.open-meteo.com/v1/elevation",
    flood: "https://flood-api.open-meteo.com/v1/flood",
    weather: "https://api.open-meteo.com/v1/forecast",
    overpass: "https://overpass-api.de/api/interpreter"
  }
};

/* ==========================================================================
   RED, YELLOW, GREEN FLOOD INUNDATION RISK ZONES (GEOJSON POLYGONS)
   ========================================================================== */
const FLOOD_ZONES_GEOJSON = {
  type: "FeatureCollection",
  features: [
    // 1. RED ZONE (Severe Inundation & High Flow Basin along Pai River / Bridge Crossing)
    {
      type: "Feature",
      properties: {
        zoneType: "red",
        name: "🔴 Red Zone (เขตวิกฤตน้ำท่วมรุนแรง H ≥ 1.25)",
        hazardLevel: "Critical (> 1.25)",
        waterDepth: "0.8 - 1.6 m",
        description: "พื้นที่ลุ่มต่ำริมแม่น้ำปาย/สะพานข้ามแม่น้ำ กระแสน้ำไหลเชี่ยว ตัดขาดการสัญจร"
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [97.9650, 19.2930],
          [97.9715, 19.2950],
          [97.9730, 19.3015],
          [97.9705, 19.3060],
          [97.9675, 19.3030],
          [97.9665, 19.2980],
          [97.9635, 19.2955],
          [97.9650, 19.2930]
        ]]
      }
    },
    // 2. YELLOW ZONE (Moderate Flood / Caution Buffer in Downtown Market)
    {
      type: "Feature",
      properties: {
        zoneType: "yellow",
        name: "🟡 Yellow Zone (เขตเฝ้าระวังน้ำท่วมปานกลาง 0.6 ≤ H < 1.25)",
        hazardLevel: "Moderate (0.6 - 1.25)",
        waterDepth: "0.3 - 0.7 m",
        description: "พื้นที่ราบตอนกลาง ชุมชนตลาด และทางแยกชั้นในที่เสี่ยงน้ำเอ่อล้น ชะลอความเร็วการเดินเท้า"
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [97.9610, 19.2965],
          [97.9670, 19.2985],
          [97.9700, 19.3050],
          [97.9680, 19.3085],
          [97.9630, 19.3070],
          [97.9615, 19.3010],
          [97.9610, 19.2965]
        ]]
      }
    },
    // 3. GREEN ZONE (Safe Elevation Plateaus & Mountains - Z1, Z2, Z3)
    {
      type: "Feature",
      properties: {
        zoneType: "green",
        name: "🟢 Green Zone (เขตพื้นที่ปลอดภัยบนที่สูง H < 0.25)",
        hazardLevel: "Safe (< 0.25)",
        waterDepth: "0.0 - 0.1 m",
        description: "พื้นที่ดอยกองมู เนินเขาโรงเรียนห้องสอนศึกษา และศาลากลางจังหวัด (252m - 325m MSL) ปลอดภัย 100%"
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [97.9510, 19.2980],
          [97.9585, 19.2990],
          [97.9605, 19.3050],
          [97.9595, 19.3100],
          [97.9530, 19.3080],
          [97.9510, 19.2980]
        ]]
      }
    }
  ]
};
