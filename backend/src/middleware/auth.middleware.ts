/**
 * Firebase Authentication Middleware - Production Ready
 * 
 * STRICTLY verifies Firebase ID tokens
 * NO bypasses, NO compromises
 */

import { Request, Response, NextFunction } from 'express';
import * as admin from 'firebase-admin';

export interface AuthenticatedRequest extends Request {
    user: {
        uid: string;
        email?: string;
    };
}

/**
 * Middleware to verify Firebase ID token from Authorization header
 * Attaches decoded user info to req.user
 */
export async function authenticate(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ error: 'Unauthorized: No token provided' });
            return;
        }

        const idToken = authHeader.split('Bearer ')[1];

        // STRICT: Verify the Firebase ID token
        const decodedToken = await admin.auth().verifyIdToken(idToken);

        // Attach user info to request
        (req as AuthenticatedRequest).user = {
            uid: decodedToken.uid,
            email: decodedToken.email,
        };

        next();
    } catch (error) {
        console.error('[Auth] Token verification failed:', error);
        res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
}
