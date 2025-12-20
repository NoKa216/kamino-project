
# Kamino Project - Architecture Blueprint 🚀
**Version:** 1.0.0 (Dec 2025)
**Goal:** $100M AI Travel Startup. High scale, premium UX.

## 1. Core Tech Stack
- **Mobile:** Expo SDK 54 (Managed), React Native 0.81 (New Architecture).
- **Language:** TypeScript (Strict Mode).
- **Styling:** NativeWind v4 (Tailwind CSS) + Reanimated 3.
- **Backend:** Node.js + Express + Firebase Admin.
- **AI Engine:** **Gemini 3.0 Flash** (Primary engine for speed & cost).
- **Deep Linking:** Expo Linking (for viral sharing).

## 2. User Strategy: "Lazy Auth" & Auto-Save 🥷
- **Philosophy:** "Taste before you commit." No barriers to entry.
- **Guest Mode:** Crucial. Users must be able to skip login initially.
- **Data Persistence:** All trips are **Auto-Saved** locally (Guest ID).
- **The "Hook" (Signup Triggers):**
  1.  **Cloud Backup:** "Secure your trip in the cloud."
  2.  **Viral Sharing:** "Share a link with friends." (Feature: Generates a Deep Link. Recipients download the app to view the trip in **Read-Only** mode).
  3.  **Advanced Features:** Access to full history.

## 3. UI/UX Design System (Light Mode)
- **Theme:** Clean, Minimalist, Light Mode.
- **Color Palette (Extracted from Figma):**
  - **Primary:** `Kamino Violet` (#6366F1).
  - **Background:** `White` (#FFFFFF) and `Slate-50` (#F8FAFC).
  - **Text:** `Rich Black` (#1E293B), `Cool Gray` (#64748B).
- **Visuals:** High-end photography. Rounded corners (xl/2xl).
- **Navigation Structure:**
  - `(tabs)`: Explore, My Trips, Saved, Profile.
  - `auth`: **Modal Bottom Sheet** flow over a rotating scenic background.
    - **Control:** MUST include a **"Skip" / "Close" button** (Top Right).
    - **Flow:** Social Login -> Email Login -> Email Signup.

## 4. Architecture Rules (Monorepo)
- **Root:** `/mobile` (Expo Client), `/backend` (Node API).
- **Security:** Use `.env` files. NEVER commit keys.
- **Mobile Structure (Feature-First):**
  - `src/features/auth` (Login visuals, logic).
  - `src/features/home` (Feed, Search).
  - `src/features/trip-planner` (Wizard, Itinerary).
  - `src/features/sharing` (Deep link handling, Read-only view).
- **State:** Zustand (Global), TanStack Query (Server Data).

## 5. Development Workflow
1. **Mock First:** Build pixel-perfect UI with hardcoded data based on Figma.
2. **Logic Second:** Implement navigation, state, and Deep Linking.
3. **Connect Last:** Hook up Real Backend & Gemini AI.