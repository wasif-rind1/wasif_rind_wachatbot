// ══════════════════════════════
//   APP + SUDO + WHATSAPP PLUGINS
// ══════════════════════════════

const config = require("../config");
const fs = require("fs-extra");

// ════════════════
//   APP COMMANDS
// ════════════════

// ── SETVAR ──
const setvarPlugin = {
  command: "setvar",
  description: "Set a variable",
  ownerOnly: true,
  execute: async ({ sock, from, args, vars }) => {
    if (args.length < 2) return sock.sendMessage(from, { text: "Usage: .setvar KEY value" });
    const key = args[0];
    const val = args.slice(1).join(" ");
    vars[key] = val;
    await sock.sendMessage(from, { text: `✅ Set *${key}* = ${val}` });
  },
};

// ── GETVAR ──
const getvarPlugin = {
  command: "getvar",
  description: "Get a variable",
  ownerOnly: true,
  execute: async ({ sock, from, args, vars }) => {
    const key = args[0];
    if (!key) return sock.sendMessage(from, { text: "Usage: .getvar KEY" });
    const val = vars[key];
    await sock.sendMessage(from, { text: val !== undefined ? `📦 *${key}* = ${val}` : `❌ Variable *${key}* not found.` });
  },
};

// ── DELVAR ──
const delvarPlugin = {
  command: "delvar",
  description: "Delete a variable",
  ownerOnly: true,
  execute: async ({ sock, from, args, vars }) => {
    const key = args[0];
    if (!key) return sock.sendMessage(from, { text: "Usage: .delvar KEY" });
    delete vars[key];
    await sock.sendMessage(from, { text: `🗑️ Deleted variable *${key}*` });
  },
};

// ── GETALLVARS ──
const getallvarsPlugin = {
  command: "getallvars",
  description: "Show all variables",
  ownerOnly: true,
  execute: async ({ sock, from, vars }) => {
    const keys = Object.keys(vars);
    if (!keys.length) return sock.sendMessage(from, { text: "No variables set." });
    const msg = keys.map((k) => `• *${k}* = ${vars[k]}`).join("\n");
    await sock.sendMessage(from, { text: `📦 *All Variables:*\n\n${msg}` });
  },
};

// ── MODE ──
const modePlugin = {
  command: "mode",
  description: "Switch public/private mode",
  ownerOnly: true,
  execute: async ({ sock, from, args }) => {
    const m = args[0]?.toLowerCase();
    if (!["public", "private"].includes(m)) return sock.sendMessage(from, { text: "Usage: .mode public OR .mode private" });
    config.mode = m;
    await sock.sendMessage(from, { text: `✅ Mode set to *${m}*` });
  },
};

// ── SETTINGS ──
const settingsPlugin = {
  command: "settings",
  description: "Show bot settings",
  ownerOnly: true,
  execute: async ({ sock, from }) => {
    await sock.sendMessage(from, {
      text: `⚙️ *Bot Settings:*\n\n• Name: ${config.botName}\n• Mode: ${config.mode}\n• Prefix: ${config.prefix}\n• AutoRead: ${config.autoRead}\n• AutoTyping: ${config.autoTyping}\n• AntiSpam: ${config.antiSpam}\n• AntiLink: ${config.antiLink}\n• WelcomeMsg: ${config.welcomeMsg}`,
    });
  },
};

// ── UPDATE ──
const updatePlugin = {
  command: "update",
  description: "Check for updates",
  ownerOnly: true,
  execute: async ({ sock, from }) => {
    await sock.sendMessage(from, { text: "🔄 Bot is up to date! Version: 1.0.0\n\nCheck: https://github.com/your-username/kamran-hasil-wabot" });
  },
};

// ── PLATFORM ──
const platformPlugin = {
  command: "platform",
  description: "Show platform info",
  execute: async ({ sock, from }) => {
    await sock.sendMessage(from, {
      text: `💻 *Platform Info:*\n\n• OS: ${process.platform}\n• Node: ${process.version}\n• RAM: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB used\n• Uptime: ${Math.floor(process.uptime())}s`,
    });
  },
};

// ── RESTART ──
const restartPlugin = {
  command: "restart",
  description: "Restart the bot",
  ownerOnly: true,
  execute: async ({ sock, from }) => {
    await sock.sendMessage(from, { text: "♻️ Restarting bot..." });
    setTimeout(() => process.exit(0), 1000);
  },
};

// ════════════════
//   SUDO COMMANDS
// ════════════════

