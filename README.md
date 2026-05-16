# BGYCC Deep Link Redirect Server

This project handles pretty-link redirection for the BGYCC mobile application. It acts as a bridge between custom branded domains and AppsFlyer OneLink tracking URLs to support **Deferred Deep Linking**.

## Features

- **Static Verification**: Serves `.well-known/apple-app-site-association` and `.well-known/assetlinks.json` for Universal Links (iOS) and App Links (Android).
- **Flavor Support**: Distinct routes for `dev`, `stg`, and `prod` environments.
- **Tracking Preservation**: Forwards referral codes and metadata to AppsFlyer via 302 redirection.

## Architecture

1. User clicks: `app.bgyccommunity.com/invite/erin`
2. This server redirects to: `dev.app.bgyccommunity.com/N8R5?deep_link_value=erin&path=invite/erin...`
3. AppsFlyer tracks the attribution and handles the App Store/App redirection.

## Routes

- `GET /dev-invite/:code` -> Redirects to `APPSFLYER_DEV_URL`
- `GET /stg-invite/:code` -> Redirects to `APPSFLYER_STG_URL`
- `GET /invite/:code`     -> Redirects to `APPSFLYER_PROD_URL`
- `GET /.well-known/*`    -> Serves static verification files

## Configuration

Create a `.env` file in the root directory:

```env
PORT=3000

# AppsFlyer OneLink Endpoints
APPSFLYER_DEV_URL=https://dev.app.bgyccommunity.com/N8R5
APPSFLYER_STG_URL=https://stg.app.bgyccommunity.com/N8R5
APPSFLYER_PROD_URL=https://app.bgyccommunity.com/N8R5
```

## Deployment

This project is optimized for deployment on **Vercel**, **Railway**, or **Render**.

1. Point your domain (e.g., `app.bgyccommunity.com`) to your hosting provider.
2. Ensure your `.well-known` files contain the correct Team IDs and SHA-256 fingerprints.
3. Deploy the Node.js application.

## Local Development

```bash
npm install
npm start
```
