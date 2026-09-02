require('dotenv').config();
const fs = require('fs');
const chalk = require('chalk');

// Contact details
global.sessionid = process.env.SESSION_ID || '{"noiseKey":{"private":{"type":"Buffer","data":"cFRYE5FKdvmjdbk24f207ZTMibTZr7ehdCrSaFo5mlo="},"public":{"type":"Buffer","data":"tKemQW2p/ETappLyiYq3Br7uwnlIgZOttXSleOVMJwk="}},"pairingEphemeralKeyPair":{"private":{"type":"Buffer","data":"WB+pU3RZlrAzB+VXjC3h5F7e6zEv3u2ozAu9AtP9aV0="},"public":{"type":"Buffer","data":"uBSILEX0MX7m0g4hoGRwkR7U766KAvrEwNuXq6z4e0c="}},"signedIdentityKey":{"private":{"type":"Buffer","data":"sCUVhXW94nkZUN7mWG6wPjPxiX86yW5vm2+F5bBeDXQ="},"public":{"type":"Buffer","data":"apO+9ARMyzV/HbUXP2MwvnqWcEeQRH4AFWRFIfZ7rxE="}},"signedPreKey":{"keyPair":{"private":{"type":"Buffer","data":"mP5vUgfZjIVF7vgTZWIIPrqqxu729IJetHj8ZHcWL0w="},"public":{"type":"Buffer","data":"qTqvGHIi7GhWsmWTo5TBAwUQQXQu9bowLl9fEILQFlE="}},"signature":{"type":"Buffer","data":"XZEUMXi332uJnEWlWKkKiu5fc9NztRksj6JLB3KGvyWcFmMm19ed0HAlBy2+lLbBn4UDbtHivj91XalQdaQ2gg=="},"keyId":1},"registrationId":249,"advSecretKey":"EmGXLfOiLN5EEqj40YyJRJGQr/bxYGWa9rnBn67Y/Nw=","processedHistoryMessages":[],"nextPreKeyId":31,"firstUnuploadedPreKeyId":31,"accountSyncCounter":0,"accountSettings":{"unarchiveChats":false},"registered":false,"account":{"details":"CKuOyvQHEMSOltQGGAEgACgA","accountSignatureKey":"Wrjhsib/EMeEaHgu9UkNS22ABb6QPOnIdSr92mYounw=","accountSignature":"enVYvgEsHC8N+octtAuywp9CFGij0ClTe4he86vRkl+tL136DUdG+uNyWTYseI/hVQgCz0ZMh12c+fv9QTGrBA==","deviceSignature":"lIeJHfLDkjeUv6p8oJB0IqeAy2KrfKsZuXXarq3+Hvk7zmhzuAwsJ/anXGknQke6mVHmtZwQgpJJbwCZzK9Ciw=="},"me":{"id":"255743140476:12@s.whatsapp.net","name":"ㅤ","lid":"207537618030662:12@lid"},"signalIdentities":[{"identifier":{"name":"255743140476:12@s.whatsapp.net","deviceId":0},"identifierKey":{"type":"Buffer","data":"BVq44bIm/xDHhGh4LvVJDUttgAW+kDzpyHUq/dpmKLp8"}}],"platform":"smba","routingInfo":{"type":"Buffer","data":"CAUIEggI"},"lastAccountSyncTimestamp":1787135829,"myAppStateKeyId":"AAAAAPQp"}';
global.ytname = process.env.YT_NAME || "YT: @EliteProTechs";
global.socialm = process.env.SOCIAL_M || "GitHub: EliteProTech";
global.location = process.env.LOCATION || "Nigeria, Port Harcourt";

// Creator details
global.ownernumber = process.env.OWNER_NUMBER || '255743140476';
global.ownername = process.env.OWNER_NAME || 'Byte0XFF';
global.botname = process.env.BOT_NAME || 'ELITE-PRO-V1';

// Default settings 
global.prefix = process.env.PREFIX || '.';
// Settings: true=enable false=disable
global.autoRecording = process.env.AUTO_RECORDING === 'false';
global.autoTyping = process.env.AUTO_TYPING === 'false';
global.autorecordtype = process.env.AUTO_RECORD_TYPE === 'false';
global.autoread = process.env.AUTO_READ === 'false';
global.autobio = process.env.AUTO_BIO !== 'true';
global.autoviewstatus = process.env.AUTO_VIEW_STATUS !== 'true';
global.welcome = process.env.WELCOME !== 'false';
global.autoreact = process.env.AUTO_REACT === 'false';
global.autolikestatus = process.env.AUTO_LIKE_STATUS === 'true';
global.autoOffline = process.env.AUTO_OFFLINE === 'false';

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
