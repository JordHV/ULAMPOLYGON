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
