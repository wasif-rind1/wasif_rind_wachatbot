// ══════════════════════════════
//   YOUTUBE + DOWNLOADER PLUGINS
// ══════════════════════════════

const ytdl = require("ytdl-core");
const yts = require("yt-search");
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const config = require("../config");

// ── YTS (search) ──
const ytsPlugin = {
  command: "yts",
  description: "Search YouTube",
  execute: async ({ sock, from, text }) => {
    if (!text) return sock.sendMessage(from, { text: "Usage: .yts song name" });
    const r = await yts(text);
    const v = r.videos.slice(0, 5);
    if (!v.length) return sock.sendMessage(from, { text: "❌ No results found." });
    let msg = `🔎 *YouTube Results for:* ${text}\n\n`;
    v.forEach((x, i) => {
      msg += `*${i + 1}.* ${x.title}\n⏱ ${x.duration.timestamp} | 👁 ${x.views}\n🔗 ${x.url}\n\n`;
    });
    await sock.sendMessage(from, { text: msg });
  },
};

// ── YTA (audio download) ──
const ytaPlugin = {
  command: ["yta", "song", "play"],
  description: "Download YouTube audio",
  execute: async ({ sock, from, text }) => {
    if (!text) return sock.sendMessage(from, { text: "Usage: .yta song name OR youtube link" });
    await sock.sendMessage(from, { text: "⏳ Downloading audio..." });
    try {
      let url = text;
      if (!text.startsWith("http")) {
        const r = await yts(text);
        if (!r.videos.length) return sock.sendMessage(from, { text: "❌ Not found." });
        url = r.videos[0].url;
        await sock.sendMessage(from, { text: `🎵 Found: *${r.videos[0].title}*` });
      }

      const info = await ytdl.getInfo(url);
      const dur = parseInt(info.videoDetails.lengthSeconds);
      if (dur > config.maxYTDuration) {
        return sock.sendMessage(from, { text: `❌ Video too long (max ${config.maxYTDuration / 60} mins)` });
      }

      const file = path.join("temp", `yt_${Date.now()}.mp3`);
      await new Promise((res, rej) => {
        ytdl(url, { filter: "audioonly", quality: "highestaudio" })
          .pipe(fs.createWriteStream(file))
          .on("finish", res)
          .on("error", rej);
      });

      await sock.sendMessage(from, {
        audio: fs.readFileSync(file),
        mimetype: "audio/mp4",
        fileName: `${info.videoDetails.title}.mp3`,
      });
      fs.remove(file);
    } catch (e) {
      await sock.sendMessage(from, { text: "❌ Download failed: " + e.message });
    }
  },
};

// ── YTV (video download) ──
const ytvPlugin = {
  command: "ytv",
  description: "Download YouTube video",
  execute: async ({ sock, from, text }) => {
    if (!text) return sock.sendMessage(from, { text: "Usage: .ytv youtube link" });
    await sock.sendMessage(from, { text: "⏳ Downloading video..." });
    try {
      let url = text;
      if (!text.startsWith("http")) {
        const r = await yts(text);
        if (!r.videos.length) return sock.sendMessage(from, { text: "❌ Not found." });
        url = r.videos[0].url;
      }

      const info = await ytdl.getInfo(url);
      const dur = parseInt(info.videoDetails.lengthSeconds);
      if (dur > config.maxYTDuration) {
        return sock.sendMessage(from, { text: `❌ Video too long (max ${config.maxYTDuration / 60} mins)` });
      }

      const file = path.join("temp", `ytv_${Date.now()}.mp4`);
      await new Promise((res, rej) => {
        ytdl(url, { filter: "videoandaudio", quality: "highest" })
          .pipe(fs.createWriteStream(file))
          .on("finish", res)
          .on("error", rej);
      });

      await sock.sendMessage(from, {
        video: fs.readFileSync(file),
        caption: `🎬 ${info.videoDetails.title}`,
      });
      fs.remove(file);
    } catch (e) {
      await sock.sendMessage(from, { text: "❌ Download failed: " + e.message });
    }
  },
};

