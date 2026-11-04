const path = require('path');
const os = require('os');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const { initDb } = require('./db');
const authRoutes = require('./routes/auth');
const dataRoutes = require('./routes/data');
const aiRoutes = require('./routes/ai');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url} ${res.statusCode} - ${duration}ms`);
  });
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/data', dataRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

function getNetworkIp() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return 'localhost';
}

// Start server
async function startServer() {
  try {
    await initDb();
    const networkIp = getNetworkIp();
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`\n======================================================`);
      console.log(`🚀 LinguaNet AI Server in esecuzione!`);
      console.log(`📡 Backend locale:   http://localhost:${PORT}`);
      console.log(`📶 Backend Wi-Fi/LAN: http://${networkIp}:${PORT}`);
      console.log(`💻 Frontend Wi-Fi/LAN: http://${networkIp}:5173`);
      console.log(`======================================================\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
