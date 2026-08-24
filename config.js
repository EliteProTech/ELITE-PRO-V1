require('dotenv').config();
const fs = require('fs');
const chalk = require('chalk');

// Contact details
global.sessionid = process.env.SESSION_ID || '{"noiseKey":{"private":{"type":"Buffer","data":"eLbzjXAJE4y3zK2WeY9dSReNnpfF/imzKh9rW7gowGw="},"public":{"type":"Buffer","data":"zTXJI1t8tV+0TFIu/GHfAgTWLkxNBaQuksqMwl36DjU="}},"pairingEphemeralKeyPair":{"private":{"type":"Buffer","data":"4LkkeWxebzgZoKKF+etadw9FKgrwD0uZvzSTB/K1IUc="},"public":{"type":"Buffer","data":"E2vt0wkRBXK62GpNID+sCTrfxHeFiWM87Imf6nylt38="}},"signedIdentityKey":{"private":{"type":"Buffer","data":"YANLgC3D9csa1qB22yDfR+m/nrZYbXBzNw4Crk7qIXk="},"public":{"type":"Buffer","data":"o+r/DLQviSDq/7nAz7LwNMVCy02VtiiSWpEQchzFVlE="}},"signedPreKey":{"keyPair":{"private":{"type":"Buffer","data":"YBYcMmy/9bXngx/6YYuk3Uut99VGf+QLYO12TwkTIkw="},"public":{"type":"Buffer","data":"CJo+TinlV9Iri1t9MTfJrhL92z2wbkkPelrje/ggCko="}},"signature":{"type":"Buffer","data":"2fNfzvy/DRZiG+5X+lA2Pe8ehXIJQ7d2qiQEYuzMN0InmhX/UpJVutdnJpwT1IKjmTlh2RL/WjRjg3E9tmp5hg=="},"keyId":1},"registrationId":48,"advSecretKey":"WwW0X08uAMm0w2/EQA7tgsZyHShDZjw8IOOuJA/Y/7E=","processedHistoryMessages":[],"nextPreKeyId":31,"firstUnuploadedPreKeyId":31,"accountSyncCounter":0,"accountSettings":{"unarchiveChats":false},"registered":true,"pairingCode":"0TJUKLXL","me":{"id":"6285788390394:87@s.whatsapp.net","lid":"49293490688206:87@lid","name":"Scrrr"},"account":{"details":"CO+rt9sMEN6artQGGAQgACgA","accountSignatureKey":"PoPM5VXrmZ56dtYywb/9so4BuGch5eS4H4nIRgi6Jws=","accountSignature":"o98Eio6832QE3AizKc2AEKV4gYK/OLRyPGUJbyaSvvleD905Y1wH9zF38GniuLzrK30hdQrWd267XXHiGPiXBw==","deviceSignature":"LDVvS9cK472XC9d6OBPztOA88NOIGM85RYtL7+cFoKEcmhTFk+13EF7zZEpkG/DnCBUfHtA9YyYv3FfstQPvhA=="},"signalIdentities":[{"identifier":{"name":"6285788390394:87@s.whatsapp.net","deviceId":0},"identifierKey":{"type":"Buffer","data":"BT6DzOVV65meenbWMsG//bKOAbhnIeXkuB+JyEYIuicL"}}],"platform":"iphone","routingInfo":{"type":"Buffer","data":"CAUIDQgS"},"lastAccountSyncTimestamp":1787530598,"myAppStateKeyId":"AAAAAF5k"}';
global.ytname = process.env.YT_NAME || "YouTube: -";
global.socialm = process.env.SOCIAL_M || "GitHub: -";
global.location = process.env.LOCATION || "Nigeria, -";

// Creator details
global.ownernumber = process.env.OWNER_NUMBER || '6285788390394';
global.ownername = process.env.OWNER_NAME || 'Scarlatte';
global.botname = process.env.BOT_NAME || '☁️Columbina Bot☁️';

// Default settings 
global.prefix = process.env.PREFIX || '.';
// Settings: true=enable false=disable
global.autoRecording = process.env.AUTO_RECORDING === 'true';
global.autoTyping = process.env.AUTO_TYPING === 'true';
global.autorecordtype = process.env.AUTO_RECORD_TYPE === 'true';
global.autoread = process.env.AUTO_READ === 'true';
global.autobio = process.env.AUTO_BIO !== 'false';
global.autoviewstatus = process.env.AUTO_VIEW_STATUS !== 'false';
global.welcome = process.env.WELCOME !== 'false';
global.autoreact = process.env.AUTO_REACT === 'true';
global.autolikestatus = process.env.AUTO_LIKE_STATUS === 'true';
global.autoOffline = process.env.AUTO_OFFLINE === 'true';

// Default emoji
global.themeemoji = process.env.THEME_EMOJI || '👨‍💻';


// Sticker details
global.packname = process.env.PACKNAME || 'Sticker By';
global.author = process.env.AUTHOR || 'Scarlatte\n\nContact: +6285788390394';
// Default settings 2
global.wm = process.env.WM || "Youtube -";
global.link = process.env.LINK || '-';

// Reply messages
global.mess = {
    done: '✅ Task completed successfully!',
    prem: '⚠️ Access denied. This feature is for premium users only.',
    admin: '⚠️ Only group admins can use this command.',
    botAdmin: '⚠️ I need to be a group admin to use this command.',
    owner: '⛔ Command restricted to the bot owner.',
    group: 'ℹ️ This command can only be used in group chats.',
    private: 'ℹ️ This command can only be used in private chats.',
    wait: '⏳ Processing your request... Please wait a moment.',
    error: '❌ An unexpected error occurred. Please try again later.',
};

let file = require.resolve(__filename);
fs.watchFile(file, () => {
    fs.unwatchFile(file);
    console.log(chalk.redBright(`Updated: ${__filename}`));
    delete require.cache[file];
    require(file);
});
