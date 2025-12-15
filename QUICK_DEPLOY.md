# Quick Deployment Guide

## ❌ Problem: References and Links Not Found

When you copy source code to another PC, you get errors like:
- "Cannot find module"
- "Module not found"
- Links/images not working
- Prisma client errors

**Why?** Because you're missing:
- `node_modules/` (dependencies)
- `.next/` (compiled code)
- Prisma client (generated files)

## ✅ Solution: Use Portable Package

### Step 1: Build Portable Package (On Source PC)

```bash
npm run build:portable
```

This creates a complete package at: `dist-portable/lucky-draw-system/`

### Step 2: Transfer to Target PC

Copy the **entire** `dist-portable/lucky-draw-system/` folder to the target PC.

### Step 3: Run on Target PC

**Windows:**
- Double-click `start.bat`
- Or open terminal and run: `start.bat`

**Linux/Mac:**
```bash
./start.sh
```

### Step 4: Access Application

Open browser: http://localhost:3000

---

## 📋 What's Included in Portable Package

✅ Compiled application (`.next/standalone`)
✅ Static assets (`.next/static`)
✅ Public files (`public/`)
✅ Prisma client (pre-generated)
✅ Start scripts (`start.bat`, `start.sh`)

❌ NOT included: `node_modules/` (too large, platform-specific)

---

## ⚠️ Requirements on Target PC

- **Node.js 18+** must be installed
- Port 3000 available (or change PORT in `.env`)

---

## 🔧 Alternative: Source Code Transfer

If you must transfer source code:

1. **Copy files** (excluding `node_modules`, `.next`, `.env`)
2. **On target PC:**
   ```bash
   npm install          # Install dependencies
   npx prisma generate  # Generate Prisma client
   npx prisma db push   # Create database
   npm run build        # Build application
   npm start            # Start server
   ```

**But the portable package is much easier!**

---

## 🐛 Troubleshooting

### "Cannot find module '@prisma/client'"
→ Run `npx prisma generate` on target PC

### "Module not found"
→ Run `npm install` on target PC

### Links/images not working
→ Ensure `public/` folder was copied
→ Ensure `.next/static/` folder was copied

### "Database file not found"
→ Run `npx prisma db push` on target PC

---

## 💡 Best Practice

**Always use `npm run build:portable`** for transferring to another PC.
It's the easiest and most reliable method!



