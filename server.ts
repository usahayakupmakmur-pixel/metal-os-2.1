import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { google } from 'googleapis';
import cookieParser from 'cookie-parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cookieParser());

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.APP_URL}/auth/google/callback`
  );

  const SCOPES = [
    'openid',
    'email',
    'profile',
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/contacts',
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/spreadsheets.readonly',
    'https://www.googleapis.com/auth/documents.readonly'
  ];

  // API Routes
  app.get('/api/auth/google/url', (req, res) => {
    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
      prompt: 'consent'
    });
    res.json({ url });
  });

  app.get('/auth/google/callback', async (req, res) => {
    const { code } = req.query;
    try {
      const { tokens } = await oauth2Client.getToken(code as string);
      
      // Store tokens in a secure, httpOnly cookie
      // In a real app, you'd store the refresh token in a database
      res.cookie('google_tokens', JSON.stringify(tokens), {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 3600000 // 1 hour
      });

      res.send(`
        <html>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS' }, '*');
                window.close();
              } else {
                window.location.href = '/';
              }
            </script>
            <p>Authentication successful. This window should close automatically.</p>
          </body>
        </html>
      `);
    } catch (error) {
      console.error('Error getting tokens:', error);
      res.status(500).send('Authentication failed');
    }
  });

  app.get('/api/google/profile', async (req, res) => {
    const tokensCookie = req.cookies.google_tokens;
    if (!tokensCookie) return res.status(401).json({ error: 'Not authenticated' });

    try {
      const tokens = JSON.parse(tokensCookie);
      oauth2Client.setCredentials(tokens);
      const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
      const { data } = await oauth2.userinfo.get();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch profile' });
    }
  });

  // Example: Fetch Gmail messages
  app.get('/api/google/gmail', async (req, res) => {
    const tokensCookie = req.cookies.google_tokens;
    if (!tokensCookie) return res.status(401).json({ error: 'Not authenticated' });

    try {
      const tokens = JSON.parse(tokensCookie);
      oauth2Client.setCredentials(tokens);
      const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
      const { data } = await gmail.users.messages.list({ userId: 'me', maxResults: 10 });
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch gmail' });
    }
  });

  // Fetch Calendar Events
  app.get('/api/google/calendar', async (req, res) => {
    const tokensCookie = req.cookies.google_tokens;
    if (!tokensCookie) return res.status(401).json({ error: 'Not authenticated' });

    try {
      const tokens = JSON.parse(tokensCookie);
      oauth2Client.setCredentials(tokens);
      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
      const { data } = await calendar.events.list({
        calendarId: 'primary',
        timeMin: (new Date()).toISOString(),
        maxResults: 10,
        singleEvents: true,
        orderBy: 'startTime',
      });
      res.json(data.items);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch calendar' });
    }
  });

  // Fetch Drive Files
  app.get('/api/google/drive', async (req, res) => {
    const tokensCookie = req.cookies.google_tokens;
    if (!tokensCookie) return res.status(401).json({ error: 'Not authenticated' });

    try {
      const tokens = JSON.parse(tokensCookie);
      oauth2Client.setCredentials(tokens);
      const drive = google.drive({ version: 'v3', auth: oauth2Client });
      const { data } = await drive.files.list({
        pageSize: 20,
        fields: 'nextPageToken, files(id, name, mimeType, webViewLink, iconLink, modifiedTime, size)',
      });
      res.json(data.files);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch drive' });
    }
  });

  // Fetch Contacts
  app.get('/api/google/contacts', async (req, res) => {
    const tokensCookie = req.cookies.google_tokens;
    if (!tokensCookie) return res.status(401).json({ error: 'Not authenticated' });

    try {
      const tokens = JSON.parse(tokensCookie);
      oauth2Client.setCredentials(tokens);
      const people = google.people({ version: 'v1', auth: oauth2Client });
      const { data } = await people.people.connections.list({
        resourceName: 'people/me',
        pageSize: 20,
        personFields: 'names,emailAddresses,photos',
      });
      res.json(data.connections);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch contacts' });
    }
  });

  // Save Report to Drive
  app.post('/api/google/drive/save-report', async (req, res) => {
    const tokensCookie = req.cookies.google_tokens;
    if (!tokensCookie) return res.status(401).json({ error: 'Not authenticated' });

    try {
      const tokens = JSON.parse(tokensCookie);
      oauth2Client.setCredentials(tokens);
      const drive = google.drive({ version: 'v3', auth: oauth2Client });
      
      const { report } = req.body;
      const fileMetadata = {
        name: `Report-${report.title}-${Date.now()}.txt`,
        mimeType: 'text/plain',
      };
      const media = {
        mimeType: 'text/plain',
        body: `
Title: ${report.title}
Type: ${report.type}
Status: ${report.status}
Author: ${report.author}
Date: ${report.date}
Location: ${report.location}
Coordinates: ${report.coordinates ? `${report.coordinates.lat}, ${report.coordinates.lng}` : 'N/A'}

Description:
${report.description}

Votes: ${report.votes}
Comments: ${report.comments}
        `.trim(),
      };

      const file = await drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id, webViewLink',
      });

      res.json(file.data);
    } catch (error) {
      console.error('Error saving to drive:', error);
      res.status(500).json({ error: 'Failed to save to drive' });
    }
  });

  // Save Contact to People API
  app.post('/api/google/contacts/save', async (req, res) => {
    const tokensCookie = req.cookies.google_tokens;
    if (!tokensCookie) return res.status(401).json({ error: 'Not authenticated' });

    try {
      const tokens = JSON.parse(tokensCookie);
      oauth2Client.setCredentials(tokens);
      const people = google.people({ version: 'v1', auth: oauth2Client });
      
      const { contact } = req.body;
      
      const response: any = await people.people.createContact({
        requestBody: {
          names: [{ givenName: contact.name }],
          organizations: [{ name: 'Warga Yosomulyo', title: contact.role }],
          biographies: [{ value: `RW: ${contact.rw}` }],
          // Mocking phone since it's not in the type but usually needed
          phoneNumbers: [{ value: '08123456789', type: 'mobile' }]
        }
      });

      res.json(response.data);
    } catch (error) {
      console.error('Error saving contact:', error);
      res.status(500).json({ error: 'Failed to save contact' });
    }
  });

  // Save Report to Calendar
  app.post('/api/google/calendar/save-report', async (req, res) => {
    const tokensCookie = req.cookies.google_tokens;
    if (!tokensCookie) return res.status(401).json({ error: 'Not authenticated' });

    try {
      const tokens = JSON.parse(tokensCookie);
      oauth2Client.setCredentials(tokens);
      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
      
      const { report } = req.body;
      
      const event = {
        summary: `[MetalOS Report] ${report.title}`,
        location: report.location,
        description: report.description,
        start: {
          dateTime: new Date().toISOString(), // Default to now if no specific date
          timeZone: 'Asia/Jakarta',
        },
        end: {
          dateTime: new Date(Date.now() + 3600000).toISOString(), // 1 hour later
          timeZone: 'Asia/Jakarta',
        },
      };

      const response = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: event,
      });

      res.json(response.data);
    } catch (error) {
      console.error('Error saving to calendar:', error);
      res.status(500).json({ error: 'Failed to save to calendar' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('/*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
