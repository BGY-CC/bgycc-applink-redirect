require('dotenv').config();
const path = require('path');
const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;

const TEMPLATE_ID = process.env.APPSFLYER_TEMPLATE_ID;
const APPSFLYER_SUBDOMAIN = process.env.APPSFLYER_SUBDOMAIN || 'bgycc-app';

if (!TEMPLATE_ID) {
  console.error('FATAL: APPSFLYER_TEMPLATE_ID is not set.');
  process.exit(1);
}

// Serve the .well-known directory for Apple App Site Association and Android Asset Links
app.use('/.well-known', express.static(path.join(__dirname, '.well-known'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('apple-app-site-association')) {
      res.setHeader('Content-Type', 'application/json');
    }
  }
}));

app.get('/invite/:code', (req, res) => {
  const code = req.params.code;
  if (!code) return res.status(400).send('Referral code missing');

  const baseUrl = `https://${APPSFLYER_SUBDOMAIN}.onelink.me/${TEMPLATE_ID}`;

  try {
    const appsflyerUrl = new URL(baseUrl);
    appsflyerUrl.searchParams.append('deep_link_value', code);
    appsflyerUrl.searchParams.append('path', `invite/${code}`);
    appsflyerUrl.searchParams.append('af_channel', 'User_invite');
    appsflyerUrl.searchParams.append('media_source', 'User_invite');

    Object.keys(req.query).forEach(key => {
      appsflyerUrl.searchParams.append(key, req.query[key]);
    });

    console.log(`Redirecting: ${code} -> ${appsflyerUrl.toString()}`);
    res.redirect(302, appsflyerUrl.toString());
  } catch (error) {
    console.error('Redirect error:', error);
    res.status(500).send('Internal Server Error: Invalid redirect configuration');
  }
});

// Health check
app.get('/', (req, res) => {
  res.send('BGYCC Redirect Server is running.');
});

app.listen(PORT, () => {
  console.log(`Redirect server listening on port ${PORT}`);
  console.log(`AppsFlyer Subdomain: ${APPSFLYER_SUBDOMAIN}, Template: ${TEMPLATE_ID}`);
});
