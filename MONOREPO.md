# Clipper 2.0 Monorepo

A full-stack business management system with Windows 3.1 aesthetic, featuring comprehensive tools for customer management, order processing, inventory tracking, and analytics.

## Structure

This is an npm workspaces monorepo with the following structure:

```
clipper-monorepo/
├── packages/
│   ├── frontend/                 (@clipper/frontend)
│   │   ├── src/                  # React components and pages
│   │   ├── index.html
│   │   ├── package.json
│   │   └── vite.config.js
│   │
│   ├── express-backend/          (@clipper/express-backend)
│   │   ├── routes/               # Express API routes
│   │   ├── middleware/           # Express middleware
│   │   ├── config/               # Database configuration
│   │   ├── scripts/              # Utility scripts
│   │   ├── server.js             # Main Express app
│   │   └── package.json
│   │
│   └── python-backend/           (@clipper/python-backend)
│       ├── config/               # FastAPI configuration
│       ├── models/               # Optional Pydantic models
│       ├── routes/               # FastAPI routes
│       ├── main.py               # Main FastAPI app
│       ├── requirements.txt      # Python dependencies
│       └── package.json          # NPM wrapper config
│
├── database/                      # Database schemas and samples
├── .env.example                   # Environment variables template
├── package.json                   # Root monorepo config
└── README.md                      # This file
```

## Workspaces

### 1. Frontend (`@clipper/frontend`)
- **Framework**: React 18.3.1
- **Build Tool**: Vite 7.3.1
- **Router**: React Router 6.22.0
- **Chart Library**: Chart.js + react-chartjs-2
- **PDF Export**: jsPDF + jsPDF-AutoTable
- **Testing**: Vitest + React Testing Library

**Commands**:
```bash
npm run dev:frontend      # Start dev server (localhost:5173)
npm run build:frontend    # Build for production
npm --workspace=@clipper/frontend run test   # Run tests
```

### 2. Express Backend (`@clipper/express-backend`)
- **Framework**: Express 4.18.2
- **Database**: MySQL 3.6.5
- **Auth**: JWT (jsonwebtoken) + bcrypt
- **CORS**: Enabled for frontend communication
- **Testing**: Jest + Supertest

**Commands**:
```bash
npm run dev:express              # Start dev server with nodemon (port 8080)
npm --workspace=@clipper/express-backend run start   # Start production server
npm --workspace=@clipper/express-backend run test   # Run tests
```

### 3. Python FastAPI Backend (`@clipper/python-backend`)
- **Framework**: FastAPI 0.115.5
- **Server**: Uvicorn 0.32.1
- **Database**: MySQL Connector Python 9.1.0
- **Validation**: Pydantic 2.10.3

**Commands**:
```bash
npm run dev:python              # Start dev server (localhost:8000)
npm --workspace=@clipper/python-backend run start   # Start production server
```

Note: Python backend uses a `package.json` wrapper for monorepo compatibility. The actual Python environment must be set up separately with `pip install -r requirements.txt`.

## Getting Started

### Installation

1. **Root dependencies**:
```bash
npm install
```

This will automatically install dependencies for all workspaces.

2. **Python backend setup** (if using Python backend):
```bash
cd packages/python-backend
pip install -r requirements.txt
```

### Development

**Run all dev servers**:
```bash
npm run dev     # Runs dev command in all workspaces
```

**Run individual workspace**:
```bash
npm run dev:frontend      # Frontend only
npm run dev:express       # Express backend only
npm run dev:python        # Python backend only
```

### Building

**Build all packages**:
```bash
npm run build
```

**Build specific workspace**:
```bash
npm run build:frontend
```

### Testing

**Test all workspaces**:
```bash
npm run test
```

**Test specific workspace**:
```bash
npm --workspace=@clipper/frontend run test
npm --workspace=@clipper/express-backend run test
```

## Features

- **Authentication System** - Role-based login with admin-managed permissions
- **Windows 3.1 Design** - Nostalgic UI with modern enhancements
- **Responsive Layout** - Collapsible sidebar navigation
- **Real-time Clock** - World time zones display
- **Nautical Theme** - International maritime signal flags for branding
- **Multi-role Support** - Administrator, Manager, Employee, Viewer roles
- **Data Visualization** - Analytics with charts and reports
- **PDF Export** - Generate and export business reports
- **Payment Processing** - Stripe integration for credit card payments

## API Endpoints

The Express backend provides REST API endpoints for:
- Authentication (`/api/auth`)
- Customers (`/api/customers`)
- Orders (`/api/orders`)
- Inventory (`/api/inventory`)
- Suppliers (`/api/suppliers`)
- Analytics (`/api/analytics`)
- Reports (`/api/reports`)
- Shipments (`/api/shipments`)
- Payments (`/api/payments`)

## Environment Variables

Copy `.env.example` to `.env` and configure:
```bash
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=clipper

# Server
PORT=8080
NODE_ENV=development

# Frontend
VITE_API_BASE_URL=http://localhost:8080/api

# Stripe
STRIPE_PUBLIC_KEY=your_key
STRIPE_SECRET_KEY=your_secret
```

## Database Setup

```bash
# Run schema
mysql -u root -p < database/schema.sql

# Load sample data
mysql -u root -p < database/sample_customers.sql
mysql -u root -p < database/sample_orders.sql
mysql -u root -p < database/sample_inventory.sql
```

## Technologies Used

### Frontend
- React 18.3.1, React Router DOM 6.22.0
- Vite 7.3.1, Chart.js, jsPDF, DOMPurify
- Vitest, React Testing Library

### Backend
- Express.js 4.18.2, FastAPI 0.115.5
- MySQL2, mysql-connector-python
- jsonwebtoken, bcrypt, Pydantic

### DevOps
- Docker, AWS Elastic Beanstalk, AWS CodeBuild
- npm workspaces

## Project Goals

- Provide a comprehensive business management system
- Demonstrate full-stack development practices
- Maintain code organization in a monorepo
- Support multiple backend implementations (Node.js and Python)

## Contributing

1. Follow the workspace structure
2. Keep backend services independent but compatible
3. Maintain consistent environment variables across workspaces
4. Write tests for new features
5. Update documentation for significant changes

## License

ISC

## Author

Jack Sawyer
