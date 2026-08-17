/* ==========================================================================
   CONFIG & CONSTANTS
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
    defaultZoom: 15
  },

  // Tile Layer Providers (100% Free - No Credit Card Required)
  tileLayers: {
    "carto-dark": {
      name: "CartoDB Dark Matter",
      url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      maxZoom: 19,
      attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OSM'
    },
    "satellite": {
      name: "ESRI World Satellite",
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      maxZoom: 19,
      attribution: '&copy; ESRI ArcGIS &copy; Maxar'
    },
    "carto-voyager": {
      name: "CartoDB Voyager (Light)",
      url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
      maxZoom: 19,
      attribution: '&copy; CARTO &copy; OSM'
    },
    "opentopo": {
      name: "OpenTopoMap (Contours)",
      url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
      maxZoom: 17,
      attribution: '&copy; OpenTopoMap &copy; OSM'
    },
    "osm": {
      name: "OpenStreetMap Standard",
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }
  },

  // Open APIs (100% Free Public Endpoints)
  apis: {
    elevation: "https://api.open-meteo.com/v1/elevation",
    flood: "https://flood-api.open-meteo.com/v1/flood",
    weather: "https://api.open-meteo.com/v1/forecast",
    overpass: "https://overpass-api.de/api/interpreter"
  }
};
