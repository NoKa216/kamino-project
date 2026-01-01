import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';

// Load environment variables from .env file
dotenv.config();

// Initialize the Express application
const app: Express = express();
const port = process.env.PORT || 3000;

// =============================================================================
// MIDDLEWARE CONFIGURATION
// =============================================================================

// Use Helmet to secure Express apps by setting various HTTP headers
app.use(helmet());

// Enable Cross-Origin Resource Sharing (CORS) to allow requests from the mobile app
app.use(cors());

// Parse incoming requests with JSON payloads
app.use(express.json());

// =============================================================================
// ROUTE CONFIGURATION
// =============================================================================

/**
 * Mount Auth Routes
 * Note: The '/api' prefix is crucial to match the client-side Axios configuration.
 * Endpoint: /api/auth/login, /api/auth/signup, etc.
 */
app.use('/api/auth', authRoutes);

/**
 * Health Check Endpoint
 * A simple route to verify that the server is up and running.
 */
app.get('/', (req: Request, res: Response) => {
    res.send('Kamino Backend is Running 🚀');
});

// =============================================================================
// SERVER STARTUP
// =============================================================================

app.listen(port, () => {
    console.log(`⚡️ [server]: Server is running at http://localhost:${port}`);
});