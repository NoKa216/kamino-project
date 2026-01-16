import { Router } from 'express';
import { searchPlaces, proxyPlacePhoto } from '../controllers/places.controller';

const router = Router();

/**
 * @route   GET /api/places/search
 * @desc    Search for cities or attractions via autocomplete
 * @access  Public (or Protected, depending on requirements)
 * @query   q (string) - The search query
 * @query   type (string) - 'city' | 'attraction'
 */
router.get('/search', searchPlaces);

/**
 * @route   GET /api/places/photo/:reference(*)
 * @desc    Proxy Google Places photos securely (hides API key)
 * @access  Public
 * @param   reference - Google Places photo reference path (supports slashes)
 * @query   maxWidth - Maximum width in pixels (default: 1000)
 */
router.get('/photo/:reference(*)', proxyPlacePhoto);

export default router;