<div align="center">

# 🌊 Flood Safe Zone (FSZ)
### **Flood Hazard-Weighted Evacuation Graph (FHEG) & 3D Geospatial Multi-Criteria Decision System**

[![YSC 2026](https://img.shields.io/badge/Competition-YSC%202569-0284c7.svg?style=for-the-badge)](https://www.nstda.or.th/)
[![Category](https://img.shields.io/badge/Category-Applied%20Mathematics-10b981.svg?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/License-MIT-purple.svg?style=for-the-badge)](#)
[![Engine](https://img.shields.io/badge/3D%20Engine-MapLibre%20GL%20WebGL-f59e0b.svg?style=for-the-badge)](#)
[![Theme](https://img.shields.io/badge/UI-Pure%20Light%20Lab%20Console-blue.svg?style=for-the-badge)](#)

<p align="center">
  <strong>ระบบคำนวณและจำลองเส้นทางอพยพหนีภัยน้ำท่วม 3 มิติ ด้วยแบบจำลองกราฟถ่วงน้ำหนักความเสี่ยงอุทกภัย (FHEG)<br>
  และการจัดลำดับศูนย์พักพิงด้วยกระบวนการตัดสินใจแบบพหุเกณฑ์ (Dynamic TOPSIS)</strong>
  <br>
  <em>กรณีศึกษา: เขตเทศบาลเมืองแม่ฮ่องสอน จังหวัดแม่ฮ่องสอน ประเทศไทย</em>
</p>

</div>

---

## 📌 บทคัดย่อโครงงาน (Project Abstract)

ในเหตุการณ์อุทกภัยน้ำหลากฉับพลัน (Flash Flood) ในพื้นที่ภูมิประเทศภูเขาและหุบเขา เช่น เทศบาลเมืองแม่ฮ่องสอน การอพยพโดยพิจารณาเฉพาะ **"ระยะทางที่สั้นที่สุด" (Shortest Distance)** มักนำผู้ประสบภัยเข้าสู่เส้นทางอันตรายที่มีระดับน้ำท่วมสูงและกระแสน้ำเชี่ยวจนไม่สามารถสัญจรได้

โครงงานนี้จึงนำเสนอ **แบบจำลองโครงข่ายกราฟถ่วงน้ำหนักความเสี่ยงอุทกภัย (Flood Hazard-Weighted Evacuation Graph: FHEG)** ซึ่งบูรณาการ:
1. **แบบจำลองการเดินเท้าบนความลาดชันจริงของ Tobler** ร่วมกับ **Copernicus 30m Global DEM**
2. **ฟังก์ชันระดับอันตรายอุทกพลศาสตร์ (Hydrodynamic Flood Hazard Function: $H_e$)** ร่วมกับการตัดขาดเส้นทางวิกฤต ($H_c = 1.25$)
3. **ฟังก์ชันลดทอนความเร็วการเดินเท้าแบบต่อเนื่อง ($\phi_p(H_e)$)**
4. **พารามิเตอร์ความกลัวความเสี่ยง ($\lambda$)** และ **การวิเคราะห์จุดเปลี่ยนผ่านเส้นทาง (Analytical Route Switching Thresholds: $\lambda_{ij}$)**
5. **การพิสูจน์ความสมมูลและการค้นพบผลเฉลยที่เหมาะสมที่สุด (A\* vs. Dijkstra Verification)**
6. **การจัดอันดับศูนย์พักพิงที่เหมาะสมที่สุดด้วยกระบวนการ TOPSIS 6 ขั้นตอนแบบพลวัต**

---

## ✨ คุณสมบัติเด่นของระบบ (Key Features)

```text
+---------------------------------------------------------------------------------------+
|  [FSZ LOGO]  Flood Safe Zone (FHEG)  |  MAE HONG SON CASE STUDY  | [⚙️ Settings] [ℹ️ Sources] |
+---------------------------------------------------------------------------------------+
|  KPI BAR: [🎯 Selected: Z2 (Rank #1)] [⏱️ ETA: 7.42 min] [🌊 Pai Flow: 42.8 m³/s] [✅ Verified] |
+---------------------------------------------------------------------------------------+
|   🗺️ 3D WEBGL LIGHT MAP (MapLibre GL Isometric 55°)                                    |
|   - 🔴 Red Zone (เขตวิกฤตน้ำท่วมรุนแรง H ≥ 1.25)                                       |
|   - 🟡 Yellow Zone (เขตเฝ้าระวังน้ำท่วมปานกลาง 0.6 ≤ H < 1.25)                          |
|   - 🟢 Green Zone (เขตพื้นที่ปลอดภัยบนที่สูง H < 0.25)                                 |
|   - ⚡ 3D Glowing Neon Optimal Evacuation Path (S -> Z2)                               |
+---------------------------------------------------------------------------------------+
|  📊 ANALYTICS DECK: [1. Route Summary] [2. TOPSIS Matrix] [3. A* Verification]        |
+---------------------------------------------------------------------------------------+
|  📐 MATHEMATICAL PROOF DRAWER: KaTeX Formulas, Proofs & Parameter Breakdowns          |
+---------------------------------------------------------------------------------------+
```

* ☀️ **Pure Light-Mode Laboratory Console**: ดีไซน์หน้าจอสีขาว-เทาเงินสะอาดตา สไตล์ห้องปฏิบัติการวิทยาศาสตร์ระดับสากล ไม่รกตา
* 🗺️ **True 3D WebGL Geospatial Map**: หมุนมุมมอง 3 มิติ (Isometric 55°) แสดงความลึกและระดับความสูงของภูมิประเทศหุบเขา
* 🔴🟡🟢 **Explicit Inundation Risk Zones**: วาด Red Zone (เขตวิกฤต), Yellow Zone (เขตเฝ้าระวัง) และ Green Zone (เขตปลอดภัยบนที่สูง) ชัดเจน พร้อมสวิตช์เปิด-ปิด
* ⚙️ **Progressive Disclosure Settings**: ซ่อนการปรับค่าพารามิเตอร์ไว้ใน Drawer สไลด์ออกมากด Apply & Compute ได้ทันที
* 📐 **Interactive Math Proofs & KaTeX**: แสดงบทพิสูจน์ทางคณิตศาสตร์ อนุพันธ์ของฟังก์ชัน และการแทนค่าตัวแปรระดับ Edge
* 🌐 **100% Free & Open APIs (No Credit Card)**: ข้อมูลจริงจาก OpenStreetMap, Copernicus 30m DEM, GloFAS River Discharge และ ECMWF Weather

---

## 📐 แกนกลางคณิตศาสตร์ (Mathematical Formulations)

### 1. ความลาดชันของเส้นทาง (Topographical Slope: $s_e$)
$$s_e = \frac{z_j - z_i}{L_e}$$

### 2. ฟังก์ชันระดับอันตรายจากน้ำท่วม (Flood Hazard Function: $H_e$)
$$H_e = h_e(v_e + 0.5) + D_e$$
> **Proof of Strictly Increasing Monotonicity:**
> $$\frac{\partial H}{\partial h} = v + 0.5 > 0, \quad \frac{\partial H}{\partial v} = h \ge 0$$
> รับประกันว่าระดับความเสี่ยงจะเพิ่มขึ้นตามความลึกและความเร็วของน้ำเสมอ

### 3. เงื่อนไขขอบเขตตัดเส้นทางวิกฤต (Feasibility Cutoff Constraint: $H_c$)
$$e \in E_F \iff H_e < H_c = 1.25$$

### 4. ฟังก์ชันลดทอนความเร็วการเดินเท้า (Speed Attenuation Function: $\phi_p$)
$$\phi_p(H) = \begin{cases}
1.0 & H \le 0.25 \\
\left(\frac{1.25 - H}{1.0}\right)^p & 0.25 < H < 1.25 \\
0.0 & H \ge 1.25
\end{cases}$$

### 5. ความเร็วเดินเท้าจริง (Effective Walking Speed: $u_e$)
$$u_e = V_T(s_e) \cdot \phi_p(H_e), \quad V_T(s_e) = 6 \exp(-3.5 \cdot |s_e + 0.05|) \quad (\text{km/h} \to \text{m/min})$$

### 6. น้ำหนักเส้นทาง FHEG (Edge Cost Weight: $w_e(\lambda)$)
$$w_e(\lambda) = t_e + \lambda \cdot r_e = \frac{L_e}{u_e} + \lambda \cdot \left[ t_e \left(\frac{H_e}{H_c - \min(H_e, H_c - 0.05)}\right)^q \cdot 0.45 \right]$$

### 7. จุดเปลี่ยนผ่านเส้นทาง (Analytical Route Switching Thresholds: $\lambda_{ij}$)
$$\lambda_{ij} = \frac{T_j - T_i}{R_i - R_j}$$

---

## 🏛️ ศูนย์พักพิงชั่วคราวกรณีศึกษา (Candidate Safe Zones)

| รหัส | ชื่อสถานที่ | ระดับความสูง (MSL) | ระยะห่างแม่น้ำปาย | ความจุรองรับ | คุณลักษณะพื้นที่ |
|:---:|---|:---:|:---:|:---:|---|
| **Z1** | **โรงเรียนห้องสอนศึกษา** | $252.0\text{ m}$ | $650\text{ m}$ | 800 คน | เนินเขาสูงตอนเหนือ มีอาคารเรียนคอนกรีตเสริมเหล็ก |
| **Z2** | **ศาลากลาง / หอประชุมเทศบาล** | $260.0\text{ m}$ | $850\text{ m}$ | 1,200 คน | พื้นที่ราชการบนเนินเขา สาธารณูปโภคครบครัน (Rank #1) |
| **Z3** | **ลานวัดพระธาตุดอยกองมู** | $325.0\text{ m}$ | $1,400\text{ m}$ | 450 คน | ภูเขาสูง ปลอดภัยจากน้ำท่วม 100% ทางขึ้นลาดชัน |
| **Z4** | **สนามกีฬากลางจังหวัด** | $239.0\text{ m}$ | $350\text{ m}$ | 1,500 คน | พื้นที่ลุ่มใกล้แม่น้ำ เสี่ยงน้ำท่วมเข้าถึงยากในฤดูน้ำหลาก |

---

## 🚀 โครงสร้างโฟลเดอร์ (Repository Structure)

```text
YSC-FloodSafeZone/
├── index.html                  # Master Presentation Webapp (Pure Light Console)
├── README.md                   # Complete Project Overview & Mathematical Specs
├── Architecture.md             # System Architecture & Technical Specifications
├── AGENTS.md                   # AI Agent & Pair Programming Guidelines
├── blueprint.md                # Canonical Research Blueprint (48 Sections)
├── css/
│   ├── design-tokens.css       # Pure Light Tokens, Lab Shadows, Typography
│   ├── layout.css              # Fluid Grid System, KPI Cards, Map Stage, Drawers
│   ├── components.css          # Lab Console Buttons, Zone Filter Pills, Modals
│   └── visualizers.css         # KaTeX Strict Fix, 3D Markers, Glowing Polyline
└── js/
    ├── config.js               # 3D Map Coordinates, APIs, Red/Yellow/Green GeoJSON
    ├── data-network.js         # Mae Hong Son Road Network (28 Nodes / 42 Edges)
    ├── fheg-core.js            # FHEG Mathematical Pipeline (Slope, Hazard, Speed, Cost)
    ├── solvers.js              # A* Search (Admissible Heuristic) & Dijkstra Solver
    ├── topsis-engine.js        # Dynamic 6-Step TOPSIS Decision Matrix Engine
    ├── map-visualizer.js       # MapLibre GL 3D Engine with Zone Polygons & Camera
    ├── chart-visualizer.js     # Chart.js Route Switching & Sensitivity Curves
    ├── live-compute-anim.js    # 3D Node Exploration Simulation & KPI Ticker
    ├── exporter.js             # Research Evidence Exporter (JSON & CSV)
    └── app.js                  # Main Application Orchestrator & Event Controller
```

---

## 💻 วิธีการเปิดใช้งาน (Getting Started)

ระบบถูกออกแบบให้ทำงานแบบ Client-Side 100% โดยไม่ต้องติดตั้ง Backend หรือฐานข้อมูล:

### วิธีที่ 1: เปิดผ่านเบราว์เซอร์โดยตรง (Direct Browser)
ดับเบิลคลิกไฟล์ `index.html` เพื่อเปิดใช้งานบน Google Chrome, Microsoft Edge, Safari, หรือ Firefox

### วิธีที่ 2: รันผ่าน Local Web Server (แนะนำ)
```bash
# ใช้ Python Built-in HTTP Server
python -m http.server 8080

# หรือใช้ Node.js http-server / serve
npx serve .
```
เปิดเบราว์เซอร์ไปที่ `http://localhost:8080`

---

## 📊 แหล่งข้อมูล & การอ้างอิง (Data Attribution & APIs)

* **OpenStreetMap (OSM) & Overpass API**: โครงข่ายถนน พิกัดแยก และจุดปลอดภัยใน อ.เมืองแม่ฮ่องสอน
* **Copernicus Global DEM (30m) & Open-Meteo Elevation API**: ระดับความสูงภูมิประเทศจริงเหนือระดับน้ำทะเล
* **Global Flood Awareness System (GloFAS) & Open-Meteo Flood API**: ข้อมูลอัตราการไหลแม่น้ำปาย ($m^3/s$)
* **ECMWF & Open-Meteo Weather API**: ปริมาณน้ำฝนสะสมแบบเรียลไทม์ ($mm/h$)
* **MapLibre GL JS & CartoDB / ESRI**: แผนที่ภาพถ่ายดาวเทียมและ 3D Vector Tiles (Free Tier)

---

## 🏆 การแข่งขันและผู้พัฒนา (Credits)

* **โครงงานพัฒนาสำหรับ:** การประกวดโครงงานของนักวิทยาศาสตร์รุ่นเยาว์ ครั้งที่ 28 (YSC 2569)
* **สาขาวิชา:** คณิตศาสตร์ประยุกต์ (Applied Mathematics)
