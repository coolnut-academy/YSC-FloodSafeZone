/* ==========================================================================
   TOPSIS MULTI-CRITERIA DECISION ENGINE
   ========================================================================== */

const TOPSIS_Engine = {
  // Execute full 6-step TOPSIS algorithm on Candidate Safe Zones
  compute(shelterIds, nodes, routeResults, rawWeights) {
    // 1. Normalize Criteria Weights so sum(w_j) = 1.0
    const sumW = rawWeights.reduce((a, b) => a + b, 0);
    const weights = rawWeights.map(w => sumW > 0 ? w / sumW : 0.25);

    // 2. Build Decision Matrix X [m x n]
    // Criteria: [C1: ETA Travel Time (Cost), C2: Relative Elevation (Benefit), C3: River Buffer (Benefit), C4: Capacity (Benefit)]
    const rawMatrix = shelterIds.map(zId => {
      const node = nodes[zId];
      const route = routeResults[zId];
      const eta = (route && route.feasible) ? route.travelTime : 999.0;
      return [eta, node.z, node.riverDist, node.capacity];
    });

    // 3. Vector Normalization: r_ij = x_ij / sqrt(sum_i x_ij^2)
    const numCriteria = 4;
    const colNorms = [];
    for (let j = 0; j < numCriteria; j++) {
      let sumSq = 0;
      for (let i = 0; i < shelterIds.length; i++) {
        sumSq += rawMatrix[i][j] * rawMatrix[i][j];
      }
      colNorms.push(Math.sqrt(sumSq));
    }

    const normMatrix = rawMatrix.map(row => {
      return row.map((val, j) => colNorms[j] > 0 ? val / colNorms[j] : 0);
    });

    // 4. Weighted Normalized Matrix: y_ij = w_j * r_ij
    const weightedMatrix = normMatrix.map(row => {
      return row.map((val, j) => val * weights[j]);
    });

    // 5. Determine Positive Ideal Solution (A+) and Negative Ideal Solution (A-)
    // C1 is Cost (min is better), C2-C4 are Benefit (max is better)
    const idealPlus = [
      Math.min(...weightedMatrix.map(r => r[0])),
      Math.max(...weightedMatrix.map(r => r[1])),
      Math.max(...weightedMatrix.map(r => r[2])),
      Math.max(...weightedMatrix.map(r => r[3]))
    ];

    const idealMinus = [
      Math.max(...weightedMatrix.map(r => r[0])),
      Math.min(...weightedMatrix.map(r => r[1])),
      Math.min(...weightedMatrix.map(r => r[2])),
      Math.min(...weightedMatrix.map(r => r[3]))
    ];

    // 6. Euclidean Separation Measures & Closeness Coefficients
    const results = shelterIds.map((zId, i) => {
      const row = weightedMatrix[i];
      let dPlusSq = 0;
      let dMinusSq = 0;

      for (let j = 0; j < numCriteria; j++) {
        dPlusSq += Math.pow(row[j] - idealPlus[j], 2);
        dMinusSq += Math.pow(row[j] - idealMinus[j], 2);
      }

      const dPlus = Math.sqrt(dPlusSq);
      const dMinus = Math.sqrt(dMinusSq);
      const closeness = (dPlus + dMinus) > 0 ? dMinus / (dPlus + dMinus) : 0;

      return {
        zoneId: zId,
        name: nodes[zId].name,
        raw: rawMatrix[i],
        norm: normMatrix[i],
        weighted: row,
        dPlus,
        dMinus,
        closeness,
        rank: 1
      };
    });

    // Sort by Closeness descending and assign Rank
    const sorted = [...results].sort((a, b) => b.closeness - a.closeness);
    sorted.forEach((item, idx) => {
      const found = results.find(r => r.zoneId === item.zoneId);
      if (found) found.rank = idx + 1;
    });

    return {
      weights,
      rawMatrix,
      normMatrix,
      weightedMatrix,
      idealPlus,
      idealMinus,
      results
    };
  }
};
