# Native iOS & Android Builds

This guide explains how to build Ganba Hero for iOS and Android devices.

## Prerequisites

### General
- Node.js 18+
- npm or yarn
- React Native CLI: `npm install -g @react-native-community/cli`

### iOS
- macOS (required)
- Xcode 15+ (from App Store)
- CocoaPods: `sudo gem install cocoapods`
- Ruby 2.7+ (bundler): `gem install bundler`

### Android
- Android Studio (Arctic Fox or later)
- JDK 17
- Android SDK 35
- Android NDK 26.1.10909125

## Firebase Configuration

### iOS Setup

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project → Project Settings → Your apps → iOS
3. Download `GoogleService-Info.plist`
4. Place it in: `ios/GanbaHero/GoogleService-Info.plist`

### Android Setup

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project → Project Settings → Your apps → Android
3. Register app with package name: `com.ganbahero`
4. Download `google-services.json`
5. Place it in: `android/app/google-services.json`

## Building for iOS

### 1. Install Dependencies

```bash
# Install npm packages
npm install

# Install Ruby gems (for CocoaPods)
cd ios && bundle install

# Install CocoaPods dependencies
bundle exec pod install
cd ..
```

### 2. Open in Xcode

```bash
open ios/GanbaHero.xcworkspace
```

**Important**: Open the `.xcworkspace` file, not `.xcodeproj`

### 3. Configure Signing

1. Select the "GanbaHero" target
2. Go to "Signing & Capabilities"
3. Select your Team
4. Update Bundle Identifier if needed (e.g., `com.yourcompany.ganbahero`)

### 4. Run the App

**Simulator:**
```bash
npm run ios
# or
npx react-native run-ios
```

**Device:**
```bash
npx react-native run-ios --device "Your iPhone Name"
```

### 5. Build for Release

1. In Xcode, select Product → Scheme → Edit Scheme
2. Set Build Configuration to "Release"
3. Product → Build (⌘B)
4. Product → Archive for App Store submission

## Building for Android

### 1. Install Dependencies

```bash
npm install
```

### 2. Open in Android Studio (Optional)

```bash
open -a "Android Studio" android
```

### 3. Run the App

**Emulator:**
```bash
npm run android
# or
npx react-native run-android
```

**Device:**
1. Enable USB Debugging on your device
2. Connect via USB
3. Run:
```bash
npx react-native run-android
```

### 4. Build Release APK

```bash
cd android
./gradlew assembleRelease
```

APK location: `android/app/build/outputs/apk/release/app-release.apk`

### 5. Build Release AAB (for Play Store)

```bash
cd android
./gradlew bundleRelease
```

AAB location: `android/app/build/outputs/bundle/release/app-release.aab`

## Google Sign-In Configuration

### iOS

1. In Firebase Console, enable Google Sign-In provider
2. Add your iOS Bundle ID
3. Download the updated `GoogleService-Info.plist`
4. Add URL scheme to Xcode:
   - Open `ios/GanbaHero.xcworkspace`
   - Select target → Info → URL Types
   - Add: `REVERSED_CLIENT_ID` from GoogleService-Info.plist

### Android

1. In Firebase Console, add SHA-1 fingerprint:
   ```bash
   cd android
   ./gradlew signingReport
   ```
2. Copy the SHA-1 for debug/release
3. Add it in Firebase Console → Project Settings → Your apps → Android → Add fingerprint

## Troubleshooting

### iOS: Pod install fails

```bash
cd ios
rm -rf Pods Podfile.lock
bundle exec pod install --repo-update
```

### Android: Build fails with "SDK not found"

Set ANDROID_HOME:
```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

### Metro bundler issues

```bash
# Clear Metro cache
npx react-native start --reset-cache

# Clean build
cd ios && rm -rf build && cd ..
cd android && ./gradlew clean && cd ..
```

### Firebase not initializing

- iOS: Ensure `[FIRApp configure]` is in AppDelegate.mm
- Android: Ensure `google-services.json` is in `android/app/`

## Release Checklist

- [ ] Update version in `package.json`
- [ ] Update `versionCode` and `versionName` in `android/app/build.gradle`
- [ ] Update version in Xcode (General → Version/Build)
- [ ] Test on real devices
- [ ] Generate release signing key (Android)
- [ ] Configure App Store Connect (iOS)
- [ ] Configure Google Play Console (Android)

