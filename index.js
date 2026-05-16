const path = require('path');
const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;
const APPSFLYER_BASE_URL = process.env.APPSFLYER_BASE_URL;

// Serve the .well-known directory for Apple App Site Association and Android Asset Links
// Ensure the folder contains 'apple-app-site-association' (no .json extension for iOS)
app.use('/.well-known', express.static(path.join(__dirname, '.well-known'), {
  setHeaders: (res, filePath) => {
    // iOS requires the AASA file to be served with application/json or application/pkcs7-mime
    if (filePath.endsWith('apple-app-site-association')) {
      res.setHeader('Content-Type', 'application/json');
    }
  }
}));

/**
 * Redirects /invite/:code to the AppsFlyer OneLink
 */
app.get('/invite/:code', (req, res) => {
  const code = req.params.code;
  
  if (!code) {
    return res.status(400).send('Referral code missing');
  }

  const appsflyerUrl = new URL(APPSFLYER_BASE_URL);
  appsflyerUrl.searchParams.append('deep_link_value', code);
  appsflyerUrl.searchParams.append('path', `invite/${code}`);
  appsflyerUrl.searchParams.append('af_channel', 'User_invite');
  appsflyerUrl.searchParams.append('media_source', 'User_invite');
  
  Object.keys(req.query).forEach(key => {
    appsflyerUrl.searchParams.append(key, req.query[key]);
  });

  console.log(`Redirecting invite: ${code} -> ${appsflyerUrl.toString()}`);
  res.redirect(302, appsflyerUrl.toString());
});

// Health check
app.get('/', (req, res) => {
  res.send('BGYCC Redirect Server is running.');
});

app.listen(PORT, () => {
  console.log(`Redirect server listening on port ${PORT}`);
});
