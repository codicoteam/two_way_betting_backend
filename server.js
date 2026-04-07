const express = require('express');
const http = require('http');
const cors = require('cors');
const connectDB = require('./src/configs/database');
const corsOptions = require('./src/configs/cors');
const { limiter } = require('./src/configs/rate-limit');
const logger = require('./src/configs/logger');
const swaggerUi = require('swagger-ui-express');
let swaggerSpecs;
try { swaggerSpecs = require('./src/configs/swagger'); } catch { swaggerSpecs = null; }

const app = express();
const server = http.createServer(app);

// Connect to DB
connectDB();

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(limiter);

// API routes
app.use('/api', require('./src/routes'));
if (swaggerSpecs) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));
}

// Start jobs (async graceful)
const startJobs = async () => {
  try {
    const { initQueues } = require('./src/jobs/queue');
    await initQueues(); // Will log warn if no Redis
    require('./src/jobs/matchUpdateJob');
    require('./src/jobs/settlementJob');
    require('./src/jobs/badgeJob');
    require('./src/jobs/leaderboardJob');
    require('./src/jobs/notificationJob');
    require('./src/jobs/expiryJob');
    require('./src/jobs/cleanupJob');
  } catch (err) {
    console.warn('⚠️ Jobs disabled:', err.message);
  }
};
startJobs();

// Socket init (if needed)
try {
  require('./src/sockets').init(server);
} catch (err) {
  console.warn('Socket init failed:', err.message);
}

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {

  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌐 API Documentation (Swagger): http://localhost:${PORT}/api-docs`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);

  logger.info(`Server running on port ${PORT}`);
});