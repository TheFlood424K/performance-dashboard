# Performance Dashboard

A privacy-first, browser-only dashboard for self-observation of substances/medications, wellbeing, and task performance. It is a static GitHub Pages app: there is no server, account, analytics, or automatic upload.

> This app is a logging tool, not medical advice or a guide for starting, stopping, combining, or changing substances. Follow a licensed clinician's and pharmacist's directions.

## Privacy and storage

Entries are saved only in browser `localStorage` under `performance-dashboard.entries.v1`. They are **not cookies** and are not sent to GitHub or any other server.

Local browser storage can be erased when site data is cleared or devices fail. Export JSON backups regularly and keep them private. Never commit exported health data to this public repository.

## Backup and analysis

- **Export backup (JSON):** full portable backup for restoring to this app.
- **Import backup:** merges entries by unique ID without duplicating them.
- **Export analysis (CSV):** produces a flat table with ISO timestamps for spreadsheets or analysis.

CSV fields: `id,timestamp,type,substance,dose,unit,route,focus,energy,mood,wellbeing,discomfort,stress,performance,sideEffects,context,notes`.

## GitHub Pages

1. Open repository **Settings** then **Pages**.
2. Under Build and deployment, choose **Deploy from a branch**.
3. Select branch `main` and folder `/ (root)`, then save.
4. GitHub will display the deployed site URL.

## Accessible design

Semantic forms, visible keyboard focus, a skip link, responsive layout, native controls, status messages, and reduced-motion support are included.