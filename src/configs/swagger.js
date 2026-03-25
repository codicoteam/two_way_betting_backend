const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'DuelBet API',
      version: '1.0.0',
      description: 'API documentation for DuelBet peer-to-peer sports betting platform'
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Local server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT Authentication'
        }
      }
    }
  },
  apis: ['./src/routes/*.js', './src/controllers/*.js']
};

module.exports = swaggerJSDoc(options);
