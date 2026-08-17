/* ==========================================================================
   GRAPH SOLVERS: A* SEARCH (HEURISTIC) & DIJKSTRA REFERENCE SOLVER
   ========================================================================== */

const GraphSolvers = {
  // Dijkstra Solver with Step-by-Step State Tracking for Live Presentation
  dijkstra(startId, targetId, nodes, edges) {
    const t0 = performance.now();
    const dist = {};
    const prev = {};
    const visited = new Set();
    const expansionHistory = [];
    let expandedCount = 0;

    Object.keys(nodes).forEach(id => dist[id] = Infinity);
    dist[startId] = 0;

    const pq = [{ id: startId, d: 0 }];

    // Build adjacency mapping from feasible edges
    const adj = {};
    Object.keys(nodes).forEach(id => adj[id] = []);
    edges.forEach(e => {
      if (e.feasible) {
        adj[e.from].push({ to: e.to, weight: e.weight, edge: e });
      }
    });

    while (pq.length > 0) {
      pq.sort((a, b) => a.d - b.d);
      const { id: u, d: currentDist } = pq.shift();

      if (visited.has(u)) continue;
      visited.add(u);
      expandedCount++;
      expansionHistory.push({ step: expandedCount, node: u, costSoFar: currentDist });

      if (u === targetId) break;

      (adj[u] || []).forEach(({ to: v, weight }) => {
        if (!visited.has(v) && dist[u] + weight < dist[v]) {
          dist[v] = dist[u] + weight;
          prev[v] = u;
          pq.push({ id: v, d: dist[v] });
        }
      });
    }

    const t1 = performance.now();
    const path = [];
    let curr = targetId;
    if (dist[targetId] < Infinity) {
      while (curr) {
        path.unshift(curr);
        curr = prev[curr];
      }
    }

    return {
      cost: dist[targetId],
      path,
      expandedNodes: expandedCount,
      history: expansionHistory,
      runtimeMs: (t1 - t0)
    };
  },

  // A* Search Solver with Admissible & Consistent Euclidean Lower-Bound Heuristic
  aStar(startId, targetId, nodes, edges) {
    const t0 = performance.now();
    const targetNode = nodes[targetId];
    const maxSpeed = 90.0; // Admissible lower-bound speed (m/min)

    function heuristic(nodeId) {
      const n = nodes[nodeId];
      const directDist = FHEG_Math.haversine(n.lat, n.lon, targetNode.lat, targetNode.lon);
      return directDist / maxSpeed;
    }

    const gScore = {};
    const fScore = {};
    const prev = {};
    const closedSet = new Set();
    const expansionHistory = [];
    let expandedCount = 0;

    Object.keys(nodes).forEach(id => {
      gScore[id] = Infinity;
      fScore[id] = Infinity;
    });

    gScore[startId] = 0;
    fScore[startId] = heuristic(startId);

    const openSet = [{ id: startId, f: fScore[startId] }];

    // Build adjacency mapping from feasible edges
    const adj = {};
    Object.keys(nodes).forEach(id => adj[id] = []);
    edges.forEach(e => {
      if (e.feasible) {
        adj[e.from].push({ to: e.to, weight: e.weight, edge: e });
      }
    });

    while (openSet.length > 0) {
      openSet.sort((a, b) => a.f - b.f);
      const { id: current } = openSet.shift();

      if (current === targetId) break;

      closedSet.add(current);
      expandedCount++;
      expansionHistory.push({ step: expandedCount, node: current, g: gScore[current], f: fScore[current] });

      (adj[current] || []).forEach(({ to: neighbor, weight }) => {
        if (closedSet.has(neighbor)) return;

        const tentativeG = gScore[current] + weight;
        if (tentativeG < gScore[neighbor]) {
          prev[neighbor] = current;
          gScore[neighbor] = tentativeG;
          fScore[neighbor] = tentativeG + heuristic(neighbor);

          if (!openSet.some(item => item.id === neighbor)) {
            openSet.push({ id: neighbor, f: fScore[neighbor] });
          }
        }
      });
    }

    const t1 = performance.now();
    const path = [];
    let curr = targetId;
    if (gScore[targetId] < Infinity) {
      while (curr) {
        path.unshift(curr);
        curr = prev[curr];
      }
    }

    return {
      cost: gScore[targetId],
      path,
      expandedNodes: expandedCount,
      history: expansionHistory,
      runtimeMs: (t1 - t0)
    };
  }
};
