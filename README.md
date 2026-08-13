# Loggbok – App Store

Kopi av Loggbok-appen brukt til å lage **iOS-app** (Capacitor) for App Store.

Hovedappen for web/Vercel ligger i et eget repo (`loggbok-nm`). Dette repoet skal ikke brukes til vanlig produksjonsdeploy.

## Kom i gang

```bash
npm install
npm run dev
```

Åpne [http://localhost:3000](http://localhost:3000).

## Miljøvariabler

Kopier `.env` fra hovedprosjektet (eller lag en ny).  
**Commit aldri `.env`** — den inneholder hemmeligheter.

## Merknad

- Samme database/backend som hovedappen hvis du bruker samme `.env`
- Capacitor / Xcode settes opp her senere uten å røre web-repoet
