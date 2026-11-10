import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(cors());
app.use(express.static(__dirname));

async function getJson(url, options={}) {
  const response = await fetch(url, options);
  const body = await response.json().catch(()=>({}));
  if (!response.ok) throw new Error(body.error?.message || body.error || `Provider returned ${response.status}`);
  return body;
}
const enc = encodeURIComponent;

app.get("/api/status", (_req,res)=>res.json({
  jamendo:!!process.env.JAMENDO_CLIENT_ID,
  spotify:!!(process.env.SPOTIFY_CLIENT_ID && process.env.SPOTIFY_CLIENT_SECRET),
  youtube:!!process.env.YOUTUBE_API_KEY,
  lrclib:true,
  sponsorblock:true,
  returnYouTubeDislike:true,
  itunesArtwork:true
}));

// Jamendo: catalogue search with licensed preview stream URLs, subject to Jamendo terms.
app.get("/api/jamendo/search", async (req,res)=>{
  try {
    if(!process.env.JAMENDO_CLIENT_ID) return res.status(503).json({error:"Set JAMENDO_CLIENT_ID in .env"});
    const q=String(req.query.q||"").slice(0,120);
    const data=await getJson(`https://api.jamendo.com/v3.0/tracks/?client_id=${enc(process.env.JAMENDO_CLIENT_ID)}&format=json&limit=20&search=${enc(q)}&audioformat=mp32`);
    res.json({results:(data.results||[]).map(t=>({id:t.id,title:t.name,artist:t.artist_name,audio:t.audio,image:t.image,duration:t.duration,source:"Jamendo"}))});
  } catch(e){res.status(502).json({error:e.message})}
});

// Spotify Web API: metadata search only; does not provide full-song playback.
let spotifyToken=null, spotifyTokenExpires=0;
async function getSpotifyToken(){
  if(spotifyToken && Date.now()<spotifyTokenExpires) return spotifyToken;
  const basic=Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString("base64");
  const r=await fetch("https://accounts.spotify.com/api/token",{method:"POST",headers:{"Authorization":`Basic ${basic}`,"Content-Type":"application/x-www-form-urlencoded"},body:"grant_type=client_credentials"});
  const d=await r.json();if(!r.ok)throw new Error(d.error_description||"Spotify authentication failed");
  spotifyToken=d.access_token;spotifyTokenExpires=Date.now()+(d.expires_in-60)*1000;return spotifyToken;
}
app.get("/api/spotify/search",async(req,res)=>{
  try{
    if(!process.env.SPOTIFY_CLIENT_ID||!process.env.SPOTIFY_CLIENT_SECRET)return res.status(503).json({error:"Set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in .env"});
    const token=await getSpotifyToken();
    const d=await getJson(`https://api.spotify.com/v1/search?q=${enc(String(req.query.q||"").slice(0,120))}&type=track&limit=20`,{headers:{Authorization:`Bearer ${token}`}});
    res.json({results:(d.tracks?.items||[]).map(t=>({id:t.id,title:t.name,artist:t.artists.map(a=>a.name).join(", "),image:t.album.images?.[0]?.url||"",source:"Spotify"}))});
  }catch(e){res.status(502).json({error:e.message})}
});

// Official YouTube Data API: video search and metadata; no audio extraction/playback.
app.get("/api/youtube/search",async(req,res)=>{
  try{
    if(!process.env.YOUTUBE_API_KEY)return res.status(503).json({error:"Set YOUTUBE_API_KEY in .env"});
    const d=await getJson(`https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoCategoryId=10&maxResults=20&q=${enc(String(req.query.q||"").slice(0,120))}&key=${enc(process.env.YOUTUBE_API_KEY)}`);
    res.json({results:(d.items||[]).map(v=>({id:v.id.videoId,title:v.snippet.title,artist:v.snippet.channelTitle,image:v.snippet.thumbnails?.medium?.url||"",source:"YouTube",videoId:v.id.videoId}))});
  }catch(e){res.status(502).json({error:e.message})}
});

// iTunes Search API: artwork and catalogue metadata.
app.get("/api/itunes/search",async(req,res)=>{
  try{
    const d=await getJson(`https://itunes.apple.com/search?media=music&entity=song&limit=20&term=${enc(String(req.query.q||"").slice(0,120))}`);
    res.json({results:(d.results||[]).map(t=>({id:t.trackId,title:t.trackName,artist:t.artistName,image:t.artworkUrl100?.replace("100x100","600x600")||"",source:"Apple Music / iTunes"}))});
  }catch(e){res.status(502).json({error:e.message})}
});

// LRCLIB: lyrics lookup.
app.get("/api/lyrics",async(req,res)=>{
  try{
    const p=new URLSearchParams();
    for(const k of ["track_name","artist_name","album_name","duration"]) if(req.query[k])p.set(k,String(req.query[k]));
    const d=await getJson(`https://lrclib.net/api/get?${p.toString()}`,{headers:{"User-Agent":"TuneFlow-PBL/1.0 (student demo)"}});
    res.json(d);
  }catch(e){res.status(404).json({error:"Lyrics not found or LRCLIB unavailable"})}
});

// SponsorBlock: segment metadata only. Actual skipping requires a permitted video player integration.
app.get("/api/sponsorblock",async(req,res)=>{
  try{
    const id=String(req.query.videoID||"").trim();
    if(!/^[a-zA-Z0-9_-]{11}$/.test(id))return res.status(400).json({error:"Provide a valid 11-character YouTube video ID"});
    const categories=encodeURIComponent(JSON.stringify(["sponsor","selfpromo","interaction","intro","outro","preview","music_offtopic"]));
    const d=await getJson(`https://sponsor.ajay.app/api/skipSegments?videoID=${enc(id)}&categories=${categories}`);
    res.json(d);
  }catch(e){res.status(502).json({error:e.message})}
});

// Return YouTube Dislike: community estimates for a YouTube video ID.
app.get("/api/dislikes",async(req,res)=>{
  try{
    const id=String(req.query.videoId||"").trim();
    if(!/^[a-zA-Z0-9_-]{11}$/.test(id))return res.status(400).json({error:"Provide a valid 11-character YouTube video ID"});
    const d=await getJson(`https://returnyoutubedislikeapi.com/votes?videoId=${enc(id)}`);
    res.json(d);
  }catch(e){res.status(502).json({error:e.message})}
});

app.get("*",(req,res)=>res.sendFile(path.join(__dirname,"index.html")));
app.listen(PORT,()=>console.log(`TuneFlow running at http://localhost:${PORT}`));
