# Deployment Guide - Voyage Tracker v5

## For Corporate Network Drives (No Admin Privileges Required)

### ✅ What You Get

The `dist/` folder contains a **fully self-contained, static web application** that requires:
- ✅ **NO installation**
- ✅ **NO admin privileges**
- ✅ **NO server**
- ✅ **NO Node.js**

Just copy the folder and open `index.html` in any modern browser!

---

## 📦 Quick Deployment

### Step 1: Copy the ENTIRE dist/ folder

```bash
# The dist/ folder is located at:
/Users/Manos/Projects/Voyage_Tracker/voyage-tracker-react/dist/

# IMPORTANT: Copy the ENTIRE dist/ folder to your network drive
# The folder contains:
# - index.html
# - assets/ folder (with CSS and JavaScript files)
# - vite.svg (favicon)

# Example network path:
# \\marinefs\Engineering\VoyageTracker\
# or
# V:\Engineering\VoyageTracker\
```

### Step 2: Open in Browser

Navigate to the copied `dist/` folder on your network drive and double-click `index.html`

OR right-click `index.html` and choose "Open with" → Chrome or Edge

**IMPORTANT:**
- You MUST copy the ENTIRE `dist/` folder, not just `index.html`
- The `assets/` subfolder contains the CSS and JavaScript files
- All files must maintain their relative folder structure

**That's it!** 🎉

---

## 📂 What's Inside dist/

```
dist/
├── index.html                  # Main entry point (0.87 KB)
├── vite.svg                    # Favicon (1.5 KB)
└── assets/
    ├── style-C4EU0g_l.css      # All styles (10.76 KB)
    └── index-Y2t529Rg.js       # All app code (277 KB)
```

**Total Size:** ~290 KB (very lightweight!)

**How It Works:**
- `index.html` loads the CSS and JavaScript from the `assets/` folder
- All files use relative paths (`./assets/...`)
- Works from file:// protocol and network shares
- No web server required

---

## 🌐 Browser Compatibility

| Browser | Status | Notes |
|---------|--------|-------|
| Chrome  | ✅ **BEST** | Full File System API support |
| Edge    | ✅ **BEST** | Full File System API support |
| Firefox | ⚠️ Limited | Download/upload only (no direct file access) |
| Safari  | ⚠️ Limited | Download/upload only (no direct file access) |

**Recommendation:** Use Chrome or Edge for best experience with File System Access API.

---

## 💾 Data Storage

The application stores data in two ways:

1. **Primary (Chrome/Edge):** File System Access API
   - You can select a folder on the network drive
   - Files are saved directly to that folder
   - Changes persist between sessions

2. **Fallback (All browsers):** IndexedDB + Download
   - Data saved in browser's IndexedDB
   - Export button downloads JSON files
   - Import button loads JSON files

---

## 🚀 Usage Instructions

### First Time Setup (Chrome/Edge)

1. Open `index.html` from the network drive
2. Click "Select Folder" button
3. Choose a folder where you want to save voyage files
4. Grant permission when browser asks
5. Start creating voyages!

### Subsequent Uses

1. Open `index.html` from the network drive
2. Click "Select Folder" and choose the same folder
3. All your previous voyages will load automatically

### For Firefox/Safari

1. Open `index.html` from the network drive
2. Create voyages normally
3. Use "Export" button to download JSON files
4. Use "Import" button to load JSON files
5. Save your JSON files to the network drive manually

---

## 📝 Important Notes

### ✅ Advantages

- **Portable:** Copy to any computer, works immediately
- **No Installation:** Just HTML, CSS, and JavaScript
- **Offline Capable:** Works without internet connection
- **Secure:** All data stays on your network drive
- **Fast:** Loads in < 1 second

### ⚠️ Limitations

- **No Auto-Updates:** To update, replace the entire `dist/` folder
- **Browser Security:** Some browsers have stricter security for local files
- **File System API:** Only Chrome/Edge support direct file access

### 🔐 Security Considerations

- All data is stored locally (network drive or browser)
- No data is sent to any external servers
- No internet connection required
- Safe for sensitive engineering data

---

## 🔄 Updating the Application

When a new version is released:

1. Delete the old `dist/` folder from network drive
2. Copy the new `dist/` folder from the latest build
3. Your data files remain safe (they're in a separate folder)
4. Open the new `index.html`

**Data Migration:** Your JSON files are compatible across versions!

---

## 🐛 Troubleshooting

### "Cannot read file" error in Chrome/Edge

**Solution:** Re-grant folder access
1. Click "Select Folder" button
2. Choose the folder where your voyages are saved
3. Click "Allow" when browser asks for permission

### Application doesn't load

**Possible causes:**
1. Browser is blocking local file access
2. Antivirus is blocking JavaScript execution
3. Corporate firewall is blocking local HTML files

**Solutions:**
1. Try a different browser (Chrome/Edge recommended)
2. Contact IT to whitelist the `dist/` folder
3. Use Firefox as fallback with manual JSON export/import

### Styles look broken

**Solution:** The `index.html` file should be self-contained
- All CSS and JavaScript are embedded in the HTML file
- If styles are missing, try rebuilding: `npm run build`
- Verify the `index.html` file size is around 281 KB

### Changes not saving

**Chrome/Edge:** Re-grant folder permissions
**Firefox/Safari:** Use Export button to manually save JSON files

---

## 📞 Support

For issues or questions:
- Check this guide first
- Verify browser compatibility
- Ensure all `dist/` files are present
- Try a different browser

---

## 🎯 Best Practices

1. **Backup Regularly:** Export all voyages to JSON files weekly
2. **Use Chrome/Edge:** For best File System API experience
3. **Consistent Folder:** Always use the same folder for voyages
4. **Version Control:** Keep old `dist/` folders as backups
5. **Multiple Locations:** Can deploy to multiple network locations

---

## 📊 Technical Details

- **Framework:** React 18
- **Build Tool:** Vite 7 + vite-plugin-singlefile
- **Size:** 281 KB (single HTML file)
- **Files:** 1 self-contained HTML file
- **Dependencies:** All bundled inline (no external files)
- **Fonts:** Loaded from Google Fonts CDN (only external dependency)

---

**Deployed and Ready to Use!** 🚀

Just copy the `dist/` folder to your network drive and you're done!
