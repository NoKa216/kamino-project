import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import placesRoutes from './routes/places.routes';

// Load environment variables
dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

// =============================================================================
// MIDDLEWARE CONFIGURATION
// =============================================================================

app.use(helmet()); // Secure HTTP headers
app.use(cors());   // Enable CORS
app.use(express.json()); // Parse JSON bodies

// =============================================================================
// ROUTE CONFIGURATION
// =============================================================================

// Mount Auth Routes
app.use('/api/auth', authRoutes);

// Mount Places Routes
// This exposes endpoints like: /api/places/search
app.use('/api/places', placesRoutes);

/**
 * Health Check Endpoint
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