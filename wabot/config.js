// ╔══════════════════════════════════════╗
// ║   WASIF RIND – WABOT CONFIG        ║
// ╚══════════════════════════════════════╝

module.exports = {
  // Bot Info
  botName: "Wasif Rind Bot",
  prefix: ".",
  ownerNumber: ["923272516116@s.whatsapp.net"], // Apna number daalo with country code, no +

  // Mode: "private" (sirf owner) | "public" (sab)
  mode: "public",

  // Session
  sessionId: "wasif-rind-session",

  // Features Toggle
  autoRead: false,       // Messages auto read
  autoTyping: false,     // Auto typing indicator
  antiSpam: true,        // Spam protection
  antiLink: false,       // Anti link in groups
  welcomeMsg: true,      // Welcome new members

  // Sudo Users (extra admins)
  sudo: [],

  // Bot Status Message
  statusMessage: "🤖 Bot Online | .menu for help",

  // Download limits
  maxYTDuration: 600,    // Max YouTube video seconds (10 min)

  // Render/Railway Port
  port: process.env.PORT || 3000,
}
