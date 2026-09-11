# ULAMPOLYGON

Polygonal Ulam spiral visualizer. The spiral path is drawn as a line; hollow circles mark primes. **Edges** sets the polygon (3 = triangle, 4 = square, …).

## Controls

| Field | Meaning |
| --- | --- |
| Start (center) | Value at the origin |
| Edges | Number of spiral directions / polygon sides (≥ 3) |
| Increment | Added to the value at each step |
| Max increments | How many steps to draw after the center |
| Highlight collinear primes (10+) | When on, primes that lie on a straight line with at least 10 primes in the current spiral are drawn in red |

Use the **+** / **−** buttons or type a value; the spiral updates on every change. The collinear toggle redraws immediately.

### Growth rule (not a control)

Side length starts at 1 and increases by 1 after every `floor(edges / 2)` sides. For a square (`edges = 4`) that means grow every 2 sides → lengths `1,1,2,2,3,3,…` — the classic Ulam spiral arm pattern.

## Local preview

Open `index.html` in a browser, or:

```bash
python3 -m http.server 8080
```

Then visit http://localhost:8080/

## Tests

```bash
node --test tests/spiral.test.mjs
```

## GitHub Pages

A workflow deploys this site to GitHub Pages on every push to `main`. Enable **Settings → Pages → Source: GitHub Actions** if it is not already on.
