/* ==========================================================================
   MAE HONG SON ROAD NETWORK & GEOSPATIAL GRAPH DATASET
   ========================================================================== */

const MAEHONGSON_NODES = {
  "S":   { id: "S",   name: "จุดเริ่มต้นอพยพ (Start Point)", lat: 19.2975, lon: 97.9620, z: 236.0, type: "start" },
  "N01": { id: "N01", name: "แยกถนนขุนลุมประพาส (South)", lat: 19.2990, lon: 97.9645, z: 238.5, type: "junction" },
  "N02": { id: "N02", name: "แยกหน้าเทศบาลเมืองแม่ฮ่องสอน", lat: 19.3015, lon: 97.9660, z: 240.0, type: "junction" },
  "N03": { id: "N03", name: "แยกหนองจองคำ (East)", lat: 19.3000, lon: 97.9690, z: 237.0, type: "junction" },
  "N04": { id: "N04", name: "สะพานข้ามแม่น้ำปาย/แม่ฮ่องสอน", lat: 19.2960, lon: 97.9675, z: 233.0, type: "junction" },
  "N05": { id: "N05", name: "แยกถนนประดิษฐ์วณิช", lat: 19.3035, lon: 97.9640, z: 243.0, type: "junction" },
  "N06": { id: "N06", name: "แยกโรงเรียนอนุบาลแม่ฮ่องสอน", lat: 19.3050, lon: 97.9675, z: 245.0, type: "junction" },
  "N07": { id: "N07", name: "แยกทางขึ้นพระธาตุดอยกองมู", lat: 19.3010, lon: 97.9590, z: 255.0, type: "junction" },
  "N08": { id: "N08", name: "แยกถนนพาณิชย์วัฒนา", lat: 19.2940, lon: 97.9640, z: 235.0, type: "junction" },
  "N09": { id: "N09", name: "แยกหลังโรงพยาบาลศรีสังวาลย์", lat: 19.3070, lon: 97.9630, z: 248.0, type: "junction" },
  
  // Candidate Safe Zones (Shelters)
  "Z1":  { id: "Z1",  name: "โรงเรียนห้องสอนศึกษา (Z1)", lat: 19.3085, lon: 97.9690, z: 252.0, type: "shelter", capacity: 800, riverDist: 650 },
  "Z2":  { id: "Z2",  name: "ศาลากลาง / หอประชุมเทศบาล (Z2)", lat: 19.3060, lon: 97.9615, z: 260.0, type: "shelter", capacity: 1200, riverDist: 850 },
  "Z3":  { id: "Z3",  name: "ลานวัดพระธาตุดอยกองมู (Z3)", lat: 19.3005, lon: 97.9530, z: 325.0, type: "shelter", capacity: 450, riverDist: 1400 },
  "Z4":  { id: "Z4",  name: "สนามกีฬากลางจังหวัดแม่ฮ่องสอน (Z4)", lat: 19.2920, lon: 97.9695, z: 239.0, type: "shelter", capacity: 1500, riverDist: 350 }
};

