/**
 * User Type Definitions
 * 
 * Shared types for user data across the application
 */

export interface User {
    id: string;
    email: string;
    fullName?: string;
    photoUrl?: string;
    createdAt?: string;
    preferences?: UserPreferences;
}

export interface UserPreferences {
    defaultBudget?: 'budget' | 'moderate' | 'luxury';
    defaultTravelStyle?: string;
    favoriteCategories?: string[];
    language?: string;
}

/**
 * Firebase Auth User (minimal subset we use)
 */
export interface FirebaseAuthUser {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
}
