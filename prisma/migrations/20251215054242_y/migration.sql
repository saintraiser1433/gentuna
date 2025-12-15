-- CreateTable
CREATE TABLE "Entry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Draw" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "numWinners" INTEGER NOT NULL,
    "seed" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Prize" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "value" REAL,
    "position" INTEGER,
    "imageUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Winner" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "drawId" TEXT NOT NULL,
    "entryId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "prizeId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'present',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Winner_drawId_fkey" FOREIGN KEY ("drawId") REFERENCES "Draw" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Winner_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "Entry" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Winner_prizeId_fkey" FOREIGN KEY ("prizeId") REFERENCES "Prize" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DrawSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "prizeAssignments" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "Entry_name_idx" ON "Entry"("name");

-- CreateIndex
CREATE INDEX "Entry_createdAt_idx" ON "Entry"("createdAt");

-- CreateIndex
CREATE INDEX "Draw_createdAt_idx" ON "Draw"("createdAt");

-- CreateIndex
CREATE INDEX "Prize_position_idx" ON "Prize"("position");

-- CreateIndex
CREATE INDEX "Prize_createdAt_idx" ON "Prize"("createdAt");

-- CreateIndex
CREATE INDEX "Winner_drawId_idx" ON "Winner"("drawId");

-- CreateIndex
CREATE INDEX "Winner_entryId_idx" ON "Winner"("entryId");

-- CreateIndex
CREATE INDEX "Winner_prizeId_idx" ON "Winner"("prizeId");

-- CreateIndex
CREATE INDEX "Winner_status_idx" ON "Winner"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Winner_drawId_entryId_key" ON "Winner"("drawId", "entryId");

-- CreateIndex
CREATE INDEX "DrawSettings_updatedAt_idx" ON "DrawSettings"("updatedAt");
