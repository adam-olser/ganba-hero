# Firebase Setup Guide

This guide walks you through setting up Firebase for Ganba Hero.

## Prerequisites

- [Firebase CLI](https://firebase.google.com/docs/cli) installed
- A Google account
- Node.js 18+

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: `ganba-hero` (or your preferred name)
4. Enable Google Analytics (optional but recommended)
5. Select or create an Analytics account
6. Click "Create project"

## Step 2: Enable Required Services

### Authentication
1. Go to **Authentication** in the sidebar
2. Click **Get started**
3. Enable these sign-in providers:
   - **Google**: Click, enable, add Web Client ID
   - **Apple**: Click, enable, configure (requires Apple Developer account)
   - **Anonymous**: Click, enable

### Firestore Database
1. Go to **Firestore Database** in the sidebar
2. Click **Create database**
3. Choose **Start in production mode**
4. Select your region (choose closest to your users)

### Cloud Functions
1. Go to **Functions** in the sidebar
2. Click **Get started**
3. Upgrade to **Blaze plan** (pay as you go - required for functions)

### Cloud Messaging (for push notifications)
1. Go to **Cloud Messaging** in the sidebar
2. Note your Sender ID for later

## Step 3: Get Configuration Files

### For iOS
1. Go to **Project settings** > **General**
2. Under "Your apps", click the iOS icon
3. Register app with bundle ID: `com.yourcompany.ganbahero`
4. Download `GoogleService-Info.plist`
5. Place it in `ios/GanbaHero/`

### For Android
1. Click "Add app" > Android icon
2. Register with package name: `com.yourcompany.ganbahero`
3. Download `google-services.json`
4. Place it in `android/app/`

### For Web
1. Click "Add app" > Web icon
2. Register app name: `Ganba Hero Web`
3. Copy the config object

## Step 4: Configure Environment

Create `.env` file from the example:

```bash
cp .env.example .env
```

Fill in the values from your Firebase project:

```env
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
```

## Step 5: Deploy Firestore Rules

```bash
# Login to Firebase
firebase login

# Initialize Firebase in your project
firebase init

# Select: Firestore, Functions, Hosting
# Use existing project: your-project-id

# Deploy rules
firebase deploy --only firestore:rules
```

## Step 6: Deploy Cloud Functions

```bash
cd functions
npm install
npm run build
cd ..
firebase deploy --only functions
```

## Step 7: Seed Initial Data (Optional)

Run the seed script to populate vocabulary:

```bash
npm run seed
```

## Security Rules

The Firestore rules are configured to:
- Allow authenticated users to read vocabulary and grammar content
- Allow users to read/write only their own progress data
- Prevent direct writes to content collections (admin only)

See `firestore.rules` for the complete ruleset.

## Emulators for Local Development

Start the Firebase emulators:

```bash
firebase emulators:start
```

This starts:
- Auth emulator on port 9099
- Firestore emulator on port 8080
- Functions emulator on port 5001
- Hosting emulator on port 5000

## Troubleshooting

### "Permission denied" errors
- Check that the user is authenticated
- Verify Firestore rules are deployed
- Check the user's subscription status for premium content

### Functions not working
- Ensure you're on Blaze plan
- Check Functions logs: `firebase functions:log`
- Verify functions are deployed: `firebase deploy --only functions`

### Auth issues
- Verify sign-in providers are enabled
- Check OAuth redirect URIs are configured
- For Apple Sign-In, ensure Services ID is set up

