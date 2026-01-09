# Project Context: Kamino (AI Travel Planner)

## Tech Stack
- **Frontend:** React Native (Expo), Expo Router, NativeWind (Tailwind), Lucide Icons, Reanimated.
- **Backend:** Node.js, Express, TypeScript.
- **Services:** Google Places API (New), Google Gemini (AI), Firebase Auth & Firestore.

## Current Status (As of Jan 2026)

### 1. Backend (`/backend`)
- **Places Controller:** - Migrated to **Google Places API (New)** (`places.googleapis.com/v1`).
  - Implemented **Strict English Filtering**: Requests containing non-English characters return empty arrays immediately to force English results.
  - Using `includedPrimaryTypes` to distinguish between 'city' and 'attraction'.
  - Added specific fields to response (Field Masking) for cost efficiency.
- **Env:** Requires `GOOGLE_PLACES_API_KEY`.

### 2. Frontend (`/mobile` or root)
- **Wizard Flow:**
  - `CreateTripScreen`: Main wizard.
  - `DestinationInput`: 
    - Fixed **Z-Index issues** (dropdown now appears above date picker).
    - Implemented **Auto-Resolve**: If `initialDestination` is passed (e.g. from Explore), it automatically fetches the best match from Google without user typing.
    - Prevents "double searching" using a `useRef` flag (`isTyping`).
    - Styled to show dropdown relative to the input field correctly.
  - `GeneratingScreen`:
    - Simulates loading state.
    - Uses `router.dismissAll()` on completion to correctly close the modal stack and reveal the underlying App tabs (instead of pushing a new route inside the modal).

### 3. Navigation structure
- Using Expo Router with a Modal stack for the creation flow (`_layout.tsx`).
- Main app lives in `(app)` folder.

## Next Steps (Immediate Tasks)
1. **Connect Generating Screen to Backend:** - The `GeneratingScreen` currently uses a `setTimeout`. It needs to send the collected `tripData` to the backend.
2. **Backend AI Integration:**
   - Create a controller that accepts trip data.
   - Use Google Gemini SDK to generate a JSON itinerary.
3. **Database Storage:**
   - Save the generated itinerary to Firebase Firestore under `users/{userId}/trips`.
4. **Frontend Display:**
   - Fetch and display the new trip in the `Trips` tab.