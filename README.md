# 🦐 Ganba Hero

A Japanese language learning app with spaced repetition, built with React Native + React Native Web.

**Ganba Hero** = "Gamba" (Spanish: shrimp) + "頑張れ" (Ganbare: do your best!)

## Features

- 📚 JLPT N5-N1 vocabulary and grammar
- 🔄 Spaced repetition (SM-2 algorithm)
- 🎯 Daily goals and streak tracking
- ⭐ XP and level progression
- 🌐 Works on iOS, Android, and Web (PWA)
- 🌙 Beautiful dark mode UI

## Tech Stack

- **Frontend**: React Native + TypeScript + React Native Web
- **Backend**: Firebase (Firestore, Auth, Functions, FCM)
- **State**: Zustand + React Query
- **Payments**: RevenueCat
- **Styling**: Custom theme system

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Xcode (for iOS)
- Android Studio (for Android)
- Firebase project

### Installation

```bash
# Clone the repo
git clone https://github.com/adam-olser/ganba-hero.git
cd ganba-hero

# Install dependencies
npm install

# Install iOS pods
cd ios && pod install && cd ..
```

### Environment Setup

Copy the example environment file and fill in your values:

```bash
cp .env.example .env
```

### Running the App

```bash
# iOS
npm run ios

# Android
npm run android

# Web
npm run web
```

## Project Structure

```
src/
├── api/            # Firebase API functions
├── components/     # UI components (shared, by screen)
├── screens/        # Screen components
├── navigation/     # Navigation configuration
├── services/       # Business logic (SRS, analytics)
├── store/          # Zustand stores
├── hooks/          # Custom React hooks
├── types/          # TypeScript types
├── theme/          # Colors, typography, spacing
├── i18n/           # Internationalization
└── utils/          # Helper functions
```

## Content Licensing

Vocabulary and grammar content is sourced from:

- **[Hanabira.org](https://hanabira.org)** - CC BY-SA 4.0
- **[JMdict](https://www.edrdg.org/jmdict/j_jmdict.html)** - CC BY-SA 4.0

See [ATTRIBUTION.md](docs/ATTRIBUTION.md) for full details.

## Contributing

Contributions are welcome! Please read the contributing guidelines first.

## License

This project is proprietary. The app code is not open source.
Content is licensed as noted above.

