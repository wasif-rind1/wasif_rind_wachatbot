// ╔══════════════════════════════════════════════╗
// ║   WASIF RIND – FULL WHATSAPP BOT           ║
// ║   Platform: Render/Railway (Free Cloud)      ║
// ╚══════════════════════════════════════════════╝

require("./lib/init");

const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeInMemoryStore,
  downloadMediaMessage,
  getContentType,
} = require("@whiskeysockets/baileys");

const pino = require("pino");
const fs = require("fs-extra");
const path = require("path");
const chalk = require("chalk");
const http = require("http");
const config = require("./config");

// Render/Railway alive ping
const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end("Kamran Hasil Bot is alive!");
});
server.listen(config.port, () =>
  console.log(chalk.green(`[SERVER] Port ${config.port}`))
);

const store = makeInMemoryStore({
  logger: pino().child({ level: "silent", stream: "store" }),
});

// Load plugins (array or single export)
const pluginFiles = fs.readdirSync("./plugins").filter((f) => f.endsWith(".js"));
const plugins = {};
for (const file of pluginFiles) {
  const plug = require(`./plugins/${file}`);
  const list = Array.isArray(plug) ? plug : [plug];
  for (const p of list) {
    if (!p.command) continue;
    const cmds = Array.isArray(p.command) ? p.command : [p.command];
    cmds.forEach((c) => (plugins[c] = p));
  }
}
console.log(chalk.cyan(`[PLUGINS] Loaded: ${Object.keys(plugins).length} commands`));

const vars = {};
const sudoList = [...(config.sudo || [])];

function getMsg(msg) {
  const m = msg.message;
  if (!m) return "";
  return (
    m?.conversation ||
    m?.extendedTextMessage?.text ||
    m?.imageMessage?.caption ||
    m?.videoMessage?.caption ||
    m?.buttonsResponseMessage?.selectedButtonId ||
    m?.listResponseMessage?.singleSelectReply?.selectedRowId ||
    ""
  );
}

function isOwner(jid) {
  return config.ownerNumber.some(
    (o) => o.replace(/[^0-9]/g, "") === jid.replace(/[^0-9]/g, "")
  );
}
function isSudo(jid) {
  return isOwner(jid) || sudoList.includes(jid);
}

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("auth_info");
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: true,
    logger: pino({ level: "silent" }),
    browser: ["Kamran Hasil Bot", "Chrome", "20.0.0"],
    getMessage: async (key) => {
      const msg = store.messages[key.remoteJid]?.get(key.id);
      return msg?.message || undefined;
    },
  });

  store.bind(sock.ev);
  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", ({ connection, lastDisconnect }) => {
    if (connection === "close") {
      const code = lastDisconnect?.error?.output?.statusCode;
      const reconnect = code !== DisconnectReason.loggedOut;
      console.log(chalk.red(`[CONN] Closed (${code}). Reconnect: ${reconnect}`));
      if (reconnect) setTimeout(startBot, 4000);
    } else if (connection === "open") {
      console.log(chalk.green("[CONN] Bot Online!"));
    }
  });

  sock.ev.on("group-participants.update", async ({ id, participants, action }) => {
    if (!config.welcomeMsg) return;
    if (action === "add") {
      await sock.sendMessage(id, {
        text: `Welcome @${participants[0].split("@")[0]}!\nType ${config.prefix}menu for commands.`,
        mentions: participants,
      });
    }
  });

  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    if (type !== "notify") return;
    for (const msg of messages) {
      try {
        if (!msg.message || msg.key.fromMe) continue;
        const from = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;
        const isGroup = from.endsWith("@g.us");
        const pushName = msg.pushName || "User";
        const body = getMsg(msg);
        const prefix = config.prefix;
        const isCmd = body.startsWith(prefix);
        const cmdName = isCmd ? body.slice(prefix.length).trim().split(/\s+/)[0].toLowerCase() : "";
        const args = body.trim().split(/\s+/).slice(1);
        const text = args.join(" ");

        if (config.autoRead) await sock.readMessages([msg.key]);
        if (!isCmd) continue;

        if (config.mode === "private" && !isOwner(sender)) {
          await sock.sendMessage(from, { text: "Bot is in Private Mode." });
          continue;
        }

        const plugin = plugins[cmdName];
        if (!plugin) continue;

        if (plugin.ownerOnly && !isOwner(sender)) { await sock.sendMessage(from, { text: "Owner only!" }); continue; }
        if (plugin.sudoOnly && !isSudo(sender)) { await sock.sendMessage(from, { text: "Sudo only!" }); continue; }
        if (plugin.groupOnly && !isGroup) { await sock.sendMessage(from, { text: "Group only!" }); continue; }

        let isAdmin = false, isBotAdmin = false;
        if (isGroup) {
          const meta = await sock.groupMetadata(from);
          const admins = meta.participants.filter((p) => p.admin).map((p) => p.id);
          isAdmin = admins.includes(sender);
          isBotAdmin = admins.includes(sock.user?.id);
        }

        if (plugin.adminOnly && !isAdmin) { await sock.sendMessage(from, { text: "Admin only!" }); continue; }

        await plugin.execute({
          sock, msg, from, sender, args, text, body, isGroup, isAdmin, isBotAdmin,
          isOwner: isOwner(sender), isSudo: isSudo(sender),
          pushName, vars, sudoList, config, plugins, store, downloadMediaMessage,
        });
      } catch (err) {
        console.error(chalk.red("[ERR]"), err.message);
      }
    }
  });
}

startBot();
