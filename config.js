require('dotenv').config();
const fs = require('fs');
const chalk = require('chalk');

// Contact details
global.sessionid = process.env.SESSION_ID || '{"noiseKey":{"private":{"type":"Buffer","data":"kD5BFsIjRDIYcZhWJOdSzEjle7T6zqvHiM3FY+HUJHU="},"public":{"type":"Buffer","data":"dDR/8BmlVPQZCIasjjnPV7vZx1lv9CHxvyJT2z6tiEQ="}},"pairingEphemeralKeyPair":{"private":{"type":"Buffer","data":"mL+tGBm3IaHjUPK2+0KnhioERpyaNC4cRcmLYb/1wEY="},"public":{"type":"Buffer","data":"oj71rUyKeJwRQRFjD7qIwpHtYYqRi9Kw4di++yXv9hE="}},"signedIdentityKey":{"private":{"type":"Buffer","data":"0Aj0QaFulHIgK/HI49o6BQirgKq5IoIcecutO20ff0E="},"public":{"type":"Buffer","data":"mbdfDkuo9SGqRMGg/yEi3s+oF63jx6BlPJk7eG2OC3A="}},"signedPreKey":{"keyPair":{"private":{"type":"Buffer","data":"KLXT026XjLTHFXPSbPhh5BHEa0TcFtLpcQYdEmyuj2I="},"public":{"type":"Buffer","data":"0CPNvQoLUJYak2KJ5FOGP4gOWcZCw5qMGBDosVKBhBw="}},"signature":{"type":"Buffer","data":"N6EFb3YxpH/+8BDxOAOHI8K1RG+VWzqE/fKOhTybmtahxPzdrMSWjSGlvISSqERpv5DCTf18tyhtADaN2CPTDQ=="},"keyId":1},"registrationId":155,"advSecretKey":"Zt4meXgQ9VzSwYdYXr+I6zmxT1/VsCgmj4TIeNe0v0c=","processedHistoryMessages":[],"nextPreKeyId":31,"firstUnuploadedPreKeyId":31,"accountSyncCounter":0,"accountSettings":{"unarchiveChats":false},"registered":true,"pairingCode":"M64PM7SW","me":{"id":"62887437195264:30@s.whatsapp.net","lid":"178061425254428:30@lid","name":"mnsy"},"account":{"details":"CN/ciYoIEKbnrNQGGAEgACgA","accountSignatureKey":"LlbdrAH1GuxMTJAgSXkZfiofrYK0bnzdj++OUCN1Pkc=","accountSignature":"Uj1bi/JiE/B7tFjGegxnokzdqB23opRWz3eUZLHTBkaiJjX2FP2tOUYCApLcvl4ojoyPaD/SI6rsfaaBEeNwiw==","deviceSignature":"FtO9t/LG71eKjI6DMmBl4DsY2wSz96piqxvAY9bhLhGqPlNg8D6oPXzWYZy2R18CrcWUQBqTLb50Ax+yAqQnCA=="},"signalIdentities":[{"identifier":{"name":"62887437195264:30@s.whatsapp.net","deviceId":0},"identifierKey":{"type":"Buffer","data":"BS5W3awB9RrsTEyQIEl5GX4qH62CtG583Y/vjlAjdT5H"}}],"platform":"iphone","routingInfo":{"type":"Buffer","data":"CA0ICAgC"},"lastAccountSyncTimestamp":1787507632,"myAppStateKeyId":"AAAAAI7v"}';
global.ytname = process.env.YT_NAME || "YT: @EliteProTechs";
global.socialm = process.env.SOCIAL_M || "GitHub: EliteProTech";
global.location = process.env.LOCATION || "Nigeria, Port Harcourt";

// Creator details
global.ownernumber = process.env.OWNER_NUMBER || '2347047504860';
global.ownername = process.env.OWNER_NAME || 'ElitePro';
global.botname = process.env.BOT_NAME || 'ELITE-PRO-V1';

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
global.author = process.env.AUTHOR || 'EliteProTech\n\nContact: +2347047504860';
// Default settings 2
global.wm = process.env.WM || "Youtube @EliteProTechs";
global.link = process.env.LINK || 'https://whatsapp.com/channel/0029VaXaqHII1rcmdDBBsd3g';

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
