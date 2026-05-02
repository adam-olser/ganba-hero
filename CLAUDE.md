# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run ios           # Run on iOS simulator
npm run android       # Run on Android emulator
npm run web           # Run web dev server (localhost:3000, webpack)
npm run start         # Start Metro bundler only

# Quality
npm run typecheck     # TypeScript type check (no emit)
npm run lint          # ESLint
npm run lint:fix      # ESLint with auto-fix
npm run format        # Prettier (src/**/)

# Testing
npm test                            # Run all tests
npm test -- __tests__/services/srs.test.ts  # Run a single test file

# Build & Deploy
npm run web:build     # Production webpack build → build/
npm run seed          # Seed Firestore with vocabulary data (ts-node)

# iOS native deps (after npm install)
cd ios && pod install && cd ..
```

## Architecture

### Multi-platform Strategy

The app targets iOS, Android, and Web from a single codebase using React Native Web. Two parallel implementations exist for platform-specific concerns:

- **Native** (`@react-native-firebase/*`) vs **Web** (`firebase` JS SDK) — Firebase is the main split point.
- Files named `*.web.ts` / `*.web.tsx` are the web-specific implementations.
- `src/mocks/` contains stub modules for native-only packages (e.g. Google Sign-In, Apple Auth, FCM) that are swapped in via webpack aliases.
- Webpack aliases `@/api` → `src/api/index.web.ts` on web, while Metro resolves it to `src/api/index.ts` on native. The same pattern applies to `src/services/analytics`.

All path imports use the `@/` alias (maps to `src/`) configured in both `babel.config.js` and `webpack.config.js`.

### Navigation Flow

`RootNavigator` gates routing by auth state from `useAuthStore`:
- `unauthenticated` → `AuthNavigator` (Welcome/sign-in)
- `authenticated` + `!hasSeenOnboarding` → `OnboardingNavigator`
- `authenticated` + onboarded → `MainNavigator`

`MainNavigator` uses React Navigation bottom tabs on mobile and a custom `DesktopSidebar` on wide screens, toggled by the `useResponsive` hook. The Study tab is a nested stack navigator.

### State Management

Three Zustand stores in `src/store/`:
- `useAuthStore` — auth status (`loading | authenticated | unauthenticated`), current `User` object
- `useStudyStore` — active session queue, current card index, daily progress counters
- `useSettingsStore` — `hasSeenOnboarding`, user preferences (mirrors `User.settings`)

Named selectors are exported alongside each store (e.g. `selectCurrentCard`, `selectDailyProgress`). React Query handles server-state fetching on top of these.

### Core Learning Loop

1. `buildStudyQueue()` (`src/services/cardQueue.ts`) interleaves new and due cards — default pattern: 1 new card per 4 review cards.
2. The user grades each card 0–5 (SM-2 quality scale) via `GradeButtons`.
3. On session end, `saveSessionResults()` (`src/api/firestore.ts`) atomically:
   - Batch-writes updated SRS fields to `users/{uid}/progress/{vocabId}`
   - Records a `studySessions` document and updates `dailyStats/{date}`
   - Increments `totalXp` and calls `updateStreak` if the daily goal was met
4. XP is calculated by `src/services/xpCalculator.ts`.

### Firestore Schema

```
users/{uid}                          # User profile, XP, streak, settings
users/{uid}/progress/{vocabId}       # SRS state per card (interval, easeFactor, nextReview, status)
users/{uid}/dailyStats/{YYYY-MM-DD}  # Aggregated daily stats (increment-based)
users/{uid}/studySessions/{id}       # Per-session records
users/{uid}/grammarProgress/{id}     # Grammar completion state
vocabularies/{id}                    # JLPT vocabulary content (N5–N1)
grammarPoints/{id}                   # Grammar points
```

Card status lifecycle: `new` → `learning` (interval ≤ 1) → `review` (interval 2–20) → `mastered` (interval ≥ 21).

### Firebase Cloud Functions (`functions/src/index.ts`)

- `onUserCreate` — triggered by Firebase Auth, creates the initial user Firestore document
- `onUserDelete` — cleans up all user subcollections on account deletion
- `updateLastActive`, `updateStreak`, `getDueCardsCount` — HTTPS callable functions

Deploy functions separately: `cd functions && npm run deploy`.

### Web Deployment

Pushing to `main` triggers the GitHub Actions workflow (`.github/workflows/deploy.yml`) which runs `npm run web:build` and deploys the `build/` directory to GitHub Pages. A `404.html` copy of `index.html` is added for SPA client-side routing.

## Environment Variables

Copy `.env.example` → `.env`. For web, all `FIREBASE_*` vars are injected at build time via webpack `DefinePlugin`. The native apps read them via `react-native-config`.

Required: `FIREBASE_API_KEY`, `FIREBASE_AUTH_DOMAIN`, `FIREBASE_PROJECT_ID`, `FIREBASE_STORAGE_BUCKET`, `FIREBASE_MESSAGING_SENDER_ID`, `FIREBASE_APP_ID`. Optional: `FIREBASE_MEASUREMENT_ID`, `REVENUECAT_API_KEY_IOS`, `REVENUECAT_API_KEY_ANDROID`, `GOOGLE_WEB_CLIENT_ID`.
