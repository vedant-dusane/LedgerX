// Local development server - mimics Vercel serverless functions
require('dotenv').config({ path: '.env.local' });
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Auto-load all API routes
const fs = require('fs');
function loadRoutes(dir, prefix = '') {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      loadRoutes(fullPath, prefix + '/' + file);
    } else if (file.endsWith('.js')) {
      const routeName = file === 'index.js' ? prefix : prefix + '/' + file.replace('.js', '');
      const handler = require('./' + fullPath);
      app.all('/api' + routeName, (req, res) => {
        handler(req, res);
      });
      console.log('Loaded route: /api' + routeName);
    }
  });
}

loadRoutes('api');

const PORT = 3001;
app.listen(PORT, () => console.log(`Dev API server running on http://localhost:${PORT}`));
