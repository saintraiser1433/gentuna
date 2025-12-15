# Building Production Executable / Portable Package

This guide explains how to create a portable package or executable file for the Lucky Draw System.

## Recommended: Portable Package (Easiest & Most Reliable)

This method creates a portable folder that can be easily distributed. It requires Node.js on the target machine but is the most reliable method.

## Method 1: Portable Package (Recommended)

**No additional tools required!** This method uses built-in Node.js features.

### Step 1: Build and Package

```bash
npm run build:portable
```

This will:
1. Build the application in standalone mode
2. Create a portable package in `dist-portable/lucky-draw-system/`

### Step 2: Distribute

The `dist-portable/lucky-draw-system/` folder contains everything needed:
- Application files
- Start scripts (start.bat for Windows, start.sh for Linux/Mac)
- README with instructions

### Step 3: Run on Target Machine

**Windows:**
- Double-click `start.bat`
- Or run: `start.bat`

**Linux/Mac:**
```bash
./start.sh
```

The application will start on http://localhost:3000

### Requirements on Target Machine
- Node.js 18+ installed
- Port 3000 available (or set PORT environment variable)

## Method 2: Using pkg (True Executable - Advanced)

**Note:** This method has limitations with Prisma native modules. The portable package method is recommended.

### Prerequisites

1. **Install pkg globally**:
   ```bash
   npm install -g pkg
   ```

   Or use it locally:
   ```bash
   npm install --save-dev pkg
   ```

### Step 1: Build the Application

```bash
npm run build
```

This will:
- Generate Prisma Client
- Build Next.js in standalone mode
- Create optimized production build

### Step 2: Create Executable

```bash
# If pkg is installed globally
pkg launcher.js --targets node18-win-x64 --output-path dist

# Or if using local pkg
npx pkg launcher.js --targets node18-win-x64 --output-path dist
```

This creates `dist/launcher.exe` (Windows) or `dist/launcher` (Linux/Mac).

### Step 3: Package Required Files

After creating the executable, you need to copy these files to the same directory:

```bash
# Create distribution folder
mkdir -p dist/package

# Copy executable
cp dist/launcher.exe dist/package/  # Windows
# or
cp dist/launcher dist/package/       # Linux/Mac

# Copy required directories
cp -r .next/standalone dist/package/
cp -r .next/static dist/package/
cp -r prisma dist/package/
cp -r public dist/package/
```

## Method 2: Next.js Standalone Mode (Recommended for Deployment)

Next.js standalone mode creates a more portable package that still requires Node.js.

### Step 1: Build

```bash
npm run build
```

### Step 2: Package

The `.next/standalone` folder contains everything needed. Copy it along with:
- `.next/static` folder
- `prisma` folder
- `public` folder

### Step 3: Run

```bash
cd .next/standalone
node server.js
```

## Method 3: Using Electron (For Desktop App)

If you want a true desktop application with a window, consider using Electron:

1. Install Electron:
   ```bash
   npm install --save-dev electron electron-builder
   ```

2. Create an Electron main process file
3. Package with electron-builder

## Important Notes

### Database Location

The SQLite database will be created at:
- **Development**: `prisma/dev.db`
- **Executable**: Same directory as executable, in `prisma/dev.db`

### Port Configuration

The application runs on port 3000 by default. You can change it by:
- Setting `PORT` environment variable
- Modifying `launcher.js`

### File Structure for Distribution

```
dist/
├── launcher.exe (or launcher)
├── .next/
│   ├── standalone/
│   └── static/
├── prisma/
│   └── dev.db (created on first run)
└── public/
```

## Limitations

1. **pkg Limitations**:
   - Native modules (like Prisma) may have issues
   - Large file size (~100-200MB)
   - May require additional configuration for Prisma

2. **Standalone Mode**:
   - Still requires Node.js runtime
   - More portable but not a true executable

## Alternative: Portable Package

Instead of a single executable, create a portable package:

1. Build the application
2. Create a zip file with:
   - Node.js runtime (portable version)
   - Application files
   - Start script

This is often more reliable than pkg for complex applications.

## Troubleshooting

### Prisma Issues with pkg

If Prisma doesn't work with pkg, you may need to:
1. Use standalone mode instead
2. Or manually copy Prisma binaries to the executable directory

### Port Already in Use

Change the port in `launcher.js` or set `PORT` environment variable.

### Database Not Found

Ensure the `prisma` directory exists and is writable in the executable location.

