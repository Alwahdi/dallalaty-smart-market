# 📱 دلالتي - السوق الذكي (Expo Mobile App)

A beautiful, polished React Native mobile application built with Expo for the Dallalaty Smart Market platform. This is the mobile companion to the web application, providing a native experience for browsing real estate and marketplace listings in Saudi Arabia.

![Expo](https://img.shields.io/badge/Expo-54-blue) ![React Native](https://img.shields.io/badge/React%20Native-0.81-green) ![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue) ![Supabase](https://img.shields.io/badge/Supabase-Backend-orange)

## ✨ Features

### 🏠 Full Marketplace
- Browse properties, cars, electronics, furniture, and more
- Rich property detail view with image carousel
- Advanced search with text, category, and listing type filters
- Pull-to-refresh on all listing screens

### 🔐 Authentication
- Email/password sign in and registration
- Secure session persistence with Supabase
- Form validation with animated error feedback
- Auto-redirect for authenticated users

### ❤️ Favorites
- Save listings with one tap
- Real-time sync across devices
- View all favorites in dedicated screen
- Badge count on tab bar

### 🔔 Notifications
- Real-time notification updates
- Mark as read / mark all as read
- Delete individual notifications
- Unread count badge

### 🎨 Polished Design
- **Gold & Olive** color palette matching the web app
- **Dark mode** with automatic system detection
- **RTL Arabic** layout throughout (right-to-left)
- **Haptic feedback** on all interactions
- **Smooth animations** on screen transitions and loading states
- **Skeleton loaders** while data is loading
- Native **pull-to-refresh** on all screens

### 📞 Contact Integration
- WhatsApp quick contact button
- Direct phone call support
- Native share functionality

---

## 🚀 How to Run with Expo Go

### Prerequisites

1. **Install Node.js** (v18 or later) — [Download here](https://nodejs.org/)
2. **Install Expo Go** on your phone:
   - 📱 **Android**: [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
   - 📱 **iOS**: [App Store](https://apps.apple.com/app/expo-go/id982107779)

### Step-by-Step Instructions

```bash
# 1. Navigate to the mobile directory
cd mobile

# 2. Install dependencies
npm install

# 3. Start the Expo development server
npx expo start
```

### Connecting Your Phone

After running `npx expo start`, you'll see a QR code in the terminal:

1. **Android**: Open the **Expo Go** app → tap **"Scan QR code"** → scan the QR code
2. **iOS**: Open the **Camera** app → point at the QR code → tap the Expo notification

> **💡 Tip**: Make sure your phone and computer are on the **same Wi-Fi network**.

> **💡 Tip**: If the QR code doesn't connect, try pressing `s` in the terminal to switch to **Expo Go** mode, or use the `--tunnel` flag:
> ```bash
> npx expo start --tunnel
> ```

### Alternative: Run on Simulators

```bash
# iOS Simulator (macOS only, requires Xcode)
npx expo start --ios

# Android Emulator (requires Android Studio)
npx expo start --android
```

---

## 📁 Project Structure

```
mobile/
├── app/                          # Screens (expo-router file-based routing)
│   ├── _layout.tsx              # Root layout (providers, navigation)
│   ├── index.tsx                # Landing/welcome screen
│   ├── (auth)/                  # Auth flow
│   │   ├── _layout.tsx
│   │   ├── login.tsx            # Sign in screen
│   │   └── register.tsx         # Sign up screen
│   ├── (tabs)/                  # Main tab navigator
│   │   ├── _layout.tsx          # Tab bar configuration
│   │   ├── index.tsx            # Home screen
│   │   ├── explore.tsx          # Browse/search listings
│   │   ├── favorites.tsx        # Saved favorites
│   │   ├── notifications.tsx    # Notifications center
│   │   └── account.tsx          # Profile & settings
│   └── product/
│       └── [id].tsx             # Product detail screen
├── components/                   # Reusable UI components
│   ├── PropertyCard.tsx         # Listing card with image, price, actions
│   ├── PropertyCardSkeleton.tsx # Loading skeleton animation
│   ├── CategoryCard.tsx         # Category icon card
│   ├── SearchBar.tsx            # Search input with filter button
│   └── EmptyState.tsx           # Empty content placeholder
├── hooks/                        # Custom React hooks
│   ├── useAuth.tsx              # Authentication context & logic
│   ├── useTheme.tsx             # Theme (light/dark) context
│   ├── useFavorites.ts          # Favorites management
│   ├── useNotifications.ts      # Notifications with real-time
│   └── useProperties.ts        # Property data fetching & filtering
├── lib/
│   └── supabase.ts              # Supabase client configuration
├── constants/
│   ├── Colors.ts                # Color palette (light & dark)
│   └── Layout.ts                # Layout constants & shadows
├── assets/                       # App icons and images
├── app.json                      # Expo configuration
├── tsconfig.json                 # TypeScript config
└── package.json                  # Dependencies
```

---

## 🎨 Design System

### Color Palette

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| Primary | `#D4A843` | `#E0B84D` | Gold — buttons, highlights, accents |
| Secondary | `#7A8C55` | `#8FA060` | Olive green — secondary elements |
| Background | `#FDFAF3` | `#151210` | Warm off-white / dark brown |
| Card | `#FFFFFF` | `#252018` | Card surfaces |
| Text | `#2D2518` | `#F5EDD5` | Primary text |

### Typography

- **Hero**: 32px bold
- **Title**: 24px extra-bold
- **Heading**: 20px extra-bold
- **Body**: 15px regular
- **Caption**: 13px medium
- **Tiny**: 11px

---

## 🛠 Tech Stack

| Technology | Purpose |
|-----------|---------|
| **Expo SDK 54** | Development framework |
| **React Native 0.81** | UI framework |
| **expo-router** | File-based navigation |
| **TypeScript** | Type safety |
| **Supabase** | Backend, auth, real-time |
| **expo-haptics** | Haptic feedback |
| **expo-linear-gradient** | Gradient effects |
| **@expo/vector-icons** | Ionicons |
| **react-native-gesture-handler** | Touch gestures |
| **react-native-reanimated** | Animations |

---

## 📝 Screens Overview

### 1. Landing Screen (`/`)
Animated welcome screen with feature cards, app description, and CTA buttons. Auto-redirects to home if already authenticated.

### 2. Login Screen (`/(auth)/login`)
Clean email/password form with shake animations on errors, show/hide password toggle, and haptic feedback.

### 3. Register Screen (`/(auth)/register`)
Full registration with name, phone, email, password. Sequential field focus with "next" keyboard buttons.

### 4. Home Screen (`/(tabs)/`)
Dashboard with greeting, hero card with gradient, quick search bar, category grid, and featured property listings.

### 5. Explore Screen (`/(tabs)/explore`)
Full-featured browsing with search bar, horizontal category chips, listing type tabs (All/Sale/Rent), filter modal, and results counter.

### 6. Product Detail (`/product/[id]`)
Rich detail view: paginated image gallery with dots, price, location, quick stats (beds/baths/area), description, details table, amenities tags, agent card, related listings, and sticky WhatsApp/Call contact bar.

### 7. Favorites Screen (`/(tabs)/favorites`)
Grid of saved listings with badge count and empty state with CTA.

### 8. Notifications Screen (`/(tabs)/notifications`)
Notification feed with read/unread states, time-ago labels, delete buttons, and mark-all-as-read.

### 9. Account Screen (`/(tabs)/account`)
Profile card, phone editing, theme selection (light/dark/auto), app info, and sign out.

---

## 🔧 Development Notes

- All text is **right-to-left (RTL)** by default for Arabic
- `I18nManager.forceRTL(true)` is set in the Layout constants
- The `flexDirection: 'row-reverse'` pattern is used throughout for RTL layout
- All `writingDirection: 'rtl'` is applied in StyleSheet, not on component props
- The app uses **Supabase real-time subscriptions** for live favorites and notification updates

---

## 📄 License

This project is part of the Dallalaty Smart Market platform. See the root README for license information.
