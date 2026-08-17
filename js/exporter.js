/* ==========================================================================
   EVIDENCE & AUDIT EXPORTER (JSON & CSV)
   ========================================================================== */

const ResearchExporter = {
  exportEvidence(computedEdges, routeResults, topsisData, solverComparison, currentParams) {
    const researchPackage = {
      project: "Flood Safe Zone (FSZ) - FHEG Mathematical Graph Model",
      academicYear: 2569,
      caseStudy: "Mae Hong Son Municipality, Thailand",
      generatedAt: new Date().toISOString(),
      parameters: currentParams,
      nodes: MAEHONGSON_NODES,
      edges: computedEdges,
      routes: routeResults,
      topsis: topsisData,
      verification: solverComparison
    };

    // 1. Download JSON Research Package
    const jsonStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(researchPackage, null, 2));
    const jsonLink = document.createElement("a");
    jsonLink.setAttribute("href", jsonStr);
    jsonLink.setAttribute("download", `fsz_fheg_evidence_${Date.now()}.json`);
    document.body.appendChild(jsonLink);
    jsonLink.click();
    jsonLink.remove();

    // 2. Download CSV Edge Table
    let csv = "data:text/csv;charset=utf-8,";
    csv += "Edge_ID,From,To,Length_m,Slope_pct,Depth_m,Velocity_ms,Debris,Hazard_H,Feasible,Atten_phi,Speed_m_min,TravelTime_min,Risk_min_eq,Weight_w\n";
    computedEdges.forEach(e => {
      csv += `${e.id},${e.from},${e.to},${e.length.toFixed(1)},${(e.slope * 100).toFixed(2)},${e.he.toFixed(2)},${e.ve.toFixed(2)},${e.De.toFixed(2)},${e.He.toFixed(4)},${e.feasible},${e.phi.toFixed(4)},${e.effectiveSpeed.toFixed(1)},${e.te.toFixed(3)},${isFinite(e.re) ? e.re.toFixed(3) : 'Inf'},${isFinite(e.weight) ? e.weight.toFixed(3) : 'Inf'}\n`;
    });

    const csvLink = document.createElement("a");
    csvLink.setAttribute("href", encodeURI(csv));
    csvLink.setAttribute("download", `fsz_edge_audit_${Date.now()}.csv`);
    document.body.appendChild(csvLink);
    csvLink.click();
    csvLink.remove();
  }
};
