# Voyage Tracker v5 - React + Vite

A modern React application for tracking fuel consumption and equipment counter readings on cruise ship voyages. Migrated from a single-file HTML application to a proper React + Vite structure.

**Client:** Celebrity Solstice Engine Department
**Version:** 5.0.0
**Technology:** React 18 + Vite + Tailwind CSS

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The app will be available at `http://localhost:5173`

---

## 📋 Features

### Core Functionality
- ✅ Multi-leg voyage management
- ✅ Dynamic phase management (Port, Sea, Standby, Fuel Changeover)
- ✅ Counter readings with automatic MT (Metric Tons) conversion
- ✅ Configurable fuel densities per voyage
- ✅ Counter carry-over system between phases, legs, and voyages
- ✅ File System Access API for Chrome/Edge (with IndexedDB fallback)
- ✅ Auto-save with 1-second debounce
- ✅ Periodic IndexedDB backups (every 30 seconds)
- ✅ Voyage completion summary with totals

### Tracked Data
- **Fuel Types:** HFO, MGO, LSFO with density-based calculations
- **Equipment:** DG 1-2, DG 3, DG 4, Boiler 1, Boiler 2
- **Fuel Data:** R.O.B. (Remaining On Board), Bunkered amounts
- **Fresh Water:** Production, Consumption, Bunkered, R.O.B.
- **AEP/Scrubber:** Open Loop hours, Closed Loop hours, NaOH consumption
- **Lube Oil:** ME Consumption, LO 13 S14 S, Used LO 13C

### UI/UX Features
- 🎨 Maritime-themed design with ocean blues and navy colors
- 🌓 Dark mode support
- 💎 Glass-morphism styling effects
- 🔔 Toast notifications for user feedback
- 📱 Responsive layouts
- 🎯 Phase type color coding (🏭 Port, 🌊 Sea, ⚓ Standby)
- 📂 Collapsible legs and reports for better organization

---

## 🏗️ Project Structure

```
voyage-tracker-react/
├── src/
│   ├── components/
│   │   ├── common/              # Reusable UI components
│   │   │   ├── Icons.jsx
│   │   │   ├── ThemeToggle.jsx
│   │   │   └── ConfirmModal.jsx
│   │   ├── modals/              # Modal dialogs
│   │   │   ├── CounterCarryOverModal.jsx
│   │   │   ├── SettingsModal.jsx
│   │   │   ├── VoyageEndModal.jsx
│   │   │   ├── NewVoyageModal.jsx
│   │   │   └── ImportCountersModal.jsx
│   │   ├── phase/               # Phase and equipment components
│   │   │   ├── PhaseSection.jsx
│   │   │   └── EquipmentRow.jsx
│   │   ├── leg/                 # Leg and report components
│   │   │   ├── LegSection.jsx
│   │   │   └── ReportForm.jsx
│   │   └── voyage/              # Voyage-level components
│   │       ├── VoyageTracker.jsx (main app logic)
│   │       └── CruiseSummary.jsx
│   ├── context/                 # React contexts
│   │   ├── ThemeContext.jsx
│   │   └── ToastContext.jsx
│   ├── utils/                   # Utility functions
│   │   ├── calculations.js      # Consumption calculations
│   │   ├── dataFactory.js       # Default data structures
│   │   ├── storage.js           # IndexedDB operations
│   │   └── validation.js        # Data validation
│   ├── constants/               # Application constants
│   │   └── index.js
│   ├── App.jsx                  # Root component with providers
│   ├── main.jsx                 # Application entry point
│   └── index.css                # Global styles + Tailwind
├── public/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

---

## 🔧 Key Technical Details

### Fuel Type Restrictions
| Equipment | Allowed Fuels |
|-----------|---------------|
| DG 1-2    | HFO, MGO, LSFO |
| DG 4      | HFO, MGO, LSFO |
| DG 3      | MGO only (locked) |
| Boiler 1  | MGO only (locked) |
| Boiler 2  | MGO only (locked) |

### Density-Based Calculations
```javascript
Consumption (MT) = (End Counter - Start Counter) ÷ 1000 × Density
```

**Default Densities:**
- HFO: 0.92 t/m³
- MGO: 0.83 t/m³
- LSFO: 0.92 t/m³

### Data Persistence
- **Primary:** File System Access API (Chrome/Edge only)
- **Backup:** IndexedDB for browser storage
- **Export:** JSON file download
- **Auto-save:** 1-second debounce after changes
- **Filename format:** `YYYY-MM-DD_Cruise_Name.json`

---

## 🌐 Browser Compatibility

| Browser | Status | Notes |
|---------|--------|-------|
| Chrome  | ✅ Full | File System API supported |
| Edge    | ✅ Full | File System API supported |
| Firefox | ⚠️ Limited | No File System API (download fallback) |
| Safari  | ⚠️ Limited | No File System API (download fallback) |

---

## 📦 Migration from v5 HTML to React

This project was migrated from a 2,500+ line single HTML file to a modern React application.

### Benefits of Migration
- ✅ **Modular Components:** Easier to maintain and extend
- ✅ **Better Code Organization:** Clear separation of concerns
- ✅ **Reusable Components:** No more copy-paste
- ✅ **Type Safety Ready:** Easy to add TypeScript later
- ✅ **Testing Friendly:** Individual components can be tested
- ✅ **Hot Module Replacement:** Faster development cycle
- ✅ **Optimized Builds:** Vite provides fast, optimized production builds

### Original Files Preserved
The original `Voyage_Tracker_v5.html` file remains in the parent directory as a reference and backup.

---

## 🎯 Voyage Structure

```
Voyage/Cruise
├── Metadata (name, start date, fuel densities)
└── Legs (multiple port-to-port segments)
    ├── Departure Report
    │   ├── Port Phase(s) + optional Fuel Changeover phases
    │   └── Standby Phase
    └── Arrival Report
        ├── Sea Phase(s) + optional Fuel Changeover phases
        └── Standby Phase
