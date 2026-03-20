# Clipper 2.0 Monorepo - Quick Reference

## Common Commands

### Initial Setup
```bash
npm install              # Install all workspace dependencies
```

### Development
```bash
npm run dev              # Start all services
npm run dev:frontend     # Frontend only (port 5173)
npm run dev:express      # Express backend (port 8080)
npm run dev:python       # FastAPI backend (port 8000)
```

### Building
```bash
npm run build            # Build all packages
npm run build:frontend   # Build frontend only
```

### Testing
```bash
npm run test             # Test all packages
npm --workspace=@clipper/frontend run test
npm --workspace=@clipper/express-backend run test
```

## Workspace Commands

Run commands in specific workspaces:

```bash
# Frontend workspace
npm --workspace=@clipper/frontend run dev
npm --workspace=@clipper/frontend run build
npm --workspace=@clipper/frontend run test

# Express backend workspace
npm --workspace=@clipper/express-backend run dev
npm --workspace=@clipper/express-backend run start
npm --workspace=@clipper/express-backend run test

# Python backend workspace
npm --workspace=@clipper/python-backend run dev
```

## Directory Guide

| Path | Purpose |
|------|---------|
| `packages/frontend/` | React frontend app |
| `packages/express-backend/` | Express.js REST API |
| `packages/python-backend/` | FastAPI alternative API |
| `database/` | SQL schemas and sample data |
| `.env` | Environment variables (copy from `.env.example`) |

## Ports

| Service | Port | URL |
|---------|------|-----|
| Frontend | 5173 | http://localhost:5173 |
| Express API | 8080 | http://localhost:8080 |
| FastAPI | 8000 | http://localhost:8000 |
| MySQL | 3306 | localhost |

## Package Names

- `@clipper/frontend` - React frontend
- `@clipper/express-backend` - Express.js backend
- `@clipper/python-backend` - FastAPI backend

## Documentation

- **[MONOREPO.md](./MONOREPO.md)** - Full monorepo documentation
- **[MONOREPO_MIGRATION.md](./MONOREPO_MIGRATION.md)** - Migration details
- **[README.md](./README.md)** - Project overview
- **[TESTING_GUIDE.md](./TESTING_GUIDE.md)** - Testing guide
- **[DEPLOY.md](./DEPLOY.md)** - Deployment guide

## Troubleshooting

### npm workspaces not recognized
```bash
# Verify workspaces in package.json
cat package.json | grep -A 5 workspaces

# Reinstall
rm -rf node_modules package-lock.json
npm install
```

### Module not found errors
```bash
# Reinstall specific workspace
npm install --workspace=@clipper/frontend
```

### Port already in use
```bash
# Kill processes on specific port (Windows)
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

## Tips

- Use `npm run dev` to start everything at once
- Each workspace has its own `node_modules` in `packages/<workspace>/node_modules`
- Root `node_modules` contains shared dependencies
- Environment variables apply to all workspaces
