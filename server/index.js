require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');
const multer = require('multer');
const upload = multer();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.json({ ok: true }));

// Google OAuth + Drive integration
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

app.get('/auth/url', (req, res) => {
  const scopes = [
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email'
  ];
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes
  });
  res.json({ url });
});

app.get('/auth/callback', async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).send('Missing code');
  try {
    const { tokens } = await oauth2Client.getToken(code);
    // Return a small page that posts tokens to the opener and closes
    const safe = JSON.stringify(tokens).replace(/</g, '\\u003c');
    res.send(`<!doctype html><html><body><script>window.opener.postMessage(${safe}, '*');window.close();</script></body></html>`);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/save', upload.none(), async (req, res) => {
  // Expect { content, filename, tokens }
  const { content, filename, tokens } = req.body;
  if (!content || !filename || !tokens) return res.status(400).json({ error: 'Missing fields' });
  try {
    const client = new google.auth.OAuth2();
    client.setCredentials(tokens);
    const drive = google.drive({ version: 'v3', auth: client });

    // Create or update a file named filename
    // For simplicity, we upload a new file each time
    const resDrive = await drive.files.create({
      requestBody: { name: filename, mimeType: 'application/json' },
      media: { mimeType: 'application/json', body: content }
    });
    res.json({ ok: true, fileId: resDrive.data.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/load', express.json(), async (req, res) => {
  // Expect { fileId, tokens }
  const { fileId, tokens } = req.body;
  if (!fileId || !tokens) return res.status(400).json({ error: 'Missing fields' });
  try {
    const client = new google.auth.OAuth2();
    client.setCredentials(tokens);
    const drive = google.drive({ version: 'v3', auth: client });
    const resp = await drive.files.get({ fileId, alt: 'media' }, { responseType: 'stream' });
    let data = '';
    resp.data.on('data', chunk => (data += chunk));
    resp.data.on('end', () => res.json({ ok: true, content: data }));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Server listening on ${port}`));
