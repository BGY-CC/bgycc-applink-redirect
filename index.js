const path = require('path');
const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;

const APPSFLYER_URLS = {
  'dev-invite': process.env.APPSFLYER_DEV_URL || "https://dev.app.bgyccommunity.com/N8R5",
  'stg-invite': process.env.APPSFLYER_STG_URL || "https://stg.app.bgyccommunity.com/N8R5",
  'invite': process.env.APPSFLYER_PROD_URL || "https://app.bgyccommunity.com/N8R5"
};

// Serve the .well-known directory for Apple App Site Association and Android Asset Links
app.use('/.well-known', express.static(path.join(__dirname, '.well-known'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('apple-app-site-association')) {
      res.setHeader('Content-Type', 'application/json');
    }
  }
}));

/**
 * Core redirect logic
 */
const handleInviteRedirect = (req, res, pathPrefix) => {
  const code = req.params.code;
  if (!code) return res.status(400).send('Referral code missing');

  const baseUrl = APPSFLYER_URLS[pathPrefix];
  const appsflyerUrl = new URL(baseUrl);
  appsflyerUrl.searchParams.append('deep_link_value', code);

  // Important: We pass the flavored path so the app knows which environment it's in
  appsflyerUrl.searchParams.append('path', `${pathPrefix}/${code}`);

  appsflyerUrl.searchParams.append('af_channel', 'User_invite');
  appsflyerUrl.searchParams.append('media_source', 'User_invite');
  
  // Forward additional query parameters
  Object.keys(req.query).forEach(key => {
    appsflyerUrl.searchParams.append(key, req.query[key]);
  });

  console.log(`Redirecting [${pathPrefix}]: ${code} -> ${appsflyerUrl.toString()}`);
  res.redirect(302, appsflyerUrl.toString());
};

// Flavor-based routes
app.get('/dev-invite/:code', (req, res) => handleInviteRedirect(req, res, 'dev-invite'));
app.get('/stg-invite/:code', (req, res) => handleInviteRedirect(req, res, 'stg-invite'));
app.get('/invite/:code', (req, res) => handleInviteRedirect(req, res, 'invite'));

// Health check
app.get('/', (req, res) => {
  res.send('BGYCC Redirect Server is running.');
});

app.listen(PORT, () => {
  console.log(`Redirect server listening on port ${PORT}`);
  console.log(`Configured AppsFlyer URLs:`, APPSFLYER_URLS);
});
