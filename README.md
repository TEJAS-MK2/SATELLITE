# SATELLITE

A lightweight real-time orbital intelligence dashboard inspired by the OSIRIS Live command-center experience.

## Live site

**[Open SATELLITE on GitHub Pages](https://tejas-mk2.github.io/SATELLITE/)**

## Live data

The dashboard consumes public OSIRIS Intelligence API endpoints directly from the browser:

- `GET https://osirisai.live/api/satellites`
- `GET https://osirisai.live/api/earthquakes`
- `GET https://osirisai.live/api/flights`
- `GET https://osirisai.live/api/stats`

No API key is hard-coded or required by this project. OSIRIS documents these read endpoints as public/keyless feeds.

## Features

- Interactive MapLibre globe
- Live satellite positions
- Satellite search by name or NORAD ID
- Satellite orbit-path visualization when orbital data is available
- ISS quick tracking
- Live earthquake and aircraft layers
- Object telemetry panel
- Automatic data refresh
- Responsive command-center interface

## Run locally

Serve the repository with any local HTTP server, for example:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

## GitHub Pages

Every push to `main` runs `.github/workflows/pages.yml` and deploys the static site to GitHub Pages.

In repository settings, set **Pages → Build and deployment → Source** to **GitHub Actions** if it is not already configured.

## License

Mozilla Public License 2.0. See `LICENSE`.
