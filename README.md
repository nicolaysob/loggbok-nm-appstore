# Loggbok – App Store

Kopi av Loggbok brukt til **iOS-app** (Capacitor) for App Store.

Hovedappen for web/Vercel: separat repo `loggbok-nm` — endres ikke herfra.

## Kom i gang (web i denne kopien)

```bash
npm install
npm run dev
```

## App Store

Se **[APP_STORE.md](./APP_STORE.md)** for Apple Developer, privacy labels, review-notater og TestFlight.

## Capacitor

```bash
npm install
npx cap sync ios
npx cap open ios
```

WebView peker på produksjon: `https://loggbok-nm-lyart.vercel.app`

## Miljøvariabler

Kopier `.env` fra hovedprosjektet. **Commit aldri `.env`.**
