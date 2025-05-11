# Migrare la Firebase

Acest proiect a fost migrat de la o bază de date PostgreSQL la Firebase (Firestore).

## Configurare Firebase

1. Creează un proiect în [Firebase Console](https://console.firebase.google.com/)
2. Adaugă o aplicație web în proiectul tău
3. Obține credențialele Firebase (apiKey, authDomain, etc.)
4. Creează un fișier `.env` în directorul backend cu următoarele variabile:

```
# Cheia folosită pentru semnarea token-urilor JWT
TOKEN_KEY=cheie_secreta_jwt

# Configurație Firebase
FIREBASE_API_KEY=apikey
FIREBASE_AUTH_DOMAIN=proiect.firebaseapp.com
FIREBASE_PROJECT_ID=proiect
FIREBASE_STORAGE_BUCKET=proiect.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

## Structura Firestore

Colecțiile din Firestore sunt organizate astfel:

1. **users**: Informații despre utilizatori
   - firstName, lastName
   - email, password (criptată)
   - role (SUPERADMIN, ADMIN, USER)
   - city, state, country, profilePictureUrl

2. **medici**: Informații despre medici
   - specializare, numarTelefon
   - recomandari

3. **pacienti**: Informații despre pacienți
   - varsta, cnp, oras, strada
   - nrTelefon, profesie
   - istoricMedical, alergii
   - valoriNormaleID (referință la documento din valori_normale)

4. **alarme**: Alerte medicale
   - pacientID (referință către un pacient)
   - dataStart, dataSfarsit
   - descriere, titlu, cauza

5. **activitati**: Activități medicale
   - medicID, pacientID (referințe)
   - durata, descriere

6. **recomandari**: Recomandări medicale
   - medicID, pacientID (referințe)
   - tipulDeRecomandare, timpulDeRecomandare, alteRecomandari

7. **valori_normale**: Valori normale pentru parametrii biologici
   - minTemp, maxTemp
   - minPuls, maxPuls
   - minUmid, maxUmid

8. **senzori**: Date de la senzori
   - **umiditate**, **temperatura**, **puls**, **ekg**: Subcollecții cu măsurători
     - pacientID, valoare, dataInregistrarii

## Rulare aplicație

1. Instalează dependențele: `npm install`
2. Rulează aplicația: `npm start`

## Note despre migrare

- Toate interogările SQL au fost înlocuite cu apeluri la Firestore
- Am păstrat același format de răspuns API pentru compatibilitate cu frontend-ul existent
- Autentificarea a fost adaptată pentru a folosi Firebase Authentication împreună cu Firestore

## Exemple de utilizare

### Înregistrare utilizator
```bash
curl -X POST http://localhost:3001/api/register -H "Content-Type: application/json" -d '{"firstName":"Ion","lastName":"Popescu","email":"ion@example.com","password":"parola123"}'
```

### Login
```bash
curl -X POST http://localhost:3001/api/login -H "Content-Type: application/json" -d '{"email":"ion@example.com","password":"parola123"}' 