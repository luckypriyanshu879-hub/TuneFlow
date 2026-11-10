# TuneFlow PBL — API-integrated edition

Independent music discovery/player demo. It is inspired by the general feature ideas of SimpMusic, but does not copy its source code, branding, private endpoints, or stream extraction.

## Included integrations

| Service | Implemented feature | Credentials |
|---|---|---|
| Jamendo | Search tracks and play provider preview URLs where supplied | `JAMENDO_CLIENT_ID` |
| Spotify Web API | Search track/artist/album metadata | Client ID + secret |
| YouTube Data API v3 | Search music videos and get video IDs/thumbnails | API key |
| LRCLIB | Look up plain and synced lyrics | No key for basic public endpoint |
| SponsorBlock | Retrieve community segment metadata for a YouTube video ID | No key |
| Return YouTube Dislike | Retrieve community like/dislike estimates | No key |
| Apple/iTunes Search | Search music metadata and artwork | No key |

The app shows which services are configured in the API Lab on the Home screen.

## Run the project

Requires Node.js 18 or newer.

1. Extract the project ZIP.
2. Open the folder in VS Code / terminal.
3. Install packages:

   ```bash
   npm install
   ```

4. Copy `.env.example` to `.env`.
5. Add your credentials (instructions below).
6. Start the backend:

   ```bash
   npm start
   ```

7. Open `http://localhost:3000`.

Do not open `index.html` directly for API mode; use the Node server so `/api/...` routes work.

## Get credentials

- **Jamendo:** Register an app at https://devportal.jamendo.com/ and copy its client ID.
- **Spotify:** Create an app at https://developer.spotify.com/dashboard/ and copy the Client ID and Client Secret. This implementation uses Client Credentials for catalogue metadata. It does not unlock full track playback or Spotify Canvas.
- **YouTube:** Create a project at https://console.cloud.google.com/, enable YouTube Data API v3, and create an API key. Restrict the key to the YouTube Data API and your app where possible.

Paste the values into `.env`, not into `app.js`.

## Important limitations

- SimpMusic documents a hidden YouTube Music API and stream URL extraction. This project intentionally does not implement private API calls, account-cookie reuse, DRM bypass, or extraction of protected stream URLs.
- YouTube Data API provides search/metadata, not a legal full-song stream URL. Use YouTube's official player/embed flow or an authorized audio provider for playback.
- Spotify Web API search returns catalogue metadata, not full audio. Spotify Canvas is not included as an official general-purpose Web API feature.
- SponsorBlock returns segment data. It does not itself play videos or skip segments; skipping requires a compatible player and must follow the provider's terms.
- Return YouTube Dislike values are community estimates, not official YouTube dislike counts.
- LRCLIB availability and lyrics rights vary by track. Respect its service rules and applicable copyright.
- Apple/iTunes results provide artwork/metadata; artwork usage remains subject to Apple's terms.
- Tidal BPM/key, Shazam recognition, SimpMusic Lyrics private/service endpoints, YouTube transcript extraction, AI translation, Last.fm, and Discord integrations are not wired into this starter because they require separate access, SDKs, authentication, or a provider-specific implementation. Do not treat unofficial endpoints as supported public APIs.

## Suggested PBL modules

1. Responsive music discovery UI
2. Provider search and metadata aggregation
3. Authorized preview playback
4. Lyrics lookup
5. Video community utilities
6. Playlist / liked-song storage
7. Backend API proxy and environment-based secrets

## Reference

SimpMusic documentation: https://www.simpmusic.org/docs/guide/introduction
Official repository: https://github.com/maxrave-dev/SimpMusic
