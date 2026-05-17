// ══════════════════════════════
//   MISC PLUGINS
// ══════════════════════════════

const config = require("../config");

// ── MENU ──
const menuPlugin = {
  command: "menu",
  description: "Show all commands",
  execute: async ({ sock, from, plugins }) => {
    const cats = {
      "📱 APP": ["update","platform","restart","setvar","delvar","getvar","getallvars","mode","settings","setsudo","delsudo","getsudo"],
      "🔄 CONVERTERS": ["url","trt","vv","sticker","mp3","take","photo","tts","say","doc","nondoc"],
      "⬇️ DOWNLOADER": ["insta","pinterest","fb","spotify","spotifydl","terabox","gitclone"],
      "👥 GROUP": ["tag","tagall","kick","promote","demote","mute","unmute","glock","gunlock","invite","revoke","gname","gdesc","joinrequests","leave","removegpp","gpp"],
      "🔧 MISC": ["menu","sparky","pair","repo","sc","jid","runtime","ping","wame"],
      "📄 PDF": ["pdf","addimg","addtext","clear"],
      "🛡️ SUDO": ["plugin","remove","plugins","mee","setname","setbio","unblock","block","fullpp"],
      "💬 WHATSAPP": ["online","lastseen","profile","status","readreceipt","groupadd","getprivacy","dlt"],
      "▶️ YOUTUBE": ["yts","ytv","yta","play","song"],
    };

    let menu = `╭━━━〔 *${config.botName}* 〕━━>
┃• Mode: *${config.mode}*
┃• Prefix: *${config.prefix}*
┃• Platform: *Render/Railway*
╰━━━━━━━━━━━━━>\n\n`;

    for (const [cat, cmds] of Object.entries(cats)) {
      menu += `╭━━━>\n┠ ${cat}\n`;
      cmds.forEach((c) => (menu += `┃│• ${config.prefix}${c}\n`));
      menu += `╰━━━━>\n\n`;
    }

    await sock.sendMessage(from, { text: menu });
  },
};

// ── PING ──
const pingPlugin = {
  command: "ping",
  description: "Check bot speed",
  execute: async ({ sock, from }) => {
    const start = Date.now();
    await sock.sendMessage(from, { text: "🏓 Pong!" });
    const diff = Date.now() - start;
    await sock.sendMessage(from, { text: `⚡ Speed: *${diff}ms*` });
  },
};

// ── RUNTIME ──
const runtimePlugin = {
  command: "runtime",
  description: "Bot uptime",
  execute: async ({ sock, from }) => {
    const s = Math.floor(process.uptime());
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    await sock.sendMessage(from, { text: `⏱ *Runtime:* ${h}h ${m}m ${sec}s` });
  },
};

// ── JID ──
const jidPlugin = {
  command: "jid",
  description: "Get JID",
  execute: async ({ sock, from, sender, isGroup }) => {
    await sock.sendMessage(from, {
      text: `📋 *Your JID:* ${sender}\n📋 *Chat JID:* ${from}${isGroup ? "\n👥 This is a group" : ""}`,
    });
  },
};

// ── REPO ──
const repoPlugin = {
  command: "repo",
  description: "Bot source code",
  execute: async ({ sock, from }) => {
    await sock.sendMessage(from, {
      text: `📦 *Bot Repository*\n\nhttps://github.com/wasif-rind1/wasif_rind_wachatbot ⭐ if you like it!_`,
    });
  },
};

// ── WAME ──
const wamePlugin = {
  command: "wame",
  description: "Get WhatsApp link",
  execute: async ({ sock, from, args }) => {
    const number = args[0]?.replace(/[^0-9]/g, "");
    if (!number) return sock.sendMessage(from, { text: "Usage: .wame 923272516116" });
    await sock.sendMessage(from, { text: `🔗 https://wa.me/${number}` });
  },
};

// ── SC (Source Code) ──
const scPlugin = {
  command: "sc",
  description: "Source code",
  execute: async ({ sock, from }) => {
    await sock.sendMessage(from, { text: `💻 *Source Code:*\nhttps://github.com/wasif-rind1/wasif_rind_wachatbot` });
  },
};

// ── SPARKY ──
const sparkyPlugin = {
  command: "sparky",
  description: "Bot info",
  execute: async ({ sock, from }) => {
    await sock.sendMessage(from, {
      text: `⚡ *Sparky – Wasif Rind Bot*\n\n• Version: 1.0.0\n• Plugins: 84+\n• Library: Baileys\n• Platform: Render/Railway\n\nType *.menu* to see all commands!`,
    });
  },
};

// ── PAIR ──
const pairPlugin = {
  command: "pair",
  description: "Pair bot with number",
  execute: async ({ sock, from, args }) => {
    if (!args[0]) return sock.sendMessage(from, { text: "Usage: .pair 923272516116" });
    await sock.sendMessage(from, { text: `✅ Use this number to pair: *${args[0]}*\nScan QR or use pairing code from terminal.` });
  },
};

module.exports = [menuPlugin, pingPlugin, runtimePlugin, jidPlugin, repoPlugin, wamePlugin, scPlugin, sparkyPlugin, pairPlugin];
