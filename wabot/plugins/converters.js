// ══════════════════════════════
//   CONVERTER PLUGINS
// ══════════════════════════════

const sharp = require("sharp");
const gtts = require("gtts");
const fs = require("fs-extra");
const path = require("path");
const { exec } = require("child_process");
const { promisify } = require("util");
const execAsync = promisify(exec);

// ── STICKER ──
const stickerPlugin = {
  command: "sticker",
  description: "Image/Video to sticker",
  execute: async ({ sock, from, msg, downloadMediaMessage }) => {
    const type = Object.keys(msg.message || {})[0];
    if (!["imageMessage", "videoMessage"].includes(type)) {
      return sock.sendMessage(from, { text: "📸 Image ya video bhejo caption *.sticker* ke saath" });
    }
    try {
      const buffer = await downloadMediaMessage(msg, "buffer", {});
      const webp = await sharp(buffer).webp({ quality: 80 }).toBuffer();
      await sock.sendMessage(from, {
        sticker: webp,
        mimetype: "image/webp",
      });
    } catch (e) {
      await sock.sendMessage(from, { text: "❌ Sticker banane mein error: " + e.message });
    }
  },
};

// ── TTS (Text to Speech) ──
const ttsPlugin = {
  command: ["tts", "say"],
  description: "Text to Speech",
  execute: async ({ sock, from, text }) => {
    if (!text) return sock.sendMessage(from, { text: "Usage: .tts Hello world" });
    const file = path.join("temp", `tts_${Date.now()}.mp3`);
    const speech = new gtts(text, "ur"); // Urdu default
    await new Promise((res, rej) => speech.save(file, (err) => (err ? rej(err) : res())));
    await sock.sendMessage(from, {
      audio: fs.readFileSync(file),
      mimetype: "audio/mp4",
      ptt: true,
    });
    fs.remove(file);
  },
};

// ── URL (shorten) ──
const urlPlugin = {
  command: "url",
  description: "Shorten URL",
  execute: async ({ sock, from, args }) => {
    const url = args[0];
    if (!url) return sock.sendMessage(from, { text: "Usage: .url https://example.com" });
    try {
      const fetch = require("node-fetch");
      const res = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`);
      const short = await res.text();
      await sock.sendMessage(from, { text: `🔗 Shortened: ${short}` });
    } catch {
      await sock.sendMessage(from, { text: "❌ URL shorten karne mein error." });
    }
  },
};

// ── MP3 (video to audio) ──
const mp3Plugin = {
  command: "mp3",
  description: "Extract audio from video",
  execute: async ({ sock, from, msg, downloadMediaMessage }) => {
    const type = Object.keys(msg.message || {})[0];
    if (type !== "videoMessage") return sock.sendMessage(from, { text: "🎥 Video bhejo caption *.mp3* ke saath" });
    try {
      const buffer = await downloadMediaMessage(msg, "buffer", {});
      const inFile = path.join("temp", `vid_${Date.now()}.mp4`);
      const outFile = path.join("temp", `aud_${Date.now()}.mp3`);
      fs.writeFileSync(inFile, buffer);
      await execAsync(`ffmpeg -i ${inFile} -vn -ar 44100 -ac 2 -b:a 192k ${outFile}`);
      await sock.sendMessage(from, {
        audio: fs.readFileSync(outFile),
        mimetype: "audio/mp4",
      });
      fs.remove(inFile); fs.remove(outFile);
    } catch {
      await sock.sendMessage(from, { text: "❌ Audio extract karne mein error. ffmpeg check karo." });
    }
  },
};

// ── VV (view once unlock) ──
const vvPlugin = {
  command: "vv",
  description: "Unlock view once message",
  execute: async ({ sock, from, msg, downloadMediaMessage }) => {
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    if (!quoted) return sock.sendMessage(from, { text: "Reply karo view-once message pe" });
    const type = Object.keys(quoted)[0];
    if (!["imageMessage", "videoMessage", "audioMessage"].includes(type)) {
      return sock.sendMessage(from, { text: "❌ Yeh view-once nahi hai." });
    }
    try {
      const buffer = await downloadMediaMessage({ message: quoted, key: msg.message.extendedTextMessage.contextInfo }, "buffer", {});
      if (type === "imageMessage") await sock.sendMessage(from, { image: buffer, caption: "✅ View Once Unlocked" });
      else if (type === "videoMessage") await sock.sendMessage(from, { video: buffer, caption: "✅ View Once Unlocked" });
      else await sock.sendMessage(from, { audio: buffer, mimetype: "audio/mp4" });
    } catch {
      await sock.sendMessage(from, { text: "❌ Unlock nahi ho saka." });
    }
  },
};

// ── PHOTO (sticker to image) ──
const photoPlugin = {
  command: "photo",
  description: "Sticker to image",
  execute: async ({ sock, from, msg, downloadMediaMessage }) => {
    const type = Object.keys(msg.message || {})[0];
    if (type !== "stickerMessage") return sock.sendMessage(from, { text: "Sticker bhejo caption *.photo* ke saath" });
    const buffer = await downloadMediaMessage(msg, "buffer", {});
    const png = await sharp(buffer).png().toBuffer();
    await sock.sendMessage(from, { image: png, caption: "🖼️ Converted!" });
  },
};

// ── TRT (translate) ──
const trtPlugin = {
  command: "trt",
  description: "Translate text",
  execute: async ({ sock, from, args, text }) => {
    const lang = args[0] || "en";
    const words = args.slice(1).join(" ") || text;
    if (!words) return sock.sendMessage(from, { text: "Usage: .trt en Mujhe neend aa rahi hai" });
    try {
      const fetch = require("node-fetch");
      const res = await fetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${lang}&dt=t&q=${encodeURIComponent(words)}`
      );
      const data = await res.json();
      const translated = data[0].map((x) => x[0]).join("");
      await sock.sendMessage(from, { text: `🌐 *Translation (${lang}):*\n${translated}` });
    } catch {
      await sock.sendMessage(from, { text: "❌ Translation error." });
    }
  },
};

