import assert from "node:assert/strict";
import { test } from "node:test";

function isPrime(n) {
  if (n < 2) return false;
  if (n % 2 === 0) return n === 2;
  if (n % 3 === 0) return n === 3;
  for (let i = 5; i * i <= n; i += 6) {
    if (n % i === 0 || n % (i + 2) === 0) return false;
  }
  return true;
}

function buildSpiral(start, edges, increment, maxIncrements) {
  const points = [];
  let x = 0;
  let y = 0;
  let value = start;
  points.push({ x, y, value, prime: isPrime(value) });

  const dirs = [];
  for (let i = 0; i < edges; i++) {
    const angle = (2 * Math.PI * i) / edges;
    dirs.push({ dx: Math.cos(angle), dy: -Math.sin(angle) });
  }

  const sidesBeforeGrow = Math.max(1, Math.floor(edges / 2));
  let dirIndex = 0;
  let sideLength = 1;
  let sidesDrawn = 0;
  let stepsLeft = maxIncrements;

  while (stepsLeft > 0) {
    const dir = dirs[dirIndex % edges];
    const stepsThisSide = Math.min(sideLength, stepsLeft);
    for (let s = 0; s < stepsThisSide; s++) {
      x += dir.dx;
      y += dir.dy;
      value += increment;
      points.push({ x, y, value, prime: isPrime(value) });
    }
    stepsLeft -= stepsThisSide;
    dirIndex += 1;
    sidesDrawn += 1;
    if (sidesDrawn >= sidesBeforeGrow) {
      sidesDrawn = 0;
      sideLength += 1;
    }
  }

  return points;
}

/** Indices of primes that lie on at least one line with ≥ minCount primes. */
function findCollinearPrimeIndices(points, minCount) {
  const primes = [];
  for (let i = 0; i < points.length; i++) {
    if (points[i].prime) primes.push(i);
  }
  if (primes.length < minCount) return new Set();

  const highlighted = new Set();
  const eps = 1e-9;
  const n = primes.length;

  for (let i = 0; i < n; i++) {
    const groups = new Map();
    const pi = points[primes[i]];
    for (let j = 0; j < n; j++) {
      if (i === j) continue;
      const pj = points[primes[j]];
      let dx = pj.x - pi.x;
      let dy = pj.y - pi.y;
      if (Math.abs(dx) < eps && Math.abs(dy) < eps) continue;
      const len = Math.hypot(dx, dy);
      dx /= len;
      dy /= len;
      if (dx < -eps || (Math.abs(dx) < eps && dy < 0)) {
        dx = -dx;
        dy = -dy;
      }
      const key = Math.round(dx * 1e6) + "," + Math.round(dy * 1e6);
      let group = groups.get(key);
      if (!group) {
        group = [primes[i]];
        groups.set(key, group);
      }
      group.push(primes[j]);
    }
    for (const group of groups.values()) {
      if (group.length < minCount) continue;
      for (let k = 0; k < group.length; k++) highlighted.add(group[k]);
    }
  }

  return highlighted;
}

/**
 * Indices of primes on a straight line where every spiral node on that line is
 * prime, and consecutive nodes are neighbors (no long skips).
 */
