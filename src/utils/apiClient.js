const axios = require('axios');
const logger = require('./logger');
const redis = require('../configs/redis');

class ApiClient {
  constructor(baseURL, apiKey) {
    this.client = axios.create({
      baseURL,
      params: { api_token: apiKey },
      timeout: 10000,
    });

    // Response interceptor for logging
    this.client.interceptors.response.use(
      (response) => {
        logger.http(`API call to ${response.config.url} - ${response.status}`);
        return response;
      },
      (error) => {
        logger.error(`API error: ${error.message}`);
        return Promise.reject(error);
      }
    );
  }

  async get(endpoint, params = {}, useCache = true, ttl = 300) {
    const cacheKey = `api:${endpoint}:${JSON.stringify(params)}`;

    if (useCache) {
      const cached = await redis.get(cacheKey);
      if (cached) {
        logger.debug(`Cache hit for ${cacheKey}`);
        return JSON.parse(cached);
      }
    }

    const response = await this.client.get(endpoint, { params });
    const data = response.data;

    if (useCache && data) {
      await redis.setex(cacheKey, ttl, JSON.stringify(data));
    }

    return data;
  }
}

// Create and export a configured instance
const sportmonksClient = new ApiClient(
  process.env.SPORTMONKS_BASE_URL || 'https://soccer.sportmonks.com/api/v2.0',
  process.env.SPORTMONKS_API_KEY
);

module.exports = { ApiClient, sportmonksClient };