// ── DOC (send as document) ──
const docPlugin = {
  command: "doc",
  description: "Send media as document",
  execute: async ({ sock, from, msg, downloadMediaMessage }) => {
    const type = Object.keys(msg.message || {})[0];
    if (!["imageMessage", "videoMessage"].includes(type)) {
      return sock.sendMessage(from, { text: "Image ya video bhejo caption *.doc* ke saath" });
    }
    const buffer = await downloadMediaMessage(msg, "buffer", {});
    await sock.sendMessage(from, {
      document: buffer,
      mimetype: type === "imageMessage" ? "image/jpeg" : "video/mp4",
      fileName: `file_${Date.now()}.${type === "imageMessage" ? "jpg" : "mp4"}`,
    });
  },
};

// ── NONDOC (send document as media) ──
const nondocPlugin = {
  command: "nondoc",
  description: "Send document as image/video",
  execute: async ({ sock, from, msg, downloadMediaMessage }) => {
    const type = Object.keys(msg.message || {})[0];
    if (type !== "documentMessage") return sock.sendMessage(from, { text: "Document bhejo caption *.nondoc* ke saath" });
    const buffer = await downloadMediaMessage(msg, "buffer", {});
    const mime = msg.message.documentMessage.mimetype || "";
    if (mime.startsWith("image")) await sock.sendMessage(from, { image: buffer });
    else if (mime.startsWith("video")) await sock.sendMessage(from, { video: buffer });
    else await sock.sendMessage(from, { text: "❌ Image ya video document hi send karo." });
  },
};

// ── TAKE (image caption change) ──
const takePlugin = {
  command: "take",
  description: "Reshare with new caption",
  execute: async ({ sock, from, msg, text, downloadMediaMessage }) => {
    const type = Object.keys(msg.message || {})[0];
    if (!["imageMessage", "videoMessage", "stickerMessage"].includes(type)) {
      return sock.sendMessage(from, { text: "Media bhejo caption *.take [new caption]* ke saath" });
    }
    const buffer = await downloadMediaMessage(msg, "buffer", {});
    if (type === "imageMessage") await sock.sendMessage(from, { image: buffer, caption: text || "" });
    else if (type === "videoMessage") await sock.sendMessage(from, { video: buffer, caption: text || "" });
    else await sock.sendMessage(from, { sticker: buffer });
  },
};

module.exports = [stickerPlugin, ttsPlugin, urlPlugin, mp3Plugin, vvPlugin, photoPlugin, trtPlugin, docPlugin, nondocPlugin, takePlugin];
