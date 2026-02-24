# Voyage Tracker — Project Context

## Overview

**Voyage Tracker** is a digital fuel consumption tracking application for the **Celebrity Solstice Engine Department**. It replaces traditional Excel-based workflows for tracking fuel consumption, equipment counter readings, and operational data across multi-leg cruise ship voyages. Users are marine engineering officers.

- **Vessel:** Celebrity Solstice
- **Current Version:** 6.0.0
- **Architecture:** Vite + React 19 SPA (Single Page Application)
- **Design System:** Signal Flag Bands (color-coded category cards)

---

## Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| UI Framework | React 19 | via npm (`react`, `react-dom`) |
| Build Tool | Vite 7 | `npm run dev` / `npm run build` |
| Styling | Tailwind CSS v4 | via `@tailwindcss/vite` plugin |
| Fonts | Google Fonts | Manrope (display), IBM Plex Mono (data) |
| Primary Storage | File System Access API | JSON files to network directory |
| Backup Storage | IndexedDB | `VoyageTrackerBackup` database |
| State Management | React useState/useEffect | No external state library |

---

## Architecture

### File Structure

```
src/
  main.jsx                          # Entry point
  App.jsx                           # Root wrapper with ToastProvider
  VoyageTracker.jsx                 # Main state container (core logic)
  contexts/
    ThemeContext.jsx                 # Dark mode provider
    ToastContext.jsx                 # Toast notifications
  hooks/
    useAutoSave.js                  # File I/O via File System Access API
    useBackupInterval.js            # IndexedDB backup every 30s
    useKeyboardShortcuts.js         # Keyboard shortcuts
    useToast.js                     # Toast hook
  utils/
    constants.js                    # APP_VERSION, PHASE_TYPES, EQUIPMENT_LABELS
    factories.js                    # Data object factories (cruise, report, phase, equipment, voyageReport)
    validation.js                   # Cruise data validation
    calculations.js                 # calcConsumption, calcCruiseTotal, generateFilename
    indexeddb.js                    # IndexedDB backup/restore
  components/
    Icons.jsx                       # SVG icon library
    layout/
      Header.jsx                    # Top nav with save status
      Footer.jsx                    # Footer
      DensityBar.jsx                # Fuel density editor
    ui/
      ThemeToggle.jsx               # Dark/light mode toggle
      FloatingCarryOverButton.jsx   # Manual counter carry-over activation
    modals/
      NewVoyageModal.jsx            # Create new voyage
      ImportCountersModal.jsx       # Import end values from previous voyage
      VoyageEndModal.jsx            # Finalize voyage with summary
      SettingsModal.jsx             # Density settings
      ConfirmModal.jsx              # Generic confirmation
      ManualCarryOverModal.jsx      # Manual carry-over UI
    voyage/
      VoyageList.jsx                # List of voyages from directory
      VoyageEditor.jsx              # Main edit view for active voyage
      CruiseSummary.jsx             # Aggregated stats card
      LegSection.jsx                # Collapsible leg container
      VoyageReportSection.jsx       # Navigation/bridge data per leg
      ReportForm.jsx                # Departure/arrival report form
      PhaseSection.jsx              # Port/sea/standby phase with equipment table
      EquipmentRow.jsx              # Single equipment counter row
  styles/
    app.css                         # Tailwind 4 config + Signal Flag Bands theme
```

### Component Hierarchy

```
App
  ToastProvider
    VoyageTracker (main state, file I/O)
      Header (status, save, settings, theme)
      Density Bar
      [List View] VoyageList
      [Edit View]
        VoyageEditor
          Cruise Info Card (name, vessel, dates)
          CruiseSummary (aggregated stats)
          LegSection[] (one per leg)
            VoyageReportSection (navigation data — collapsible, optional)
            ReportForm (departure)
              PhaseSection[] (port/changeover phases)
                EquipmentRow[] (DG 1-2, DG 4, DG 3, Boiler 1, Boiler 2)
              PhaseSection (standby)
            ReportForm (arrival)
              PhaseSection[] (sea/changeover phases)
              PhaseSection (standby)
          FloatingCarryOverButton
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
  version: "6.0.0",
  filename: "2025-01-15_Singapore_to_Hong_Kong.json"  // stable, assigned at creation
}
```

### Leg

```javascript
{
  id: Number,
  departure: Report,            // type: 'departure'
  arrival: Report,              // type: 'arrival'
  voyageReport: VoyageReport | null   // navigation/bridge data (optional)
}
```

### Report (Engine Department)

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

### VoyageReport (Bridge/Navigation Data)

```javascript
{
  departure: {
    sbe: "HH:MM",
    fa: "HH:MM",
    pierToFA: { distance: '', time: '', avgSpeed: '' },  // avgSpeed auto-calculated
  },
  voyage: {
    totalMiles: '',
    steamingTime: '',      // hours (decimal)
    averageSpeed: '',      // auto-calculated from miles/time
  },
  arrival: {
    sbe: "HH:MM",
    fwe: "HH:MM",
    sbeToBerth: { distance: '', time: '', avgSpeed: '' },  // avgSpeed auto-calculated
  },
}
```

Ports and dates are **not stored** in voyageReport — they are read from the engine department's departure/arrival Report objects (`leg.departure.port`, `leg.arrival.port`, etc.).

