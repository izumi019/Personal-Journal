# Personal Journal

Minimal journal scaffold with client and server.

Server:
- /server: Node + Express placeholder

Client:
- /client: Vite + React editor

Run:

Install and run server:

```bash
cd server
npm install
npm start
```

Install and run client:

```bash
cd client
npm install
npm run dev

Google OAuth setup:

1. Create OAuth credentials at https://console.cloud.google.com/apis/credentials
2. Use the redirect URI `http://localhost:4000/auth/callback`
3. Add the client id/secret to `server/.env` (copy from `.env.example`)

Local auth flow:
- Click "Connect Google Drive" which opens a popup
- After authorizing, the popup posts tokens to the app and closes
- Use "Save" to upload your journal to Drive and "Load" to load by file ID

Spotify embeds:
- Click "Add Spotify Embed" to insert a Spotify block
- Use the block's "Edit Embed" button to paste a Spotify track URL/URI/ID; it will be converted to an embed iframe

Templates:
- Use the template dropdown in the editor to apply a built-in template.
- Click "Save as Template" to save the current page layout to localStorage.
```
# Personal-Journal
A personal journal website that you can use to store your own journal entries
