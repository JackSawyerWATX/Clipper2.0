# Clipper 2.0

A React-based business management system with Windows 3.1 aesthetic, featuring comprehensive tools for customer management, order processing, inventory tracking, and analytics.

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
cd server; npm run dev
```

3. Build for production:
```bash
npm run build
```

## Structure

- `src/pages/` - Contains all page components
- `src/styles/` - Page-specific CSS files
- `src/App.jsx` - Main app component with routing and authentication
- `src/main.jsx` - Application entry point

## Features

- **Authentication System** - Role-based login with admin-managed permissions
- **Windows 3.1 Design** - Nostalgic UI with modern enhancements (shadows, hover effects)
- **Responsive Layout** - Collapsible sidebar navigation
- **Real-time Clock** - World time zones display for international coordination
- **Nautical Theme** - International maritime signal flags for branding

## Pages

The application includes 12 pages accessible via the sidebar navigation:

- **Dashboard** - `/` - Overview with topical information at a glance
- **Customers** - `/customers` - Customer management and directory
- **Orders** - `/orders` - Order tracking and status management
- **Place Order** - `/place-order` - Create new orders for customers
- **Shipment Tracking** - `/shipment-tracking` - Track shipments across carriers
- **Suppliers** - `/suppliers` - Vendor and supplier directory
- **Inventory** - `/inventory` - Inventory management with search and filtering
- **Analytics** - `/analytics` - Sales analytics and customer insights
- **Payment Processing** - `/payment-processing` - Process credit card payments via Stripe
- **Reports** - `/reports` - Generate and export business reports
- **Admin** - `/admin` - User management, roles, and permissions (admin only)
- **Login** - User authentication and welcome page

Each page features Windows 3.1 styling with 3D beveled borders, gray panels, and interactive buttons.

## User Roles

- **Administrator** - Full access to all features including user management
- **Manager** - Access to most operational features
- **Employee** - Limited access to daily operational tasks
- **Viewer** - Read-only access to selected pages

Access permissions are managed through the Admin page.

## Technologies Used

### Frontend
- **React** 18.3.1 - UI framework
- **React Router DOM** 6.22.0 - Client-side routing
- **Vite** 7.3.1 - Build tool and dev server
- **Chart.js** 4.5.1 & **react-chartjs-2** 5.3.1 - Data visualization and analytics charts
- **jsPDF** 4.0.0 & **jsPDF-AutoTable** 5.0.7 - PDF generation for reports
- **DOMPurify** 3.3.2 - HTML sanitization

### Backend
#### Node.js/Express API
- **Express** 4.18.2 - Web framework
- **MySQL2** 3.6.5 - MySQL database driver
- **jsonwebtoken** 9.0.2 - JWT authentication
- **bcrypt** 5.1.1 - Password hashing
- **CORS** 2.8.5 - Cross-origin resource sharing
- **dotenv** 16.3.1 - Environment variable management
- **Nodemon** 3.0.2 - Development auto-reload

#### Python/FastAPI Backend
- **FastAPI** 0.115.5 - Modern async Python web framework
- **Uvicorn** 0.32.1 - ASGI server
- **MySQL Connector** 9.1.0 - MySQL database connection
- **Pydantic** 2.10.3 - Data validation
- **python-dotenv** 1.0.1 - Environment variable management
- **python-multipart** 0.0.20 - Form data parsing

### Database
- **MySQL** / **MariaDB** - Relational database

### Testing & QA
- **Vitest** 4.0.18 - Frontend unit testing framework
- **Jest** 30.2.0 - Backend testing framework
- **@testing-library/react** 16.3.2 - React component testing utilities
- **@testing-library/jest-dom** 6.9.1 - DOM matchers for Jest
- **Supertest** 7.2.2 - HTTP assertion library
- **JSDOM** 28.1.0 - DOM implementation for Node.js

### Development & Build Tools
- **TypeScript** (@types/react, @types/react-dom) - Type safety
- **@vitejs/plugin-react** 4.3.1 - Vite React plugin

### DevOps & Deployment
- **Docker** - Containerization
- **AWS Elastic Beanstalk** - Cloud deployment platform
- **AWS CodeBuild** - CI/CD pipeline support

### Third-Party Integrations
- **Stripe** - Payment processing for credit card transactions

### Styling
- **CSS3** - Custom styling with Windows 3.1 aesthetic