### Phase

```javascript
{
  id: Number,
  type: 'port' | 'sea' | 'standby',
  name: String,           // e.g. "FWE -> SBE (In Port)"
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
1. PORT — "FWE -> SBE (In Port)"
2. STANDBY — "SBE -> FA (Stand By Departure)"

**Arrival:**
1. SEA — "FA -> SBE (Sea Passage)"
2. STANDBY — "SBE -> FWE (Stand By Arrival)"

Users can add extra "Fuel Changeover" phases between the operational and standby phases.

---

## Equipment Fuel Rules

| Equipment | Allowed Fuels | Fuel Dropdown | Default |
|-----------|--------------|---------------|---------|
| DG 1-2 | HFO, MGO, LSFO | Selectable (all 3) | HFO |
| DG 4 | HFO, MGO, LSFO | Selectable (all 3) | HFO |
| DG 3 | MGO, LSFO | Selectable (these 2 only) | MGO |
| Boiler 1 | MGO | Locked (no dropdown) | MGO |
| Boiler 2 | MGO | Locked (no dropdown) | MGO |

### Counter Units

- **Input:** Counter readings in **m3** (cubic meters)
- **Calculation:** `consumption_MT = (end_m3 - start_m3) x density_t/m3`
- **Output:** All summaries and totals displayed in **MT** (metric tons)

### Default Densities (at 30C)

- HFO: 0.920 t/m3
- MGO: 0.830 t/m3
- LSFO: 0.920 t/m3

---

## Key Features

### Voyage Report (Navigation Data)
- Collapsible card within each LegSection, above the engine departure/arrival reports
- Captures bridge data: departure SBE/FA times, sea passage miles/time/speed, arrival SBE/FWE times
- Pier-to-FA and SBE-to-Berth distance/time segments with auto-calculated average speed
- Ports and dates are read-only — sourced from the engine crew's departure/arrival data
- Uses ocean/cyan Signal Flag Band styling (`.cat-card.nav`)
- Optional per leg: user clicks "Add Voyage Report" to create, trash icon to remove
- Factory: `defaultVoyageReport()` in `src/utils/factories.js`
- Component: `src/components/voyage/VoyageReportSection.jsx`

### Manual Carry-Over System
- Floating button (bottom-right) visible in edit mode
- User edits END values in a phase -> button activates showing source phase
- Click -> modal shows which equipment to carry over -> copies END values to next phase's START
- Crosses phase boundaries: within report, departure->arrival, and leg->leg
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

## Design System: Signal Flag Bands

### Typography

- **Display/Body:** Manrope (weights 300-800)
- **Monospace/Data:** IBM Plex Mono (weights 400-700)

### Color System (CSS Variables in `src/styles/app.css`)

| Category | Primary | Light BG | Band | Border |
|----------|---------|----------|------|--------|
| HFO | #D97706 | #FFF8EB | #F59E0B | #FDE68A |
| MGO | #059669 | #ECFDF5 | #10B981 | #A7F3D0 |
| LSFO | #6366F1 | #EEF2FF | #818CF8 | #C7D2FE |
| Water | #0284C7 | #F0F9FF | #38BDF8 | #BAE6FD |
| Chemicals | #DB2777 | #FDF2F8 | #F472B6 | #FBCFE8 |
| Lub-Oil | #EA580C | #FFF7ED | #FB923C | #FED7AA |
| Navigation | ocean-500 | water-light | ocean-500 | water-border |

### Category Card Classes

- `.cat-card.fuel` — Fuel data (multi-stripe left band)
- `.cat-card.water` — Fresh water data (blue band)
- `.cat-card.chem` — Chemicals/NaOH data (pink band)
- `.cat-card.lube` — Lub-oil data (orange band)
- `.cat-card.nav` — Navigation/voyage report data (ocean/cyan band)
- `.cat-card.legs` — Leg summary (neutral)

---

## Development Conventions

1. **Vite project** — run `npm run dev` for development, `npm run build` for production
2. **Modular components** — each component in its own file under `src/components/`
3. **Test scenarios:** multi-leg voyages, fuel changeovers, counter carry-over chains, voyage end/reopen
4. **No breaking changes** to JSON data format without migration logic (see `validation.js`)
5. **DG3 & Boiler restrictions** must be enforced in UI (dropdown locks), not just defaults
6. **Backward compatibility:** `validateCruiseData()` auto-fixes missing fields (e.g. `voyageReport: null` on old legs)

### Auto-Save Filename Stability
- Filename is assigned at cruise creation and stored in the cruise object
- Never regenerated during editing — prevents duplicate files
- Format: `YYYY-MM-DD_From_to_To.json`

---

## Planned Features (Not Yet Implemented)

1. **Password Protection** — SHA-256 hashed, stored in localStorage
2. **View/Edit Modes** — View Only (no password), Edit Mode (password required)
3. **Inactivity Auto-Lock** — 15-minute timeout, 14-minute warning
4. **Multi-Instance Detection** — BroadcastChannel API warns when same voyage open in multiple tabs
5. **Master Override** — Format: `CHIEF-OVERRIDE-CELEBRITY-SOLSTICE`

All planned features are backward compatible with existing data files.
