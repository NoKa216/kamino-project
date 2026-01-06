import { Router } from 'express';
import { searchPlaces } from '../controllers/places.controller';

const router = Router();

/**
 * @route   GET /api/places/search
 * @desc    Search for cities or attractions via autocomplete
 * @access  Public (or Protected, depending on requirements)
 * @query   q (string) - The search query
 * @query   type (string) - 'city' | 'attraction'
 */
router.get('/search', searchPlaces);

export default router;