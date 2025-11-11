const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');

// Load environment variables
dotenv.config({ path: './config/config.env' });

// Connect to the database
connectDB();

// Initialize express app
const app = express();

// Middleware for parsing JSON
app.use(express.json());

// Cookie parser
app.use(cookieParser());

// Sanitize data to prevent NoSQL injection
app.use(mongoSanitize());

// Set security headers
app.use(helmet());

// Prevent cross-site scripting (XSS) attacks
app.use(xss());

// Prevent HTTP parameter pollution
app.use(hpp());

// CORS settings
// Allow both local development and the deployed Vercel frontend.
// Note: origin should be the scheme + host (no path). The user provided
// a URL with a path (/1) — we allow the host `https://2110724-cubank2025-frontend.vercel.app`.
const corsOptions = {
    origin: [
        'http://localhost:3000',
        'https://2110724-cubank2025-frontend.vercel.app'
    ], // Allow requests from these origins
    credentials: true, // Enable sending credentials (cookies, etc.)
};
app.use(cors(corsOptions));

// Route files
const transactionRoutes = require('./routes/transactions');
const authRoutes = require('./routes/auth');

// Mount routers
app.use('/api/v1/transactions', transactionRoutes);
app.use('/api/v1/auth', authRoutes);

// Default response for root URL (optional)
// app.get('/', (req, res) => {
//     res.status(200).json({ success: true, data: { id: 1 } });
// });

// Server port from environment variable or default to 4000
const PORT = process.env.PORT || 4000;

// Start the server
const server = app.listen(PORT, () =>
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    // Close server and exit process
    server.close(() => process.exit(1));
});
