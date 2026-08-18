# App Store — sjekkliste for N&M Loggbok

Dette repoet er **App Store-kopien**. Den deployes ikke. Hovedappen på Vercel endres ikke herfra.

iOS-wrapperen (Capacitor) laster produksjon: https://loggbok-nm-lyart.vercel.app  
Nytt utseende i denne mappa brukes når du sier at det skal inn i appen.

**Personvern:** https://loggbok-nm-lyart.vercel.app/personvern  
**Support:** https://loggbok-nm-lyart.vercel.app/support

---

## Fase 0 — Apple Developer (må gjøres manuelt)

1. Gå til https://developer.apple.com/programs/ og meld deg på ($99/år).
2. Velg utgivernavn i butikken, foreslått: **N&M Vaktmesterservice AS**.
3. Noter:
   - Team ID
   - Apple ID brukt til kontoen
   - Støtte-e-post: midlertidig `nicolaysob2002@gmail.com` (bytt når bedriften har fast adresse — før innsending)
4. Når kontoen er godkjent: opprett app i [App Store Connect](https://appstoreconnect.apple.com) med bundle id `no.nmvaktmester.loggbok`.

Uten dette kan vi bygge lokalt i Xcode Simulator, men **ikke** TestFlight/App Store.

---

## Privacy Nutrition Labels (App Store Connect)

Fyll inn under App Privacy:

| Data | Type | Formål | Koblet til bruker | Brukes til tracking |
|------|------|--------|-------------------|---------------------|
| Kontonavn / brukernavn | Kontaktinfo | App-funksjonalitet | Ja | Nei |
| E-post (hvis satt) | Kontaktinfo | App-funksjonalitet | Ja | Nei |
| Brukerinnhold (logger, kommentarer, avvik) | Brukerinnhold | App-funksjonalitet | Ja | Nei |
| Bilder (feltfoto) | Bilder | App-funksjonalitet | Ja | Nei |
| Enhets-ID (push via OneSignal) | Identifikatorer | App-funksjonalitet (varsler) | Ja | Nei |

Ingen reklame, ingen data solgt til tredjeparter. OneSignal brukes kun til arbeidsvarsler — **ikke** ATT/tracking med mindre dere senere legger til annonser.

---

## Review-notater (lim inn i App Store Connect)

```
Loggbok er et internt verktøy for N&M Vaktmesterservice AS (ansatte og
kundekontoer). Det er ikke en forbrukerapp for åpen registrering.

Testbruker (ansatt):
Brukernavn: [FYLL INN]
Passord: [FYLL INN]

Kundenportal (valgfritt):
Brukernavn: [FYLL INN]
Passord: [FYLL INN]

Appen krever innlogging. Personvern: https://loggbok-nm-lyart.vercel.app/personvern
Sletting av konto: Mer → Slett konto (eller /mer/slett-konto).
Support: https://loggbok-nm-lyart.vercel.app/support
```

---

## TestFlight / innsending

1. Opprett Apple Developer-konto (se Fase 0).
2. I denne mappa:

```bash
npm install
npx cap sync ios
npx cap open ios
```

3. I Xcode:
   - Velg target **App**
   - Signing & Capabilities → Team = ditt Apple Developer-team
   - Bundle ID er `no.nmvaktmester.loggbok` (må være unik i App Store Connect)
4. Product → Destination: Any iOS Device → **Archive**
5. Distribute App → **App Store Connect** → Upload
6. I App Store Connect: aktiver build for **TestFlight**, inviter interne testere
7. Når OK: fyll listing (skjermbilder, privacy labels fra tabellen over), lim inn review-notater, **Submit for Review**

**Skjermbilder:** iPhone 6.7" og 6.1", norsk UI (Hjem, stempling, kundekort, Mer).

**Kategori:** Business  
**Pris:** Gratis  
**Aldersgrense:** 4+ (arbeidsverktøy, ingen sosial UGC)

### Capacitor-kommandoer

| Kommando | Hva |
|----------|-----|
| `npm run cap:sync` | Synk web + plugins til iOS |
| `npm run cap:open` | Åpne Xcode |

WebView laster: `https://loggbok-nm-lyart.vercel.app`  
Offline-fallback: `www/index.html`
