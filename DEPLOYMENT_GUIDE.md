# Deployment Guide - Transferring to Another PC

When transferring the application to another PC, you cannot simply copy the source code and run it. Here's what you need to do:

## ❌ Common Mistakes

1. **Copying only source code** - Missing `node_modules`, `.next`, and Prisma client
2. **Not running `npm install`** - Dependencies are missing
3. **Missing environment variables** - `.env` file not included
4. **Prisma client not generated** - Database queries will fail
5. **Database file missing** - Application won't have data

## ✅ Correct Methods

### Method 1: Portable Package (Recommended - Easiest)

This creates a complete, ready-to-run package:

```bash
npm run build:portable
```

This will create a folder at `dist-portable/lucky-draw-system/` that contains:
- ✅ All compiled code (`.next/standalone`)
- ✅ Static assets (`.next/static`)
- ✅ Prisma client (already generated)
- ✅ Public files
- ✅ Start scripts (`start.bat` for Windows, `start.sh` for Linux/Mac)

**To transfer:**
1. Copy the entire `dist-portable/lucky-draw-system/` folder to the target PC
2. On the target PC, make sure Node.js 18+ is installed
3. Run `start.bat` (Windows) or `./start.sh` (Linux/Mac)
4. The application will start on http://localhost:3000

**Note:** The database file (`prisma/dev.db`) will be created automatically on first run.

---

### Method 2: Source Code Transfer (Requires Setup on Target PC)

If you need to transfer source code (for development or customization):

**Files to include:**
- ✅ All source files (`.ts`, `.tsx`, `.js`, `.jsx`)
- ✅ `package.json` and `package-lock.json`
- ✅ `prisma/schema.prisma`
- ✅ `public/` folder
- ✅ `.env.example` (rename to `.env` on target PC)
- ✅ `next.config.ts`
- ✅ `tsconfig.json`
- ✅ `tailwind.config.ts` (if exists)
- ✅ `postcss.config.js` (if exists)

**Files NOT to include (will be regenerated):**
- ❌ `node_modules/` (too large, platform-specific)
- ❌ `.next/` (build output, will be regenerated)
- ❌ `prisma/dev.db` (database, will be created)
- ❌ `.env` (contains secrets, create new one)

**Steps on Target PC:**

1. **Install Node.js 18+** (if not already installed)

2. **Copy the project folder** to the target PC

3. **Open terminal in the project folder** and run:
   ```bash
   npm install
   ```
   This installs all dependencies from `package.json`

4. **Create `.env` file**:
   ```bash
   # Copy from .env.example or create new
   DATABASE_URL="file:./prisma/dev.db"
   NODE_ENV=production
   PORT=3000
   ```

5. **Generate Prisma Client**:
   ```bash
   npx prisma generate
   ```
   This creates the database client (required!)

6. **Create database tables**:
   ```bash
   npx prisma db push
   ```
   This creates the database file and tables

7. **Build the application**:
   ```bash
   npm run build
   ```
   This compiles the application

8. **Start the application**:
   ```bash
   npm start
   ```
   Or use PM2:
   ```bash
   npm run pm2:start
   ```

---

### Method 3: Using Git (Best for Development)

If both PCs have Git:

1. **On source PC:** Commit and push to Git repository
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push
   ```

2. **On target PC:** Clone and setup
   ```bash
   git clone <repository-url>
   cd gentune-rafflesystem
   npm install
   cp .env.example .env
   # Edit .env with correct values
   npx prisma generate
   npx prisma db push
   npm run build
   npm start
   ```

---

## 🔍 Troubleshooting

### Error: "Cannot find module '@prisma/client'"
**Solution:** Run `npx prisma generate` on the target PC

### Error: "Module not found" or "Cannot resolve module"
**Solution:** Run `npm install` on the target PC

### Error: "Database file not found"
**Solution:** Run `npx prisma db push` to create the database

### Error: "Port 3000 already in use"
**Solution:** Change the port in `.env`:
   ```
   PORT=3001
   ```

### Links/References Not Working
**Common causes:**
1. **Missing `.next/static` folder** - Run `npm run build`
2. **Missing `public/` folder** - Copy the entire `public/` folder
3. **Incorrect base path** - Check `next.config.ts` for base path settings
4. **Missing environment variables** - Ensure `.env` file exists

### Images/Assets Not Loading
**Solution:** 
- Ensure `public/` folder is copied
- Check that paths in code use `/` (not `./` or `../`)
- Verify `next.config.ts` doesn't have incorrect asset prefix

---

## 📦 What's Included in Portable Package

The `build:portable` script automatically includes:
- ✅ Compiled Next.js application (`.next/standalone`)
- ✅ Static assets (`.next/static`)
- ✅ Prisma client (pre-generated)
- ✅ Public files (`public/`)
- ✅ Prisma schema (for database setup)
- ✅ Start scripts for easy launching

**What's NOT included (and why):**
- ❌ `node_modules/` - Too large, platform-specific, regenerated on install
- ❌ Source TypeScript files - Not needed for production
- ❌ Development dependencies - Not needed for running
- ❌ `.env` file - Should be created on target PC with correct values

---

## 🚀 Quick Start Checklist

**For Portable Package:**
- [ ] Run `npm run build:portable` on source PC
- [ ] Copy `dist-portable/lucky-draw-system/` folder to target PC
- [ ] Ensure Node.js 18+ is installed on target PC
- [ ] Run `start.bat` (Windows) or `./start.sh` (Linux/Mac)
- [ ] Open http://localhost:3000

**For Source Code Transfer:**
- [ ] Copy source files (excluding `node_modules`, `.next`, `.env`)
- [ ] On target PC: `npm install`
- [ ] Create `.env` file with `DATABASE_URL="file:./prisma/dev.db"`
- [ ] Run `npx prisma generate`
- [ ] Run `npx prisma db push`
- [ ] Run `npm run build`
- [ ] Run `npm start`

---

## 💡 Pro Tips

1. **Always use the portable package** for production deployments - it's the most reliable
2. **Test on target PC** before final deployment
3. **Keep database file separate** - Don't include `prisma/dev.db` in transfers (it will be created)
4. **Use environment variables** - Never hardcode paths or secrets
5. **Document your setup** - Keep notes of any custom configurations

---

## 📞 Need Help?

If you encounter issues:
1. Check the error message carefully
2. Verify all steps were followed
3. Check Node.js version: `node --version` (should be 18+)
4. Check if port is available: `netstat -an | findstr :3000` (Windows) or `lsof -i :3000` (Linux/Mac)
5. Review logs in `logs/` folder if using PM2