// ── SETSUDO ──
const setsudoPlugin = {
  command: "setsudo",
  description: "Add sudo user",
  ownerOnly: true,
  execute: async ({ sock, from, msg, args, sudoList }) => {
    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    const target = mentioned[0] || (args[0] ? args[0] + "@s.whatsapp.net" : null);
    if (!target) return sock.sendMessage(from, { text: "Mention a user or provide number" });
    if (!sudoList.includes(target)) sudoList.push(target);
    await sock.sendMessage(from, { text: `✅ Added sudo: @${target.split("@")[0]}`, mentions: [target] });
  },
};

// ── DELSUDO ──
const delsudoPlugin = {
  command: "delsudo",
  description: "Remove sudo user",
  ownerOnly: true,
  execute: async ({ sock, from, msg, args, sudoList }) => {
    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    const target = mentioned[0] || (args[0] ? args[0] + "@s.whatsapp.net" : null);
    if (!target) return sock.sendMessage(from, { text: "Mention a user or provide number" });
    const idx = sudoList.indexOf(target);
    if (idx > -1) sudoList.splice(idx, 1);
    await sock.sendMessage(from, { text: `✅ Removed sudo: @${target.split("@")[0]}`, mentions: [target] });
  },
};

// ── GETSUDO ──
const getsudoPlugin = {
  command: "getsudo",
  description: "List sudo users",
  ownerOnly: true,
  execute: async ({ sock, from, sudoList }) => {
    if (!sudoList.length) return sock.sendMessage(from, { text: "No sudo users set." });
    const list = sudoList.map((s) => `• @${s.split("@")[0]}`).join("\n");
    await sock.sendMessage(from, { text: `🛡️ *Sudo Users:*\n\n${list}`, mentions: sudoList });
  },
};

// ── SETNAME ──
const setnamePlugin = {
  command: "setname",
  description: "Change bot WhatsApp name",
  ownerOnly: true,
  execute: async ({ sock, from, text }) => {
    if (!text) return sock.sendMessage(from, { text: "Usage: .setname New Bot Name" });
    await sock.updateProfileName(text);
    await sock.sendMessage(from, { text: `✅ Name changed to: *${text}*` });
  },
};

// ── SETBIO ──
const setbioPlugin = {
  command: "setbio",
  description: "Change bot WhatsApp bio",
  ownerOnly: true,
  execute: async ({ sock, from, text }) => {
    if (!text) return sock.sendMessage(from, { text: "Usage: .setbio New bio here" });
    await sock.updateProfileStatus(text);
    await sock.sendMessage(from, { text: `✅ Bio changed to: *${text}*` });
  },
};

// ── BLOCK ──
const blockPlugin = {
  command: "block",
  description: "Block a user",
  ownerOnly: true,
  execute: async ({ sock, from, msg, args }) => {
    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    const target = mentioned[0] || (args[0] ? args[0] + "@s.whatsapp.net" : null);
    if (!target) return sock.sendMessage(from, { text: "Mention a user to block" });
    await sock.updateBlockStatus(target, "block");
    await sock.sendMessage(from, { text: `🚫 Blocked: @${target.split("@")[0]}`, mentions: [target] });
  },
};

// ── UNBLOCK ──
const unblockPlugin = {
  command: "unblock",
  description: "Unblock a user",
  ownerOnly: true,
  execute: async ({ sock, from, msg, args }) => {
    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    const target = mentioned[0] || (args[0] ? args[0] + "@s.whatsapp.net" : null);
    if (!target) return sock.sendMessage(from, { text: "Mention a user to unblock" });
    await sock.updateBlockStatus(target, "unblock");
    await sock.sendMessage(from, { text: `✅ Unblocked: @${target.split("@")[0]}`, mentions: [target] });
  },
};

// ── MEE ──
const meePlugin = {
  command: "mee",
  description: "Bot info / self mention",
  execute: async ({ sock, from }) => {
    const id = sock.user.id;
    await sock.sendMessage(from, { text: `🤖 *Bot JID:* ${id}\n• @${id.split("@")[0]}`, mentions: [id] });
  },
};

// ── PLUGINS (list) ──
const pluginsPlugin = {
  command: "plugins",
  description: "List all plugins",
  execute: async ({ sock, from, plugins }) => {
    const list = Object.keys(plugins).sort().map((p) => `• .${p}`).join("\n");
    await sock.sendMessage(from, { text: `📦 *All Commands (${Object.keys(plugins).length}):*\n\n${list}` });
  },
};

// ── FULLPP ──
const fullppPlugin = {
  command: "fullpp",
  description: "Set full profile picture",
  ownerOnly: true,
  execute: async ({ sock, from, msg, downloadMediaMessage }) => {
    const type = Object.keys(msg.message || {})[0];
    if (type !== "imageMessage") return sock.sendMessage(from, { text: "Image bhejo caption *.fullpp* ke saath" });
    const buffer = await downloadMediaMessage(msg, "buffer", {});
    await sock.updateProfilePicture(sock.user.id, buffer);
    await sock.sendMessage(from, { text: "✅ Profile picture updated!" });
  },
};

