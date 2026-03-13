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
    console.log(`SKIP (not found): ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');

  // Fix: '`${API_URL}/path` -> `${API_URL}/path`  (remove leading single quote)
  content = content.replace(/'`\$\{API_URL\}\/([^`]*)`/g, '`${API_URL}/$1`');

  // Fix: ``${API_URL}/path` -> `${API_URL}/path`  (remove extra backtick)
  content = content.replace(/``\$\{API_URL\}\/([^`]*)`/g, '`${API_URL}/$1`');

  // Fix: new URL('`${API_URL}/path`) -> new URL(`${API_URL}/path`)
  content = content.replace(/new URL\('`\$\{API_URL\}\/([^`]*)`\)/g, 'new URL(`${API_URL}/$1`)');

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`FIXED: ${filePath}`);
});

console.log('\nDone!');
