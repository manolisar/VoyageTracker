# Deploying to GitHub Pages

This guide explains how to host the Voyage Tracker on GitHub Pages so users can access it via a URL.

## Why GitHub Pages?

✅ **Free static hosting**
✅ **HTTPS by default** (secure)
✅ **Works from any device** with internet
✅ **No installation needed** - just a URL
✅ **Data stays local** - stored in browser or via File System API
✅ **Easy to update** - just push changes

---

## Initial Setup (One Time)

### Step 1: Create GitHub Repository

1. Go to https://github.com/new
2. Create a new repository (e.g., `voyage-tracker`)
3. Make it **Public** (required for free GitHub Pages)
4. Don't initialize with README (we already have code)

### Step 2: Connect Local Repository to GitHub

```bash
# In the voyage-tracker-react directory
cd /Users/Manos/Projects/Voyage_Tracker/voyage-tracker-react

# Add GitHub remote (replace USERNAME and REPO)
git remote add origin https://github.com/USERNAME/REPO.git

# Create main branch
git branch -M main
```

### Step 3: Configure Vite for GitHub Pages

The `vite.config.js` is already configured with `base: './'` which works for GitHub Pages.

### Step 4: Build and Commit

```bash
# Build the production version
npm run build

# Add all files
git add .

# Commit
git commit -m "Initial commit: Voyage Tracker v5 React"

# Push to GitHub
git push -u origin main
```

### Step 5: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** → **Pages** (in left sidebar)
3. Under "Source", select:
   - **Deploy from a branch**
   - Branch: **main**
   - Folder: **/ (root)**
4. Click **Save**

### Step 6: Configure GitHub Pages to Use dist/ Folder

Since our app is in the `dist/` folder, we need to tell GitHub Pages about it.

**Option A: Use gh-pages branch (Recommended)**

Install gh-pages package:
```bash
npm install --save-dev gh-pages
```

Add deployment script to `package.json`:
```json
"scripts": {
  "deploy": "npm run build && gh-pages -d dist"
}
```

Deploy:
```bash
npm run deploy
```

Then in GitHub Settings → Pages:
- Branch: **gh-pages**
- Folder: **/ (root)**

**Option B: Move dist contents to root**

This is simpler but mixes source and build files:
```bash
# After building
cp -r dist/* .
git add .
git commit -m "Deploy to root"
git push
```

---

## Deployment Workflow (Every Update)

### When You Make Changes:

```bash
# 1. Build the updated version
npm run build

# 2. Deploy (if using gh-pages)
npm run deploy

# OR commit and push (if using root deployment)
git add .
git commit -m "Update: description of changes"
git push
```

Wait 1-2 minutes for GitHub to rebuild and deploy.

---

## Accessing the App

Your app will be available at:
```
https://USERNAME.github.io/REPO/
```

For example:
```
https://manos-engineer.github.io/voyage-tracker/
```

### Share with Team

Users can:
1. Bookmark the URL
2. Add to home screen on mobile
3. Access from any device with internet

---

## How Data Works

### Data Storage Options:

**1. File System Access API (Chrome/Edge)**
- Users click "Select Folder"
- Choose a folder on their computer or network drive
- Files save directly to that folder
- Works across sessions (users re-select the same folder)

**2. IndexedDB (All Browsers)**
- Data stored in browser
- Use Export/Import buttons to save/load JSON files
- Files can be saved to network drive manually

### Important Notes:

⚠️ **Data is NOT stored on GitHub** - GitHub only hosts the app code
✅ **Data stays on user's computer** - in browser or local files
✅ **No server-side database** - completely client-side
✅ **Privacy** - No data leaves the user's device

---

## Updating the App

### For Users:
- Just refresh the page (Ctrl+F5 / Cmd+Shift+R)
- No re-installation needed
- Existing data files remain compatible

### For You (Developer):
```bash
# Make changes to source code
# ...

# Build
npm run build

# Deploy
npm run deploy  # (or git add/commit/push)
```

---

## Troubleshooting

### Page shows 404
- Check GitHub Pages is enabled in Settings
- Verify correct branch and folder are selected
- Wait 1-2 minutes after first enabling

### Blank Page
- Open browser console (F12)
- Check for errors
- Verify `base: './'` in vite.config.js
- Try hard refresh (Ctrl+F5)

### Changes Not Showing
- Clear browser cache
- Hard refresh (Ctrl+F5)
- Check GitHub Actions tab to see if deployment succeeded

### Data Not Saving
- **Chrome/Edge**: Re-grant folder access
- **Other browsers**: Use Export/Import buttons

---

## Custom Domain (Optional)

If you own a domain (e.g., voyagetracker.com):

1. Add a file named `CNAME` to your repository:
   ```
   voyagetracker.com
   ```

2. Configure DNS with your domain provider:
   - Add CNAME record pointing to `USERNAME.github.io`

3. In GitHub Settings → Pages:
   - Enter your custom domain
   - Enable "Enforce HTTPS"

---

## Advantages vs Network Drive

| Feature | Network Drive | GitHub Pages |
|---------|---------------|--------------|
| Installation | Copy folder | Just URL |
| Updates | Re-copy folder | Auto-update on refresh |
| Access | Only local network | Anywhere with internet |
| Mobile | Difficult | Full support |
| Setup | Manual | One-time |
| Speed | Fast (local) | Fast (CDN) |
| Offline | ✅ Yes | ❌ No (needs internet) |

---

## Best Practice: Use Both!

1. **GitHub Pages** - For online access and updates
2. **Network Drive** - As offline backup

Users can:
- Use GitHub Pages URL for daily work
- Keep a copy on network drive as backup
- All data files work with both versions

---

## Security Notes

✅ **Code is public** - Anyone can see the app source
✅ **Data is private** - Stored locally on each user's device
✅ **HTTPS enforced** - Secure connection
✅ **No server** - No backend to hack
✅ **No authentication needed** - Just open the URL

For sensitive data, users should:
- Use File System API to save to encrypted drives
- Regularly export/backup JSON files
- Use browser privacy mode if sharing computer

---

## Cost

**Completely FREE** for public repositories! 🎉

GitHub Pages limits:
- 100 GB bandwidth/month (plenty for this app)
- 1 GB repository size (our app is ~1 MB)
- 10 builds/hour (more than enough)

---

Ready to deploy! 🚀
