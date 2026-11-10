let tracks = [
 {id:1,title:"Midnight City",artist:"M83",mood:"Energy",symbol:"✦",colors:["#e46a55","#542b65"],audio:"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",duration:"6:13"},
 {id:2,title:"Weightless",artist:"Marconi Union",mood:"Focus",symbol:"◌",colors:["#4c9caa","#253f66"],audio:"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",duration:"6:12"},
 {id:3,title:"Sunset Lover",artist:"Petit Biscuit",mood:"Chill",symbol:"☼",colors:["#f29c72","#744b78"],audio:"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",duration:"5:32"},
 {id:4,title:"Golden",artist:"Harry Styles",mood:"Feel good",symbol:"☀",colors:["#d2a44c","#754b37"],audio:"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",duration:"5:02"},
 {id:5,title:"A Moment Apart",artist:"ODESZA",mood:"Focus",symbol:"✧",colors:["#5d6cb0","#282d4c"],audio:"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",duration:"3:55"},
 {id:6,title:"Ocean Drive",artist:"Duke Dumont",mood:"Energy",symbol:"≈",colors:["#38a6a0","#24506b"],audio:"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",duration:"5:05"},
 {id:7,title:"Night Owl",artist:"Galimatias",mood:"Chill",symbol:"☾",colors:["#6a5798","#242c4e"],audio:"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",duration:"4:12"},
 {id:8,title:"Good Days",artist:"SZA",mood:"Feel good",symbol:"✿",colors:["#d17b9b","#78465f"],audio:"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",duration:"4:39"}
];
const audio=document.getElementById("audio"), content=document.getElementById("content");
let current=null, queue=[...tracks], queueIndex=0, recent=[], liked=JSON.parse(localStorage.getItem("tuneflow-liked")||"[]"), activeView="home", shuffle=false, repeat=false, playlists=JSON.parse(localStorage.getItem("tuneflow-playlists")||'{"Focus Flow":[2,5],"Late Night":[1,7],"Good Energy":[3,4,6]}');
const $=id=>document.getElementById(id);
function toast(msg){const t=$("toast");t.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),1900)}
function coverStyle(t){return `background:linear-gradient(140deg,${t.colors[0]},${t.colors[1]})`}
function trackCard(t){return `<article class="track-card" data-track="${t.id}"><div class="cover" style="${coverStyle(t)}"><span>${t.symbol}</span></div><strong>${t.title}</strong><small>${t.artist}</small></article>`}
function renderHome(){content.innerHTML=`<section class="hero"><div class="hero-copy"><span class="eyebrow">YOUR PERSONAL SOUNDTRACK</span><h1>Find your<br><em>flow state.</em></h1><p>Good music makes every moment better. Discover a sound for whatever you're feeling.</p><button class="primary-button" id="hero-play">▶ &nbsp; Play something good</button></div><div class="hero-art"><div class="orbit orbit-one"></div><div class="orbit orbit-two"></div><div class="hero-disc"><div class="disc-center">♫</div></div><span class="floating-note note-one">♪</span><span class="floating-note note-two">♫</span></div></section><section class="section-block"><div class="section-heading"><div><span class="eyebrow">MADE FOR YOU</span><h2>Pick your mood</h2></div></div><div class="mood-grid">${["Focus","Energy","Chill","Feel good"].map((m,i)=>`<button class="mood-card ${["mood-purple","mood-orange","mood-blue","mood-pink"][i]}" data-mood="${m}"><span>${["◉","⚡","☾","✿"][i]}</span><b>${m}</b><small>${["Stay in the zone","Turn it up","Take it easy","Good vibes only"][i]}</small></button>`).join("")}</div></section><section class="section-block"><div class="section-heading"><div><span class="eyebrow">ON REPEAT</span><h2>Popular right now</h2></div><button class="text-button" id="show-all">View all ↗</button></div><div class="track-grid">${tracks.slice(0,5).map(trackCard).join("")}</div></section><section class="section-block"><div class="section-heading"><div><span class="eyebrow">YOUR ROTATION</span><h2>Recently played</h2></div></div><div class="track-list">${recent.length?recent.slice(0,5).map(rowHTML).join(""):'<div class="empty-state">Your recently played tracks will show up here.</div>'}</div></section>`;bindContent();renderApiLab()}
function rowHTML(t){return `<div class="track-row" data-track="${t.id}"><div class="row-cover" style="${coverStyle(t)}">${t.symbol}</div><div class="row-title"><strong>${t.title}</strong><small>${t.artist}</small></div><span class="track-duration">${t.duration}</span><button class="row-like" data-like="${t.id}">${liked.includes(t.id)?"♥":"♡"}</button></div>`}
function renderSearch(){content.innerHTML=`<h1 class="view-title">Search</h1><p class="view-subtitle">Find a track, artist, or a mood to match your moment.</p><div class="search-wrap"><input class="search-input" id="search-input" placeholder="What do you want to listen to?" autocomplete="off"></div><div class="section-heading"><h2>Browse all tracks</h2></div><div class="track-grid" id="search-results">${tracks.map(trackCard).join("")}</div>`;bindContent();$("search-input").focus();$("search-input").addEventListener("input",e=>{const q=e.target.value.toLowerCase();$("search-results").innerHTML=tracks.filter(t=>(t.title+" "+t.artist+" "+t.mood).toLowerCase().includes(q)).map(trackCard).join("")||'<div class="empty-state">No tracks found. Try another search.</div>';bindTrackClicks()})}
function renderLibrary(){content.innerHTML=`<h1 class="view-title">Your library</h1><p class="view-subtitle">Everything you love, all in one place.</p><div class="library-tabs"><button class="active" data-tab="all">All tracks</button><button data-tab="liked">Liked songs (${liked.length})</button><button data-tab="playlists">Playlists</button></div><div id="library-results" class="track-grid">${tracks.map(trackCard).join("")}</div>`;bindContent();document.querySelectorAll("[data-tab]").forEach(b=>b.onclick=()=>{document.querySelectorAll("[data-tab]").forEach(x=>x.classList.remove("active"));b.classList.add("active");const tab=b.dataset.tab;const list=tab==="liked"?tracks.filter(t=>liked.includes(t.id)):tab==="playlists"?[]:tracks;$("library-results").innerHTML=tab==="playlists"?Object.keys(playlists).map(p=>`<button class="mood-card mood-purple" data-playlist="${p}"><span>♫</span><b>${p}</b><small>${playlists[p].length} tracks</small></button>`).join(""):list.map(trackCard).join("")||'<div class="empty-state">No liked songs yet. Tap ♡ beside a track to save it.</div>';bindTrackClicks();document.querySelectorAll("#library-results [data-playlist]").forEach(x=>x.onclick=()=>renderPlaylist(x.dataset.playlist))})}
function renderPlaylist(name){const list=(playlists[name]||[]).map(id=>tracks.find(t=>t.id===id)).filter(Boolean);content.innerHTML=`<h1 class="view-title">${name}</h1><p class="view-subtitle">${list.length} tracks in this playlist</p><div class="track-list">${list.map(rowHTML).join("")||'<div class="empty-state">This playlist is empty.</div>'}</div>`;bindContent()}
function bindTrackClicks(){document.querySelectorAll("[data-track]").forEach(el=>el.onclick=e=>{if(e.target.closest("[data-like]"))return;playTrack(Number(el.dataset.track))})}
function bindContent(){bindTrackClicks();document.querySelectorAll("[data-mood]").forEach(b=>b.onclick=()=>{const list=tracks.filter(t=>t.mood===b.dataset.mood);if(list.length){queue=list;queueIndex=0;playTrack(list[0].id);toast(`${b.dataset.mood} mix started`)}});document.querySelectorAll("[data-like]").forEach(b=>b.onclick=e=>{e.stopPropagation();toggleLike(Number(b.dataset.like))});const hp=$("hero-play");if(hp)hp.onclick=()=>playTrack(tracks[Math.floor(Math.random()*tracks.length)].id);const all=$("show-all");if(all)all.onclick=()=>navigate("search")}
function navigate(view){activeView=view;
// ---------------- TuneFlow API integrations ----------------
async function apiGet(path, params={}) {
  const url = new URL(path, window.location.origin);
  Object.entries(params).forEach(([k,v]) => {
    if (v !== undefined && v !== null && String(v).trim() !== "") url.searchParams.set(k, v);
  });
  const response = await fetch(url);
  const payload = await response.json().catch(()=>({}));
  if (!response.ok) throw new Error(payload.error || `Request failed (${response.status})`);
  return payload;
}
function renderApiLab() {
  if (document.getElementById("api-lab")) return;
  const section = document.createElement("section");
  section.className = "section-block api-lab";
  section.id = "api-lab";
  section.innerHTML = `
    <div class="section-heading"><div><span class="eyebrow">CONNECTED SERVICES</span><h2>Music API Lab</h2></div><span class="api-status" id="api-status">Checking services…</span></div>
    <div class="api-panel">
      <div class="api-search-row">
        <input id="api-query" class="search-input" placeholder="Search Jamendo, Spotify or YouTube…" />
        <button class="primary-button" id="api-search-btn">Search music</button>
      </div>
      <div class="api-provider-row">
        <button class="api-chip active" data-provider="jamendo">Jamendo · playable tracks</button>
        <button class="api-chip" data-provider="spotify">Spotify · metadata</button>
        <button class="api-chip" data-provider="youtube">YouTube · search</button>
        <button class="api-chip" data-provider="itunes">Apple · artwork</button>
      </div>
      <div id="api-results" class="api-results"><p class="api-help">Search a provider to load live results. Jamendo results can be played when the provider supplies an audio preview.</p></div>
    </div>
    <div class="api-tools-grid">
      <div class="api-tool-card"><h3>Lyrics · LRCLIB</h3><p>Find plain or time-synced lyrics for the currently playing track.</p><button class="api-secondary" id="lyrics-btn">Find current song lyrics</button><div id="lyrics-output" class="api-output"></div></div>
      <div class="api-tool-card"><h3>YouTube video utilities</h3><p>Enter a YouTube video ID to look up community dislike estimates and SponsorBlock segments.</p><input class="api-mini-input" id="video-id-input" placeholder="YouTube video ID" /><div class="api-button-row"><button class="api-secondary" id="dislike-btn">Get dislikes</button><button class="api-secondary" id="sponsor-btn">Get segments</button></div><div id="video-output" class="api-output"></div></div>
    </div>
    <p class="api-footnote">Some providers require credentials in the backend .env file. Search metadata does not automatically grant audio-streaming rights.</p>`;
  content.appendChild(section);

  let provider = "jamendo";
  section.querySelectorAll("[data-provider]").forEach(btn => btn.onclick=()=>{
    provider=btn.dataset.provider;
    section.querySelectorAll("[data-provider]").forEach(x=>x.classList.toggle("active",x===btn));
  });
  $("api-search-btn").onclick=()=>runProviderSearch(provider);
  $("api-query").addEventListener("keydown",e=>{if(e.key==="Enter")runProviderSearch(provider)});
  $("lyrics-btn").onclick=loadCurrentLyrics;
  $("dislike-btn").onclick=loadDislikes;
  $("sponsor-btn").onclick=loadSponsorSegments;
  apiGet("/api/status").then(status=>{
    const labels=Object.entries(status).map(([k,v])=>`${k}: ${v?"ready":"needs setup"}`);
    $("api-status").textContent=labels.join(" · ");
  }).catch(()=>$("api-status").textContent="Start the backend to connect services");
}
function safeText(value){return String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
async function runProviderSearch(provider){
  const q=$("api-query").value.trim();
  if(!q){toast("Enter a search term");return}
  const out=$("api-results");out.innerHTML='<p class="api-help">Searching…</p>';
  try{
    const data=await apiGet(`/api/${provider}/search`,{q});
    const items=data.results||[];
    if(!items.length){out.innerHTML='<p class="api-help">No results found. Check your API credentials and try again.</p>';return}
    out.innerHTML=items.map((item,i)=>`
      <article class="api-result">
        <div class="api-result-art" style="background-image:url('${safeText(item.image||"")}')">${item.image?"":"♫"}</div>
        <div class="api-result-info"><strong>${safeText(item.title)}</strong><small>${safeText(item.artist||item.subtitle||"")}</small><small>${safeText(item.source||provider)}</small></div>
        ${item.audio?`<button class="api-play" data-api-play="${i}">▶</button>`:""}
      </article>`).join("");
    out.querySelectorAll("[data-api-play]").forEach(btn=>btn.onclick=()=>{
      const item=items[Number(btn.dataset.apiPlay)];
      const track={id:`api-${item.id||Date.now()}`,title:item.title,artist:item.artist||"Unknown artist",audio:item.audio,mood:"Chill",symbol:"♫",colors:["#668b58","#253b4c"],duration:item.duration||"—",image:item.image};
      tracks=[track,...tracks.filter(t=>t.id!==track.id)];queue=[track,...queue.filter(t=>t.id!==track.id)];queueIndex=0;playTrack(track.id);
    });
  }catch(error){out.innerHTML=`<p class="api-error">${safeText(error.message)}. Check README.md and .env setup.</p>`}
}
async function loadCurrentLyrics(){
  const out=$("lyrics-output");if(!current){out.textContent="Play a track first.";return}
  out.textContent="Looking up lyrics…";
  try{
    const data=await apiGet("/api/lyrics",{track_name:current.title,artist_name:current.artist});
    const lyric=data.syncedLyrics||data.plainLyrics;
    out.textContent=lyric||"No lyrics were found for this track.";
  }catch(e){out.textContent=e.message}
}
async function loadDislikes(){
  const id=$("video-id-input").value.trim(),out=$("video-output");
  if(!id){out.textContent="Enter a YouTube video ID first.";return}
  out.textContent="Loading dislike estimate…";
  try{const d=await apiGet("/api/dislikes",{videoId:id});out.textContent=`Estimated dislikes: ${Number(d.dislikes||0).toLocaleString()} · Likes: ${Number(d.likes||0).toLocaleString()}`}
  catch(e){out.textContent=e.message}
}
async function loadSponsorSegments(){
  const id=$("video-id-input").value.trim(),out=$("video-output");
  if(!id){out.textContent="Enter a YouTube video ID first.";return}
  out.textContent="Loading SponsorBlock segments…";
  try{const d=await apiGet("/api/sponsorblock",{videoID:id});out.textContent=d.length?d.map(s=>`${s.category}: ${s.segment[0].toFixed(1)}s–${s.segment[1].toFixed(1)}s`).join("\n"):"No segments returned."}
  catch(e){out.textContent=e.message}
}

document.querySelectorAll(".main-nav [data-view]").forEach(b=>b.classList.toggle("active",b.dataset.view===view));view==="home"?renderHome():view==="search"?renderSearch():renderLibrary()}
function playTrack(id){const t=tracks.find(x=>x.id===id);if(!t)return;current=t;queueIndex=Math.max(0,queue.findIndex(x=>x.id===id));audio.src=t.audio;audio.play().catch(()=>toast("Audio preview needs an internet connection"));$("now-title").textContent=t.title;$("now-artist").textContent=t.artist;$("mini-art").textContent=t.symbol;$("mini-art").style=coverStyle(t);$("play-btn").textContent="Ⅱ";$("like-current").textContent=liked.includes(id)?"♥":"♡";recent=[t,...recent.filter(x=>x.id!==id)];if(activeView==="home")renderHome()}
function togglePlay(){if(!current){playTrack(tracks[0].id);return}if(audio.paused){audio.play();$("play-btn").textContent="Ⅱ"}else{audio.pause();$("play-btn").textContent="▶"}}
function next(){if(!queue.length)return;queueIndex=shuffle?Math.floor(Math.random()*queue.length):(queueIndex+1)%queue.length;playTrack(queue[queueIndex].id)}
function prev(){if(audio.currentTime>3){audio.currentTime=0;return}queueIndex=(queueIndex-1+queue.length)%queue.length;playTrack(queue[queueIndex].id)}
function toggleLike(id){liked=liked.includes(id)?liked.filter(x=>x!==id):[...liked,id];localStorage.setItem("tuneflow-liked",JSON.stringify(liked));if(current&&current.id===id)$("like-current").textContent=liked.includes(id)?"♥":"♡";if(activeView==="library")renderLibrary();else if(activeView==="home")renderHome();toast(liked.includes(id)?"Added to liked songs":"Removed from liked songs")}
$("play-btn").onclick=togglePlay;$("next-btn").onclick=next;$("prev-btn").onclick=prev;$("like-current").onclick=()=>current&&toggleLike(current.id);$("shuffle-btn").onclick=()=>{shuffle=!shuffle;$("shuffle-btn").style.color=shuffle?"#b7f36b":"";toast(shuffle?"Shuffle on":"Shuffle off")};$("repeat-btn").onclick=()=>{repeat=!repeat;$("repeat-btn").style.color=repeat?"#b7f36b":"";toast(repeat?"Repeat on":"Repeat off")};$("queue-btn").onclick=()=>toast("Queue: "+queue.map(t=>t.title).join(", "));$("volume").oninput=e=>audio.volume=e.target.value;audio.volume=.75;audio.ontimeupdate=()=>{if(audio.duration){$("seek-bar").value=audio.currentTime/audio.duration*100;$("current-time").textContent=fmt(audio.currentTime);$("duration").textContent=fmt(audio.duration)}};audio.onended=()=>repeat?(audio.currentTime=0,audio.play()):next();$("seek-bar").oninput=e=>{if(audio.duration)audio.currentTime=e.target.value/100*audio.duration};function fmt(s){if(!isFinite(s))return"0:00";return Math.floor(s/60)+":"+String(Math.floor(s%60)).padStart(2,"0")}
document.querySelectorAll(".main-nav [data-view]").forEach(b=>b.onclick=()=>navigate(b.dataset.view));$("theme-toggle").onclick=()=>{document.body.classList.toggle("light");localStorage.setItem("tuneflow-light",document.body.classList.contains("light"))};if(localStorage.getItem("tuneflow-light")==="true")document.body.classList.add("light");$("explore-btn").onclick=()=>navigate("search");$("add-playlist").onclick=()=>{const name=prompt("Name your new playlist:");if(name&&name.trim()){playlists[name.trim()]=[];localStorage.setItem("tuneflow-playlists",JSON.stringify(playlists));$("playlist-nav").innerHTML=Object.keys(playlists).map(p=>`<button class="nav-link" data-playlist="${p}">◷ <span>${p}</span></button>`).join("");bindPlaylistNav();toast("Playlist created")}};function bindPlaylistNav(){document.querySelectorAll("#playlist-nav [data-playlist]").forEach(b=>b.onclick=()=>renderPlaylist(b.dataset.playlist))}bindPlaylistNav();$("back-btn").onclick=()=>navigate("home");$("forward-btn").onclick=()=>navigate("library");renderHome();
