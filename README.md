# Payment Collection Frontend

Expo React Native app for personal-loan EMI collection.

## Setup

```bash
npm install
```

Run locally:

```bash
API_URL=http://localhost:3000 npm start
```

For Android emulator, use your machine IP or `http://10.0.2.2:3000` depending on the environment.

## Screens

- Loan Details
- Make Payment
- Payment History
- Admin Dashboard
- Successful Payment Stamp

## Demo Login

```text
Email: demo@example.com
Password: password123
```

The demo user is linked to loan account `AC10293847`.

Admin login:

```text
Email: admin@example.com
Password: password123
```

The admin account can view all loans and payment history in the dashboard.

## Build

Sign in to Expo or set `EXPO_TOKEN`, then:

```bash
npm run build:apk
```

The preview build creates an Android APK and uses the deployed backend URL:

```bash
https://loan-api.akashtomy.com
```

Latest APK install page:

```text
https://expo.dev/accounts/akashtomy174/projects/payment-collection/builds/327a321d-8def-4b7f-9c60-878b807d94f6
```
