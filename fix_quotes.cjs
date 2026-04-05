const fs = require('fs');

const files = [
  'src/pages/Analytics.jsx',
  'src/pages/Customers.jsx',
  'src/pages/Dashboard.jsx',
  'src/pages/Inventory.jsx',
  'src/pages/Orders.jsx',
  'src/pages/Reports.jsx',
  'src/pages/ShipmentTracking.jsx',
  'src/pages/Suppliers.jsx'
];

files.forEach(filePath => {
  if (!fs.existsSync(filePath)) {
    console.log(`SKIP: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;

  // Fix 1: `Failed to fetch X') -> 'Failed to fetch X')
  content = content.replace(/`(Failed to [^'`]+)'/g, "'$1'");

  // Fix 2: method: `PUT` -> method: 'PUT'
  content = content.replace(/method: `(GET|POST|PUT|DELETE|PATCH)`/g, "method: '$1'");

  // Fix 3: method: `POST' -> method: 'POST'
  content = content.replace(/method: `(GET|POST|PUT|DELETE|PATCH)'/g, "method: '$1'");

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`FIXED: ${filePath}`);
  } else {
    console.log(`CLEAN: ${filePath}`);
  }
});

console.log('\nDone!');
