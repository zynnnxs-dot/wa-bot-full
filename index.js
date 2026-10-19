import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion
} from "@whiskeysockets/baileys";
import pino from "pino";
import { readFile } from "node:fs/promises";

const logger = pino({ level: "silent" });
const PREFIX = ".";
const BOT_NAME = process.env.BOT_NAME || "Ndrexan Bot";
const OWNER_NUMBER = (process.env.OWNER_NUMBER || "").replace(/\D/g, "");
const BOT_NUMBER = (process.env.BOT_NUMBER || "").replace(/\D/g, "");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("auth_info");
  let version;
  try {
    ({ version } = await fetchLatestBaileysVersion());
  } catch {
    version = undefined;
  }

  const sock = makeWASocket({
    version,
    auth: state,
    logger,
    printQRInTerminal: false,
    browser: ["Ndrexan Bot", "Chrome", "1.0.0"],
    markOnlineOnConnect: false,
    syncFullHistory: false
  });

  if (!state.creds.registered && BOT_NUMBER) {
    await sleep(1500);
    try {
      const code = await sock.requestPairingCode(BOT_NUMBER);
      console.log("\\n=================================");
      console.log("PAIRING CODE:", code);
      console.log("Buka WhatsApp > Perangkat tertaut > Tautkan perangkat > Tautkan dengan nomor telepon.");
      console.log("=================================\\n");
    } catch (err) {
      console.error("Gagal membuat pairing code:", err?.message || err);
    }
  } else if (!state.creds.registered) {
    console.log("Isi BOT_NUMBER di Environment Variables dengan nomor WhatsApp lengkap, contoh 62812xxxxxxx.");
  }

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", ({ connection, lastDisconnect }) => {
    if (connection === "open") console.log("Bot tersambung ke WhatsApp!");
    if (connection === "close") {
      const status = lastDisconnect?.error?.output?.statusCode;
      console.log("Koneksi terputus. Status:", status ?? "tidak diketahui");
      if (status !== DisconnectReason.loggedOut) {
        setTimeout(() => startBot().catch(console.error), 3000);
      } else {
        console.log("Sesi logout. Hapus auth_info lalu hubungkan ulang jika memang ingin login lagi.");
      }
    }
  });

  sock.ev.on("group-participants.update", async (event) => {
    if (event.action !== "add") return;
    for (const participant of event.participants || []) {
      try {
        await sock.sendMessage(event.id, {
          text: `Halo @${participant.split("@")[0]} 👋 Selamat datang di grup!`,
          mentions: [participant]
        });
      } catch (err) {
        console.error("Gagal mengirim welcome:", err?.message || err);
      }
    }
  });

  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    if (type !== "notify") return;
    for (const msg of messages) {
      if (!msg.message || msg.key.fromMe) continue;

      const jid = msg.key.remoteJid;
      if (!jid || jid === "status@broadcast") continue;

      const text = (
        msg.message.conversation ||
        msg.message.extendedTextMessage?.text ||
        msg.message.imageMessage?.caption ||
        msg.message.videoMessage?.caption ||
        ""
      ).trim();

      if (!text.startsWith(PREFIX)) continue;
      const [commandRaw, ...args] = text.slice(PREFIX.length).trim().split(/\s+/);
      const command = (commandRaw || "").toLowerCase();
      const isGroup = jid.endsWith("@g.us");
      const sender = msg.key.participant || msg.key.remoteJid;
      const senderNumber = (sender || "").split("@")[0].replace(/\D/g, "");
      const isOwner = OWNER_NUMBER && senderNumber.endsWith(OWNER_NUMBER);

      const reply = async (body) => sock.sendMessage(jid, { text: body }, { quoted: msg });

      try {
        switch (command) {
          case "menu":
          case "help":
            await reply(
`╭─「 ${BOT_NAME} 」
│
├─ INFO
│ .menu
│ .ping
│ .runtime
│ .owner
│
├─ HIBURAN
│ .dadu
│ .tebakangka
│
├─ TOOLS
│ .say teks
│ .sticker (fitur berikutnya)
│ .toimg (fitur berikutnya)
│
└─ Bot tidak mengirim spam otomatis.`
            );
            break;
          case "ping":
            await reply("Pong! Bot aktif ✅");
            break;
          case "runtime":
            await reply(`Bot aktif selama ${Math.floor(process.uptime())} detik.`);
            break;
          case "owner":
            await reply(OWNER_NUMBER ? `Owner: wa.me/${OWNER_NUMBER}` : "Nomor owner belum diatur di Environment Variables.");
            break;
          case "dadu":
            await reply(`🎲 Hasil dadu: ${1 + Math.floor(Math.random() * 6)}`);
            break;
          case "tebakangka": {
            const target = 1 + Math.floor(Math.random() * 10);
            await reply(`🎯 Tebak angka 1–10: ${target}\n(Mode demo: angka ditampilkan. Versi berikutnya bisa dibuat interaktif.)`);
            break;
          }
          case "say":
            if (!args.length) await reply("Cara pakai: .say teks kamu");
            else await reply(args.join(" ").slice(0, 1000));
            break;
          default:
            // Abaikan command yang tidak dikenal agar chat tidak terganggu.
            break;
        }
      } catch (err) {
        console.error("Gagal memproses pesan:", err?.message || err);
      }
    }
  });
}

startBot().catch((err) => {
  console.error("Bot gagal dijalankan:", err);
  process.exitCode = 1;
});
