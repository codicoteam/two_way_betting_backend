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
app.use(limiter);

// API routes
app.use('/api', require('./src/routes'));
if (swaggerSpecs) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));
}

// Start jobs
require('./src/jobs/matchUpdateJob');
require('./src/jobs/settlementJob');
require('./src/jobs/badgeJob');
require('./src/jobs/leaderboardJob');
require('./src/jobs/notificationJob');
require('./src/jobs/expiryJob');
require('./src/jobs/cleanupJob');
require('./src/jobs/queue');

// Socket init (if needed)
try {
  require('./src/sockets').init(server);
} catch (err) {
  console.warn('Socket init failed:', err.message);
}

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});