function findFullyPrimeLineIndices(points) {
  const highlighted = new Set();
  const n = points.length;
  if (n < 2) return highlighted;

  const eps = 1e-9;
  const unit =
    n >= 2 ? Math.hypot(points[1].x - points[0].x, points[1].y - points[0].y) || 1 : 1;
  const maxStep = unit * Math.SQRT2 + 1e-6;

  for (let i = 0; i < n; i++) {
    const groups = new Map();
    const pi = points[i];
    for (let j = 0; j < n; j++) {
      if (i === j) continue;
      const pj = points[j];
      let dx = pj.x - pi.x;
      let dy = pj.y - pi.y;
      if (Math.abs(dx) < eps && Math.abs(dy) < eps) continue;
      const len = Math.hypot(dx, dy);
      dx /= len;
      dy /= len;
      if (dx < -eps || (Math.abs(dx) < eps && dy < 0)) {
        dx = -dx;
        dy = -dy;
      }
      const key = Math.round(dx * 1e6) + "," + Math.round(dy * 1e6);
      let group = groups.get(key);
      if (!group) {
        group = [i];
        groups.set(key, group);
      }
      group.push(j);
    }
    for (const group of groups.values()) {
      if (group.length < 2) continue;
      let allPrime = true;
      for (let k = 0; k < group.length; k++) {
        if (!points[group[k]].prime) {
          allPrime = false;
          break;
        }
      }
      if (!allPrime) continue;

      const base = points[group[0]];
      let ux = points[group[1]].x - base.x;
      let uy = points[group[1]].y - base.y;
      const ul = Math.hypot(ux, uy) || 1;
      ux /= ul;
      uy /= ul;
      const ordered = group.slice().sort((a, b) => {
        const ta = (points[a].x - base.x) * ux + (points[a].y - base.y) * uy;
        const tb = (points[b].x - base.x) * ux + (points[b].y - base.y) * uy;
        return ta - tb;
      });
      const gaps = [];
      for (let k = 1; k < ordered.length; k++) {
        const a = points[ordered[k - 1]];
        const b = points[ordered[k]];
        gaps.push(Math.hypot(b.x - a.x, b.y - a.y));
      }
      const step = Math.min(...gaps);
      if (step > maxStep) continue;
      let uniform = true;
      for (let k = 0; k < gaps.length; k++) {
        if (Math.abs(gaps[k] - step) > 1e-4) {
          uniform = false;
          break;
        }
      }
      if (!uniform) continue;

      for (let k = 0; k < ordered.length; k++) highlighted.add(ordered[k]);
    }
  }

  return highlighted;
}

test("isPrime handles small cases", () => {
  assert.equal(isPrime(1), false);
  assert.equal(isPrime(2), true);
  assert.equal(isPrime(3), true);
  assert.equal(isPrime(4), false);
  assert.equal(isPrime(9), false);
  assert.equal(isPrime(97), true);
  assert.equal(isPrime(100), false);
});

test("buildSpiral length is 1 + maxIncrements", () => {
  const points = buildSpiral(1, 4, 1, 50);
  assert.equal(points.length, 51);
  assert.equal(points[0].value, 1);
  assert.equal(points[50].value, 51);
});

test("square spiral (4 edges) uses axis-aligned directions", () => {
  const points = buildSpiral(1, 4, 1, 8);
  // First side length 1: right (cos0=1)
  assert.ok(Math.abs(points[1].x - 1) < 1e-9);
  assert.ok(Math.abs(points[1].y) < 1e-9);
  // Second side length 1: up (angle π/2 → dy=-1 in screen coords)
  assert.ok(Math.abs(points[2].x - 1) < 1e-9);
  assert.ok(Math.abs(points[2].y - -1) < 1e-9);
});

test("side length grows every floor(edges/2) sides for square", () => {
  // edges=4 → grow every 2 sides: lengths 1,1,2,2,3,...
  const points = buildSpiral(1, 4, 1, 12);
  // After 1+1+2+2 = 6 steps from center → index 6
  // After another 3 → index 9; another 3 → index 12
  assert.equal(points.length, 13);
  const primes = points.filter((p) => p.prime).map((p) => p.value);
  assert.deepEqual(primes, [2, 3, 5, 7, 11, 13].filter((n) => n <= 13));
});

test("increment scales values", () => {
  const points = buildSpiral(5, 3, 2, 4);
  assert.deepEqual(
    points.map((p) => p.value),
    [5, 7, 9, 11, 13]
  );
});

