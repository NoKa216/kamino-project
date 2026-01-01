import { Request, Response } from 'express';
import { auth, db, admin } from '../config/firebase';
import { SignupSchema } from '../schemas/auth.schema';
import { z } from 'zod';

export const signup = async (req: Request, res: Response) => {
    try {
        const { email, password, fullName } = SignupSchema.parse(req.body);

        // Extract language from body or default to English
        const language = req.body.language || 'en';

        // 1. Create user in Firebase Authentication
        const userRecord = await auth.createUser({
            email,
            password,
            displayName: fullName
        });

        // 2. Initialize user document in Firestore
        await db.collection('users').doc(userRecord.uid).set({
            email: email,
            fullName: fullName,
            avatar: '',
            authProvider: 'email',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            settings: {
                language: language,
                homeCity: '',
                units: 'metric'
            },
            globalConstraints: {
                dietary: [],
                accessibility: false
            },
            deviceTokens: [],
            favorites: [],
            totalTripsPlanned: 0
        });

        res.status(201).json({
            message: 'User created successfully',
            uid: userRecord.uid
        });

    } catch (error: any) {
        // Handle Zod Validation Errors
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }

        // --- FIX: Handle Firebase Specific Errors ---
        // Provide meaningful status codes for the frontend to handle
        if (error.code === 'auth/email-already-exists') {
            return res.status(409).json({ error: 'The email address is already in use.' });
        }
        if (error.code === 'auth/invalid-email') {
            return res.status(400).json({ error: 'The email address is invalid.' });
        }
        if (error.code === 'auth/weak-password') {
            return res.status(400).json({ error: 'The password is not strong enough.' });
        }

        console.error("Signup Error:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// ... (keep socialAuth, anonymousAuth, and login functions as they were) ...
export const socialAuth = async (req: Request, res: Response) => {
    try {
        const { idToken, fullName } = req.body;
        const decodedToken = await auth.verifyIdToken(idToken);
        const { uid, email, picture } = decodedToken;
        // Attempt to detect language from social provider locale
        const detectedLanguage = (decodedToken as any).locale?.split('-')[0] || 'en';

        const userDoc = await db.collection('users').doc(uid).get();
        if (!userDoc.exists) {
            await db.collection('users').doc(uid).set({
                email: email || '',
                fullName: fullName || decodedToken.name || 'Traveler',
                avatar: picture || '',
                authProvider: decodedToken.firebase.sign_in_provider,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                settings: {
                    language: detectedLanguage,
                    homeCity: '',
                    units: 'metric'
                },
                globalConstraints: {
                    dietary: [],
                    accessibility: false
                },
                deviceTokens: [],
                favorites: [],
                totalTripsPlanned: 0
            });
        }
        res.status(200).json({ message: 'Social login successful', uid });
    } catch (error: any) {
        console.error("Social Auth Error:", error);
        res.status(401).json({ error: 'Authentication Failed' });
    }
};

export const anonymousAuth = async (req: Request, res: Response) => {
    try {
        const { idToken } = req.body;
        if (!idToken) return res.status(400).json({ error: 'Missing ID Token' });

        const decodedToken = await auth.verifyIdToken(idToken);
        const uid = decodedToken.uid;
        const userDoc = await db.collection('users').doc(uid).get();

        if (!userDoc.exists) {
            await db.collection('users').doc(uid).set({
                email: '',
                fullName: 'Guest Traveler',
                avatar: '',
                authProvider: 'anonymous',
                isAnonymous: true,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                settings: { language: 'en', homeCity: '', units: 'metric' },
                globalConstraints: { dietary: [], accessibility: false },
                deviceTokens: [],
                favorites: [],
                totalTripsPlanned: 0
            });
        }
        res.status(200).json({ message: 'Anonymous login successful', user: { uid, isAnonymous: true } });
    } catch (error: any) {
        console.error("Anonymous Auth Error:", error);
        res.status(401).json({ error: 'Authentication Failed' });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { idToken } = req.body;
        if (!idToken) return res.status(400).json({ error: 'Missing ID Token' });

        const decodedToken = await auth.verifyIdToken(idToken);
        const uid = decodedToken.uid;
        const userDoc = await db.collection('users').doc(uid).get();

        if (!userDoc.exists) return res.status(404).json({ error: 'User profile not found' });

        res.status(200).json({ message: 'Login successful', user: { uid, ...userDoc.data() } });
    } catch (error: any) {
        console.error("Login Error:", error);
        res.status(401).json({ error: 'Invalid credentials or token' });
    }
};