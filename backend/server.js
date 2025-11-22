const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const assignmentRoutes = require('./routes/assignments');
const errorResponse = require('./utils/errorResponse');

const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET', 'FRONTEND_URL'];
requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    console.error(`FATAL ERROR: ${varName} environment variable is not defined!`);
    process.exit(1);
  }
});

const app = express();

app.use(morgan('combined')); // Logging middleware

app.use(express.json());

app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:4173',
      process.env.FRONTEND_URL,         
      'https://numbersystemv2.netlify.app', 
      'https://vercel.app',
      ,
    ];

    if (!origin) return callback(null, true);  // allow requests like postman or server-side calls

    const isAllowed = allowedOrigins.some((allowedOrigin) => {
      if (allowedOrigin === origin) return true;
      if (
        allowedOrigin === 'https://*.vercel.app' &&
        /^https:\/\/[\w-]+\.vercel\.app$/.test(origin)
      )
        return true;
      return false;
    });

    if (isAllowed) callback(null, true);
    else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));


const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Too many attempts, try later' },
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Swagger configuration
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.1',
    info: {
      title: 'DP Numbers System API',
      version: '1.0.0',
      description: 'API documentation for DP Numbers System',
    },
    servers: [{ url: `http://localhost:${process.env.PORT || 5000}` }],
  },
  apis: ['./routes/*.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use('/api/auth', authRoutes);
app.use('/api/assignments', assignmentRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    message: 'DP Numbers System API is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/', (req, res) => {
  res.json({ message: 'DP Numbers System API', status: 'Active', version: '1.0.0' });
});

app.use((err, req, res, next) => errorResponse(res, 500, 'Internal server error', err));

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err.message);
  process.exit(1);
});

const PORT = process.env.PORT || 5000;
async function startServer() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
}

startServer();