// ── INSTA ──
const instaPlugin = {
  command: "insta",
  description: "Download Instagram media",
  execute: async ({ sock, from, args }) => {
    const url = args[0];
    if (!url || !url.includes("instagram")) return sock.sendMessage(from, { text: "Usage: .insta [instagram URL]" });
    await sock.sendMessage(from, { text: "⏳ Trying to download..." });
    try {
      // Using a public Instagram downloader API
      const api = `https://api.instagram.com/oembed/?url=${encodeURIComponent(url)}`;
      const res = await axios.get(api);
      await sock.sendMessage(from, {
        text: `📸 *${res.data.title || "Instagram Post"}*\nAuthor: ${res.data.author_name || "Unknown"}\n\n_Note: Direct media download requires Instagram login. Use this link:_\n${url}`,
      });
    } catch {
      await sock.sendMessage(from, { text: `📲 Instagram downloader:\nhttps://snapinsta.app\n\nPaste this link: ${url}` });
    }
  },
};

// ── FACEBOOK ──
const fbPlugin = {
  command: "fb",
  description: "Download Facebook video",
  execute: async ({ sock, from, args }) => {
    const url = args[0];
    if (!url) return sock.sendMessage(from, { text: "Usage: .fb [facebook video URL]" });
    await sock.sendMessage(from, { text: `📥 Facebook downloader:\nhttps://fdown.net\n\nPaste this link: ${url}` });
  },
};

// ── SPOTIFY ──
const spotifyPlugin = {
  command: "spotify",
  description: "Search Spotify song info",
  execute: async ({ sock, from, text }) => {
    if (!text) return sock.sendMessage(from, { text: "Usage: .spotify song name" });
    // Search on YouTube as Spotify alternative
    const r = await yts(text + " spotify");
    if (!r.videos.length) return sock.sendMessage(from, { text: "❌ Not found." });
    const v = r.videos[0];
    await sock.sendMessage(from, { text: `🎵 *${v.title}*\n⏱ ${v.duration.timestamp}\n🔗 ${v.url}\n\nType: *.yta ${v.url}* to download!` });
  },
};

// ── SPOTIFYDL ──
const spotifydlPlugin = {
  command: "spotifydl",
  description: "Download Spotify song (via YT)",
  execute: async ({ sock, from, args }) => {
    const url = args[0];
    if (!url) return sock.sendMessage(from, { text: "Usage: .spotifydl [spotify song name]" });
    await sock.sendMessage(from, { text: `🎵 Spotify song download ke liye:\nhttps://spotifydownloader.com\n\nYa use karo: *.yta ${url}*` });
  },
};

// ── PINTEREST ──
const pinterestPlugin = {
  command: "pinterest",
  description: "Search Pinterest images",
  execute: async ({ sock, from, text }) => {
    if (!text) return sock.sendMessage(from, { text: "Usage: .pinterest [search term]" });
    await sock.sendMessage(from, { text: `📌 Pinterest search:\nhttps://pinterest.com/search/pins/?q=${encodeURIComponent(text)}` });
  },
};

// ── TERABOX ──
const teraboxPlugin = {
  command: "terabox",
  description: "Get Terabox download link",
  execute: async ({ sock, from, args }) => {
    const url = args[0];
    if (!url) return sock.sendMessage(from, { text: "Usage: .terabox [terabox link]" });
    await sock.sendMessage(from, { text: `📦 Terabox link:\n${url}\n\nOpen in browser or use Terabox app.` });
  },
};

// ── GITCLONE ──
const gitclonePlugin = {
  command: "gitclone",
  description: "Download GitHub repo as zip",
  execute: async ({ sock, from, args }) => {
    const repo = args[0];
    if (!repo || !repo.includes("github.com")) return sock.sendMessage(from, { text: "Usage: .gitclone https://github.com/user/repo" });
    const zipUrl = repo.replace("github.com", "codeload.github.com").replace(/\/$/, "") + "/zip/refs/heads/main";
    await sock.sendMessage(from, { text: `📦 Download ZIP:\n${zipUrl}\n\n_Ya yeh command use karo terminal mein:_\ngit clone ${repo}` });
  },
};

module.exports = [ytsPlugin, ytaPlugin, ytvPlugin, instaPlugin, fbPlugin, spotifyPlugin, spotifydlPlugin, pinterestPlugin, teraboxPlugin, gitclonePlugin];
