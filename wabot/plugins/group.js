// ══════════════════════════════
//   GROUP PLUGINS
// ══════════════════════════════

// ── TAG ──
const tagPlugin = {
  command: "tag",
  description: "Tag a user",
  groupOnly: true,
  execute: async ({ sock, from, msg, text }) => {
    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    if (!mentioned.length) return sock.sendMessage(from, { text: "Reply to someone or mention them" });
    await sock.sendMessage(from, { text: text || "📢 Tagged!", mentions: mentioned });
  },
};

// ── TAGALL ──
const tagallPlugin = {
  command: "tagall",
  description: "Tag all members",
  groupOnly: true,
  adminOnly: true,
  execute: async ({ sock, from, text }) => {
    const meta = await sock.groupMetadata(from);
    const members = meta.participants.map((p) => p.id);
    const mentionText = members.map((m) => `@${m.split("@")[0]}`).join(" ");
    await sock.sendMessage(from, {
      text: `📢 *${text || "Attention everyone!"}*\n\n${mentionText}`,
      mentions: members,
    });
  },
};

// ── KICK ──
const kickPlugin = {
  command: "kick",
  description: "Kick a member",
  groupOnly: true,
  adminOnly: true,
  execute: async ({ sock, from, msg, isBotAdmin }) => {
    if (!isBotAdmin) return sock.sendMessage(from, { text: "❌ Bot ko admin banao pehle!" });
    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid ||
      (msg.message?.extendedTextMessage?.contextInfo?.participant ? [msg.message.extendedTextMessage.contextInfo.participant] : []);
    if (!mentioned.length) return sock.sendMessage(from, { text: "Kisi ko mention karo ya reply karo" });
    await sock.groupParticipantsUpdate(from, mentioned, "remove");
    await sock.sendMessage(from, { text: `✅ Kicked: @${mentioned[0].split("@")[0]}`, mentions: mentioned });
  },
};

// ── PROMOTE ──
const promotePlugin = {
  command: "promote",
  description: "Make admin",
  groupOnly: true,
  adminOnly: true,
  execute: async ({ sock, from, msg, isBotAdmin }) => {
    if (!isBotAdmin) return sock.sendMessage(from, { text: "❌ Bot ko admin banao pehle!" });
    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    if (!mentioned.length) return sock.sendMessage(from, { text: "Kisi ko mention karo" });
    await sock.groupParticipantsUpdate(from, mentioned, "promote");
    await sock.sendMessage(from, { text: `⭐ Promoted to admin: @${mentioned[0].split("@")[0]}`, mentions: mentioned });
  },
};

// ── DEMOTE ──
const demotePlugin = {
  command: "demote",
  description: "Remove admin",
  groupOnly: true,
  adminOnly: true,
  execute: async ({ sock, from, msg, isBotAdmin }) => {
    if (!isBotAdmin) return sock.sendMessage(from, { text: "❌ Bot ko admin banao pehle!" });
    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    if (!mentioned.length) return sock.sendMessage(from, { text: "Kisi ko mention karo" });
    await sock.groupParticipantsUpdate(from, mentioned, "demote");
    await sock.sendMessage(from, { text: `🔽 Demoted: @${mentioned[0].split("@")[0]}`, mentions: mentioned });
  },
};

// ── MUTE (close group) ──
const mutePlugin = {
  command: "mute",
  description: "Mute group (admins only can send)",
  groupOnly: true,
  adminOnly: true,
  execute: async ({ sock, from, isBotAdmin }) => {
    if (!isBotAdmin) return sock.sendMessage(from, { text: "❌ Bot ko admin banao pehle!" });
    await sock.groupSettingUpdate(from, "announcement");
    await sock.sendMessage(from, { text: "🔇 Group muted! Only admins can send now." });
  },
};

// ── UNMUTE ──
const unmutePlugin = {
  command: "unmute",
  description: "Unmute group",
  groupOnly: true,
  adminOnly: true,
  execute: async ({ sock, from, isBotAdmin }) => {
    if (!isBotAdmin) return sock.sendMessage(from, { text: "❌ Bot ko admin banao pehle!" });
    await sock.groupSettingUpdate(from, "not_announcement");
    await sock.sendMessage(from, { text: "🔊 Group unmuted! Everyone can send now." });
  },
};

// ── GLOCK (lock group) ──
const glockPlugin = {
  command: "glock",
  description: "Lock group settings",
  groupOnly: true,
  adminOnly: true,
  execute: async ({ sock, from, isBotAdmin }) => {
    if (!isBotAdmin) return sock.sendMessage(from, { text: "❌ Bot ko admin banao pehle!" });
    await sock.groupSettingUpdate(from, "locked");
    await sock.sendMessage(from, { text: "🔒 Group settings locked!" });
  },
};

