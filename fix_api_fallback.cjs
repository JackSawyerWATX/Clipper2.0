const fs = require('fs');

const files = [
  'src/pages/Analytics.jsx',
  'src/pages/Customers.jsx',
  'src/pages/Dashboard.jsx',
  'src/pages/Inventory.jsx',
  'src/pages/Orders.jsx',
  'src/pages/Reports.jsx',
  'src/pages/ShipmentTracking.jsx',
  'src/pages/Suppliers.jsx',
  'src/utils/auth.js',
  'src/pages/Login.jsx'
];

files.forEach(filePath => {
  if (!fs.existsSync(filePath)) {
    console.log(`SKIP: ${filePath}`);
    return;
  }
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;
  content = content.replace(
    /const API_URL = import\.meta\.env\.VITE_API_URL \|\| 'http:\/\/localhost:5000';/g,
    "const API_URL = import.meta.env.VITE_API_URL ?? '';"
  );
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`FIXED: ${filePath}`);
  } else {
    console.log(`CLEAN: ${filePath}`);
  }
});
console.log('Done!');
