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