```

Each **Phase** contains:
- Equipment table (5 rows for DG 1-2, DG 4, DG 3, Boiler 1, Boiler 2)
- Start/End counter readings in Liters (auto-converts to m³ internally)
- Fuel type selection (with equipment-specific restrictions)
- Automatic consumption calculation in Metric Tons

---

## ⌨️ Keyboard Shortcuts

- **Ctrl+S / Cmd+S:** Manual save (triggers immediate save)
- **Enter:** Submit forms in modals (New Voyage, Settings, etc.)

---

## 💾 Data Management

### Creating a New Voyage
1. Click "New Voyage" button
2. Enter start date and port information
3. Optionally import final counters from previous voyage
4. System generates filename: `YYYY-MM-DD_From_To.json`

### Adding Legs
1. Open a voyage in edit mode
2. Click "Add New Leg" button
3. Fill in departure report details
4. Add phases as needed (Port → Standby → Sea → Standby)
5. Complete arrival report
6. Counters auto-carry from departure to arrival

### Counter Carry-Over
The system automatically detects and prompts when:
- Moving from one phase to the next within a report
- Moving from departure to arrival within a leg
- Starting a new voyage (can import from previous voyage file)

### Completing a Voyage
1. Click "Complete Voyage" button
2. Review voyage totals by fuel type
3. Enter final lube oil data
4. Add engineer signature and notes
5. System marks voyage as completed

---

## 🛠️ Development

### Tech Stack
- **Framework:** React 18.2.0
- **Build Tool:** Vite 6.x
- **Styling:** Tailwind CSS 3.x + Custom CSS
- **Fonts:** Outfit (display), DM Sans (body), JetBrains Mono (monospace)
- **Storage:** File System Access API + IndexedDB

### Available Scripts

```bash
# Development
npm run dev          # Start dev server with HMR

# Production
npm run build        # Build for production (output: dist/)
npm run preview      # Preview production build locally

# Linting
npm run lint         # Run ESLint checks
```

### Adding New Features

1. **New Component:**
   ```bash
   # Create in appropriate directory
   src/components/{category}/{ComponentName}.jsx
   ```

2. **New Utility:**
   ```bash
   # Add to utils directory
   src/utils/{utilityName}.js
   ```

3. **New Constant:**
   ```bash
   # Add to constants file
   src/constants/index.js
   ```

### Code Style
- Use functional components with hooks
- Extract reusable logic into custom hooks
- Keep components focused and single-purpose
- Use Tailwind classes for styling where possible
- Use custom CSS classes for complex effects

---

## 📊 Key Domain Terms

| Term | Meaning |
|------|---------|
| Leg | One port-to-port segment of a voyage |
| Phase | An operational period (Port, Sea, Standby, or Changeover) |
| R.O.B. | Remaining On Board (fuel inventory) |
| Bunkered | Fuel loaded onto ship |
| DG | Diesel Generator |
| AEP | Auxiliary Engine Power (scrubber system) |
| NaOH | Sodium Hydroxide (alkali for scrubber) |
| MT | Metric Tons |
| HFO | Heavy Fuel Oil |
| MGO | Marine Gas Oil |
| LSFO | Low Sulfur Fuel Oil |
| Changeover | Switching between fuel types |
| SBE | Stand By Engine |
| FWE | Finished With Engines |
| FA | Full Away |

---

## 🚦 Testing Checklist

Before deploying, verify:

- [ ] Counter carry-over works between phases
- [ ] Counter carry-over works between legs
- [ ] Counter carry-over works from previous voyage
- [ ] Calculation accuracy (density × volume)
- [ ] File save/load integrity
- [ ] Auto-save triggers correctly
- [ ] IndexedDB backup works
- [ ] Modal workflows complete successfully
- [ ] Fuel restrictions enforced (DG3/Boilers = MGO only)
- [ ] Dark mode toggle works
- [ ] Toast notifications appear
- [ ] Voyage completion summary calculates correctly
- [ ] Browser compatibility (Chrome, Edge, Firefox, Safari)

---

## 📝 Known Limitations

- File System API requires user gesture (button click) for folder selection
- Directory handle doesn't persist across browser restarts
- BroadcastChannel not available in Safari (not used in v5)
- Firefox and Safari users must use download/upload workflow instead of direct file access

---

## 🔜 Future Enhancements (v6+)

Planned features for future versions:

- Password protection system (SHA-256 hashing)
- Lock/Unlock modes (View Only vs Edit)
- Inactivity auto-lock (15 minutes)
- Multi-instance detection (BroadcastChannel API)
- Export to Excel/PDF
- Data visualization charts
- TypeScript migration
- Unit and integration tests

---

## 👥 Contact

**Developer:** AI-assisted development with Claude
**User:** Manolis (Engine Department, Celebrity Solstice)
**Purpose:** Production tool for daily voyage tracking operations

---

## 📄 License

This is a proprietary application developed for Celebrity Solstice Engine Department.

---

**Generated with Claude Code** 🤖