// ════════════════════
//   WHATSAPP COMMANDS
// ════════════════════

// ── ONLINE ──
const onlinePlugin = {
  command: "online",
  description: "Set bot as online",
  ownerOnly: true,
  execute: async ({ sock, from }) => {
    await sock.sendPresenceUpdate("available");
    await sock.sendMessage(from, { text: "✅ Bot set to online!" });
  },
};

// ── LASTSEEN ──
const lastseenPlugin = {
  command: "lastseen",
  description: "Toggle last seen",
  ownerOnly: true,
  execute: async ({ sock, from, args }) => {
    const val = args[0] === "off" ? "none" : "all";
    await sock.updateLastSeenPrivacy(val);
    await sock.sendMessage(from, { text: `✅ Last seen set to: *${val}*` });
  },
};

// ── PROFILE ──
const profilePlugin = {
  command: "profile",
  description: "Get profile picture",
  execute: async ({ sock, from, msg, args, sender }) => {
    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    const target = mentioned[0] || sender;
    try {
      const pp = await sock.profilePictureUrl(target, "image");
      await sock.sendMessage(from, { image: { url: pp }, caption: `📸 Profile: @${target.split("@")[0]}`, mentions: [target] });
    } catch {
      await sock.sendMessage(from, { text: "❌ Profile picture not found or private." });
    }
  },
};

// ── STATUS ──
const statusPlugin = {
  command: "status",
  description: "Set bot status",
  ownerOnly: true,
  execute: async ({ sock, from, text }) => {
    if (!text) return sock.sendMessage(from, { text: "Usage: .status New status here" });
    await sock.updateProfileStatus(text);
    await sock.sendMessage(from, { text: `✅ Status updated: *${text}*` });
  },
};

// ── READRECEIPT ──
const readreceiptPlugin = {
  command: "readreceipt",
  description: "Toggle read receipts",
  ownerOnly: true,
  execute: async ({ sock, from, args }) => {
    const val = args[0] !== "off";
    config.autoRead = val;
    await sock.sendMessage(from, { text: `✅ Read receipts: *${val ? "ON" : "OFF"}*` });
  },
};

// ── GROUPADD ──
const groupaddPlugin = {
  command: "groupadd",
  description: "Add user to group",
  ownerOnly: true,
  execute: async ({ sock, from, args }) => {
    const [groupId, number] = args;
    if (!groupId || !number) return sock.sendMessage(from, { text: "Usage: .groupadd [groupJID] [number]" });
    await sock.groupParticipantsUpdate(`${groupId}@g.us`, [`${number}@s.whatsapp.net`], "add");
    await sock.sendMessage(from, { text: `✅ Added ${number} to group!` });
  },
};

// ── GETPRIVACY ──
const getprivacyPlugin = {
  command: "getprivacy",
  description: "Get privacy settings",
  execute: async ({ sock, from }) => {
    try {
      const p = await sock.fetchPrivacySettings(true);
      await sock.sendMessage(from, {
        text: `🔐 *Privacy Settings:*\n\n• Last Seen: ${p.last}\n• Online: ${p.online}\n• Profile Photo: ${p.profile}\n• Status: ${p.status}\n• Read Receipts: ${p.readreceipts}\n• Groups: ${p.groupadd}`,
      });
    } catch {
      await sock.sendMessage(from, { text: "❌ Could not fetch privacy settings." });
    }
  },
};

// ── DLT (delete message) ──
const dltPlugin = {
  command: "dlt",
  description: "Delete a message",
  execute: async ({ sock, from, msg }) => {
    const quoted = msg.message?.extendedTextMessage?.contextInfo;
    if (!quoted?.stanzaId) return sock.sendMessage(from, { text: "Reply to a message to delete it" });
    await sock.sendMessage(from, {
      delete: {
        remoteJid: from,
        fromMe: quoted.participant === sock.user.id,
        id: quoted.stanzaId,
        participant: quoted.participant,
      },
    });
  },
};

module.exports = [
  // App
  setvarPlugin, getvarPlugin, delvarPlugin, getallvarsPlugin, modePlugin, settingsPlugin, updatePlugin, platformPlugin, restartPlugin,
  // Sudo
  setsudoPlugin, delsudoPlugin, getsudoPlugin, setnamePlugin, setbioPlugin, blockPlugin, unblockPlugin, meePlugin, pluginsPlugin, fullppPlugin,
  // WhatsApp
  onlinePlugin, lastseenPlugin, profilePlugin, statusPlugin, readreceiptPlugin, groupaddPlugin, getprivacyPlugin, dltPlugin,
];
