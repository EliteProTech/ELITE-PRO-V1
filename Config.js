require('dotenv').config();
const fs = require('fs');
const chalk = require('chalk');

// Contact details
global.sessionid = process.env.SESSION_ID || '{"noiseKey":{"private":{"type":"Buffer","data":"UOpKNpZKG4mW/xgj/by2gjB0NhuUpHZSkzYGeaSoaUg="},"public":{"type":"Buffer","data":"lT4/a/MtMFuPd1/iEhHTAuI3V4Tm9nUFGBzoKzVuzyA="}},"pairingEphemeralKeyPair":{"private":{"type":"Buffer","data":"oD7wUtfh+4juvc8r8wzrGSwj078FlC+oayhMk5YexVA="},"public":{"type":"Buffer","data":"+G0qGKkWtDh+9OMWJsdAv91w8pOjTTxKUYuG7RyR1B4="}},"signedIdentityKey":{"private":{"type":"Buffer","data":"ALwkYwys5mNx23LAOBHOpzjec/raqXwcxvrkiifojmo="},"public":{"type":"Buffer","data":"eRrUjbYL+px58F/uqv12zvIHXg6TwIeCVukbkwpPFxA="}},"signedPreKey":{"keyPair":{"private":{"type":"Buffer","data":"KGUlgcbd6viPP785j1mK2THmoauX9jTZ5tWoxbN+hW8="},"public":{"type":"Buffer","data":"EQYVCD7pGnWuabNjX7/9NZ4MlgeeeWhbTwSEtdQSAiE="}},"signature":{"type":"Buffer","data":"Mwjwygthb3bM3lzXKlcyr8EJjwcYcrtfqOGNtJbSJ3547Oxjh6+CooG+qdrkfTRs7Z8agkttuqhjvrGay0+FCA=="},"keyId":1},"registrationId":75,"advSecretKey":"UQ6/6u3+ij1vbo4CXh4Z0fHV945s5JjM4xAnpg/N9ms=","processedHistoryMessages":[],"nextPreKeyId":31,"firstUnuploadedPreKeyId":31,"accountSyncCounter":0,"accountSettings":{"unarchiveChats":false},"registered":true,"pairingCode":"TNPXHGKD","me":{"id":"263785785040:44@s.whatsapp.net","lid":"259987859349513:44@lid"},"account":{"details":"CPuE5KEHEIaIjsQGGBUgACgA","accountSignatureKey":"paNwEKhOXam/431mly18TXbsNPO9V2deKSMEheUJvWY=","accountSignature":"JTD1P3VOvrhUnKt/V1oqisiFPdPxG1qU63bBkWU6RPoM5MPjX6eVoT0aU/vHqD8uvZfeRQHmmiitrDWJDpG6Cw==","deviceSignature":"Fk53FRjS2Gw2ZN1aallbXjPNx9JxLR4WFiiZu4luO/kHbGUX2uKCodMhqnVei1qlscf0fyytxcqorbkdygS/CQ=="},"signalIdentities":[{"identifier":{"name":"263785785040:44@s.whatsapp.net","deviceId":0},"identifierKey":{"type":"Buffer","data":"BaWjcBCoTl2pv+N9ZpctfE127DTzvVdnXikjBIXlCb1m"}}],"platform":"android","routingInfo":{"type":"Buffer","data":"CBIIAg=="},"lastAccountSyncTimestamp":1753449482,"lastPropHash":"3gPUJk","myAppStateKeyId":"AAAAAPYO"}';
global.ytname = process.env.YT_NAME || "YT: @EliteProTechs";
global.socialm = process.env.SOCIAL_M || "GitHub: EliteProTech";
global.location = process.env.LOCATION || "Nigeria, Port Harcourt";

// Creator details
global.ownernumber = process.env.OWNER_NUMBER || '2348109263390';
global.ownername = process.env.OWNER_NAME || 'ElitePro';
global.botname = process.env.BOT_NAME || 'ELITE-PRO-V1';

// Default settings 
global.prefix = process.env.PREFIX || '.';
// Settings: true=enable false=disable
global.autoRecording = process.env.AUTO_RECORDING === 'true';
global.autoTyping = process.env.AUTO_TYPING === 'true';
global.autorecordtype = process.env.AUTO_RECORD_TYPE === 'true';
global.autoread = process.env.AUTO_READ === 'true';
global.autobio = process.env.AUTO_BIO !== 'false'; // default true
global.anti92 = process.env.ANTI_92 === 'true';
global.autoswview = process.env.AUTO_SW_VIEW !== 'false'; // default true
global.welcome = process.env.WELCOME !== 'false'; // default true
global.autoreact = process.env.AUTO_REACT === 'true';
global.autolikestatus = process.env.AUTO_LIKE_STATUS === 'true';

// Thumbnail profile picture
global.elitepropp = process.env.ELITE_PRO_PP || 'https://i.ibb.co/jk0ynvbn/7a8c4b5b617fa11a1e9a61190f427546.jpg';
// Default emoji
global.themeemoji = process.env.THEME_EMOJI || '👨‍💻';


// Sticker details
global.packname = process.env.PACKNAME || 'Sticker By';
global.author = process.env.AUTHOR || 'ELITEPRO\n\nContact: +2348109263390';
// Default settings 2
global.typemenu = process.env.TYPE_MENU || 'v2';
global.wm = process.env.WM || "Youtube @EliteProTechs";
global.link = process.env.LINK || 'https://whatsapp.com/channel/0029VaXaqHII1rcmdDBBsd3g';

// Reply messages
global.mess = {
    done: '*⿻ DONE: Task completed ✔️*',
    prem: '*⦿ This command is made for premium users.⁉️*',
    admin: '*⦿ This command is made for group admins.‼️*',
    botAdmin: '*⦿  Make bot admin to access commands⿻*',
    owner: '*⦿This commands is made for bot owner.*',
    group: '*⦿ This command is made for group chat❕*',
    private: '*⦿ This command is made for private chat ⭕*',
    wait: '*_⚙️PROCESSING DATA......_*',
    error: '*‼️AN ERROR OCCUR‼️*',
};

global.thumb = fs.readFileSync('./EliteProMedia/thumb.jpg');

let file = require.resolve(__filename);
fs.watchFile(file, () => {
    fs.unwatchFile(file);
    console.log(chalk.redBright(`Update'${__filename}'`));
    delete require.cache[file];
    require(file);
});
