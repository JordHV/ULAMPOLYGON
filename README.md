# ULAMPOLYGON

Polygonal Ulam spiral visualizer. The spiral path is drawn as a line; hollow circles mark primes. **Edges** sets the polygon (3 = triangle, 4 = square, …).

## Controls

| Field | Meaning |
| --- | --- |
| Start (center) | Value at the origin |
| Edges | Number of spiral directions / polygon sides (≥ 3) |
| Increment | Added to the value at each step |
| Max increments | How many steps to draw after the center |

## Local preview

Open `index.html` in a browser, or:

```bash
python3 -m http.server 8080
```

Then visit http://localhost:8080/

## GitHub Pages

A workflow deploys this site to GitHub Pages on every push to `main`. Enable **Settings → Pages → Source: GitHub Actions** if it is not already on.
