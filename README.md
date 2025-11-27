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

### Running the App

```bash
# iOS
npm run ios

# Android
npm run android

# Web
npm run web
```

## Content Licensing

Vocabulary and grammar content is sourced from:

- **[Hanabira.org](https://hanabira.org)** - CC BY-SA 4.0
- **[JMdict](https://www.edrdg.org/jmdict/j_jmdict.html)** - CC BY-SA 4.0

## License

This project is proprietary. The app code is not open source.
Content is licensed as noted above.
