# Stack Manager

A **privacy-first, browser-only** reference tool for managing your personal substance library ("stack").

> All data is stored in browser `localStorage`. Nothing is sent to any server. Export JSON backups regularly.

## Features

- **Drug Index** — Searchable, filterable library of substances with full pharmacokinetic profiles
- **Per-drug data fields**: drug class, schedule, mechanism of action, routes of administration
- **Pharmacokinetics**: onset, T‍max, half-life (t½), duration (total, peak, after-effects), bioavailability, volume of distribution, protein binding, metabolic pathway, active metabolites, excretion
- **Dosing tiers**: threshold, light, common/moderate, strong, frequency/redosing
- **Interactions & Safety**: drug interactions, contraindications, side effects, tolerance/dependence notes
- **Tags & free-text notes** per entry
- **Dose Log** — Timestamped log with substance, dose, unit, route, context, notes
- **Active Timeline** — Live view of what's currently active based on logged doses + duration windows, with phase labels (Onset → Coming up → Peak → Offset → Fading)
- **Import / Export** — JSON backup (full restore) and CSV export for analysis
- **Dark mode** with system preference detection + manual toggle

## Usage

1. Open `index.html` in any modern browser (no server required)
2. Navigate to **Add / Edit Drug** to build your index
3. Use **Dose Log** to record doses
4. Check **Active Timeline** to see current phase and remaining duration
5. Export a JSON backup regularly via **Import / Export**

## Schema

Data is stored as JSON arrays in `localStorage`:

```json
// stack-manager.drugs.v1
[
  {
    "id": "uuid",
    "name": "Modafinil",
    "aliases": "Provigil, Modalert",
    "drugClass": "Eugeroic",
    "schedule": "Schedule IV",
    "moa": "DAT inhibitor, orexin system activator",
    "routes": "Oral",
    "tmax": "2–3",
    "halflife": "12–15",
    "onset": "0.5–1",
    "durationTotal": "10–12",
    "durationPeak": "3–5",
    "afterEffects": "2–3",
    "bioavailability": "~80%",
    "vd": "0.9",
    "proteinBinding": "60%",
    "metabolicPathway": "Hepatic amide hydrolysis, CYP3A4",
    "metabolites": "Modafinil sulfone, modafinil acid",
    "excretion": "Renal, ~80%",
    "doseThreshold": "25",
    "doseLight": "50–100",
    "doseCommon": "100–200",
    "doseStrong": "200–400",
    "doseUnit": "mg",
    "doseFrequency": "Once daily AM, max 1 redose before noon",
    "interactions": "Hormonal contraceptives (reduced efficacy), MAOIs, CNS stimulants",
    "contraindications": "Hypersensitivity, left ventricular hypertrophy, arrhythmias",
    "sideEffects": "Headache, insomnia, nausea, anxiety, reduced appetite",
    "tolerance": "Minimal; functional tolerance reported with daily use",
    "tags": "nootropic, wakefulness, eugeroic",
    "notes": "Best taken early AM on empty stomach. Avoid PM doses.",
    "createdAt": "2026-08-25T00:00:00.000Z"
  }
]
```

## Disclaimer

This is a personal reference and observation tool. It is **not** medical advice. Always consult licensed clinicians and current pharmacological literature.