// ── GUNLOCK ──
const gunlockPlugin = {
  command: "gunlock",
  description: "Unlock group settings",
  groupOnly: true,
  adminOnly: true,
  execute: async ({ sock, from, isBotAdmin }) => {
    if (!isBotAdmin) return sock.sendMessage(from, { text: "❌ Bot ko admin banao pehle!" });
    await sock.groupSettingUpdate(from, "unlocked");
    await sock.sendMessage(from, { text: "🔓 Group settings unlocked!" });
  },
};

// ── INVITE ──
const invitePlugin = {
  command: "invite",
  description: "Get invite link",
  groupOnly: true,
  adminOnly: true,
  execute: async ({ sock, from, isBotAdmin }) => {
    if (!isBotAdmin) return sock.sendMessage(from, { text: "❌ Bot ko admin banao pehle!" });
    const code = await sock.groupInviteCode(from);
    await sock.sendMessage(from, { text: `🔗 *Invite Link:*\nhttps://chat.whatsapp.com/${code}` });
  },
};

// ── REVOKE ──
const revokePlugin = {
  command: "revoke",
  description: "Reset invite link",
  groupOnly: true,
  adminOnly: true,
  execute: async ({ sock, from, isBotAdmin }) => {
    if (!isBotAdmin) return sock.sendMessage(from, { text: "❌ Bot ko admin banao pehle!" });
    await sock.groupRevokeInvite(from);
    const code = await sock.groupInviteCode(from);
    await sock.sendMessage(from, { text: `✅ Link reset!\n🔗 New: https://chat.whatsapp.com/${code}` });
  },
};

// ── GNAME ──
const gnamePlugin = {
  command: "gname",
  description: "Change group name",
  groupOnly: true,
  adminOnly: true,
  execute: async ({ sock, from, text, isBotAdmin }) => {
    if (!isBotAdmin) return sock.sendMessage(from, { text: "❌ Bot ko admin banao pehle!" });
    if (!text) return sock.sendMessage(from, { text: "Usage: .gname New Name" });
    await sock.groupUpdateSubject(from, text);
    await sock.sendMessage(from, { text: `✅ Group name changed to: *${text}*` });
  },
};

// ── GDESC ──
const gdescPlugin = {
  command: "gdesc",
  description: "Change group description",
  groupOnly: true,
  adminOnly: true,
  execute: async ({ sock, from, text, isBotAdmin }) => {
    if (!isBotAdmin) return sock.sendMessage(from, { text: "❌ Bot ko admin banao pehle!" });
    if (!text) return sock.sendMessage(from, { text: "Usage: .gdesc New description" });
    await sock.groupUpdateDescription(from, text);
    await sock.sendMessage(from, { text: `✅ Group description updated!` });
  },
};

// ── JOINREQUESTS ──
const joinreqPlugin = {
  command: "joinrequests",
  description: "Approve all join requests",
  groupOnly: true,
  adminOnly: true,
  execute: async ({ sock, from }) => {
    try {
      const reqs = await sock.groupRequestParticipantsList(from);
      if (!reqs.length) return sock.sendMessage(from, { text: "No pending join requests." });
      for (const r of reqs) {
        await sock.groupRequestParticipantsUpdate(from, [r.jid], "approve");
      }
      await sock.sendMessage(from, { text: `✅ Approved ${reqs.length} join request(s)!` });
    } catch {
      await sock.sendMessage(from, { text: "❌ Could not fetch join requests." });
    }
  },
};

// ── LEAVE ──
const leavePlugin = {
  command: "leave",
  description: "Bot leaves group",
  groupOnly: true,
  ownerOnly: true,
  execute: async ({ sock, from }) => {
    await sock.sendMessage(from, { text: "👋 Bye bye!" });
    await sock.groupLeave(from);
  },
};

// ── GPP (group profile pic) ──
const gppPlugin = {
  command: "gpp",
  description: "Get group profile picture",
  groupOnly: true,
  execute: async ({ sock, from }) => {
    try {
      const pp = await sock.profilePictureUrl(from, "image");
      await sock.sendMessage(from, { image: { url: pp }, caption: "📸 Group Profile Picture" });
    } catch {
      await sock.sendMessage(from, { text: "❌ Could not fetch group picture." });
    }
  },
};

// ── REMOVEGPP ──
const removegppPlugin = {
  command: "removegpp",
  description: "Remove group profile picture",
  groupOnly: true,
  adminOnly: true,
  execute: async ({ sock, from }) => {
    try {
      await sock.removeProfilePicture(from);
      await sock.sendMessage(from, { text: "✅ Group profile picture removed!" });
    } catch {
      await sock.sendMessage(from, { text: "❌ Could not remove group picture." });
    }
  },
};

module.exports = [
  tagPlugin, tagallPlugin, kickPlugin, promotePlugin, demotePlugin,
  mutePlugin, unmutePlugin, glockPlugin, gunlockPlugin, invitePlugin,
  revokePlugin, gnamePlugin, gdescPlugin, joinreqPlugin, leavePlugin,
  gppPlugin, removegppPlugin,
];
