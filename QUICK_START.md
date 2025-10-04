# 🚀 Quick Start Guide - BioSteller

## The Absolute Easiest Way to Run BioSteller (Windows)

### Single Command Setup & Launch

```powershell
git clone https://github.com/codeslayer86/BioSteller
cd BioSteller
.\start-biosteller.ps1
```

That's it! The script will:
1. ✅ Check if Node.js is installed
2. ✅ Install all frontend dependencies
3. ✅ Install all backend dependencies
4. ✅ Set up configuration files
5. ✅ Ask for your API key (if not set)
6. ✅ Initialize the database
7. ✅ Start the backend server
8. ✅ Start the frontend server
9. ✅ Open the app in your browser

---

## Getting Your FREE API Key

If you don't have an API key yet:

1. Visit: https://aistudio.google.com/app/apikey
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key (starts with `AIzaSy...`)
5. Paste it when the script asks for it

**Note:** The script will even open the browser for you if you want!

---

## What the Script Does

### Automated Checks
- ✅ Verifies Node.js and npm are installed
- ✅ Checks if dependencies are already installed (skips if yes)
- ✅ Verifies API key is configured
- ✅ Checks if ports 3000 and 3001 are available
- ✅ Kills any processes blocking the ports

### Automated Setup
- ✅ Installs all required npm packages
- ✅ Creates configuration files from templates
- ✅ Saves your API key securely in `backend/.env`
- ✅ Runs database migrations

### Automated Launch
- ✅ Starts backend server (http://localhost:3001)
- ✅ Starts frontend server (http://localhost:3000)
- ✅ Opens your default browser automatically
- ✅ Keeps servers running until you press a key

### Easy Shutdown
- ✅ Press any key to stop both servers
- ✅ Automatically cleans up all processes
- ✅ Safe and clean exit

---

## Troubleshooting

### "Execution Policy" Error

If you see an error about execution policies, run:

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

Then try again:
```powershell
.\start-biosteller.ps1
```

### "Node.js not found" Error

Install Node.js 18+ from: https://nodejs.org/

### API Key Invalid

1. Make sure you copied the entire key
2. The key should start with `AIzaSy`
3. Visit https://aistudio.google.com/app/apikey to create a new one
4. Run the script again and enter the new key

### Ports Already in Use

The script automatically handles this! It will:
1. Detect processes on ports 3000 and 3001
2. Stop those processes
3. Start fresh

### Still Having Issues?

1. Try deleting `node_modules` folders:
   ```powershell
   Remove-Item -Recurse -Force node_modules
   Remove-Item -Recurse -Force backend\node_modules
   ```

2. Run the script again - it will reinstall everything:
   ```powershell
   .\start-biosteller.ps1
   ```

---

## Manual Setup (Alternative)

If you prefer to set up manually, see [README.md](README.md#-installation) for detailed instructions.

---

## Features to Try

Once BioSteller is running:

1. **Search**: Try "Plant growth in microgravity"
2. **Knowledge Graph**: Click the graph tab to visualize connections
3. **AI Chat**: Ask follow-up questions about your search
4. **Compare**: Select multiple reports and compare them
5. **Timeline**: View research chronologically
6. **Dashboard**: See statistics and trends

---

## Need Help?

- 📧 Email: omar2086pcc40sh@gmail.com
- 🐛 Issues: https://github.com/codeslayer86/BioSteller/issues
- 📖 Full Documentation: [README.md](README.md)

---

**Happy Exploring! 🌌**
