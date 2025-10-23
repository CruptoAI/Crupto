# Crupto Mobile Shell

Minimal React Native shell that boots on Android, iOS, and web using Expo. It ships the base navigation and UI requested for the first iteration of the Crupto app.

## Tech stack

- [Expo 54](https://docs.expo.dev/) with the new architecture enabled
- React Native `0.81.x` + React `19.2.0`
- [React Navigation](https://reactnavigation.org/) bottom tabs
- [React Native Paper](https://callstack.github.io/react-native-paper/) MD3 theme
- [lottie-react-native](https://github.com/lottie-react-native/lottie-react-native) for animated tab icons

## Getting started

```bash
npm install
npm run start        # launch Expo dev server
```

From the Expo CLI you can open the project in Expo Go, an Android emulator, or the iOS simulator.

## Current screens

- **Home** – two primary actions (`Dive In`, `Ask AI`) logging to the console for now.
- **Chat** & **Account** – placeholders that say “Coming soon”.
- **Markets** – Paper segmented buttons toggling `Crypto` / `TradFi` state with contextual copy.
- **News** – mirrors the Markets toggle for curated headlines.

Every tab uses a Lottie pulse animation that plays on focus and resets when unfocused. The Paper theme controls colors globally to keep navigation and surface colors in sync.

## Project layout

- `App.tsx` – navigation container, Paper provider, screen definitions, and shared styles.
- `assets/lottie/tab-pulse.json` – reusable pulse animation tinted by each tab state.

The codebase is intentionally lean so we can layer in real data, screen-specific stacks, and business logic in future iterations.