test("triangular spiral has three direction vectors", () => {
  const points = buildSpiral(1, 3, 1, 3);
  assert.equal(points.length, 4);
  // All three first steps should land at unit distance from origin
  for (let i = 1; i <= 3; i++) {
    const d = Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
    assert.ok(Math.abs(d - 1) < 1e-9);
  }
});

test("findCollinearPrimeIndices highlights a line of 10 primes", () => {
  const points = [];
  for (let i = 0; i < 10; i++) {
    points.push({ x: i, y: 2 * i, value: 0, prime: true });
  }
  points.push({ x: 0, y: 1, value: 0, prime: true }); // off the line
  const hit = findCollinearPrimeIndices(points, 10);
  assert.equal(hit.size, 10);
  for (let i = 0; i < 10; i++) assert.ok(hit.has(i));
  assert.equal(hit.has(10), false);
});

test("findCollinearPrimeIndices ignores short lines", () => {
  const points = [];
  for (let i = 0; i < 9; i++) {
    points.push({ x: i, y: 0, value: 0, prime: true });
  }
  const hit = findCollinearPrimeIndices(points, 10);
  assert.equal(hit.size, 0);
});

test("default square spiral has collinear prime runs of 10+", () => {
  const points = buildSpiral(1, 4, 1, 500);
  const hit = findCollinearPrimeIndices(points, 10);
  assert.ok(hit.size >= 10);
});

test("findFullyPrimeLineIndices highlights an all-prime line", () => {
  const points = [
    { x: 0, y: 0, value: 0, prime: true },
    { x: 1, y: 0, value: 0, prime: true },
    { x: 2, y: 0, value: 0, prime: true },
    { x: 0, y: 1, value: 0, prime: true },
  ];
  const hit = findFullyPrimeLineIndices(points);
  assert.ok(hit.has(0));
  assert.ok(hit.has(1));
  assert.ok(hit.has(2));
});

test("findFullyPrimeLineIndices ignores lines with a non-prime gap", () => {
  const points = [
    { x: 0, y: 0, value: 0, prime: true },
    { x: 1, y: 0, value: 0, prime: false },
    { x: 2, y: 0, value: 0, prime: true },
  ];
  const hit = findFullyPrimeLineIndices(points);
  assert.equal(hit.size, 0);
});

test("findFullyPrimeLineIndices highlights short neighbor all-prime lines", () => {
  const points = [
    { x: 0, y: 0, value: 0, prime: true },
    { x: 1, y: 1, value: 0, prime: true },
    { x: 3, y: 0, value: 0, prime: false },
  ];
  const hit = findFullyPrimeLineIndices(points);
  assert.equal(hit.size, 2);
  assert.ok(hit.has(0));
  assert.ok(hit.has(1));
});

test("findFullyPrimeLineIndices ignores sparse all-prime skips", () => {
  // Unit path step via (0,0)→(0,1); primes on y=0 are spaced 5 apart (not neighbors).
  const points = [
    { x: 0, y: 0, value: 0, prime: true },
    { x: 0, y: 1, value: 0, prime: false },
    { x: 5, y: 0, value: 0, prime: true },
    { x: 10, y: 0, value: 0, prime: true },
  ];
  const hit = findFullyPrimeLineIndices(points);
  assert.equal(hit.size, 0);
});

test("default square spiral has no fully prime neighbor lines", () => {
  const points = buildSpiral(1, 4, 1, 500);
  const hit = findFullyPrimeLineIndices(points);
  assert.equal(hit.size, 0);
});

test("start=41 square spiral has a fully prime diagonal", () => {
  // Classic Ulam diagonal through 41: every node on y=-x in this view is prime.
  const points = buildSpiral(41, 4, 1, 100);
  const hit = findFullyPrimeLineIndices(points);
  assert.equal(hit.size, 10);
  const values = [...hit].map((i) => points[i].value).sort((a, b) => a - b);
  assert.deepEqual(values, [41, 43, 47, 53, 61, 71, 83, 97, 113, 131]);
});
