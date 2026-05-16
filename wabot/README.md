# 🤖 WASIF RIND – Full WhatsApp Bot

> 84+ plugins | Baileys MD | Render/Railway Ready

---

## ⚡ Quick Deploy

### Option 1: Railway (Recommended)
1. [railway.app](https://railway.app) pe jao
2. **New Project → Deploy from GitHub repo**
3. Apna GitHub repo select karo
4. **Add Variable:** `PORT = 3000`
5. Deploy ho jayega!

### Option 2: Render.com
1. [render.com](https://render.com) pe jao
2. **New → Web Service**
3. GitHub repo connect karo
4. Settings:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free
5. Deploy!

---

## 🛠️ Local Setup (PC pe chalane ke liye)

```bash
git clone https://github.com/your-username/wabot
cd wabot
npm install
node index.js
```

QR code terminal mein aayega — WhatsApp se scan karo.

---

## ⚙️ Config (config.js)

```js
ownerNumber: ["923272516116@s.whatsapp.net"]  // Apna number
prefix: "."                                    // Command prefix
mode: "public"                                 // public ya private
```

**IMPORTANT:** `923272516116` mein apna actual number daalo (country code ke saath, no `+`)

---

## 📦 All Commands

| Category | Commands |
|----------|----------|
| APP | update, platform, restart, setvar, delvar, getvar, getallvars, mode, settings, setsudo, delsudo, getsudo |
| CONVERTERS | url, trt, vv, sticker, mp3, take, photo, tts, say, doc, nondoc |
| DOWNLOADER | insta, pinterest, fb, spotify, spotifydl, terabox, gitclone |
| GROUP | tag, tagall, kick, promote, demote, mute, unmute, glock, gunlock, invite, revoke, gname, gdesc, joinrequests, leave, gpp, removegpp |
| MISC | menu, sparky, pair, repo, sc, jid, runtime, ping, wame |
| PDF | pdf, addimg, addtext, clear |
| SUDO | plugin, remove, plugins, mee, setname, setbio, unblock, block, fullpp |
| WHATSAPP | online, lastseen, profile, status, readreceipt, groupadd, getprivacy, dlt |
| YOUTUBE | yts, ytv, yta, play, song |

---

## 🔧 Dependencies
- `@whiskeysockets/baileys` — WhatsApp connection
- `sharp` — Image/Sticker processing  
- `ytdl-core` — YouTube download
- `yt-search` — YouTube search
- `gtts` — Text to Speech
- `ffmpeg-static` — Audio/Video conversion
- `axios` — HTTP requests
- `chalk` — Terminal colors
- `pino` — Logging

---

## 📁 File Structure
```
wabot/
├── index.js          ← Main bot
├── config.js         ← Settings (edit this!)
├── package.json      ← Dependencies
├── lib/
│   └── init.js       ← Folder setup
├── plugins/
│   ├── misc.js       ← ping, menu, runtime...
│   ├── group.js      ← kick, tagall, promote...
│   ├── converters.js ← sticker, tts, mp3...
│   ├── downloader.js ← ytdl, insta, fb...
│   ├── app.js        ← setvar, sudo, block...
│   └── pdf.js        ← pdf, addimg...
├── auth_info/        ← WhatsApp session (auto)
└── temp/             ← Temp files (auto)
```

---

## ⚠️ Notes
- Bot unofficial hai — personal use ke liye
- Free Render plan 15 min baad sleep karta hai — UptimeRobot se ping karo
- Railway free plan better hai for always-on
- Session files (`auth_info/`) ko **kabhi delete mat karo**

---

Made with ❤️ | WASIF RIND Bot v1.0.0
