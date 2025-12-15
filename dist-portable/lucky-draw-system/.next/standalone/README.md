# Random Name Lucky Draw System

A full-featured lucky draw system built with Next.js, Prisma, and SQLite. This application allows administrators to add entrants, run weighted random draws, and maintain a complete history of all draws and winners.

## Features

- ✅ Add entries with name, optional email, and custom weight
- ✅ Run random draws with configurable number of winners
- ✅ Weighted random selection (entries with higher weights have better chances)
- ✅ Optional random seed for reproducible draws
- ✅ Exclude previous winners option
- ✅ Complete draw history with timestamps
- ✅ Export winners to CSV
- ✅ Transactional integrity (all draws are atomic)
- ✅ API key protection for draw endpoint
- ✅ Responsive UI built with Tailwind CSS and shadcn/ui

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: SQLite
- **ORM**: Prisma
- **Language**: TypeScript
- **UI**: Tailwind CSS, shadcn/ui components
- **Validation**: Zod

## Prerequisites

- Node.js 18+ and npm/yarn
- Git

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory (or update the existing one):

```env
DATABASE_URL="file:./dev.db"

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=ziAymM41pOEJTs7BnZAbeh5LQPbwOZ9JYLKqcvhr70c=

# Draw API Key (optional - for protecting the draw endpoint)
DRAW_API_KEY=your-secret-api-key-here
```

**Important**: The `DATABASE_URL` uses SQLite format. The database file will be created in the `prisma` directory.

### 3. Set Up Database

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database (creates tables)
npx prisma db push

# (Optional) Seed the database with sample data
npm run db:seed
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:push` - Push Prisma schema to database
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with sample data
- `npm run db:studio` - Open Prisma Studio (database GUI)

## API Endpoints

### Entries

- `GET /api/entries` - List all entries (supports pagination with `?page=1&limit=100`)
- `POST /api/entries` - Create a new entry
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com", // optional
    "weight": 1.5 // optional, default: 1.0
  }
  ```
- `PATCH /api/entries/[id]` - Update an entry
- `DELETE /api/entries/[id]` - Delete an entry

### Draws

- `GET /api/draws` - List all draws (supports pagination)
- `POST /api/draws` - Run a new draw
  ```json
  {
    "numWinners": 3,
    "seed": "optional-seed-string", // optional
    "excludePreviousWinners": false // optional
  }
  ```
  **Headers**: `x-api-key: your-secret-api-key-here` (if DRAW_API_KEY is set)
- `GET /api/draws/[id]` - Get a specific draw with winners
- `DELETE /api/draws/[id]` - Delete a draw
- `GET /api/draws/[id]/export` - Export winners as CSV

## How It Works

### Weighted Random Selection

When running a draw with weights:
- Each entry's chance of being selected is proportional to its weight
- Example: Entry A (weight: 2.0) has twice the chance of Entry B (weight: 1.0)
- Selection is done **without replacement** (each entry can only win once per draw)

### Random Seed

- If a seed is provided, the draw will be reproducible (same seed = same results)
- If no seed is provided, the current timestamp is used for randomness
- Seeds are stored with each draw for reference

### Excluding Previous Winners

When `excludePreviousWinners` is enabled:
- Only entries that have never won in any previous draw are eligible
- Useful for ensuring everyone gets a chance to win

## Database Schema

### Entry
- `id` (String, CUID)
- `name` (String, required)
- `email` (String, optional)
- `weight` (Float, default: 1.0)
- `createdAt`, `updatedAt` (DateTime)

### Draw
- `id` (String, CUID)
- `numWinners` (Int)
- `seed` (String, optional)
- `createdAt` (DateTime)

### Winner
- `id` (String, CUID)
- `drawId` (String, FK to Draw)
- `entryId` (String, FK to Entry)
- `position` (Int, 1-based ranking)
- `createdAt` (DateTime)

## Security Notes

- The draw endpoint (`POST /api/draws`) is protected by an API key
- Set `DRAW_API_KEY` in your `.env` file
- Include the key in the `x-api-key` header when calling the API
- If `DRAW_API_KEY` is not set, the endpoint is accessible without authentication (development only)

## Production Deployment

1. Update `DATABASE_URL` in your production environment (SQLite file path)
2. Set a strong `DRAW_API_KEY`
3. Run migrations: `npm run db:push` or `npm run db:migrate`
4. Build: `npm run build`
5. Start: `npm run start`

**Note**: For production, consider using a more robust database solution if you need concurrent access or better performance. SQLite works well for single-instance deployments.

## Troubleshooting

### Database Connection Issues
- Verify your `DATABASE_URL` is correct (should be `file:./dev.db` or similar)
- Ensure the `prisma` directory exists and is writable
- Check file permissions for the database file

### Prisma Client Not Generated
```bash
npx prisma generate
```

### Schema Changes
After modifying `prisma/schema.prisma`:
```bash
npx prisma db push  # For development
# OR
npx prisma migrate dev --name your_migration_name  # For production
```

## License

MIT

## Support

For issues or questions, please open an issue on the repository.
