# Voyage Tracker — Project Context

## Overview

**Voyage Tracker** is a digital fuel consumption tracking application for the **Celebrity Solstice Engine Department**. It replaces traditional Excel-based workflows for tracking fuel consumption, equipment counter readings, and operational data across multi-leg cruise ship voyages. Users are marine engineering officers.

- **Vessel:** Celebrity Solstice
- **Current Version:** 5.0.0
- **Main File:** `Voyage_Tracker_v5_manual_carryover.html`
- **Design Reference:** `option_e_signal_flags.html` (target visual direction)

---

## Critical Deployment Constraints

These are **non-negotiable** and shape every technical decision:

1. **Single HTML file** — The entire app must be one `.html` file. No separate CSS, JS, or asset files.
2. **No Node.js / No build tools** — Corporate PCs have no admin privileges. Cannot install Node, npm, Vite, or any CLI tools.
3. **No server** — Runs from a network drive (`\\server\share\`) opened directly in Chrome/Edge.
4. **Offline-capable** — Must work once loaded (CDN resources are cached; core logic is inline).
5. **File System Access API** — Auto-saves JSON data files to a user-selected directory (network folder). Falls back to IndexedDB.
6. **Browser target:** Chrome or Edge (modern, supports File System Access API).

> **Why single-file?** Shipboard IT infrastructure is minimal. The app is deployed by copying one file to a shared network drive. No web servers, no package managers, no admin access.

---

## Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| UI Framework | React 18 via CDN | `react.production.min.js` |
| JSX Transform | Babel Standalone via CDN | `<script type="text/babel">` |
| Styling | Tailwind CSS via CDN | `cdn.tailwindcss.com` with custom config |
| Fonts | Google Fonts | Currently: Outfit, DM Sans, JetBrains Mono |
| Primary Storage | File System Access API | JSON files to network directory |
| Backup Storage | IndexedDB | `VoyageTrackerBackup` database |
| State Management | React useState/useEffect | No external state library |

---

## Architecture

### File Structure (Single-File)

The HTML file is organized with ASCII art section dividers (`═══`) for navigation:

```
<head>
  CDN imports (React, ReactDOM, Babel, Tailwind, Google Fonts)
  Tailwind config (custom colors, animations, fonts)
  <style> block (glass morphism, phase styles, modals, toast, etc.)
</head>
<body>
  <script type="text/babel">
    ═══ CONSTANTS & DEFAULTS
    ═══ CONTEXT PROVIDERS (Theme, Toast)
    ═══ TOAST SYSTEM
    ═══ INDEXEDDB BACKUP SYSTEM
    ═══ DATA VALIDATION
    ═══ DATA FACTORY FUNCTIONS
    ═══ CALCULATION FUNCTIONS
    ═══ ICON COMPONENTS
    ═══ THEME TOGGLE
    ═══ CONFIRMATION MODAL
    ═══ COUNTER CARRY-OVER MODAL
    ═══ MANUAL CARRY-OVER COMPONENTS
    ═══ SETTINGS MODAL (Density)
    ═══ VOYAGE END MODAL
    ═══ NEW VOYAGE MODAL
    ═══ IMPORT COUNTERS MODAL
    ═══ EQUIPMENT ROW
    ═══ PHASE SECTION
    ═══ REPORT FORM
    ═══ LEG SECTION
    ═══ CRUISE SUMMARY
    ═══ MAIN APP (VoyageTracker)
    ═══ APP WRAPPER WITH PROVIDERS
  </script>
</body>
```

### Component Hierarchy

```
App
└── ToastProvider
    └── VoyageTracker (main state, file I/O)
        ├── Header (status, save, settings, theme)
        ├── Density Bar
        ├── [List View] Voyage cards
        └── [Edit View]
            ├── Cruise Info Card (name, vessel, dates)
            ├── CruiseSummary (aggregated stats)
            ├── LegSection[] (one per leg)
            │   ├── ReportForm (departure)
            │   │   ├── PhaseSection[] (port/changeover phases)
            │   │   │   └── EquipmentRow[] (DG 1-2, DG 4, DG 3, Boiler 1, Boiler 2)
            │   │   └── PhaseSection (standby)
            │   └── ReportForm (arrival)
            │       ├── PhaseSection[] (sea/changeover phases)
            │       └── PhaseSection (standby)
            └── FloatingCarryOverButton
```

---

## Data Model

### Cruise (top-level JSON file)

```javascript
{
  id: Number,              // timestamp-based
  name: String,            // e.g. "Singapore to Hong Kong"
  vessel: "Celebrity Solstice",
  startDate: "YYYY-MM-DD",
  endDate: "YYYY-MM-DD",
  legs: [Leg],
  densities: { HFO: 0.92, MGO: 0.83, LSFO: 0.92 },
  voyageEnd: VoyageEnd | null,
  lastModified: ISO string,
  version: "5.0.0",
  filename: "2025-01-15_Singapore_to_Hong_Kong.json"  // stable, assigned at creation
}
```

### Leg

```javascript
{
  id: Number,
  departure: Report,   // type: 'departure'
  arrival: Report       // type: 'arrival'
}
```

### Report

```javascript
{
  id: Number,
  type: 'departure' | 'arrival',
  date: "YYYY-MM-DD",
  port: String,
  timeEvents: { sbe: "HH:MM", fwe: "HH:MM", fa: "HH:MM" },
  phases: [Phase],          // operational + standby
  rob: { hfo: '', mgo: '', lsfo: '' },           // fuel remaining on board (MT)
  bunkered: { hfo: '', mgo: '', lsfo: '' },       // departure only
  freshWater: { rob: '', bunkered: '', production: '', consumption: '' },  // arrival only
  aep: { openLoopHrs: '', closedLoopHrs: '', alkaliCons: '', alkaliRob: '' },  // arrival only
  lubeOil: { meCons: '', lo13s14s: '', usedLo13c: '' },
  engineer: ''
}
```

### Phase

```javascript
{
  id: Number,
  type: 'port' | 'sea' | 'standby',
  name: String,           // e.g. "FWE → SBE (In Port)"
  equipment: {
    dg12:    { start: '', end: '', fuel: 'HFO' },
    dg4:     { start: '', end: '', fuel: 'HFO' },
    dg3:     { start: '', end: '', fuel: 'MGO' },
    boiler1: { start: '', end: '', fuel: 'MGO' },
    boiler2: { start: '', end: '', fuel: 'MGO' },
  },
  remarks: ''             // only for port/sea phases, not standby
}
```

### Default Phase Templates

**Departure:**
1. PORT — "FWE → SBE (In Port)"
2. STANDBY — "SBE → FA (Stand By Departure)"

**Arrival:**
1. SEA — "FA → SBE (Sea Passage)"
2. STANDBY — "SBE → FWE (Stand By Arrival)"

Users can add extra "Fuel Changeover" phases between the operational and standby phases.

---

## Equipment Fuel Rules

| Equipment | Allowed Fuels | Fuel Dropdown | Default |
|-----------|--------------|---------------|---------|
| DG 1-2 | HFO, MGO, LSFO | Selectable (all 3) | HFO |
| DG 4 | HFO, MGO, LSFO | Selectable (all 3) | HFO |
| DG 3 | MGO, VLSFO | Selectable (these 2 only) | MGO |
| Boiler 1 | MGO | Locked (no dropdown) | MGO |
| Boiler 2 | MGO | Locked (no dropdown) | MGO |

> **Note:** The current v5 HTML has DG3 as `disabled={true}` (fully locked to MGO). This needs updating to allow MGO/VLSFO selection.

### Counter Units

- **Input:** Counter readings in **m³** (cubic meters)
- **Calculation:** `consumption_MT = (end_m³ - start_m³) × density_t/m³`
- **Output:** All summaries and totals displayed in **MT** (metric tons)

### Default Densities (at 30°C)

- HFO: 0.920 t/m³
- MGO: 0.830 t/m³
- LSFO: 0.920 t/m³

---

## Key Features

### Manual Carry-Over System
- Floating button (bottom-right) visible in edit mode
- User edits END values in a phase → button activates showing source phase
- Click → modal shows which equipment to carry over → copies END values to next phase's START
- Crosses phase boundaries: within report, departure→arrival, and leg→leg
- **No automatic carry-over within a leg** — always manual via button

### Auto-Save
- Debounced 1-second delay after any change
- Saves to user-selected directory via File System Access API
- Filename is **stable** — assigned at cruise creation, never changes during editing
- Also backs up to IndexedDB every 30 seconds

### Voyage Import Counters
- When creating a new voyage with previous voyages available
- Modal offers to import last voyage's final END counter values
- Selective: user picks which equipment counters to import
- Populates first departure phase START values

### Voyage End Summary
- Aggregates all consumption, fresh water, NaOH, AEP hours, lub-oil
- Engineer signature and notes fields
- Marks voyage as completed (can be reopened)

### Fuel Changeover Phases
- Users can add extra phases for mid-voyage fuel changeovers
- Cumulative totals shown on the last operational phase when 2+ phases exist

---

## Target Design Direction: Option E "Signal Flag Bands"

The visual redesign follows the **Signal Flag Bands** approach for maximum category distinction at a glance.

### Typography

- **Display/Body:** Manrope (weights 300–800)
- **Monospace/Data:** IBM Plex Mono (weights 400–700)

### Color System (CSS Variables)

```css
:root {
  /* Base */
  --bg: #FAFBFD;
  --surface: #FFFFFF;
  --surface2: #F3F5F9;
  --text: #1A2233;
  --dim: #6B7B8F;
  --faint: #B0BAC6;
  --border: #E5E9F0;

  /* Category: Fuel — HFO */
  --hfo: #D97706;  --hfo-light: #FFF8EB;  --hfo-band: #F59E0B;  --hfo-border: #FDE68A;

  /* Category: Fuel — MGO */
  --mgo: #059669;  --mgo-light: #ECFDF5;  --mgo-band: #10B981;  --mgo-border: #A7F3D0;

  /* Category: Fuel — LSFO */
  --lsfo: #6366F1;  --lsfo-light: #EEF2FF;  --lsfo-band: #818CF8;  --lsfo-border: #C7D2FE;

  /* Category: Potable Water */
  --water: #0284C7;  --water-light: #F0F9FF;  --water-band: #38BDF8;  --water-border: #BAE6FD;

  /* Category: Chemicals (NaOH) */
  --chem: #DB2777;  --chem-light: #FDF2F8;  --chem-band: #F472B6;  --chem-border: #FBCFE8;

  /* Category: Lub-Oil */
  --lube: #EA580C;  --lube-light: #FFF7ED;  --lube-band: #FB923C;  --lube-border: #FED7AA;
}
```

### Category Distinction Approach

1. **5–6px vertical color bands** on the left edge of every category element (like maritime signal flags)
2. **Full row background tinting** — HFO rows get warm cream, MGO rows get mint, etc.
3. **Equipment table fuel cells** show flag band + colored label
4. **Summary cards** filled with category background + thick left border stripe
5. **Each category is identifiable from distance** — highest scanability of all design options

### Summary Card Types

| Card | Color System | Data |
|------|-------------|------|
| Fuel | Multi-stripe left band (HFO→MGO→LSFO gradient) | 3 fuel columns: consumption + ROB |
| Water | Blue band | Production, Consumption, ROB |
| Chemicals | Pink band + hazard icon | NaOH Cons, ROB, Open/Closed Loop hours |
| Lub-Oil | Orange band | Consumption, ROB |

---

## Known Issues & Patterns

### Mojibake / Encoding Corruption
The file frequently develops UTF-8 encoding corruption (mojibake) when edited. Characters like `→`, `✓`, `•`, `—`, `°`, `³` get corrupted to multi-byte garbage like `â†'`, `âœ"`, `â€¢`, etc.

**Fix:** Always run `ftfy` after editing:
```bash
pip install ftfy --break-system-packages
python3 -c "
import ftfy
with open('Voyage_Tracker_v5_manual_carryover.html', 'r') as f:
    content = f.read()
fixed = ftfy.fix_text(content)
with open('Voyage_Tracker_v5_manual_carryover.html', 'w') as f:
    f.write(fixed)
"
```

### Auto-Save Filename Stability
- Filename is assigned at cruise creation and stored in the cruise object
- Never regenerated during editing — prevents duplicate files
- Format: `YYYY-MM-DD_Voyage_Name.json`

---

## Planned v6 Features (Not Yet Implemented)

1. **Password Protection** — SHA-256 hashed, stored in localStorage
2. **View/Edit Modes** — View Only (no password), Edit Mode (password required)
3. **Inactivity Auto-Lock** — 15-minute timeout, 14-minute warning
4. **Multi-Instance Detection** — BroadcastChannel API warns when same voyage open in multiple tabs
5. **Master Override** — Format: `CHIEF-OVERRIDE-CELEBRITY-SOLSTICE`

All v6 features are backward compatible with v5 data files.

---

## Development Conventions

1. **Always check encoding** after any file modification — run ftfy
2. **Use ASCII dividers** (`═══`) between major code sections
3. **Preserve single-file structure** — all React components inline
4. **Test scenarios:** multi-leg voyages, fuel changeovers, counter carry-over chains, voyage end/reopen
5. **No breaking changes** to JSON data format without migration logic
6. **DG3 & Boiler restrictions** must be enforced in UI (dropdown locks), not just defaults
