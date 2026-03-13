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

const API_URL_CONST = `const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';`;

files.forEach(filePath => {
  if (!fs.existsSync(filePath)) {
    console.log(`SKIP (not found): ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');

  // Step 1: Remove any broken API_URL const lines added by previous attempts
  content = content.replace(/const API_URL = import\.meta\.env\.VITE_API_URL \|\| '.*?';\n?/g, '');

  // Step 2: Restore all mangled URLs back to plain localhost URLs
  // Fix: `${API_URL}//api/... -> http://localhost:5000/api/...
  content = content.replace(/`\$\{API_URL\}\/\//g, "'http://localhost:5000/");
  // Fix: `${API_URL}/api/... -> http://localhost:5000/api/...
  content = content.replace(/`\$\{API_URL\}\//g, "'http://localhost:5000/");
  // Fix any remaining ${API_URL} references
  content = content.replace(/`\$\{API_URL\}/g, "'http://localhost:5000");
  // Fix broken const line like: || '`${API_URL}/';
  content = content.replace(/import\.meta\.env\.VITE_API_URL \|\| '`\$\{API_URL\}\/';/g, "import.meta.env.VITE_API_URL || 'http://localhost:5000';");

  // Step 3: Replace all plain localhost:5000 URLs with ${API_URL} template literals
  // Handle fetch('http://localhost:5000/...')  -> fetch(`${API_URL}/...`)
  content = content.replace(/'http:\/\/localhost:5000\/([^']*)'/g, (match, path) => {
    return '`${API_URL}/' + path + '`';
  });
  // Handle new URL('http://localhost:5000/...')
  content = content.replace(/'http:\/\/localhost:5000'/g, '`${API_URL}`');

  // Step 4: Add the API_URL const after the last import statement
  if (!content.includes('const API_URL = import.meta.env.VITE_API_URL')) {
    const lastImportIndex = [...content.matchAll(/^import .+$/gm)].pop();
    if (lastImportIndex) {
      const insertAt = lastImportIndex.index + lastImportIndex[0].length;
      content = content.slice(0, insertAt) + '\n\n' + API_URL_CONST + '\n' + content.slice(insertAt);
    }
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`FIXED: ${filePath}`);
});

console.log('\nDone! Run: grep -n "localhost\\|API_URL" src/pages/Customers.jsx | head -20');