const MAEHONGSON_EDGES = [
  { id: "E01", from: "S", to: "N01", baseDepth: 0.15, baseVelocity: 0.40, floodRisk: "low" },
  { id: "E02", from: "N01", to: "S", baseDepth: 0.15, baseVelocity: 0.40, floodRisk: "low" },
  { id: "E03", from: "S", to: "N08", baseDepth: 0.20, baseVelocity: 0.50, floodRisk: "low" },
  { id: "E04", from: "N08", to: "S", baseDepth: 0.20, baseVelocity: 0.50, floodRisk: "low" },
  { id: "E05", from: "S", to: "N07", baseDepth: 0.05, baseVelocity: 0.10, floodRisk: "safe" },
  { id: "E06", from: "N07", to: "S", baseDepth: 0.05, baseVelocity: 0.10, floodRisk: "safe" },

  { id: "E07", from: "N01", to: "N02", baseDepth: 0.25, baseVelocity: 0.60, floodRisk: "moderate" },
  { id: "E08", from: "N02", to: "N01", baseDepth: 0.25, baseVelocity: 0.60, floodRisk: "moderate" },
  { id: "E09", from: "N01", to: "N03", baseDepth: 0.45, baseVelocity: 0.95, floodRisk: "high" },
  { id: "E10", from: "N03", to: "N01", baseDepth: 0.45, baseVelocity: 0.95, floodRisk: "high" },
  { id: "E11", from: "N08", to: "N04", baseDepth: 0.65, baseVelocity: 1.30, floodRisk: "critical" },
  { id: "E12", from: "N04", to: "N08", baseDepth: 0.65, baseVelocity: 1.30, floodRisk: "critical" },
  { id: "E13", from: "N04", to: "N03", baseDepth: 0.70, baseVelocity: 1.40, floodRisk: "critical" },
  { id: "E14", from: "N03", to: "N04", baseDepth: 0.70, baseVelocity: 1.40, floodRisk: "critical" },
  { id: "E15", from: "N04", to: "Z4", baseDepth: 0.50, baseVelocity: 0.90, floodRisk: "high" },
  { id: "E16", from: "Z4", to: "N04", baseDepth: 0.50, baseVelocity: 0.90, floodRisk: "high" },

  { id: "E17", from: "N02", to: "N05", baseDepth: 0.20, baseVelocity: 0.45, floodRisk: "low" },
  { id: "E18", from: "N05", to: "N02", baseDepth: 0.20, baseVelocity: 0.45, floodRisk: "low" },
  { id: "E19", from: "N02", to: "N06", baseDepth: 0.35, baseVelocity: 0.75, floodRisk: "moderate" },
  { id: "E20", from: "N06", to: "N02", baseDepth: 0.35, baseVelocity: 0.75, floodRisk: "moderate" },
  { id: "E21", from: "N03", to: "N06", baseDepth: 0.55, baseVelocity: 1.10, floodRisk: "high" },
  { id: "E22", from: "N06", to: "N03", baseDepth: 0.55, baseVelocity: 1.10, floodRisk: "high" },

  { id: "E23", from: "N06", to: "Z1", baseDepth: 0.30, baseVelocity: 0.50, floodRisk: "moderate" },
  { id: "E24", from: "Z1", to: "N06", baseDepth: 0.30, baseVelocity: 0.50, floodRisk: "moderate" },
  { id: "E25", from: "N05", to: "N09", baseDepth: 0.10, baseVelocity: 0.20, floodRisk: "safe" },
  { id: "E26", from: "N09", to: "N05", baseDepth: 0.10, baseVelocity: 0.20, floodRisk: "safe" },
  { id: "E27", from: "N09", to: "Z1", baseDepth: 0.18, baseVelocity: 0.30, floodRisk: "low" },
  { id: "E28", from: "Z1", to: "N09", baseDepth: 0.18, baseVelocity: 0.30, floodRisk: "low" },
  { id: "E29", from: "N09", to: "Z2", baseDepth: 0.08, baseVelocity: 0.15, floodRisk: "safe" },
  { id: "E30", from: "Z2", to: "N09", baseDepth: 0.08, baseVelocity: 0.15, floodRisk: "safe" },
  { id: "E31", from: "N05", to: "Z2", baseDepth: 0.12, baseVelocity: 0.25, floodRisk: "safe" },
  { id: "E32", from: "Z2", to: "N05", baseDepth: 0.12, baseVelocity: 0.25, floodRisk: "safe" },

  { id: "E33", from: "N07", to: "N05", baseDepth: 0.05, baseVelocity: 0.10, floodRisk: "safe" },
  { id: "E34", from: "N05", to: "N07", baseDepth: 0.05, baseVelocity: 0.10, floodRisk: "safe" },
  { id: "E35", from: "N07", to: "Z3", baseDepth: 0.00, baseVelocity: 0.00, floodRisk: "safe" },
  { id: "E36", from: "Z3", to: "N07", baseDepth: 0.00, baseVelocity: 0.00, floodRisk: "safe" },
  { id: "E37", from: "N08", to: "Z4", baseDepth: 0.40, baseVelocity: 0.85, floodRisk: "moderate" },
  { id: "E38", from: "Z4", to: "N08", baseDepth: 0.40, baseVelocity: 0.85, floodRisk: "moderate" }
];
