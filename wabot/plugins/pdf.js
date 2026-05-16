// ══════════════════════════════
//   PDF PLUGINS
// ══════════════════════════════

const fs = require("fs-extra");
const path = require("path");
const { exec } = require("child_process");
const { promisify } = require("util");
const execAsync = promisify(exec);

// PDF state per user
const pdfState = {};

// ── PDF (image to pdf) ──
const pdfPlugin = {
  command: "pdf",
  description: "Convert image to PDF",
  execute: async ({ sock, from, msg, downloadMediaMessage, sender }) => {
    const type = Object.keys(msg.message || {})[0];
    if (type !== "imageMessage") return sock.sendMessage(from, { text: "📸 Image bhejo caption *.pdf* ke saath" });
    try {
      const buffer = await downloadMediaMessage(msg, "buffer", {});
      const imgFile = path.join("temp", `img_${Date.now()}.jpg`);
      const pdfFile = path.join("temp", `pdf_${Date.now()}.pdf`);
      fs.writeFileSync(imgFile, buffer);

      // Use ImageMagick or fallback
      await execAsync(`convert ${imgFile} ${pdfFile}`).catch(async () => {
        // Fallback: just send the image
        await sock.sendMessage(from, { text: "❌ PDF conversion requires ImageMagick on server. Install: apt install imagemagick" });
        fs.remove(imgFile);
        return;
      });

      if (fs.existsSync(pdfFile)) {
        await sock.sendMessage(from, {
          document: fs.readFileSync(pdfFile),
          mimetype: "application/pdf",
          fileName: `converted_${Date.now()}.pdf`,
        });
        fs.remove(imgFile); fs.remove(pdfFile);
      }
    } catch (e) {
      await sock.sendMessage(from, { text: "❌ PDF convert error: " + e.message });
    }
  },
};

// ── ADDIMG (add to pdf queue) ──
const addimgPlugin = {
  command: "addimg",
  description: "Add image to PDF queue",
  execute: async ({ sock, from, msg, downloadMediaMessage, sender }) => {
    const type = Object.keys(msg.message || {})[0];
    if (type !== "imageMessage") return sock.sendMessage(from, { text: "Image bhejo caption *.addimg* ke saath" });
    const buffer = await downloadMediaMessage(msg, "buffer", {});
    if (!pdfState[sender]) pdfState[sender] = [];
    pdfState[sender].push(buffer);
    await sock.sendMessage(from, { text: `✅ Image ${pdfState[sender].length} added to PDF queue!\nType *.addtext [text]* or *.clear* to reset.` });
  },
};

// ── ADDTEXT ──
const addtextPlugin = {
  command: "addtext",
  description: "Generate PDF from queued images",
  execute: async ({ sock, from, sender, text }) => {
    const imgs = pdfState[sender];
    if (!imgs || !imgs.length) return sock.sendMessage(from, { text: "Pehle *.addimg* se images queue karo" });
    await sock.sendMessage(from, { text: `📄 Processing ${imgs.length} image(s)...` });

    try {
      const files = [];
      for (let i = 0; i < imgs.length; i++) {
        const f = path.join("temp", `qi_${Date.now()}_${i}.jpg`);
        fs.writeFileSync(f, imgs[i]);
        files.push(f);
      }
      const outPdf = path.join("temp", `multi_${Date.now()}.pdf`);
      await execAsync(`convert ${files.join(" ")} ${outPdf}`);

      await sock.sendMessage(from, {
        document: fs.readFileSync(outPdf),
        mimetype: "application/pdf",
        fileName: `document_${Date.now()}.pdf`,
        caption: text || "Your PDF is ready!",
      });

      files.forEach((f) => fs.remove(f));
      fs.remove(outPdf);
      delete pdfState[sender];
    } catch {
      await sock.sendMessage(from, { text: "❌ PDF generate error. ImageMagick needed: apt install imagemagick" });
    }
  },
};

// ── CLEAR (pdf queue) ──
const clearPlugin = {
  command: "clear",
  description: "Clear PDF queue",
  execute: async ({ sock, from, sender }) => {
    delete pdfState[sender];
    await sock.sendMessage(from, { text: "🗑️ PDF queue cleared!" });
  },
};

// ── PLUGIN (install plugin) ──
const pluginInstallPlugin = {
  command: "plugin",
  description: "Show plugin info",
  ownerOnly: true,
  execute: async ({ sock, from, args }) => {
    const name = args[0];
    if (!name) return sock.sendMessage(from, { text: "Usage: .plugin [plugin-name]\n\nPlugins are in /plugins folder." });
    await sock.sendMessage(from, { text: `📦 Plugin: *${name}*\n\nPlugins ko /plugins folder mein .js file ke saath add karo.` });
  },
};

// ── REMOVE (plugin) ──
const removePlugin = {
  command: "remove",
  description: "Remove a plugin",
  ownerOnly: true,
  execute: async ({ sock, from, args }) => {
    const name = args[0];
    if (!name) return sock.sendMessage(from, { text: "Usage: .remove [plugin-file-name]" });
    const filePath = path.join("plugins", `${name}.js`);
    if (fs.existsSync(filePath)) {
      fs.remove(filePath);
      await sock.sendMessage(from, { text: `✅ Removed plugin: *${name}*\nRestart bot to apply.` });
    } else {
      await sock.sendMessage(from, { text: `❌ Plugin *${name}* not found.` });
    }
  },
};

module.exports = [pdfPlugin, addimgPlugin, addtextPlugin, clearPlugin, pluginInstallPlugin, removePlugin];
