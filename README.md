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
- Successful Payment Stamp

## Build

Install and configure EAS, then:

```bash
eas build --platform android --profile preview
```

Set `API_URL` to the deployed backend URL, for example:

```bash
https://api.yourdomain.com
```

