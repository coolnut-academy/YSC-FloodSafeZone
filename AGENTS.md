# AI Agent Guidelines & Repository Engineering Standards (AGENTS.md)
## Flood Safe Zone (FSZ) — Applied Mathematics Research Repository

เอกสารนี้กำหนดข้อตกลง กฎระเบียบทางคณิตศาสตร์ และมาตรฐานการพัฒนาโค้ดสำหรับ **AI Agents และคู่โปรแกรมเมอร์ (Pair Programmer)** ที่ทำงานในคลังข้อมูลนี้

---

## 1. กฎเหล็กที่ห้ามละเมิดเด็ดขาด (Non-Negotiable Rules)

### 1.1 นโยบาย Pure Light Theme 100% (Strict Light Mode Mandate)
- **ห้ามใส่ Dark Mode หรือปุ่มสลับ Dark Mode กลับเข้ามาในระบบเด็ดขาด**
- รักษาโทนสีแบบ **Scientific Laboratory Console**:
  - พื้นหลังหลัก: Pure White (`#ffffff`), Ice Slate (`#f8fafc`, `#f4f7fb`)
  - ตัวอักษร: Deep Navy (`#0a192f`, `#334e68`)
  - เส้นขอบ: Subtle Slate (`#e2e8f0`, `#cbd5e1`)
  - แผนที่: CartoDB Voyager Light / ESRI Satellite Light / OpenStreetMap Light

### 1.2 นโยบาย Zero Payment / No Credit Card / No Paid APIs
- **ห้ามนำเข้า Mapbox หรือบริการแผนที่/API ที่ต้องผูกบัตรเครดิตหรือเสียค่าใช้จ่ายเด็ดขาด**
- ให้ใช้เฉพาะ Open-Source / Free Tier Endpoints เท่านั้น (MapLibre GL JS, Open-Meteo, Copernicus DEM, GloFAS, Overpass API)

### 1.3 นโยบายความถูกต้องทางคณิตศาสตร์ (Mathematical Invariance & Tolerance)
- ค่าความคลาดเคลื่อนระหว่าง A\* และ Dijkstra ต้องเป็นศูนย์ตามความแม่นยำทศนิยม:
  $$\Delta C = |C_{A^*} - C_{\text{Dijkstra}}| < 10^{-6}$$
- ค่าคงที่ทางทฤษฎีต้องคงที่ตาม [blueprint.md](file:///d:/YSC-FloodSafeZone/blueprint.md):
  - $H_c = 1.25$ (Feasibility Cutoff)
  - $H_0 = 0.25$ (Attenuation Lower Boundary)
  - $u_{\max} = 90.0\text{ m/min}$ (A* Heuristic Admissible Speed)
  - $q = 1.25, \quad p = 1.50$ (Default Curvatures)

### 1.4 การจัดวางสมการ KaTeX (KaTeX Layout Protection)
- **ห้ามให้สมการคณิตศาสตร์หรือสัญลักษณ์ $(\Delta C)$, $(\epsilon)$, $10^{-6}$ ตกบรรทัดเป็นตัวอักษรเดี่ยวในแนวตั้งเด็ดขาด**
- ต้องรักษา CSS Rule:
  ```css
  .katex { white-space: nowrap !important; }
  .katex .base { white-space: nowrap !important; }
  ```

---

## 2. โครงสร้างไฟล์และการแบ่งหน้าที่ (Repository Structure)

```text
d:\YSC-FloodSafeZone/
├── index.html                  # Master Presentation Webapp (Pure Light Console)
├── README.md                   # Project Overview, Formulations & Guide
├── Architecture.md             # System Engineering & Technical Blueprint
├── AGENTS.md                   # AI Agent Guidelines & Coding Standards
├── blueprint.md                # Canonical Mathematical Research Blueprint
├── css/
│   ├── design-tokens.css       # Light Color Tokens, Glassmorphism, Radii
│   ├── layout.css              # Fluid Grid, KPI Cards, Map Stage, Drawers
│   ├── components.css          # Console Buttons, Zone Filter Pills, Modals
│   └── visualizers.css         # KaTeX Strict Fix, 3D Markers, Glow Effects
└── js/
    ├── config.js               # 3D Map Coordinates, APIs, Flood Zones GeoJSON
    ├── data-network.js         # Mae Hong Son Road Graph (28 Nodes / 42 Edges)
    ├── fheg-core.js            # FHEG Mathematical Pipeline Core Functions
    ├── solvers.js              # A* Search & Dijkstra Reference Solvers
    ├── topsis-engine.js        # Dynamic 6-Step TOPSIS Decision Matrix Engine
    ├── map-visualizer.js       # MapLibre GL 3D Map Engine & Camera Controller
    ├── chart-visualizer.js     # Chart.js Route Switching & Sensitivity Curves
    ├── live-compute-anim.js    # 3D Search Flow Simulation & Live KPI Ticker
    ├── exporter.js             # Evidence Exporter (JSON Package & CSV Table)
    └── app.js                  # Master Controller & Event Orchestration
```

---

## 3. ขั้นตอนการทดสอบและตรวจสอบคุณภาพ (Quality Assurance Protocol)

เมื่อ AI Agent แก้ไขโค้ด ต้องตรวจสอบรายการต่อไปนี้เสมอ:
1. **Console Check**: ไม่มี Error หรือ Unhandled Promise Rejection ใน Developer Tools
2. **Solver Identity Check**: แท็บ Verification ต้องแสดงสถานะ `PASS (100%)` และ `Max Cost Diff = 0.000000`
3. **Map 3D Rendering**: MapLibre GL 3D ต้องโหลดกระเบื้องแผนที่และแสดงโพลีกอน 🔴 Red Zone, 🟡 Yellow Zone, 🟢 Green Zone ได้อย่างสมบูรณ์
4. **Drawer Functionality**: ทั้ง Settings Drawer และ Math Proofs Drawer ต้องเปิด-ปิดได้อย่างราบรื่น
5. **Responsive Check**: ทดสอบบน Mobile Viewport (375px) ไม่มีการล้นจอหรือองค์ประกอบซ้อนทับกัน
