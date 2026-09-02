const { default: makeWaSocket, useMultiFileAuthState, BufferJSON, WA_DEFAULT_EPHEMERAL, generateWAMessageFromContent, proto, generateWAMessageContent, generateWAMessage, prepareWAMessageMedia, areJidsEliteProTecheUser, getContentType } = require('baileys')
const os = require('os')
const fs = require('fs') 
const fsx = require('fs-extra')
const path = require('path')
const util = require('util')
const chalk = require('chalk')
const moment = require('moment-timezone')
const speed = require('performance-now')
const ms = toMs = require('ms')
const axios = require('axios')
const FormData = require("form-data")
const fetch = require('node-fetch')
const yts = require('yt-search')
const { sendButtons, sendInteractiveMessage } = require('gifted-btns')
const pino = require('pino')
const { exec, spawn, execSync } = require("child_process")
const {translate} = require('@vitalets/google-translate-api')
const googleTTS = require('google-tts-api')
const { performance } = require('perf_hooks')
const more = String.fromCharCode(8206)
const readmore = more.repeat(4001)
const { webp2mp4File } = require('./lib/uploader')
const { toAudio, toPTT, toVideo, ffmpeg, addExifAvatar } = require('./lib/converter')
const { uploadToEliteProTechUrl, uploadToCatbox, uploadToEliteTempUrl } = require('./lib/urlclouds');
const { smsg, getGroupAdmins, formatp, jam, formatDate, getTime, isUrl, await, sleep, clockString, msToDate, sort, toNumber, enumGetKey, runtime, fetchJson, getBuffer, json, delay, format, logic, generateProfilePicture, parseMention, getRandom, pickRandom, reSize } = require('./lib/myfunc')
const { checkPremiumUser } = require('./lib/premium')
const { fetchBuffer, buffergif } = require("./lib/myfunc2")

//database
let _owner = JSON.parse(fs.readFileSync('./database/owner.json'))
let owner = JSON.parse(fs.readFileSync('./database/owner.json'))
let elitepropic = fs.readFileSync('./database/elitepropic.jpg')

module.exports = async (EliteProTech, m, chatUpdate, store) => {
    try { const { type, quotedMsg, mentioned, now, fromMe } = m
        var body = (m.mtype === 'conversation') ? m.message.conversation :
           (m.mtype == 'imageMessage') ? m.message.imageMessage.caption :
           (m.mtype == 'videoMessage') ? m.message.videoMessage.caption :
           (m.mtype == 'extendedTextMessage') ? m.message.extendedTextMessage.text :
           (m.mtype == 'buttonsResponseMessage') ? m.message.buttonsResponseMessage.selectedButtonId :
           (m.mtype == 'listResponseMessage') ? m.message.listResponseMessage.singleSelectReply?.selectedRowId :
           (m.mtype == 'templateButtonReplyMessage') ? m.message.templateButtonReplyMessage.selectedId :
		   (m.mtype == 'interactiveResponseMessage') ? (() => {
			   try { return JSON.parse(m.message.interactiveResponseMessage.nativeFlowResponseMessage.paramsJson).id }
			   catch { return '' }
		   })() :
           (m.mtype === 'messageContextInfo') ? 
               (m.message.buttonsResponseMessage?.selectedButtonId || 
                m.message.listResponseMessage?.singleSelectReply?.selectedRowId || 
                m.text) 
           : '';
        var budy = (typeof m.text === 'string') ? m.text : '';
        const safeBody = (typeof body === 'string' && body.length) ? body : budy;
        const prefix = global.prefix !== undefined ? global.prefix : '.';
		let isCmd; let command;
		if (prefix === '') { isCmd = safeBody.trim().length > 0; 
		command = isCmd ? safeBody.trim().split(/\s+/).shift().toLowerCase() : ''; } 
		else { isCmd = safeBody.startsWith(prefix) && safeBody[prefix.length] !== ' '; 
		command = isCmd ? safeBody.slice(prefix.length).trim().split(/\s+/).shift().toLowerCase() : ''; }
		const args = safeBody.trim().split(/\s+/).slice(1);
		const full_args = isCmd ? (prefix === '' ? safeBody.trim().slice(command.length).trim() 
        : safeBody.slice(prefix.length).trim().slice(command.length).trim()) : '';
        const pushname = m.pushName || "user"
        const botNumber = await EliteProTech.decodeJid(EliteProTech.user.id)
        const itsMe = m.sender == botNumber ? true : false
        const sender = m.sender
        const text = args.join(" ")
        const q = text
        const from = m.key.remoteJid
        const fatkuns = (m.quoted || m)
        const quoted = (fatkuns.mtype == 'buttonsMessage') ? fatkuns[Object.keys(fatkuns)[1]] : (fatkuns.mtype == 'templateMessage') ? fatkuns.hydratedTemplate[Object.keys(fatkuns.hydratedTemplate)[1]] : (fatkuns.mtype == 'product') ? fatkuns[Object.keys(fatkuns)[0]] : m.quoted ? m.quoted : m
        const mime = (quoted.msg || quoted).mimetype || ''
        const qmsg = (quoted.msg || quoted)
        const isMedia = /image|video|sticker|audio/.test(mime)
        const isImage = (type == 'imageMessage')
        const isVideo = (type == 'videoMessage')
        const isAudio = (type == 'audioMessage')
        const isText = (type == 'textMessage')
        const isSticker = (type == 'stickerMessage')
        const isQuotedText = type === 'extendexTextMessage' && content.includes('textMessage')
        const isQuotedImage = type === 'extendedTextMessage' && content.includes('imageMessage')
        const isQuotedLocation = type === 'extendedTextMessage' && content.includes('locationMessage')
        const isQuotedVideo = type === 'extendedTextMessage' && content.includes('videoMessage')
        const isQuotedSticker = type === 'extendedTextMessage' && content.includes('stickerMessage')
        const isQuotedAudio = type === 'extendedTextMessage' && content.includes('audioMessage')
        const isQuotedContact = type === 'extendedTextMessage' && content.includes('contactMessage')
        const isQuotedDocument = type === 'extendedTextMessage' && content.includes('documentMessage')
        const isGroup = m.key.remoteJid.endsWith('@g.us')
        const groupMetadata = m.isGroup ? await EliteProTech.groupMetadata(m.chat).catch(e => {}) : ''
        const groupName = m.isGroup ? groupMetadata.subject : ''
        const participants = m.isGroup ? await groupMetadata.participants : ''
        const groupAdmins = m.isGroup ? await getGroupAdmins(participants) : ''
        const isBotAdmins = m.isGroup ? groupAdmins.includes(botNumber) : false
        const isAdmins = m.isGroup ? groupAdmins.includes(m.sender) : false
        const groupOwner = m.isGroup ? groupMetadata.owner : ''
        const isGroupOwner = m.isGroup ? (groupOwner ? groupOwner : groupAdmins).includes(m.sender) : false
        const cleanLid = EliteProTech.user?.lid ? EliteProTech.user.lid.replace(/:\d+/, '') : '';
        const cleanId = EliteProTech.user?.id ? EliteProTech.user.id.replace(/:\d+/, '') : '';
        const isCreator = [...[ownernumber, ..._owner].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net'), cleanLid, cleanId].includes(m.sender);
        
//DEFAULT SETTINGS 
let profilepuser
try {
    const ppUrl = await EliteProTech.profilePictureUrl(m.sender, 'image')
    const { data } = await axios.get(ppUrl, {
        responseType: 'arraybuffer'
    })
    profilepuser = Buffer.from(data)
} catch (err) {
    profilepuser = elitepropic
}

const reply = (teks) => {
    EliteProTech.sendMessage(
        m.chat,
        { text: teks },
        { quoted: m }
    );
};

if (autoread) {
    await EliteProTech.readMessages([m.key]).catch(() => {})
}

if (global.autoTyping) {
    await EliteProTech.sendPresenceUpdate('composing', from).catch(() => {})
}

if (global.autoRecording) {
    await EliteProTech.sendPresenceUpdate('recording', from).catch(() => {})
}

/*
// bot number online status, available = online, unavailable = offline
if (autoOffline) {
    await EliteProTech.sendPresenceUpdate('unavailable', from).catch(() => {})
}
*/

if (global.autorecordtype) {
    let eliterecordin = ['recording', 'composing']
    let eliterecordinfinal = eliterecordin[Math.floor(Math.random() * eliterecordin.length)]
    await EliteProTech.sendPresenceUpdate(eliterecordinfinal, from).catch(() => {})
}

if (!EliteProTech.public) {
    if (!isCreator && !m.key.fromMe) return
}

if (autobio) {
    EliteProTech.updateProfileStatus(
        `ᴇʟɪᴛᴇᴘʀᴏ ɪꜱ ɴᴏᴡ ᴀᴄᴛɪᴠᴇ ❯ ϙᴜᴏᴛᴇꜱ: ʏᴏᴜ ᴅᴏɴ'ᴛ ʜᴀᴠᴇ ᴛᴏ ʙᴇ ɢʀᴇᴀᴛ ᴛᴏ ꜱᴛᴀʀᴛ, ʙᴜᴛ ʏᴏᴜ ʜᴀᴠᴇ ᴛᴏ ꜱᴛᴀʀᴛ ᴛᴏ ʙᴇ ɢʀᴇᴀᴛ. 🚀`
    ).catch(() => {})
}
	
//CHAT COUNTER COUNSEL (CONSOLE LOG)//
if (isCmd) {
console.log(chalk.cyan(`\n< ================================================== >\n`))
console.log(
chalk.green(m.message && m.isGroup ? `Group Chat:` : `Private Chat:`)
)
console.log(
chalk.black(chalk.bgWhite('[ MESSAGE ]')),
chalk.black(chalk.bgGreen(new Date)),
chalk.black(chalk.bgBlue(budy || m.mtype)) +
'\n' +
chalk.magenta('=> From'),
chalk.green(pushname),
chalk.yellow(m.sender) +
(
m.message && m.isGroup
? '\n' + chalk.blueBright('=> In') + ' ' + chalk.green(groupName, m.chat)
: ''
)
)
}

switch (command) {
case 'ping': {
    const sharp = require('sharp')
    const start = performance.now()
    await EliteProTech.sendMessage(m.chat, { react: { text: "⚙️", key: m.key } })
    function formatUptime(seconds) {
        const d = Math.floor(seconds / 86400)
        seconds %= 86400
        const h = Math.floor(seconds / 3600)
        seconds %= 3600
        const m = Math.floor(seconds / 60)
        const s = Math.floor(seconds % 60)
        return `${d > 0 ? d + 'd ' : ''}${h}h ${m}m ${s}s`
    }
    const thumb = await sharp(profilepuser).resize(200, 200).jpeg({ quality: 40 }).toBuffer()
    const fakeQuoted = {
        key: {
            remoteJid: m.chat,
            fromMe: false,
            participant: m.sender,
            id: 'fakereplyids'
        },
        message: {
            imageMessage: {
                mimetype: 'image/jpeg',
                jpegThumbnail: thumb,
                caption: `⏱️ Uptime: ${formatUptime(process.uptime())}`
            }
        }
    }
    const latency = Math.floor(performance.now() - start)
    await EliteProTech.sendMessage(m.chat, { text: `*🌩️ 𝐁𝐨𝐭 𝐏๏፝֟ƞ̽g ${latency} 𝐌ʂ*` }, { quoted: fakeQuoted })
}
break
case 'alive':
case 'test': {
  try {
    const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'))
    const botVersion = packageJson.version || 'Unknown'

    const start = performance.now()

    const contactMessage = {
      key: {
        fromMe: false,
        participant: "0@s.whatsapp.net",
        remoteJid: "status@broadcast"
      },
      message: {
        contactMessage: {
          displayName: author,
          vcard: `BEGIN:VCARD
VERSION:3.0
N:;${author};;;;
FN:${author}
item1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}
item1.X-ABLabel:Ponsel
END:VCARD`
        }
      }
    }

    const end = performance.now()
    const speed = (end - start).toFixed(4)

    const runtime = process.uptime()
    const hours = Math.floor(runtime / 3600)
    const minutes = Math.floor((runtime % 3600) / 60)
    const seconds = Math.floor(runtime % 60)
    const uptime = `${hours} H ${minutes} M ${seconds} S`

    const usedMemory = process.memoryUsage()
    const ramUsed = (usedMemory.rss / 1024 / 1024).toFixed(2)
    const heapUsed = (usedMemory.heapUsed / 1024 / 1024).toFixed(2)
    const heapTotal = (usedMemory.heapTotal / 1024 / 1024).toFixed(2)
    const totalRam = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2)
    const freeRam = (os.freemem() / 1024 / 1024 / 1024).toFixed(2)

    await EliteProTech.sendMessage(m.chat, {
      text: `🤖 *${botname} is Alive!*
*⌜ System Info ⌟*

*▧ Speed :* ${speed} ms
*▧ Bot Version :* v${botVersion}
*▧ Uptime :* ${uptime}
*▧ RAM :* ${freeRam}GB / ${totalRam}GB Free
*▧ Memory :* ${ramUsed}MB RSS
*▧ Heap :* ${heapUsed}MB / ${heapTotal}MB`,
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: "120363287352245413@newsletter",
          newsletterName: `ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴇʟɪᴛᴇ-ᴘʀᴏ-ᴛᴇᴄʜ`,
          serverMessageId: 1
        }
      }
    }, { quoted: contactMessage })

  } catch (err) {
    console.log("Alive error:", err)
    reply("❌ Error checking bot status")
  }
}
break
case 'readmore': {
	let [l, r] = text.split`|`
    if (!l) l = ''
    if (!r) r = ''
    EliteProTech.sendMessage(m.chat, {text: l + readmore + r}, {quoted: m})
}
			break
			case 'define': 
if (!q) return reply(`What do you want to define?`)
try {
targetfine = await axios.get(`http://api.urbandictionary.com/v0/define?term=${q}`)
if (!targetfine) return reply(mess.error)
const reply = `
*${themeemoji} Word:* ${q}
*${themeemoji} Definition:* ${targetfine.data.list[0].definition
    .replace(/\[/g, "")
    .replace(/\]/g, "")}
*${themeemoji} Example:* ${targetfine.data.list[0].example
    .replace(/\[/g, "")
    .replace(/\]/g, "")}`
   EliteProTech.sendMessage(m.chat,{text:reply},{quoted:m})
} catch (err) {
    console.log(err)
    return reply(`*${q}* isn't a valid text`)
    }
//Savecontacts in group
break
case 'savecontact':
case 'svcontact':
case 'vcf': {
if (!m.isGroup) return reply(mess.group)
if (!isAdmins && !isGroupOwner && !isCreator) return reply(mess.admin)
if (!isBotAdmins) return reply(mess.botAdmin)

    const meta = await EliteProTech.groupMetadata(m.chat);
    const participants = meta.participants;

    let vcard = "";
    let index = 1;

    for (let p of participants) {
        let rawJid = p.jid || p.id || p.lid;
        if (!rawJid) continue;
        let number = rawJid.split("@")[0];
        let waName;
        try {
            waName = await EliteProTech.getName(rawJid);
        } catch {
            waName = number;
        }

        // Build VCF
        vcard += `BEGIN:VCARD
VERSION:3.0
FN:${waName}
N:${waName};;;;
TEL;type=CELL;type=VOICE;waid=${number}:+${number}
END:VCARD
`;
        index++;
    }
    const filePath = "./contacts.vcf";
    fs.writeFileSync(filePath, vcard.trim());

    await sleep(1500);
    await EliteProTech.sendMessage(
        m.chat,
        {
            document: fs.readFileSync(filePath),
            mimetype: "text/vcard",
            fileName: "Group-Contacts.vcf",
            caption: `*Group:* ${meta.subject}\n*Contacts:* ${participants.length}`,
        },
        { quoted: m }
    );
    fs.unlinkSync(filePath);
}
//Send contacts in group
break
case 'sendcontact': case 'sencontact': {
if (!m.isGroup) return reply(mess.group)
if (!m.mentionedJid[0]) return reply('\nUse like this\n Example:.sendcontact @tag|name')
let snTak = text.split(' ')[1] ? text.split(' ')[1] : 'Contact'
let snContact = {
	displayName: "Contact", contacts: [{displayName: snTak, vcard: "BEGIN:VCARD\nVERSION:3.0\nN:;"+snTak+";;;\nFN:"+snTak+"\nitem1.TEL;waid="+m.mentionedJid[0].split('@')[0]+":"+m.mentionedJid[0].split('@')[0]+"\nitem1.X-ABLabel:Mobile\nEND:VCARD"}]
}
EliteProTech.sendMessage(m.chat, {contacts: snContact}, {ephemeralExpiration: 86400})
}
//Contact tag
break
case 'contacttag': case 'contag':{
if (!m.isGroup) return reply(mess.group)
if (!isAdmins && !isGroupOwner && !isCreator) return reply(mess.admin)
if (!isBotAdmins) return reply(mess.botAdmin)
if (!m.mentionedJid[0]) return reply('\nUse like this\n Example:.contacttag @tag|name')
let sngTak = text.split(' ')[1] ? text.split(' ')[1] : 'Contact'
let sngContact = {
	displayName: "Contact", contacts: [{displayName: sngTak, vcard: "BEGIN:VCARD\nVERSION:3.0\nN:;"+sngTak+";;;\nFN:"+sngTak+"\nitem1.TEL;waid="+m.mentionedJid[0].split('@')[0]+":"+m.mentionedJid[0].split('@')[0]+"\nitem1.X-ABLabel:Mobile\nEND:VCARD"}]
}
EliteProTech.sendMessage(m.chat, {contacts: sngContact, mentions: participants.map(a => a.id)}, {ephemeralExpiration: 86400})
}
break
case 'flux': {
    try {
        if (!q) return reply(`⚠️ Example: *${prefix + command} car*`)

        await EliteProTech.sendMessage(m.chat, {
            react: { text: '🎨', key: m.key }
        })

        const apiUrl = `https://omegatech-api.dixonomega.tech/api/ai/magicstudio?prompt=${encodeURIComponent(q)}`

        await EliteProTech.sendMessage(m.chat, {
            image: { url: apiUrl },
            caption: `✅ *Flux Image for:* ${q}`
        }, { quoted: m })

        await EliteProTech.sendMessage(m.chat, {
            react: { text: '✅', key: m.key }
        })

    } catch (e) {
        console.error('Error generating flux image')

        await EliteProTech.sendMessage(m.chat, {
            react: { text: '❌', key: m.key }
        })

        reply('❌ Error generating flux image, please try again.')
    }
}
break
case 'tiktok': {
    if (!text) {
        return reply(
            `Please provide a TikTok URL or search keywords.\n\n*Example:*\n${prefix + command} https://vt.tiktok.com/ZSUMvWufM/\n${prefix + command} Dax`
        )
    }
    try {
        await EliteProTech.sendMessage(m.chat, {
            react: { text: "📥", key: m.key }
        });

        if (text.startsWith("http")) {
            const apiUrl = `https://eliteprotech-apis.zone.id/tiktok2?url=${encodeURIComponent(text)}`;
            const { data } = await axios.get(apiUrl);

            if (!data.success || !data.data) {
                return reply("⚠️ Failed to fetch TikTok video.");
            }

            const video = data.data;
            const videoUrl = video.play || video.wmplay;

            if (!videoUrl) {
                return reply("⚠️ No downloadable video found.");
            }

            const caption = `🎬 *TikTok Video*

📝 *Title:* ${video.title || "No title"}
👤 *Author:* ${video.author?.nickname || "Unknown"}
⏱️ *Duration:* ${video.duration || 0}s
❤️ *Likes:* ${Number(video.stats?.digg_count || 0).toLocaleString()}
💬 *Comments:* ${Number(video.stats?.comment_count || 0).toLocaleString()}
🔄 *Shares:* ${Number(video.stats?.share_count || 0).toLocaleString()}
▶️ *Views:* ${Number(video.stats?.play_count || 0).toLocaleString()}

> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴇʟɪᴛᴇ-ᴘʀᴏ-ᴛᴇᴄʜ©*`;

            return await EliteProTech.sendMessage(
                m.chat,
                {
                    video: { url: videoUrl },
                    mimetype: "video/mp4",
                    caption
                },
                { quoted: m }
            );
        }
        const searchUrl = `https://eliteprotech-apis.zone.id/tiktoksearch?q=${encodeURIComponent(text)}`;
        const { data } = await axios.get(searchUrl);

        if (data?.error || !data?.results?.length) {
            return reply("❌ No TikTok videos found.");
        }

        const first = data.results[0];

        const caption = `🔎 *TikTok Search Result*

🎬 *Title:* ${first.title || "No title"}
🕒 *Duration:* ${first.duration || "N/A"}s

> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴇʟɪᴛᴇ-ᴘʀᴏ-ᴛᴇᴄʜ©*`;

        await EliteProTech.sendMessage(
            m.chat,
            {
                video: { url: first.play },
                mimetype: "video/mp4",
                caption
            },
            { quoted: m }
        );

    } catch (err) {
        console.error("TikTok Error:", err);
        reply("❌ An error occurred. Please try again later.");
    }
    break;
}
case 'tiktokstalk': case 'tiktoksearch': {
    if (!text) return reply(`*Example:* ${prefix + command} username`);
    
    try {
        await EliteProTech.sendMessage(m.chat, { react: { text: "🔍", key: m.key } });
        
        const apiUrl = `https://eliteprotech-apis.zone.id/tiktokstalk?username=${encodeURIComponent(text)}`;
        const { data } = await axios.get(apiUrl);
        
        if (!data || data.status !== "success" || !data.data) {
            return reply("⚠️ User not found. Please check the TikTok username.");
        }
        
        const user = data.data;
        
        const userInfo = `
🎯 *TikTok User Info*
👤 Username: ${user.uniqueId}
📝 Nickname: ${user.nickname}
💬 Bio: ${user.bio || "No bio"}
✅ Verified: ${user.verified ? "Yes" : "No"}
🔒 Private: ${user.private ? "Yes" : "No"}
👥 Followers: ${user.followers}
👣 Following: ${user.following}
❤️ Hearts: ${user.hearts}
🎥 Videos: ${user.videos}
🔗 Profile: ${user.profileUrl}
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴇʟɪᴛᴇ-ᴘʀᴏ-ᴛᴇᴄʜ©*
`;
        
        await EliteProTech.sendMessage(m.chat, {
            image: { url: user.avatar },
            caption: userInfo
        }, { quoted: m });
        
    } catch (error) {
        console.error("Error during TikTok search:", error);
        reply("❌ An error occurred while searching TikTok user.");
    }
    break;
}
case 'mediafire': {
    if (!text) return reply(`*Example:* ${prefix + command} https://www.mediafire.com/file/rmpx6iv7kiboki3/ELITEPRO-master+(2).zip/file`);
    
    try {
        await EliteProTech.sendMessage(m.chat, { react: { text: `📥`, key: m?.key } });
        
        const apiUrl = `https://eliteprotech-apis.zone.id/mediafire?url=${encodeURIComponent(text)}`;
        const { data } = await axios.get(apiUrl);

        if (data?.status && data?.download) {
            const {
                name,
                filename,
                mimetype,
                size,
                download
            } = data;

            await EliteProTech.sendMessage(
                m.chat,
                {
                    document: { url: download },
                    mimetype: mimetype || 'application/octet-stream',
                    fileName: filename || name || 'file',
                    caption: `📦 *File Name:* ${name}\n📁 *Size:* ${size}\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴇʟɪᴛᴇ-ᴘʀᴏ-ᴛᴇᴄʜ©*`
                },
                { quoted: m }
            );
        } else {
            reply(`❌ *Failed to fetch file details!*\nPlease check the MediaFire URL and try again.`);
        }
    } catch (error) {
        console.error('Error during MediaFire command:', error);
        reply(`⚠️ *An error occurred while processing your request.*\nPlease try again later.`);
    }
    break;
}
case 'wallpaper': {
  if (!text) {
    return reply(`*𝙿𝚛𝚎𝚏𝚒𝚡:* ${command} Naruto`);
  }
  
  function getRandomIndexes(max, count) {
    const indexes = [];
    while (indexes.length < count && indexes.length < max) {
      const rand = Math.floor(Math.random() * max);
      if (!indexes.includes(rand)) indexes.push(rand);
    }
    return indexes;
  }
  
  try {
    const apiUrl = `https://weeb-api.vercel.app/wallpaper?query=${encodeURIComponent(text)}`;
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      return reply(`*ERROR!!*\n\n> Failed to fetch wallpapers. Status: ${response.status}`);
    }
    
    const imageUrls = await response.json();
    
    if (!imageUrls.length) {
      return reply(`No wallpapers found for "${text}". Try a different keyword.`);
    }
    
    const maxResults = Math.min(imageUrls.length, 5); // send up to 5 wallpapers
    const randomIndexes = getRandomIndexes(imageUrls.length, maxResults);
    const selectedImages = randomIndexes.map(i => imageUrls[i]);
    
    for (let i = 0; i < selectedImages.length; i++) {
      await EliteProTech.sendMessage(m.chat, {
        image: { url: selectedImages[i] },
        caption: `🎨 *Wallpaper Search*\n\n📄 Search: "${text}"\n🖼 Wallpaper ${i + 1}/${maxResults}\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴇʟɪᴛᴇ-ᴘʀᴏ-ᴛᴇᴄʜ©*`,
      }, { quoted: m });
    }
  } catch (error) {
    console.error('Wallpaper Error:', error);
    reply(`*AN ERROR OCCURRED!!*\n\n> ${error.message || error}`);
  }
  break;
}
case 'getpp': {
    let target = m.sender;
    const defaultPP = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png';
    
    if (m.quoted && m.quoted.sender) {
        target = m.quoted.sender;
    } else if (m.mentionedJid && m.mentionedJid.length > 0) {
        target = m.mentionedJid[0];
    } else if (args[0]) {
        let number = args[0].replace(/[^0-9]/g, '');
        if (!number) return reply('Provide a valid number.');
        target = number + '@s.whatsapp.net';
    } else if (!m.isGroup) {
        target = m.key.fromMe ? m.chat : m.sender;
    } else if (m.isGroup) {
        let groupPP;
        try {
            groupPP = await EliteProTech.profilePictureUrl(m.chat, 'image');
        } catch {
            groupPP = defaultPP;
        }
        
        return await EliteProTech.sendMessage(m.chat, {
            image: { url: groupPP },
            caption: `*Group Profile Picture*`
        }, { quoted: m });
    }
    
    let pp;
    try {
        pp = await EliteProTech.profilePictureUrl(target, 'image');
    } catch {
        pp = defaultPP;
    }
    
    await EliteProTech.sendMessage(m.chat, {
        image: { url: pp },
        caption: `*@${target.split('@')[0]} profile picture*`,
        mentions: [target]
    }, { quoted: m });
}
break
case 'getgrouppp': case 'groupprofile': {
    if (!args[0]) return reply('Provide a group invite link or group JID.');
    
    const defaultPP = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png';
    let groupJid;
    
    const input = args[0];
    
    if (input.includes('chat.whatsapp.com/')) {
        const inviteCode = input.split('chat.whatsapp.com/')[1];
        try {
            const groupInfo = await EliteProTech.groupGetInviteInfo(inviteCode);
            groupJid = groupInfo.id;
        } catch {
            return reply('Invalid or expired group link.');
        }
    } else if (input.endsWith('@g.us')) {
        groupJid = input;
    } else {
        return reply('Invalid input. Provide a valid group link or JID.');
    }
    
    let groupPP;
    try {
        groupPP = await EliteProTech.profilePictureUrl(groupJid, 'image');
    } catch {
        groupPP = defaultPP;
    }
    
    await EliteProTech.sendMessage(m.chat, {
        image: { url: groupPP },
        caption: `*Group Profile Picture*`
    }, { quoted: m });
}
break
case 'quotes':
const quoteelitey = await axios.get(`https://favqs.com/api/qotd`)
        const textquotes = `*${themeemoji} Quote:* ${quoteelitey.data.quote.body}\n\n*${themeemoji} Author:* ${quoteelitey.data.quote.author}`
return reply(textquotes)
break
case 'fact': {
    	const { data } = await axios.get(`https://nekos.life/api/v2/fact`)
        return reply(`${themeemoji} *Fact:* ${data.fact}\n`)   
}
break
case 'play':
case 'ytmp3': {
    if (!text) return reply(`*Example:* ${prefix + command} Faded by Alan Walker`);
    try {
        await EliteProTech.sendMessage(m.chat, {
            react: { text: '🎵', key: m.key }
        });
        const ytRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/i;
        let video;
        let videoUrl;
        if (ytRegex.test(text)) {
            videoUrl = text;
        } else {
            const search = await yts(text);
            video = search.videos[0];
            if (!video) {
                await EliteProTech.sendMessage(m.chat, {
                    react: { text: '❌', key: m.key }
                });
                return reply(`*No results found for:* ${text}`);
            }
            videoUrl = video.url;
        }
        if (video) {
            const body = `╭━━━━━━━━━
┃ *ELITEPRO MUSIC - DOWNLOADER*

> *ᴛɪᴛʟᴇ:* ${video.title}

┃ *ᴠɪᴇᴡꜱ:* ${video.views}
┃ *ᴅᴜʀᴀᴛɪᴏɴ:* ${video.timestamp}
┃ *ᴜᴘʟᴏᴀᴅᴇᴅ:* ${video.ago}

> *ᴜʀʟ:* ${videoUrl}

┃ *Enjoy your music®*
╰━━━━━━━━━━━━━━━━━━┈⊷
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴇʟɪᴛᴇ-ᴘʀᴏ-ᴛᴇᴄʜ©*`;
            await EliteProTech.sendMessage(m.chat, {
                image: { url: video.thumbnail },
                caption: body
            }, { quoted: m });
        }
        const apiUrl = `https://eliteprotech-apis.zone.id/ytmp3?url=${encodeURIComponent(videoUrl)}`;
        const { data } = await axios.get(apiUrl, {
            timeout: 120000
        });
        if (!data?.status || !data?.download?.downloadUrl) {
            await EliteProTech.sendMessage(m.chat, {
                react: { text: '❌', key: m.key }
            });
            return reply('*❌ Failed to fetch the song! Try again later.*');
        }
        const title = data.download.title || video?.title || 'ElitePro Music';
        const fileName = `${title.replace(/[\\/:*?"<>|]/g, '')}.mp3`;
        const audioResponse = await axios.get(data.download.downloadUrl, {
            responseType: 'arraybuffer',
            timeout: 120000,
            maxContentLength: 50 * 1024 * 1024,
            maxBodyLength: 50 * 1024 * 1024
        });
        const audioBuffer = Buffer.from(audioResponse.data);
        await EliteProTech.sendMessage(m.chat, {
            audio: audioBuffer,
            mimetype: 'audio/mpeg',
            fileName,
            ptt: false
        }, { quoted: m });
        await EliteProTech.sendMessage(m.chat, {
            react: { text: '✅', key: m.key }
        });
    } catch (error) {
        console.error('Play command error:', error);
        await EliteProTech.sendMessage(m.chat, {
            react: { text: '⚠️', key: m.key }
        });
        return reply('_*An error occurred while downloading the song.*_');
    }
}
break
case 'video':
case 'ytmp4': {
    if (!text) return reply(`*Example:* ${prefix + command} Faded by Alan Walker`);

    try {
        await EliteProTech.sendMessage(m.chat, {
            react: { text: `📽️`, key: m.key }
        });

        const ytRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//i;

        let video;
        let videoUrl;
        let videoTitle = '';
        let videoThumb = '';

        if (ytRegex.test(text)) {
            videoUrl = text;
            videoTitle = "Requested YouTube Video";

            const match = videoUrl.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/);
            if (match) {
                videoThumb = `https://i.ytimg.com/vi/${match[1]}/hqdefault.jpg`;
            }
        } else {
            const search = await yts(text);
            video = search.videos[0];

            if (!video) return reply(`❌ No results found for: ${text}`);

            videoUrl = video.url;
            videoTitle = video.title;
            videoThumb = video.thumbnail;

            const info = `╭━━━━━━━━━\n` +
                `┃ *ELITEPRO VIDEO - DOWNLOADER*\n\n` +
                `> *ᴛɪᴛʟᴇ:* ${video.title}\n\n` +
                `┃ *ᴠɪᴇᴡꜱ:* ${video.views}\n` +
                `┃ *ᴅᴜʀᴀᴛɪᴏɴ:* ${video.timestamp}\n` +
                `┃ *ᴜᴘʟᴏᴀᴅᴇᴅ:* ${video.ago}\n\n` +
                `> *ᴜʀʟ:* ${video.url}\n\n` +
                `┃ *Enjoy your video®*\n` +
                `╰━━━━━━━━━━━━━━━━━━┈⊷\n` +
                `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴇʟɪᴛᴇᴘʀᴏ-ᴛᴇᴄʜ©*`;

            await EliteProTech.sendMessage(m.chat, {
                image: { url: video.thumbnail },
                caption: info
            }, { quoted: m });
        }

        const apiUrl = `https://api.neosoft.best/api/downloader/youtube?url=${encodeURIComponent(videoUrl)}&type=mp4`;

        const { data } = await axios.get(apiUrl);

        if (!data?.status || !data?.download) {
            return reply('❌ Failed to fetch video download link. Please try again later.');
        }

        await EliteProTech.sendMessage(m.chat, {
            video: { url: data.download },
            mimetype: 'video/mp4',
            caption: `🎬 *${data.title || videoTitle || "YouTube Video"}*\n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴇʟɪᴛᴇ-ᴘʀᴏ-ᴛᴇᴄʜ`
        }, { quoted: m });

        await EliteProTech.sendMessage(m.chat, {
            react: { text: `✅`, key: m.key }
        });

    } catch (error) {
        console.error(error);

        await EliteProTech.sendMessage(m.chat, {
            react: { text: `❌`, key: m.key }
        });

        reply('❌ An error occurred while processing your request.');
    }
    break;
}
case 'anime': {
  if (!text) return reply(`*Example*: ${prefix + command} Anime`);
  
  try {
    await EliteProTech.sendMessage(m.chat, { react: { text: `🎨`, key: m.key } });
    
    const apiUrlForImages = `https://img.hazex.workers.dev/?prompt=${encodeURIComponent(text)}`;
    
    // Generate and send 5 images
    const footer = "\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴇʟɪᴛᴇ-ᴘʀᴏ-ᴛᴇᴄʜ©*";
    for (let i = 0; i < 5; i++) {
      await EliteProTech.sendMessage(m.chat, {
        image: { url: apiUrlForImages }, // URL is already constructed
        caption: footer
      }, { quoted: m });
    }
    
  } catch (error) {
    console.error('Error fetching images:', error);
    reply(`*An error occurred while fetching images. Please try again later.*`);
  }
  break;
}
case 'gpt':
case 'ai':
case 'chatgpt': {
    try {
        let quotedText = '';
        if (m.quoted) {
            quotedText =
                m.quoted.text ||
                m.quoted.caption ||
                m.quoted.message?.conversation ||
                m.quoted.message?.extendedTextMessage?.text ||
                '';
        }
        let userMessage = text?.trim();
        if (!userMessage && quotedText) {
            userMessage = quotedText;
        } else if (userMessage && quotedText) {
            userMessage = `${userMessage}\n\nContext:\n${quotedText}`;
        }
        if (!userMessage) {
            return reply(`Hi ${pushname || 'there'} 👋\nReply to a message or type a question.`);
        }
        const sender = m.sender;
        const msg = await EliteProTech.sendMessage(
            m.chat,
            {
                text: `✦ Generating response @${sender.split('@')[0]}...`,
                mentions: [sender]
            },
            { quoted: m }
        );
        const apiUrl = `https://eliteprotech-apis.zone.id/chatgpt?prompt=${encodeURIComponent(userMessage)}`;
        const { data } = await axios.get(apiUrl, {
            timeout: 60000
        });

        if (!data?.success || !data?.response) {
            return await EliteProTech.sendMessage(
                m.chat,
                {
                    text: '❌ AI failed to generate a response.',
                    edit: msg.key
                }
            );
        }
        const finalText = data.response;
        await EliteProTech.sendMessage(
            m.chat,
            {
                text: finalText,
                edit: msg.key
            }
        );
    } catch (err) {
        console.error('GPT Error:', err);

        reply('❌ AI failed to respond.');
    }
    break;
}
case 'lyrics': {
    if (!q) return reply('Please provide a song name. Usage: .lyrics <song name>');
    
    try {
        const url = `https://eliteprotech-apis.zone.id/lyrics?query=${encodeURIComponent(q)}`;
        const { data } = await axios.get(url);
        
        if (!data.success || !data.result || data.result.length === 0) {
            return reply('No lyrics found for that song.');
        }
        
        const song = data.result[0];
        const caption = `🎵 *${song.trackName || song.name}*\n👤 Artist: ${song.artistName}\n💿 Album: ${song.albumName}\n\n📜 *Lyrics:*\n${song.plainLyrics}`;
        await EliteProTech.sendMessage(from, {
            text: caption
        });
        
    } catch (err) {
        console.error('Lyrics command error:', err);
        reply('❌ Error fetching lyrics. Please try again later.');
    }
}
break
case 'truth': {
  try {
    const apiUrl = 'https://apis.davidcyriltech.my.id/truth';
    const imagePath = 'https://i.ibb.co/gLNc5SGK/ce5871f200bb421678c982f5af52d7fd.jpg'; // 
    const userTag = `@${m.sender.split('@')[0]}`;


    const response = await axios.get(apiUrl);

    if (response.data.status === 200 && response.data.success) {
      const truthQuestion = response.data.question;


      EliteProTech.sendMessage(from, {
        image: { url: imagePath },
        caption: `${userTag}, you chose *TRUTH*!\n\n*Question:* ${truthQuestion}\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴇʟɪᴛᴇ-ᴘʀᴏ-ᴛᴇᴄʜ©*`,
        mentions: [m.sender],
      }, { quoted: m });
    } else {

      reply('Failed to fetch a truth question. Please try again later.');
    }
  } catch (error) {

    if (error.response) {
      reply(`API Error: ${error.response.data.message || 'Unknown API error.'}`);
    } else if (error.request) {
      reply('No response received from the API. Please try again later.');
    } else {
      reply(`An error occurred: ${error.message}`);
    }
  }
  break;
}
case 'yts':
case 'ytsearch': {
    if (!text) return reply(`❌ Example: ${prefix + command} Alan Walker Alone`);
    await EliteProTech.sendMessage(m.chat, {
        react: { text: "⏳", key: m.key }
    });
    try {
        const search = await yts(text);
        if (!search.videos || !search.videos.length) {
            return reply("❌ No results found.");
        }
        const results = search.videos.slice(0, 10);
        let caption = `*YouTube Search*\n\n`;
        caption += `◆ Query: ${text}\n`;
        caption += `◆ Results: ${results.length}\n\n`;
        for (const vid of results) {
            caption += `◆ Title: ${vid.title}
◇ Author: ${vid.author?.name || "Unknown"}
◇ Duration: ${vid.timestamp}
◇ Views: ${Number(vid.views || 0).toLocaleString()}
◇ URL: ${vid.url}

`;
        }
        await EliteProTech.sendMessage(
            m.chat,
            {
                image: {
                    url: results[0].thumbnail
                },
                caption
            },
            {
                quoted: m
            }
        );
        await EliteProTech.sendMessage(m.chat, {
            react: { text: "✅", key: m.key }
        });
    } catch (err) {
        console.error("YTS Error:", err);
        await EliteProTech.sendMessage(m.chat, {
            react: { text: "❌", key: m.key }
        });
        reply(`❌ Error fetching results:\n${err.message}`);
    }
    break;
}
case 'tiny': case 'shorturl': {
  try {
    if (!text) {
      return reply(`Please provide a URL to shorten.\n*Usage:*\n.tiny https://example.com`);
    }
    
    const urlToShorten = text.trim();
    
    if (!urlToShorten) {
      return reply('Please provide a valid URL to shorten.');
    }
    
    // Construct the API URL for TinyURL
    const apiUrl = `https://tinyurl.com/api-create.php?url=${encodeURIComponent(urlToShorten)}`;
    
    // Fetch the shortened URL
    const response = await axios.get(apiUrl);
    
    console.log('API Response:', response.data);
    
    // Send the shortened URL as a message
    await EliteProTech.sendMessage(from, {
      text: `Here is your shortened URL: ${response.data}`,
    }, { quoted: m });
    
  } catch (error) {
    console.error('Error shortening URL:', error.message);
    await EliteProTech.sendMessage(from, {
      text: 'Error shortening URL. Please check the URL format or try again later.',
    }, { quoted: m });
  }
  break;
}
case 'google': {
  try {
    if (!text) {
      return reply('Provide a search term!\nEg: .Google What is treason');
    }
    
    const axios = require("axios");
    const { data } = await axios.get(`https://www.googleapis.com/customsearch/v1?q=${text}&key=AIzaSyDMbI3nvmQUrfjoCJYLS69Lej1hSXQjnWI&cx=baf9bdb0c631236e5`);
    
    if (data.items.length === 0) {
      return reply("❌ Unable to find a result");
    }
    
    let tex = `*GOOGLE SEARCH*\n🔍 *Term:* ${text}\n\n`;
    for (let i = 0; i < data.items.length; i++) {
      tex += `🪧 *Title:* ${data.items[i].title}\n🖥 *Description:* ${data.items[i].snippet}\n🌐 *Link:* ${data.items[i].link}\n\n`;
    }
    
    await EliteProTech.sendMessage(from, {
      text: tex.trim(),
    }, { quoted: m });
    
  } catch (error) {
    console.error('Error occurred:', error);
    await EliteProTech.sendMessage(from, {
      text: '❌ Something went wrong with the Google search.',
    }, { quoted: m });
  }
  break;
}
case 'gitclone': {
    if (!args[0]) return reply(`*Usage:* ${prefix}${command} https://github.com/EliteProTech/ELITE-PRO-V1`)
    if (!isUrl(args[0]) || !args[0].includes('github.com')) return reply(`Invalid GitHub link.`)
    
    try {
        const regex = /github\.com\/([^\/]+)\/([^\/]+)(?:\.git)?/i
        const match = args[0].match(regex)
        
        if (!match) return reply(`❌ Failed to extract user/repo. Make sure the link is correct.`)
        
        const user = match[1]
        const repo = match[2].replace(/(\.git|\/)$/i, '')
        
        const zipUrl = `https://api.github.com/repos/${user}/${repo}/zipball`
        
        // Fallback filename in case HEAD fails
        const filename = `${repo}.zip`
        
        await EliteProTech.sendMessage(m.chat, {
            document: { url: zipUrl },
            fileName: filename,
            mimetype: 'application/zip'
        }, { quoted: m })
        
    } catch (err) {
        console.error(err)
        reply(`❌ Error cloning repo.\n${err.message || err}`)
    }
}
break
case 'welcome': {
    if (!m.isGroup) return reply(mess.group)
    if (!isAdmins && !isGroupOwner && !isCreator) return reply(mess.admin);

    let data = {};
    const welcomeDBPath = './database/welcome.json';
    try {
        data = JSON.parse(fs.readFileSync(welcomeDBPath, 'utf-8'));
    } catch {}

    const chatId = m.chat;

    if (!args[0]) {
        return reply(`*ꕤ Group Welcome Settings*

*This group:* ${data[chatId]?.enabled ? '✅ Enabled' : '❌ Disabled'}
*All groups:* ${Object.keys(data).filter(k => data[k]?.enabled).length} enabled

*✎ Use the command below:*
*${prefix}welcome here* → enable for this group
*${prefix}welcome all* → enable for all groups
*${prefix}welcome disable here* → disable for this group
*${prefix}welcome disable all* → disable for all groups`);
    }

    const option = args[0].toLowerCase();

    switch (option) {
        case 'here':
            data[chatId] = { enabled: true };
            reply(`✅ Welcome messages enabled for this group`);
            break;

        case 'all':
            for (let key of Object.keys(data)) data[key].enabled = true;
            if (!data[chatId]) data[chatId] = { enabled: true };
            reply(`✅ Welcome messages enabled for all groups`);
            break;

        case 'disable':
            if (args[1]?.toLowerCase() === 'here') {
                if (!data[chatId]) data[chatId] = { enabled: false };
                else data[chatId].enabled = false;
                reply(`❌ Welcome messages disabled for this group`);
            } else if (args[1]?.toLowerCase() === 'all') {
                for (let key of Object.keys(data)) data[key].enabled = false;
                reply(`❌ Welcome messages disabled for all groups`);
            } else {
                reply('❌ Invalid option. Use: disable here / disable all');
            }
            break;

        default:
            reply('❌ Invalid option. Use: here / all / disable here / disable all');
            break;
    }

    fs.writeFileSync(welcomeDBPath, JSON.stringify(data, null, 2));
}
break
case 'insult': {
    try {
        const res = await fetch('https://eliteprotech-apis.zone.id/insult')
        
        if (!res.ok) {
            throw new Error(`API request failed with status ${res.status}`)
        }
        
        const json = await res.json()
        
        if (!json.success) {
            return reply('❌ Failed to get an insult.')
        }
        
        const insult = json.insult
        await reply(insult)
        
    } catch (error) {
        console.error(error)
        reply('❌ Failed to fetch an insult. Try again later.')
    }
    break
}
case 'pickupline': {
    try {
        const res = await fetch('https://api.popcat.xyz/pickuplines')
        
        if (!res.ok) {
            throw new Error(`API request failed with status ${res.status}`)
        }
        
        const json = await res.json()
        const pickupLine = `*Here's a pickup line for you:*\n\n${json.pickupline}`
        
        await reply(pickupLine)
    } catch (error) {
        console.error(error)
        reply('❌ Failed to fetch a pickup line. Try again later.')
    }
    break
}
case 'loli': {
  let baseUrl = 'https://weeb-api.vercel.app/'
  const response = await fetch(baseUrl + command)
  const imageBuffer = await response.buffer() // Get the image data as a buffer
  EliteProTech.sendMessage(m.chat, { image: imageBuffer, caption: `Random ${command} for you!✨` }, { quoted: m })
}
break
case 'waifu': {
  let baseUrl = 'https://weeb-api.vercel.app/'
  const response = await fetch(baseUrl + command)
  const imageBuffer = await response.buffer() // Get the image data as a buffer
  EliteProTech.sendMessage(m.chat, { image: imageBuffer, caption: `Random ${command} for you!✨` }, { quoted: m })
}
break
case 'neko': {
  let baseUrl = 'https://weeb-api.vercel.app/'
  const response = await fetch(baseUrl + command)
  const imageBuffer = await response.buffer() // Get the image data as a buffer
  EliteProTech.sendMessage(m.chat, { image: imageBuffer, caption: `Random ${command} for you!✨` }, { quoted: m })
} 
break
case 'ssweb':
case 'screenshot': {
    if (!text) return reply(`📸 Please provide a link!\n\n*Example:* ${prefix + command} https://example.com`)

    let url = text.trim()

    if (!/^https?:\/\//i.test(url)) {
        url = 'https://' + url
    }

    await EliteProTech.sendMessage(m.chat, {
        react: { text: '🖼️', key: m.key }
    })

    try {
        const apiUrl = `https://eliteprotech-apis.zone.id/ssweb?url=${encodeURIComponent(url)}`

        await EliteProTech.sendMessage(
            m.chat,
            {
                image: { url: apiUrl },
                caption: `*Screenshot captured successfully.*\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴇʟɪᴛᴇ-ᴘʀᴏ-ᴛᴇᴄʜ*`
            },
            { quoted: m }
        )

        await EliteProTech.sendMessage(m.chat, {
            react: { text: '✅', key: m.key }
        })

    } catch (error) {
        console.log('SSWeb error:', error.message)

        await EliteProTech.sendMessage(m.chat, {
            react: { text: '❌', key: m.key }
        })

        reply('❌ Failed to capture the screenshot.\nPlease try again later.')
    }
}
break  
case 'vv': {
    if (!m.quoted) return reply(`Reply to a *view-once* image, video, or audio.`);
    
    try {
        // Extract actual view-once message
        let quotedMsg = m.quoted;
        
        // Access the underlying message if it's a view-once
        if (quotedMsg.message?.viewOnceMessageV2) {
            quotedMsg.message = quotedMsg.message.viewOnceMessageV2.message;
        } else if (quotedMsg.message?.viewOnceMessage) {
            quotedMsg.message = quotedMsg.message.viewOnceMessage.message;
        }
        
        const mime = quotedMsg?.mimetype || quotedMsg?.msg?.mimetype || '';
        const media = await quotedMsg.download();
        const caption = quotedMsg.text || quotedMsg.caption || '';
        
        if (/image/.test(mime)) {
            await EliteProTech.sendMessage(m.chat, {
                image: media,
                caption: `${caption}`
            }, { quoted: m });
            
        } else if (/video/.test(mime)) {
            await EliteProTech.sendMessage(m.chat, {
                video: media,
                caption: `${caption}`
            }, { quoted: m });
            
        } else if (/audio/.test(mime)) {
            await EliteProTech.sendMessage(m.chat, {
                audio: media,
                mimetype: 'audio/mp4'
            }, { quoted: m });
            
        } else {
            return reply(`Please reply to a valid *view-once* image, video, or audio.`);
        }
        
    } catch (error) {
        console.error("Error opening view-once message:", error);
        return reply("❌ Failed to process view-once media.");
    }
}
break
case 'vvdm': {
    if (!m.quoted) return reply(`⚠️ Please reply to a *view-once* image, video, or audio.`);
    
    try {
        const ownerNumber = EliteProTech.user.id.split(':')[0] + '@s.whatsapp.net';
        
        await EliteProTech.sendMessage(m.chat, {
            react: { text: "👄", key: m.key }
        });
        
        let quotedMsg = m.quoted;
        
        if (quotedMsg.message?.viewOnceMessageV2) {
            quotedMsg.message = quotedMsg.message.viewOnceMessageV2.message;
        } else if (quotedMsg.message?.viewOnceMessage) {
            quotedMsg.message = quotedMsg.message.viewOnceMessage.message;
        }
        
        const mime = quotedMsg?.mimetype || quotedMsg?.msg?.mimetype || '';
        const media = await quotedMsg.download();
        const caption = quotedMsg.text || quotedMsg.caption || '';
        
        // Send media directly to OWNER’s DM instead of user
        if (/image/.test(mime)) {
            await EliteProTech.sendMessage(ownerNumber, {
                image: media,
                caption: `${caption}`
            }, { quoted: m });
            
        } else if (/video/.test(mime)) {
            await EliteProTech.sendMessage(ownerNumber, {
                video: media,
                caption: `${caption}`
            }, { quoted: m });
            
        } else if (/audio/.test(mime)) {
            await EliteProTech.sendMessage(ownerNumber, {
                audio: media,
                mimetype: 'audio/mp4',
                ptt: false,
                caption: `${caption}`
            }, { quoted: m });
            
        } else {
            return reply(`⚠️ Please reply to a valid *view-once* image, video, or audio.`);
        }
        
        // React ✅ after success
        await EliteProTech.sendMessage(m.chat, {
            react: { text: "✅", key: m.key }
        });
        
    } catch (error) {
        console.error("Error opening view-once message:", error);
        
        // React ❌ on failure
        await EliteProTech.sendMessage(m.chat, {
            react: { text: "❌", key: m.key }
        });
    }
}
break
case 'song': {
    if (!text) return reply(`*Example*: ${prefix + command} Faded by Alan Walker or YouTube URL`);

    try {
        await EliteProTech.sendMessage(m.chat, {
            react: { text: `🎶`, key: m.key }
        });

        let videoUrl;
        let videoTitle;
        let video;
        
        const urlRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;

        if (urlRegex.test(text)) {
            const search = await yts(text);
            video = search.videos[0];

            if (!video) {
                return reply(`❌ Could not retrieve video info from URL.`);
            }

            videoUrl = text;
        } else {
            const search = await yts(text);
            video = search.videos[0];

            if (!video) {
                return reply(`❌ No results found for: ${text}`);
            }

            videoUrl = video.url;
        }

        videoTitle = video.title;

        const apiUrl = `https://eliteprotech-apis.zone.id/ytaudio?url=${encodeURIComponent(videoUrl)}`;

        const { data } = await axios.get(apiUrl);

        if (data?.success && data?.result?.url) {

            const downloadUrl = data.result.url;
            const filename = data.result.filename || `${videoTitle}.mp3`;

            const response = await axios.get(downloadUrl, {
                responseType: 'arraybuffer',
                headers: {
                    'User-Agent': 'Mozilla/5.0',
                    'Accept': 'audio/mpeg,*/*'
                }
            });

            const audioBuffer = Buffer.from(response.data);

            await EliteProTech.sendMessage(m.chat, {
                document: audioBuffer,
                fileName: filename,
                mimetype: 'audio/mpeg',
                caption: `*🎶 Here you go*`,
                contextInfo: {
                    forwardingScore: 999,
                    isForwarded: true
                }
            }, { quoted: m });

            await EliteProTech.sendMessage(m.chat, {
                react: { text: `✅`, key: m.key }
            });

        } else {
            reply(`❌ Failed to fetch the song from API.`);
        }

    } catch (error) {
        console.error('Song Downloader Error:', error);

        await EliteProTech.sendMessage(m.chat, {
            react: { text: `❌`, key: m.key }
        });

        reply(`❌ An error occurred while downloading.`);
    }

    break;
}
case 'animeavatar': {
    waifudd = await axios.get(`https://nekos.life/api/v2/img/avatar`)
    await EliteProTech.sendMessage(m.chat, { image: { url: waifudd.data.url }, caption: mess.success }, { quoted: m }).catch(err => {
      return ('Error!')
    })
  }
  break
  case '8ballpool': {
    waifudd = await axios.get(`https://nekos.life/api/v2/img/8ball`)
    await EliteProTech.sendMessage(m.chat, { image: { url: waifudd.data.url }, caption: mess.success }, { quoted: m }).catch(err => {
      return ('Error!')
    })
  }  
break
case 'stickkill': {
  axios.get(`https://api.waifu.pics/sfw/kill`)
  .then(({ data }) => {
    EliteProTech.sendImageAsSticker(from, data.url, m, { packname: global.packname, author: global.author })
  })
}  
break
case 'animeblush':{
 waifudd = await axios.get(`https://waifu.pics/api/sfw/blush`)       
            await EliteProTech.sendMessage(m.chat, { image: { url:waifudd.data.url} , caption: mess.success}, { quoted:m }).catch(err => {
                    return('Error!')
                })
                }
break
case 'animewave':{
 waifudd = await axios.get(`https://waifu.pics/api/sfw/wave`)       
            await EliteProTech.sendMessage(m.chat, { image: { url:waifudd.data.url} , caption: mess.success}, { quoted:m }).catch(err => {
                    return('Error!')
                })
                }
break
case 'animesmile':{
 waifudd = await axios.get(`https://waifu.pics/api/sfw/smile`)       
            await EliteProTech.sendMessage(m.chat, { image: { url:waifudd.data.url} , caption: mess.success}, { quoted:m }).catch(err => {
                    return('Error!')
                })
                }
break
case 'animepoke':{
 waifudd = await axios.get(`https://waifu.pics/api/sfw/poke`)       
            await EliteProTech.sendMessage(m.chat, { image: { url:waifudd.data.url} , caption: mess.success}, { quoted:m }).catch(err => {
                    return('Error!')
                })
                }
break
case 'animewink':{
 waifudd = await axios.get(`https://waifu.pics/api/sfw/wink`)       
            await EliteProTech.sendMessage(m.chat, { image: { url:waifudd.data.url} , caption: mess.success}, { quoted:m }).catch(err => {
                    return('Error!')
                })
                }
break
case 'animebonk':{
 waifudd = await axios.get(`https://waifu.pics/api/sfw/bonk`)       
            await EliteProTech.sendMessage(m.chat, { image: { url:waifudd.data.url} , caption: mess.success}, { quoted:m }).catch(err => {
                    return('Error!')
                })
                }
break
case 'animebully':{
 waifudd = await axios.get(`https://waifu.pics/api/sfw/bully`)       
            await EliteProTech.sendMessage(m.chat, { image: { url:waifudd.data.url} , caption: mess.success}, { quoted:m }).catch(err => {
                    return('Error!')
                })
                }
break
case 'bible': {
    try {
        if (!text) {
            return reply(`Please specify the chapter number or name. Example: ${prefix + command} john 3:16`)
        }
        
        const query = encodeURIComponent(text)
        const url = `https://eliteprotech-apis.zone.id/bible?q=${query}`
        
        const { data } = await axios.get(url)
        
        if (!data || !data.success) {
            return reply('❌ Verse not found. Check your reference.')
        }
        
        let message = `📖 *${data.title}*\n\n`
        message += `*Reference:* ${data.reference}\n`
        message += `*Version:* ${data.version}\n\n`
        message += `${data.text.trim()}`
        
        reply(message)
    } catch (err) {
        console.error('Bible Error:', err)
        reply('❌ Failed to fetch Bible verse.')
    }
}
  break
  case 'translate':
  case 'trt': {
    if (!q) return reply(`*Where is the text*\n\n*𝙴xample usage*\n*${prefix + command} language id text*\n*${prefix + command} Hello dear how are you?*`)
    const defaultLang = 'en'
    const tld = 'cn'
    let err = `
 *Example:*

*${prefix + command}* id text
*${prefix + command}* en Hello World

≡ *List of supported languages:* 
https://cloud.google.com/translate/docs/languages
`.trim()
    let lang = args[0]
    let text = args.slice(1).join(' ')
    if ((args[0] || '').length !== 2) {
      lang = defaultLang
      text = args.join(' ')
    }
    if (!text && m.quoted && m.quoted.text) text = m.quoted.text
    try {
      let result = await translate(text, { to: lang, autoCorrect: true }).catch(_ => null)
      reply(result.text)
    } catch (e) {
      return reply(err)
    }
  }
break
case 'quran': {
    if (!text) return reply(`🕌 Please enter surah number or name.\n\nExample: ${prefix + command} 1`)

    await EliteProTech.sendMessage(m.chat, {
        react: { text: '🕌', key: m.key }
    })

    try {
        const surahInput = text.trim().toLowerCase()

        const surahListRes = await fetch('https://quran-endpoint.vercel.app/quran')
        const surahList = await surahListRes.json()

        const surahData = surahList.data.find(surah =>
            surah.number === Number(surahInput) ||
            surah.asma?.ar?.short?.toLowerCase() === surahInput ||
            surah.asma?.en?.short?.toLowerCase() === surahInput ||
            surah.asma?.en?.long?.toLowerCase() === surahInput
        )

        if (!surahData) return reply(`❌ Couldn't find surah: ${text}`)

        const res = await fetch(`https://quran-endpoint.vercel.app/quran/${surahData.number}`)
        const json = await res.json()

        if (!res.ok || !json?.data) {
            return reply('❌ Failed to fetch surah details.')
        }

        const tafsir = json.data.tafsir?.id || 'No tafsir available.'

        let translatedTafsirEnglish = { text: tafsir }
        try {
            translatedTafsirEnglish = await translate(tafsir, {
                to: 'en',
                autoCorrect: true
            })
        } catch {}

        const quranSurah = `🕌 *Quran Surah Info*

📜 *Surah ${json.data.number}: ${json.data.asma.ar.long} (${json.data.asma.en.long})*
📌 *Type:* ${json.data.type.en}
🔢 *Verses:* ${json.data.ayahCount}

📖 *Explanation:*
${translatedTafsirEnglish.text}`

        await reply(quranSurah)

        if (json.data.recitation?.full) {
            await EliteProTech.sendMessage(m.chat, {
                audio: { url: json.data.recitation.full },
                mimetype: 'audio/mpeg',
                ptt: false,
                fileName: `Surah-${json.data.number}.mp3`
            }, { quoted: m })
        }

        await EliteProTech.sendMessage(m.chat, {
            react: { text: '✅', key: m.key }
        })

    } catch (error) {
        console.log('Quran error:', error.message)

        await EliteProTech.sendMessage(m.chat, {
            react: { text: '❌', key: m.key }
        })

        reply('❌ Error fetching Quran surah.')
    }
}
  break
  case 'tagadmin': {
    if (!m.isGroup) return reply("This command is for group use only.")
    const groupAdmins = participants.filter(p => p.admin)
    const listAdmin = groupAdmins.map((v, i) => `${i + 1}. @${v.id.split('@')[0]}`).join('\n')
    const owner = groupMetadata.owner || groupAdmins.find(p => p.admin === 'superadmin')?.id || m.chat.split`-` [0] + '@s.whatsapp.net'
    let text = `   
*Group Admins:*
${listAdmin}
`.trim()
    EliteProTech.sendMessage(m.chat, { text: text, mentions: [...groupAdmins.map(v => v.id), owner] }, { quoted: m })
  }  
break
case 'statusd':
case 'save': {
    try {
        if (!m.quoted) return reply(`⚠️ Reply to a WhatsApp status (image, video, audio, or text) you want to save.`);
        
        let mime = (m.quoted.msg || m.quoted).mimetype || '';
        let caption = m.quoted.text || m.quoted.caption || '';
        
        // React ⏳ (processing started)
        await EliteProTech.sendMessage(m.chat, {
            react: { text: "💱", key: m.key }
        });
        
        if (mime) {
            // Handle media statuses
            let media = await m.quoted.download();
            
            if (/image/.test(mime)) {
                await EliteProTech.sendMessage(m.sender, {
                    image: media,
                    caption: `${caption}\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴇʟɪᴛᴇ-ᴘʀᴏ-ᴛᴇᴄʜ©*`
                }, { quoted: m });
            } else if (/video/.test(mime)) {
                await EliteProTech.sendMessage(m.sender, {
                    video: media,
                    caption: `${caption}\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴇʟɪᴛᴇ-ᴘʀᴏ-ᴛᴇᴄʜ©*`
                }, { quoted: m });
            } else if (/audio/.test(mime)) {
                await EliteProTech.sendMessage(m.sender, {
                    audio: media,
                    mimetype: 'audio/mp4',
                    ptt: false,
                    caption: `${caption}\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴇʟɪᴛᴇ-ᴘʀᴏ-ᴛᴇᴄʜ©*`
                }, { quoted: m });
            } else {
                return reply(`⚠️ Unsupported status type.`);
            }
            
        } else if (caption) {
            // Handle text-only status
            await EliteProTech.sendMessage(m.sender, {
                text: `${caption}\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴇʟɪᴛᴇ-ᴘʀᴏ-ᴛᴇᴄʜ©*`
            }, { quoted: m });
        } else {
            return reply(`⚠️ This status has no media or text.`);
        }
        
        // React ✅ (success)
        await EliteProTech.sendMessage(m.chat, {
            react: { text: "✅", key: m.key }
        });
        
    } catch (error) {
        console.error("Error processing status:", error);
        
        // React ❌ (failure)
        await EliteProTech.sendMessage(m.chat, {
            react: { text: "❌", key: m.key }
        });
    }
}
break
case 'tts': {
    if (!text) return reply('Provide text: Hello world')

    try {
        const axios = require('axios')
        const googleTTS = require('google-tts-api')
        const { toPTT } = require('./lib/converter')

        const url = googleTTS.getAudioUrl(text, {
            lang: 'en',
            slow: false,
            host: 'https://translate.google.com',
        })

        const res = await axios.get(url, {
            responseType: 'arraybuffer'
        })

        const voice = await toPTT(Buffer.from(res.data), 'mp3')

        await EliteProTech.sendMessage(
            m.chat,
            {
                audio: voice,
                mimetype: 'audio/ogg; codecs=opus',
                ptt: true
            },
            { quoted: m }
        )

    } catch (err) {
        console.error(err)
        reply('TTS failed.')
    }
}
break
case 'spotifysearch':
case 'sps': {
  if (!text) return reply('❌ Please enter a song name!\nExample: .spotifysearch alan walker')

  try {
    const res = await axios.get(`https://kazztzyy.my.id/api/search/spotify?q=${encodeURIComponent(text)}`)

    if (!res.data.status) return reply('❌ Failed to fetch results.')

    let results = res.data.result
    if (!results.length) return reply('❌ No results found.')

    let teks = `🎵 *SPOTIFY SEARCH*\n\n🔎 Query: ${text}\n\n`

    results.slice(0, 10).forEach((item, i) => {
      teks += `*${i + 1}.* ${item.title}\n`
      teks += `   👤 Artist: ${item.artist}\n`
      teks += `   💿 Album: ${item.album}\n`
      teks += `   ⏱ Duration: ${item.duration}\n`
      teks += `   ⭐ Popularity: ${item.popularity}\n`
      teks += `   📅 Release: ${item.releaseDate}\n`
      teks += `   🔗 Link: ${item.trackUrl}\n\n`
    })

    // send with thumbnail of first result
    await EliteProTech.sendMessage(m.chat, {
      image: { url: results[0].imageUrl },
      caption: teks
    }, { quoted: m })

  } catch (e) {
    console.log(e)
    reply('❌ Error fetching Spotify results.')
  }
}
break
case 'spotify':
case 'splay': {
    try {
        if (!text) {
            return reply(`⚠️ Example:\n${prefix + command} alan walker alone\n${prefix + command} https://open.spotify.com/track/...`)
        }
        
        await EliteProTech.sendMessage(m.chat, {
            react: { text: '🎧', key: m.key }
        })

        let spotifyUrl = text

        if (!text.includes('open.spotify.com')) {
            const searchApi = `https://kazztzyy.my.id/api/search/spotify?q=${encodeURIComponent(text)}`
            const searchRes = await axios.get(searchApi)

            if (!searchRes.data || !searchRes.data.status || !searchRes.data.result.length) {
                return reply('❌ Song not found.')
            }

            const first = searchRes.data.result[0]
            spotifyUrl = first.trackUrl
        }

        const apiUrl = `https://eliteprotech-apis.zone.id/spotify?url=${encodeURIComponent(spotifyUrl)}`
        const { data } = await axios.get(apiUrl)

        if (!data || !data.success) {
            return reply('❌ Failed to fetch Spotify track.')
        }

        const meta = data.data.metadata
        const downloadUrl = data.data.download

        await EliteProTech.sendMessage(m.chat, {
            audio: { url: downloadUrl },
            mimetype: 'audio/mpeg',
            fileName: `${meta.title}.mp3`,
            ptt: false,
            contextInfo: {
                externalAdReply: {
                    title: meta.title,
                    body: `${meta.artist} : ${meta.duration}`,
                    thumbnailUrl: meta.images,
                    mediaType: 1,
                    renderLargerThumbnail: false
                }
            }
        }, { quoted: m })

        await EliteProTech.sendMessage(m.chat, {
            react: { text: '✅', key: m.key }
        })

    } catch (err) {
        console.error('Spotify Error:', err)
        reply('❌ Error downloading Spotify track.')
    }
}
break
case 'autoreact':
    case 'auto_react':{
             if (!isCreator) return reply(mess.owner)
               if (args.length < 1) return reply('on/off?')
               if (args[0] === 'on') {
                  autoreact = true
                  reply(`✅ ${command} is enabled`)
               } else if (args[0] === 'off') {
                  autoreact = false
                  reply(`🌀 ${command} is disabled`)
               }
            }
break
case 'chatbot':{
    if(!isCreator)return reply(mess.owner)
    const file='./database/chatbot.json'
    let chatbotData={global:false,dm:false,group:false,chats:{}}
    try{
        chatbotData=JSON.parse(fs.readFileSync(file,'utf8'))
    }catch{}
    chatbotData.chats=chatbotData.chats||{}
    const type=(args[0]||'').toLowerCase()
    const action=(args[1]||'').toLowerCase()
    const chatId=m.chat
    if(!type||type==='help'){
        return reply(`🤖 *CHATBOT SETTINGS*

*${prefix}chatbot dm on*
Enable chatbot for all DMs

*${prefix}chatbot dm off*
Disable chatbot for all DMs

*${prefix}chatbot group on*
Enable chatbot for all groups

*${prefix}chatbot group off*
Disable chatbot for all groups

*${prefix}chatbot chat on*
Enable chatbot for this chat only

*${prefix}chatbot chat off*
Disable chatbot for this chat only

*${prefix}chatbot all on*
Enable chatbot everywhere

*${prefix}chatbot all off*
Disable chatbot everywhere

*${prefix}chatbot status*
Show chatbot status`)
    }
    if(type==='status'){
        return reply(`🤖 *CHATBOT STATUS*

🌍 All: ${chatbotData.global?'✅ ON':'❌ OFF'}
💬 DMs: ${chatbotData.dm?'✅ ON':'❌ OFF'}
👥 Groups: ${chatbotData.group?'✅ ON':'❌ OFF'}
📌 Current chat: ${chatbotData.chats[chatId]?'✅ ON':'❌ OFF'}`)
    }
    if(type==='dm'){
        if(action==='on'){
            chatbotData.dm=true
            fs.writeFileSync(file,JSON.stringify(chatbotData,null,2))
            return reply('✅ Chatbot enabled for all DMs')
        }
        if(action==='off'){
            chatbotData.dm=false
            fs.writeFileSync(file,JSON.stringify(chatbotData,null,2))
            return reply('❌ Chatbot disabled for all DMs')
        }
    }
    if(type==='group'){
        if(action==='on'){
            chatbotData.group=true
            fs.writeFileSync(file,JSON.stringify(chatbotData,null,2))
            return reply('✅ Chatbot enabled for all groups')
        }
        if(action==='off'){
            chatbotData.group=false
            fs.writeFileSync(file,JSON.stringify(chatbotData,null,2))
            return reply('❌ Chatbot disabled for all groups')
        }
    }
    if(type==='chat'){
        if(action==='on'){
            chatbotData.chats[chatId]=true
            fs.writeFileSync(file,JSON.stringify(chatbotData,null,2))
            return reply('✅ Chatbot enabled for this chat only')
        }
        if(action==='off'){
            delete chatbotData.chats[chatId]
            fs.writeFileSync(file,JSON.stringify(chatbotData,null,2))
            return reply('❌ Chatbot disabled for this chat')
        }
    }
    if(type==='all'){
        if(action==='on'){
            chatbotData.global=true
            fs.writeFileSync(file,JSON.stringify(chatbotData,null,2))
            return reply('🌍 Chatbot enabled for all DMs and groups')
        }
        if(action==='off'){
            chatbotData.global=false
            chatbotData.dm=false
            chatbotData.group=false
            chatbotData.chats={}
            fs.writeFileSync(file,JSON.stringify(chatbotData,null,2))
            return reply('⛔ Chatbot disabled everywhere')
        }
    }
    return reply(`❌ Invalid option.

Use:
${prefix}chatbot dm on
${prefix}chatbot dm off
${prefix}chatbot group on
${prefix}chatbot group off
${prefix}chatbot chat on
${prefix}chatbot chat off
${prefix}chatbot all on
${prefix}chatbot all off
${prefix}chatbot status`)
}
break;
case 'antilink': {
if (!m.isGroup) return reply(mess.group)
if (!isAdmins && !isGroupOwner && !isCreator) return reply(mess.admin)
if (!isBotAdmins) return reply(mess.botAdmin)

let antilinkData = {}
try {
    antilinkData = JSON.parse(fs.readFileSync('./database/antilink.json'))
} catch (err) {
    console.error('Error loading antilink.json:', err)
}

if (!antilinkData[m.chat]) {
    antilinkData[m.chat] = {
        enabled: false,
        action: 'warn',
        warnings: {}
    }
}

if (!args[0]) {
    return EliteProTech.sendMessage(m.chat, {
        image: elitepropic,
        caption: `⿻ *ANTILINK SETTINGS*

🔘 Status: *${antilinkData[m.chat].enabled ? 'ON' : 'OFF'}*
⚙️ Action: *${antilinkData[m.chat].action.toUpperCase()}*

╭───────────────━⊷
┃ .antilink on
┃ .antilink off
┃ .antilink action warn
┃ .antilink action delete
┃ .antilink action kick
╰───────────────━⊷`
    }, { quoted: m })
}

if (args[0].toLowerCase() === 'on') {
    antilinkData[m.chat].enabled = true
    antilinkData[m.chat].warnings = {}

    fs.writeFileSync(
        './database/antilink.json',
        JSON.stringify(antilinkData, null, 2)
    )

    return EliteProTech.sendMessage(m.chat, {
        image: elitepropic,
        caption: `✅ *ANTILINK ENABLED*

╭───────────────━⊷
┃ delete → Delete link only
┃ warn → 4 warnings then kick
┃ kick → Instant removal
╰───────────────━⊷

⚙️ Current Action: *${antilinkData[m.chat].action.toUpperCase()}*`
    }, { quoted: m })
}

if (args[0].toLowerCase() === 'off') {
    antilinkData[m.chat].enabled = false
    antilinkData[m.chat].warnings = {}

    fs.writeFileSync(
        './database/antilink.json',
        JSON.stringify(antilinkData, null, 2)
    )

    return EliteProTech.sendMessage(m.chat, {
        image: elitepropic,
        caption: '🔄 *ANTILINK DISABLED!*\n\nLinks are now allowed in this group.'
    }, { quoted: m })
}

if (args[0].toLowerCase() === 'action' && args[1]) {
    const action = args[1].toLowerCase()

    if (!['delete', 'warn', 'kick'].includes(action)) {
        return reply('❌ Invalid action. Use: delete, warn, or kick')
    }

    antilinkData[m.chat].action = action

    fs.writeFileSync(
        './database/antilink.json',
        JSON.stringify(antilinkData, null, 2)
    )

    return EliteProTech.sendMessage(m.chat, {
        image: elitepropic,
        caption: `⚙️ *ANTILINK ACTION UPDATED*

New Action: *${action.toUpperCase()}*`
    }, { quoted: m })
}

return reply(`❌ Invalid option.

Example:
.antilink on
.antilink off
.antilink action warn
.antilink action delete
.antilink action kick`)
}
break
case 'autolikestatus': {
             if (!isCreator) return reply(mess.owner)
               if (args.length < 1) return reply('Please include an on/off toggle for autolikestatus.')
               if (args[0] === 'on') {
                  autolikestatus = true
                  reply(`Autolikestatus has been turned on! 🟢`)
               } else if (args[0] === 'off') {
                  autolikestatus = false
                  reply(`Autolikestatus has been turned off! 🔴`)
               }
            }
break  
case 'gcalert':
if (!m.isGroup) return reply(mess.group)
if (!isAdmins && !isGroupOwner && !isCreator) return reply(mess.admin)
if (!isBotAdmins) return reply(mess.botAdmin) 

let message = args.join(" "); // The broadcast message
if (!message) return reply('Please provide a message to broadcast.');

// Fetch group participants
let groupParticipants = groupMetadata.participants.map(p => p.id);

// Notify user about the process
await reply(`📢 Sending message to ${groupParticipants.length} members. Please wait...`);

try {
  // Loop through participants in batches of 5 with a 2-second delay
  const batchSize = 5;
  for (let i = 0; i < groupParticipants.length; i += batchSize) {
    let batch = groupParticipants.slice(i, i + batchSize);
    
    // Send messages to the current batch
    await Promise.all(batch.map(participant =>
      EliteProTech.sendMessage(participant, { text: `*GROUP BROADCAST*\n*Message:* ${message}\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴇʟɪᴛᴇ-ᴘʀᴏ-ᴛᴇᴄʜ©*`})
    ));
    
    // Add a delay before the next batch
    if (i + batchSize < groupParticipants.length) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // 2-second delay
    }
  }
  
  // Send final confirmation message
  reply(`✅ Successfully sent the message to all ${groupParticipants.length} members.`);
} catch (err) {
  reply('❌ An error occurred while broadcasting: ' + json(err));
}   
break
case 'demoteall':
if (!m.isGroup) return reply(mess.group)
if (!isAdmins && !isGroupOwner && !isCreator) return reply(mess.admin)
if (!isBotAdmins) return reply(mess.botAdmin)
    
    // Fetch group participants and filter out bot and group owner
    let adminParticipants = groupMetadata.participants
      .filter(p => p.admin === 'admin') // Select only admins
      .map(p => p.id)
      .filter(id => id !== botNumber && id !== m.sender); // Exclude bot and group owner
    
    if (adminParticipants.length === 0) {
      return reply(`There's is no admin to demote just you.`);
    }
    
    // Notify the user about the demotion process
    reply(`🔄 Demoting ${adminParticipants.length} admin members. Please wait...`);
    
    try {
      let demotedCount = 0;
      // Demote admin participants with a delay
      for (let i = 0; i < adminParticipants.length; i++) {
        let participant = adminParticipants[i];
        await EliteProTech.groupParticipantsUpdate(m.chat, [participant], 'demote');
        demotedCount++;
        
        // Add a 1-second delay before the next demotion
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // Send final confirmation message
      reply(`✅ Successfully demoted ${demotedCount} admin members!`);
      
    } catch (err) {
      reply('An error occurred while demoting members: ' + json(err));
    }
break
case 'promoteall':
if (!m.isGroup) return reply(mess.group)
if (!isAdmins && !isGroupOwner && !isCreator) return reply(mess.admin)
if (!isBotAdmins) return reply(mess.botAdmin)
    
    // Filter non-admin members from group participants
    let nonAdmins = groupMetadata.participants.filter(p => !p.admin).map(p => p.id);
    
    if (nonAdmins.length === 0) return reply('All participants are already admins.');
    
    // Notify the user about the promotion
    reply(`Promoting ${nonAdmins.length} members to admin. Please wait...`);
    
    try {
      // Promote non-admin members to admin with a 1-second delay
      let successCount = 0;
      for (let i = 0; i < nonAdmins.length; i++) {
        let participant = nonAdmins[i];
        await EliteProTech.groupParticipantsUpdate(m.chat, [participant], 'promote');
        successCount++;
        
        // Add a 1-second delay before the next promotion
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // Send final confirmation message
      reply(`✅ Successfully promoted ${successCount} members to admin!`);
      
    } catch (err) {
      reply('An error occurred while promoting members: ' + json(err));
    }
break
case 'kickall': {
  if (!m.isGroup) return reply(mess.group)
  if (!isAdmins && !isGroupOwner && !isCreator) return reply(mess.admin)
  if (!isBotAdmins) return reply(mess.botAdmin)

  const botJid = EliteProTech.user.id.split(':')[0] + '@s.whatsapp.net'
  const senderJid = m.sender

  let participantsToRemove = groupMetadata.participants
    .map(p => p.jid)
    .filter(jid => jid !== botJid && jid !== senderJid)

  if (participantsToRemove.length === 0) {
    return reply('No eligible members to remove, or I cannot remove myself or you.')
  }

  reply(`🔄 Removing ${participantsToRemove.length} members from the group. Please wait...`)

  try {
    let removedCount = 0

    for (let jid of participantsToRemove) {
      await EliteProTech.groupParticipantsUpdate(m.chat, [jid], 'remove')
      removedCount++
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    reply(`✅ Successfully removed ${removedCount} members from the group!`)
  } catch (err) {
    reply('❌ Error while removing members:\n' + JSON.stringify(err, null, 2))
  }
}
break
case 'addall':
if (!m.isGroup) return reply(mess.group)
if (!isAdmins && !isGroupOwner && !isCreator) return reply(mess.admin)
if (!isBotAdmins) return reply(mess.botAdmin)
if (!text) return reply('Please provide numbers to add, separated by commas.\nExample: addall 2347047504860,2347047504861')

let numbers = text.match(/\d{10,}/g) || []
if (numbers.length === 0) return reply('No valid numbers found.')

let addedCount = 0
let failed = []

reply(`🔄 Adding ${numbers.length} members to the group...`)

for (let number of numbers) {
  let jid = number + '@s.whatsapp.net'
  try {
    await EliteProTech.groupParticipantsUpdate(m.chat, [jid], 'add')
    addedCount++
    await new Promise(resolve => setTimeout(resolve, 1000)) // 1s delay
  } catch (err) {
    failed.push(number)
  }
}

reply(`✅ Added: ${addedCount}\n❌ Failed: ${failed.length > 0 ? failed.join(', ') : 'None'}`)
break;
case 'pinterest': {
    await EliteProTech.sendMessage(m.chat, { react: { text: "📌", key: m.key } });

    if (!text) {
        return reply(`📌 Example:
• Download: ${prefix + command} https://pin.it/1YSo1okSW
• Search: ${prefix + command} A guy in hoodie`);
    }

    try {
        // Check if the input is a Pinterest link or search query
        if (text.includes("pinterest.com") || text.includes("pin.it")) {
            // DOWNLOAD MODE
            let apiUrl = `https://apis.prexzyvilla.site/download/pinterestV2?url=${encodeURIComponent(text)}`;
            let res = await fetchJson(apiUrl);

            if (!res || !res.status || !res.data) {
                return reply("⚠️ Failed to fetch Pinterest media. Please check the link and try again.");
            }

            let { thumb, video, image } = res.data;

            if (video) {
                await EliteProTech.sendMessage(
                    m.chat,
                    {
                        video: { url: video },
                        mimetype: "video/mp4",
                        caption: `🎬 *Pinterest Video Downloaded!*\n> *Powered by ᴇʟɪᴛᴇ-ᴘʀᴏ-ᴛᴇᴄʜ*`
                    },
                    { quoted: m }
                );
            } else if (image) {
                await EliteProTech.sendMessage(
                    m.chat,
                    {
                        image: { url: image },
                        caption: `🖼️ *Pinterest Image Downloaded!*\n> *Powered by ᴇʟɪᴛᴇ-ᴘʀᴏ-ᴛᴇᴄʜ*`
                    },
                    { quoted: m }
                );
            } else {
                reply("⚠️ No downloadable media found in this Pinterest link.");
            }
        } else {
            // SEARCH MODE
            let searchUrl = `https://ab-pinetrest.abrahamdw882.workers.dev/?query=${encodeURIComponent(text)}`;
            let result = await fetchJson(searchUrl);

            if (!result || !result.status || !result.data || result.data.length === 0) {
                return reply(`⚠️ No results found for: *${text}*`);
            }

            let pins = result.data.slice(0, 10); // Limit to top 10 for readability
            let msg = `🔎 *Pinterest Search Results for:* _${text}_\n\n`;

            for (let pin of pins) {
                msg += `📌 *${pin.title || "No title"}*\n👤 *Uploader:* ${pin.uploader?.full_name || "Unknown"}\n🔗 ${pin.pin_url}\n\n`;
            }

            await EliteProTech.sendMessage(m.chat, { text: msg.trim() }, { quoted: m });

            // Send preview images
            for (let pin of pins.slice(0, 5)) {
                await EliteProTech.sendMessage(
                    m.chat,
                    {
                        image: { url: pin.image },
                        caption: `📌 *${pin.title || "No title"}*\n👤 *${pin.uploader?.full_name || "Unknown"}*\n🔗 ${pin.pin_url}\n> *Powered by ᴇʟɪᴛᴇ-ᴘʀᴏ-ᴛᴇᴄʜ*`
                    },
                    { quoted: m }
                );
            }
        }
    } catch (err) {
        console.error("Pinterest error:", err);
        reply("❌ An error occurred while processing your Pinterest request.");
    }
}
break
case 'flirt': {
    try {
        let apiUrl = `https://api.giftedtech.web.id/api/fun/flirt?apikey=gifted`;
        let res = await fetchJson(apiUrl);
        
        if (!res || !res.success || !res.result) {
            return reply("❌ Failed to fetch a flirt line. Try again later.");
        }
        
        await EliteProTech.sendMessage(m.chat, {
            text: `💘 *Flirty Line:*\n\n${res.result}\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴇʟɪᴛᴇ-ᴘʀᴏ-ᴛᴇᴄʜ*`
        }, { quoted: m });
        
    } catch (err) {
        console.error("Flirt API error:", err);
        reply("❌ Error occurred while getting flirt line.");
    }
}
break
case 'hdwallpaper': {
    if (!text) {
        return reply(`Example: ${prefix + command} Mountains`);
    }
    
    try {
        let apiUrl = `https://api.giftedtech.web.id/api/search/wallpaper?apikey=gifted&query=${encodeURIComponent(text)}`;
        let res = await fetchJson(apiUrl);
        
        if (!res || !res.success || !res.results || res.results.length === 0) {
            return reply("❌ No wallpaper results found.");
        }
        
        // Shuffle and pick 5 random wallpapers
        let shuffled = res.results.sort(() => 0.5 - Math.random());
        let selected = shuffled.slice(0, 5);
        
        for (let i = 0; i < selected.length; i++) {
            let img = selected[i];
            let imageUrl = img.image[0] || img.image;
            let type = img.type || 'Wallpaper';
            
            let imgRes = await fetch(imageUrl);
            let buffer = await imgRes.buffer();
            
            await EliteProTech.sendMessage(m.chat, {
                image: buffer,
                caption: `🖼️ *Wallpaper Result ${i + 1}/5*\n\n📌 *Type:* ${type}\n🔍 *Query:* ${text}\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴇʟɪᴛᴇ-ᴘʀᴏ-ᴛᴇᴄʜ*`
            }, { quoted: m });
        }
        
    } catch (err) {
        console.error("Wallpaper API error:", err);
        reply("❌ Error occurred while fetching wallpapers.");
    }
}
break
case 'lyrics': {
    if (!text) {
        return reply(`Example: ${prefix + command} Faded Alan Walker`);
    }
    
    try {
        let apiUrl = `https://api.nexoracle.com/search/lyrics?apikey=34e93682c3603be0f9&q=${encodeURIComponent(text)}`;
        let res = await fetchJson(apiUrl);
        
        if (!res || res.status !== 200 || !res.result || !res.result.lyrics) {
            return reply(`Please provide both song title and artist, e.g.:* ${prefix + command} faded | Alan Walker`);
        }
        
        let { title, lyrics } = res.result;
        
        await EliteProTech.sendMessage(m.chat, {
            text: `🎶 *Lyrics Found!*\n\n🎤 *Title:* ${title}\n\n📝 *Lyrics:*\n${lyrics}\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴇʟɪᴛᴇ-ᴘʀᴏ-ᴛᴇᴄʜ*`
        }, { quoted: m });
        
    } catch (err) {
        console.error("NexOracle Lyrics API error:", err);
        reply("❌ Error occurred while fetching lyrics.");
    }
}
break
case 'clearchat': {
    if (!isCreator) return reply(mess.owner)
    
    try {
        await EliteProTech.chatModify({
            delete: true,
            lastMessages: [
                {
                    key: m.key,
                    messageTimestamp: m.messageTimestamp
                }
            ]
        }, m.chat);

        reply(`✅ Chat cleared successfully.`);
    } catch (err) {
        reply(`❌ Failed to clear chat: ${err.message}`);
    }
}
break
case 'image':
case 'img': {
    if (!text) return reply('📸 Please enter a search term!\n\nExample:\nimg car')

    await EliteProTech.sendMessage(m.chat, {
        react: { text: '⏳', key: m.key }
    })

    try {
        const res = await axios.get(`https://eliteprotech-apis.zone.id/bingimg?q=${encodeURIComponent(text)}`)

        if (!res.data?.status || !Array.isArray(res.data.results) || res.data.results.length === 0) {
            await EliteProTech.sendMessage(m.chat, {
                react: { text: '❌', key: m.key }
            })
            return reply('❌ No images found.')
        }

        const selected = res.data.results.sort(() => 0.5 - Math.random()).slice(0, 5)

        let failed = 0

        const cards = await Promise.all(
            selected.map(async (item, index) => {
                try {
                    if (!item.image) return null

                    const response = await axios.get(item.image, {
                        responseType: 'arraybuffer',
                        timeout: 15000
                    })

                    const buffer = Buffer.from(response.data)

                    const imageMessage = (
                        await generateWAMessageContent(
                            { image: buffer },
                            { upload: EliteProTech.waUploadToServer }
                        )
                    ).imageMessage

                    return {
                        header: {
                            title: `🖼️ Image ${index + 1}`,
                            hasMediaAttachment: true,
                            imageMessage
                        },
                        body: {
                            text: `🔎 *${res.data.query}*\n${item.title || ''}`
                        },
                        footer: {
                            text: '> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴇʟɪᴛᴇ-ᴘʀᴏ-ᴛᴇᴄʜ©*'
                        },
                        nativeFlowMessage: {
                            buttons: [
                                {
                                    name: 'cta_url',
                                    buttonParamsJson: JSON.stringify({
                                        display_text: 'Open',
                                        url: item.image
                                    })
                                },
                                {
                                    name: 'cta_copy',
                                    buttonParamsJson: JSON.stringify({
                                        display_text: 'Copy URL',
                                        copy_code: item.image
                                    })
                                }
                            ]
                        }
                    }

                } catch {
                    failed++
                    return null
                }
            })
        )

        const validCards = cards.filter(Boolean)

        if (!validCards.length) {
            await EliteProTech.sendMessage(m.chat, {
                react: { text: '❌', key: m.key }
            })
            return reply('❌ Failed to process images.')
        }

        const message = generateWAMessageFromContent(
            m.chat,
            {
                viewOnceMessage: {
                    message: {
                        messageContextInfo: {
                            deviceListMetadata: {},
                            deviceListMetadataVersion: 2
                        },
                        interactiveMessage: {
                            body: { text: `🖼️ Results for: *${text}*` },
                            footer: {
                                text: `📂 ${validCards.length}/${res.data.total} images` +
                                      (failed ? ` • ⚠️ ${failed} failed` : '')
                            },
                            carouselMessage: { cards: validCards }
                        }
                    }
                }
            },
            { quoted: m }
        )

        await EliteProTech.relayMessage(m.chat, message.message, {
            messageId: message.key.id
        })

        await EliteProTech.sendMessage(m.chat, {
            react: { text: '✅', key: m.key }
        })

    } catch (err) {
        console.log('Image command error:', err.message)

        await EliteProTech.sendMessage(m.chat, {
            react: { text: '❌', key: m.key }
        })

        reply('❌ Error fetching images.')
    }
    break
}
case 'removebg': {
  try {
    await EliteProTech.sendMessage(m.chat, {
      react: { text: '⏳', key: m.key }
    });

    let imgUrl = text;

    if (!imgUrl && m.quoted) {
      const quotedMsg = m.quoted.message || m.quoted.msg || m.quoted;
      const mime = quotedMsg?.mimetype || '';

      if (/image/.test(mime)) {
        const mediaPath = await EliteProTech.downloadAndSaveMediaMessage(m.quoted);
        imgUrl = await uploadToEliteTempUrl(mediaPath);
        fs.unlinkSync(mediaPath);
      } else {
        await EliteProTech.sendMessage(m.chat, {
          react: { text: '❌', key: m.key }
        });
        return reply(
          `❌ Please reply to an image or provide an image URL.\n\nExample:\n${prefix}removebg https://example.com/image.jpg`
        );
      }
    }

    if (!imgUrl) {
      await EliteProTech.sendMessage(m.chat, {
        react: { text: '❌', key: m.key }
      });
      return reply(
        `❌ Please reply to an image or provide an image URL.\n\nExample:\n${prefix}removebg https://example.com/image.jpg`
      );
    }

    const apiUrl = `https://eliteprotech-apis.zone.id/removebg?url=${encodeURIComponent(imgUrl)}`;
    const response = await axios.get(apiUrl);
    const data = response.data;

    if (!data?.success || !data?.result) {
      await EliteProTech.sendMessage(m.chat, {
        react: { text: '❌', key: m.key }
      });
      return reply('❌ Failed to remove background.');
    }

    await EliteProTech.sendMessage(
      m.chat,
      {
        image: { url: data.result },
        caption: '✅ Background removed successfully!'
      },
      { quoted: m }
    );

    await EliteProTech.sendMessage(m.chat, {
      react: { text: '✅', key: m.key }
    });

  } catch (error) {
    console.error(error);
    await EliteProTech.sendMessage(m.chat, {
      react: { text: '❌', key: m.key }
    });
    reply('❌ Error occurred while removing background.');
  }
  break;
}
case 'ocr':
case 'img2txt': {
  try {
    let imgUrl = text;

    if (!imgUrl && m.quoted) {
      const quotedMsg = m.quoted.message || m.quoted.msg || m.quoted;
      const mime = quotedMsg?.mimetype || '';
      if (/image/.test(mime)) {
        const mediaPath = await EliteProTech.downloadAndSaveMediaMessage(m.quoted);
        imgUrl = await uploadToEliteTempUrl(mediaPath);
        fs.unlinkSync(mediaPath);
      } else {
        return reply(
          `❌ Please reply to an image or provide an image URL.\n\nExample:\n${prefix + command} https://example.com/image.jpg`
        );
      }
    }

    if (!imgUrl) {
      return reply(
        `❌ Please reply to an image or provide an image URL.\n\nExample:\n${prefix + command} https://example.com/image.jpg`
      );
    }

    const apiUrl = `https://eliteprotech-apis.zone.id/ocr?url=${encodeURIComponent(imgUrl)}`;
    const res = await axios.get(apiUrl);
    const json = res.data;

    if (!json.success || !json.text) {
      return reply('❌ OCR failed or no text found.');
    }

    const ocrText = json.text;

    await sendInteractiveMessage(
      EliteProTech,
      m.chat,
      {
        text: `✅ *OCR Result:*\n\n${ocrText}`,
        interactiveButtons: [
          {
            name: 'cta_copy',
            buttonParamsJson: JSON.stringify({
              display_text: 'Copy Text',
              copy_code: ocrText
            })
          }
        ]
      },
      { quoted: m }
    );

  } catch (err) {
    console.error(err);
    reply('❌ Error occurred while performing OCR.');
  }
  break;
}
case 'wasted': {
  try {
    await EliteProTech.sendMessage(m.chat, {
      react: { text: '⏳', key: m.key }
    });

    let imgUrl = text;

    if (!imgUrl && m.quoted) {
      const quotedMsg = m.quoted.message || m.quoted.msg || m.quoted;
      const mime = quotedMsg?.mimetype || '';

      if (/image/.test(mime)) {
        const mediaPath = await EliteProTech.downloadAndSaveMediaMessage(m.quoted);
        imgUrl = await uploadToEliteTempUrl(mediaPath);
        fs.unlinkSync(mediaPath);
      } else {
        await EliteProTech.sendMessage(m.chat, {
          react: { text: '❌', key: m.key }
        });
        return reply(
          `❌ Please reply to an image or provide an image URL.\n\nExample:\n${prefix}wasted https://example.com/image.jpg`
        );
      }
    }

    if (!imgUrl) {
      await EliteProTech.sendMessage(m.chat, {
        react: { text: '❌', key: m.key }
      });
      return reply(
        `❌ Please reply to an image or provide an image URL.\n\nExample:\n${prefix}wasted https://example.com/image.jpg`
      );
    }

    const apiUrl = `https://eliteprotech-apis.zone.id/wasted?url=${encodeURIComponent(imgUrl)}`;
    const response = await axios.get(apiUrl);
    const data = response.data;

    if (!data?.success || !data?.url) {
      await EliteProTech.sendMessage(m.chat, {
        react: { text: '❌', key: m.key }
      });
      return reply('❌ Failed to generate wasted image.');
    }

    await EliteProTech.sendMessage(
      m.chat,
      {
        image: { url: data.url },
        caption: '💀 WASTED'
      },
      { quoted: m }
    );

    await EliteProTech.sendMessage(m.chat, {
      react: { text: '✅', key: m.key }
    });

  } catch (error) {
    console.error(error);
    await EliteProTech.sendMessage(m.chat, {
      react: { text: '❌', key: m.key }
    });
    reply('❌ Error occurred while generating wasted image.');
  }
  break;
}
case 'hd':
case 'remini':
case 'enhance':
case 'upscale': {
  try {
    await EliteProTech.sendMessage(m.chat, {
      react: { text: '⏳', key: m.key }
    });

    let imgUrl = text;

    if (!imgUrl && m.quoted) {
      const quotedMsg = m.quoted.message || m.quoted.msg || m.quoted;
      const mime = quotedMsg?.mimetype || '';

      if (/image/.test(mime)) {
        const mediaPath = await EliteProTech.downloadAndSaveMediaMessage(m.quoted);
        imgUrl = await uploadToEliteTempUrl(mediaPath);
        fs.unlinkSync(mediaPath);
      } else {
        await EliteProTech.sendMessage(m.chat, {
          react: { text: '❌', key: m.key }
        });
        return reply(
          `❌ Please reply to an image or provide an image URL.\n\nExample:\n${prefix + command} https://example.com/image.jpg`
        );
      }
    }

    if (!imgUrl) {
      await EliteProTech.sendMessage(m.chat, {
        react: { text: '❌', key: m.key }
      });
      return reply(
        `❌ Please reply to an image or provide an image URL.\n\nExample:\n${prefix + command} https://example.com/image.jpg`
      );
    }

    const apiUrl = `https://eliteprotech-apis.zone.id/upscaler?url=${encodeURIComponent(imgUrl)}`;

    // 🔥 IMPORTANT FIX: get image as buffer
    const response = await axios.get(apiUrl, {
      responseType: 'arraybuffer'
    });

    const imageBuffer = Buffer.from(response.data);

    await EliteProTech.sendMessage(
      m.chat,
      {
        image: imageBuffer,
        caption: '✅ Image upscaled successfully!'
      },
      { quoted: m }
    );

    await EliteProTech.sendMessage(m.chat, {
      react: { text: '✅', key: m.key }
    });

  } catch (error) {
    console.error(error);
    await EliteProTech.sendMessage(m.chat, {
      react: { text: '❌', key: m.key }
    });
    reply('❌ Error occurred while upscaling image.');
  }
  break;
}
case 'update': {
    if (!isCreator) {
        return reply(mess.owner)
    }
    const user = 'EliteProTech'
    const repo = 'ELITE-PRO-V1'
    const branch = 'main'
    const foldersToUpdate = ['lib']
    const filesToUpdate = ['package.json']
    const localBasePath = __dirname
    async function downloadFolder(folderPath, localPath) {
        const url = `https://api.github.com/repos/${user}/${repo}/contents/${folderPath}?ref=${branch}`
        try {
            const { data } = await axios.get(url, {
                headers: {
                    'User-Agent': 'EliteProTech'
                }
            })
            for (const item of data) {
                const localFilePath = path.join(localPath, item.path)
                if (item.type === 'file') {
                    fs.mkdirSync(path.dirname(localFilePath), { recursive: true })
                    const { data: fileData } = await axios.get(item.download_url, {
                        responseType: 'text'
                    })
                    fs.writeFileSync(localFilePath, fileData, 'utf8')
                    console.log(`✅ Updated: ${item.path}`)
                } else if (item.type === 'dir') {
                    if (!fs.existsSync(localFilePath)) {
                        fs.mkdirSync(localFilePath, { recursive: true })
                    }
                    await downloadFolder(item.path, localPath)
                }
            }
        } catch (err) {
            console.error(`❌ Error reading folder ${folderPath}:`, err.message)
            throw err
        }
    }
    async function downloadFile(filePath) {
        const fileUrl = `https://raw.githubusercontent.com/${user}/${repo}/${branch}/${filePath}`
        try {
            const { data } = await axios.get(fileUrl, {
                responseType: 'text'
            })
            const localFilePath = path.join(localBasePath, filePath)
            fs.mkdirSync(path.dirname(localFilePath), { recursive: true })
            fs.writeFileSync(localFilePath, data, 'utf8')
            console.log(`✅ Updated: ${filePath}`)
        } catch (err) {
            console.error(`❌ Error updating file ${filePath}:`, err.message)
            throw err
        }
    }
    async function installDependencies() {
        const { exec } = await import('child_process')
        return new Promise((resolve, reject) => {
            console.log('📦 Running npm install...')
            exec('npm install', { cwd: localBasePath }, (error, stdout, stderr) => {
                if (stdout) console.log(stdout)
                if (stderr) console.log(stderr)
                if (error) {
                    console.error('❌ npm install failed:', error.message)
                    reject(error)
                    return
                }
                console.log('✅ Dependencies installed successfully.')
                resolve()
            })
        })
    }
    try {
        await reply('*📥 Updating and restarting the bot to apply changes...*')
        for (const folder of foldersToUpdate) {
            const folderPath = path.join(localBasePath, folder)
            if (fs.existsSync(folderPath)) {
                fs.rmSync(folderPath, {
                    recursive: true,
                    force: true
                })
            }
            await downloadFolder(folder, localBasePath)
        }
        for (const file of filesToUpdate) {
            await downloadFile(file)
        }
        await installDependencies()
        setTimeout(() => {
            process.exit(0)
        }, 2000)
    } catch (err) {
        console.error('❌ Update failed:', err)
        return reply('❌ Update failed:\n' + (err.message || err))
    }
    break
}
case 'antidelete': {
    if (!isCreator) return reply(mess.owner);
    
    const fs = require('fs');
    const path = require('path');
    const togglePath = path.join(__dirname, 'database', 'antidelete.json');
    
    // Create the file if it doesn't exist
    if (!fs.existsSync(togglePath)) {
        fs.writeFileSync(togglePath, JSON.stringify({ enabled: false }, null, 2));
    }
    
    const config = JSON.parse(fs.readFileSync(togglePath));
    
    const arg = (args[0] || '').toLowerCase();
    const enableKeywords = ['on', 'enable'];
    const disableKeywords = ['off', 'disable'];
    
    if (enableKeywords.includes(arg)) {
        config.enabled = true;
    } else if (disableKeywords.includes(arg)) {
        config.enabled = false;
    } else {
        return reply('⚙️ Use: *.antidelete enable*, or *.antidelete disable*');
    }
    
    fs.writeFileSync(togglePath, JSON.stringify(config, null, 2));
    reply(`✅ Anti-Delete is now *${config.enabled ? 'enabled' : 'disabled'}*.`);
    break;
}
case 'facebook':
case 'fb': {
    if (!text) return reply(`Give Me A Facebook Video Link \n\n*Example:* ${prefix + command} https://www.facebook.com/share/v/15PtWTGvW9/`);

    await EliteProTech.sendMessage(m.chat, {
        react: { text: `📥`, key: m.key }
    });

    try {
        const apiUrl = `https://eliteprotech-apis.zone.id/facebook2?url=${encodeURIComponent(text)}`;
        const { data } = await axios.get(apiUrl);

        if (data?.status === true && data?.video) {
            const title = data.title || 'Facebook Video';

            await EliteProTech.sendMessage(m.chat, {
                video: { url: data.video },
                mimetype: 'video/mp4',
                fileName: `${title.replace(/[\\/:*?"<>|]/g, '')}.mp4`,
                caption: `*✅ Video downloaded successfully*`,
                jpegThumbnail: data.thumbnail
                    ? Buffer.from((await axios.get(data.thumbnail, {
                        responseType: 'arraybuffer'
                    })).data)
                    : undefined
            }, { quoted: m });

            await EliteProTech.sendMessage(m.chat, {
                react: { text: `✅`, key: m.key }
            });

        } else {
            await EliteProTech.sendMessage(m.chat, {
                react: { text: `❌`, key: m.key }
            });

            reply("❌ Unable to fetch the Facebook video. Please check the URL and try again.");
        }

    } catch (error) {
        console.error('Error in Facebook Downloader:', error.message);

        await EliteProTech.sendMessage(m.chat, {
            react: { text: `⚠️`, key: m.key }
        });

        reply("❌ An error occurred while processing your request. Please try again later.");
    }

    break;
}
case 'fakeigstory':
case 'igstory': {
    if (!text) {
        return reply(`*Example:* ${prefix + command} Hello World`);
    }

    try {
        await EliteProTech.sendMessage(m.chat, {
            react: { text: `🎨`, key: m.key }
        });

        const storyText = text;
        const name = pushname || 'EliteProTech';

        let ppUrl;

        try {
            const ppBuffer = await getBuffer(profilepuser);

            const tempPath = `./temp_${Date.now()}.jpg`;
            fs.writeFileSync(tempPath, ppBuffer);

            ppUrl = await uploadToEliteTempUrl(tempPath);

            fs.unlinkSync(tempPath);

        } catch {
            ppUrl = 'https://raw.githubusercontent.com/uploader762/dat4/main/uploads/e0f993-1777126212302.jpg';
        }

        const apiUrl = `https://eliteprotech-apis.zone.id/fakeigstory?text=${encodeURIComponent(storyText)}&name=${encodeURIComponent(name)}&pp=${encodeURIComponent(ppUrl)}`;

        await EliteProTech.sendMessage(m.chat, {
            image: { url: apiUrl },
            caption: `*✅ Fake Instagram Story Generated*`
        }, { quoted: m });

        await EliteProTech.sendMessage(m.chat, {
            react: { text: `✅`, key: m.key }
        });

    } catch (error) {
        console.error('Fake IG Story Error:', error);

        await EliteProTech.sendMessage(m.chat, {
            react: { text: `❌`, key: m.key }
        });

        reply(`❌ Failed to generate fake Instagram story.`);
    }

    break;
}
case 'instagram':
case 'ig': {
    if (!text) {
        return reply(
            `Give Me An Instagram Reel/Post Link\n\n*Example:* ${prefix + command} https://www.instagram.com/reel/C9bjQfRprHK`
        );
    }
    await EliteProTech.sendMessage(m.chat, {
        react: { text: "📥", key: m.key }
    });
    try {
        const apiUrl = `https://eliteprotech-apis.zone.id/instagram?url=${encodeURIComponent(text)}`;
        const { data } = await axios.get(apiUrl, {
            timeout: 30000
        });
        if (!data?.success || !data?.data?.media?.url) {
            await EliteProTech.sendMessage(m.chat, {
                react: { text: "❌", key: m.key }
            });
            return reply(
                "❌ Unable to fetch the Instagram media. Please check the link and try again."
            );
        }
        const media = data.data.media;
        const author = data.data.author;
        const caption = data.data.caption;
        if (media.type === 'video') {
            await EliteProTech.sendMessage(
                m.chat,
                {
                    video: { url: media.url },
                    mimetype: "video/mp4",
                    caption:
                        `*Instagram Download*\n\n` +
                        `👤 *Author:* ${author?.fullname || author?.username || 'Unknown'}\n` +
                        `❤️ *Likes:* ${data.data.stats?.likes || 0}\n\n` +
                        `${caption || ''}`
                },
                { quoted: m }
            );
        } else if (media.type === 'image') {
            await EliteProTech.sendMessage(
                m.chat,
                {
                    image: { url: media.url },
                    caption:
                        `*Instagram Download*\n\n` +
                        `👤 *Author:* ${author?.fullname || author?.username || 'Unknown'}\n` +
                        `${caption || ''}`
                },
                { quoted: m }
            );
        }
        await EliteProTech.sendMessage(m.chat, {
            react: { text: "✅", key: m.key }
        });
    } catch (error) {
        console.error("Instagram Downloader:", error);
        await EliteProTech.sendMessage(m.chat, {
            react: { text: "❌", key: m.key }
        });
        return reply(
            `❌ Failed to download the Instagram media.\n\n${error.message}`
        );
    }
    break;
}
case 'get': {
    if (!text) return reply(`Example: ${prefix + command} https://api.example.com/data`);
    
    try {
        const headers = {
            'User-Agent': 'EliteProTech-Bot/1.0',
            'Accept': '*/*'
        };
        const res = await axios.get(text, {
            responseType: 'arraybuffer',
            headers
        });
        const contentType = (res.headers['content-type'] || '').toLowerCase();
        const rawData = Buffer.from(res.data);
        let isJson = false;
        let parsedJson = null;
        try {
            const preview = rawData.slice(0, 200).toString();
            if (preview.trim().startsWith('{') || preview.trim().startsWith('[')) {
                parsedJson = JSON.parse(rawData.toString());
                isJson = true;
            }
        } catch { /* not JSON */ }
        
        // ✅ If JSON (by header OR detected structure)
        if (contentType.includes('application/json') || isJson) {
            await EliteProTech.sendMessage(m.chat, {
                text: JSON.stringify(parsedJson || JSON.parse(rawData.toString()), null, 2)
            }, { quoted: m });
        }
        
        // ✅ If image
        else if (contentType.startsWith('image/')) {
            await EliteProTech.sendMessage(m.chat, {
                image: rawData,
                caption: `📷 *Image from API*`
            }, { quoted: m });
        }
        
        // ✅ If audio
        else if (contentType.startsWith('audio/')) {
            await EliteProTech.sendMessage(m.chat, {
                audio: rawData,
                mimetype: contentType || 'audio/mpeg'
            }, { quoted: m });
        }
        
        // ✅ If video
        else if (contentType.startsWith('video/')) {
            await EliteProTech.sendMessage(m.chat, {
                video: rawData,
                mimetype: contentType || 'video/mp4',
                caption: `🎥 *Video from API*`
            }, { quoted: m });
        }
        
        // ✅ Otherwise → send as document (fallback)
        else {
            await EliteProTech.sendMessage(m.chat, {
                document: rawData,
                mimetype: contentType || 'application/octet-stream',
                fileName: 'response.bin'
            }, { quoted: m });
        }
        
    } catch (err) {
        console.error('❌ API Error:', err.message);
        
        let errorMessage = {
            success: false,
            message: '❌ Unknown error occurred.'
        };
        if (err.response) {
            try {
                const type = err.response.headers['content-type'] || '';
                const dataBuf = Buffer.from(err.response.data);
                if (type.includes('application/json')) {
                    errorMessage = JSON.parse(dataBuf.toString());
                } else {
                    const preview = dataBuf.slice(0, 100).toString();
                    if (preview.trim().startsWith('{') || preview.trim().startsWith('[')) {
                        errorMessage = JSON.parse(preview);
                    } else {
                        errorMessage.message = `❌ Server responded with status ${err.response.status}`;
                    }
                }
            } catch {
                errorMessage.message = `❌ Server error: ${err.response.statusText || 'Unknown'}`;
            }
        } else if (err.request) {
            errorMessage.message = '⚠️ No response received from the API server.';
        } else {
            errorMessage.message = `❌ ${err.message}`;
        }
        
        await EliteProTech.sendMessage(m.chat, {
            text: JSON.stringify(errorMessage, null, 2)
        }, { quoted: m });
    }
}
break
case 'jid': {
    try {
        let targetJid;
        
        // If mentioned
        if (m.mentionedJid && m.mentionedJid.length > 0) {
            targetJid = m.mentionedJid[0];
        }
        // If quoted
        else if (m.quoted) {
            targetJid = m.quoted.sender;
        }
        // Otherwise, group or private
        else {
            targetJid = m.chat;
        }
        
        // If it's a group, get real JID from metadata
        if (m.isGroup) {
            const meta = await EliteProTech.groupMetadata(m.chat);
            const found = meta.participants.find(p =>
                p.id === targetJid || p.lid === targetJid || p.jid === targetJid
            );
            
            if (found && found.jid) targetJid = found.jid;
            else targetJid = meta.id; // group JID fallback
        }
        
        // Decode if LID
        const realJid = await EliteProTech.decodeJid(targetJid);
        
        await EliteProTech.sendMessage(m.chat, {
            text: realJid
        }, { quoted: m });
        
    } catch (err) {
        console.error(err);
        reply(`❌ Failed to get JID.`);
    }
}
break;
case 'lid': {
    try {
        let targetLid;
        
        // If mentioned
        if (m.mentionedJid && m.mentionedJid.length > 0) {
            targetLid = m.mentionedJid[0];
        }
        // If quoted
        else if (m.quoted) {
            targetLid = m.quoted.sender;
        }
        // Otherwise group or private
        else {
            targetLid = m.chat;
        }
        
        if (m.isGroup) {
            const meta = await EliteProTech.groupMetadata(m.chat);
            const found = meta.participants.find(p =>
                p.id === targetLid || p.lid === targetLid || p.jid === targetLid
            );
            
            if (found && found.lid) targetLid = found.lid;
            else targetLid = meta.id.replace('@g.us', '@lid'); // group lid fallback
        }
        
        await EliteProTech.sendMessage(m.chat, {
            text: targetLid
        }, { quoted: m });
        
    } catch (err) {
        console.error(err);
        reply(`❌ Failed to get LID.`);
    }
}
break
case 'eval': {
    if (!isCreator) return

    let code = full_args
    if (!code) return reply("⚠️ Provide some code to eval")

    try {
        let evaled

        try {
            evaled = await eval(`(async () => (${code}))()`)
        } catch {
            evaled = await eval(`(async () => {
                ${code}
            })()`)
        }

        let output = require('util').inspect(evaled, {
            depth: 5
        })

        if (output.length > 90000) {
            console.log(output)
            reply("✅ Result too long, check console.")
        } else {
            reply(output)
        }
    } catch (e) {
        reply("❌ Error:\n" + String(e))
    }
}
break
case 'npmdownloader':
case 'npmdownload':
case 'npmdl':
case 'npm': {
    if (!text) return reply(`⛔ Please enter an NPM package name and version (optional).\n\n📌 Example:\n${prefix + command} express,latest`);

    async function npmdownloader(pkg, pkgver) {
        try {
            const filePath = await new Promise((resolve, reject) => {
                exec(`npm pack ${pkg}@${pkgver}`, (error, stdout) => {
                    if (error) {
                        reply('❌ Error while fetching package.');
                        console.error(`exec error: ${error}`);
                        reject(error);
                        return;
                    }
                    resolve(stdout.trim());
                });
            });
            
            const fileName = filePath.split('/').pop();
            const data = await fs.promises.readFile(filePath);
            
            let Link;
            if (pkgver === 'latest') {
                Link = `https://www.npmjs.com/package/${pkg}`;
            } else {
                Link = `https://www.npmjs.com/package/${pkg}/v/${pkgver}`;
            }
            
            await EliteProTech.sendMessage(m.chat, {
                document: data,
                mimetype: "application/zip",
                fileName: fileName,
                caption: `📦 *NPM Package Downloader*\n\n- \`Name\`: ${fileName}\n- \`Version\`: ${pkgver}\n- \`Link\`: ${Link}`
            }, { quoted: m });
            
            // remove temp file after sending
            await fs.promises.unlink(filePath);
        } catch (err) {
            console.error(`Error: ${err}`);
            reply('❌ Failed to download the package. Please check the package name or version.');
        }
    }
    
    await EliteProTech.sendMessage(m.chat, {
        react: { text: "⏱", key: m.key }
    });
    
    try {
        const [pkgName, ver] = text.split(",");
        await npmdownloader(pkgName.trim(), (ver || 'latest').trim());
    } catch (error) {
        reply('⚠️ It seems there was an error or the package was not found.');
    }
    break;
}
case 'gemini': {
    if (!text) return reply(`Please enter a prompt for Gemini to respond.`);
    
    try {
        let apii = await fetch(`https://apis-starlights-team.koyeb.app/starlight/gemini?text=${encodeURIComponent(text)}`);
        let res = await apii.json();
        
        reply(res.result);
    } catch (err) {
        await EliteProTech.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        reply(`Gemini cannot answer that question.`);
    }
}
break
case 'aio': {
    if (!text)
        return reply(`Give Me A Video URL (Facebook, TikTok, etc.)\n\n*Example:* ${prefix + command} https://www.facebook.com/share/v/15PtWTGvW9/`);
    
    await EliteProTech.sendMessage(m.chat, { react: { text: `📥`, key: m?.key } });
    
    try {
        const apiUrl = `https://eliteprotech-apis.zone.id/aio?url=${encodeURIComponent(text)}`;
        const { data } = await axios.get(apiUrl);
        
        if (data.success && data.download_links?.length) {
            for (let i = 0; i < data.download_links.length; i++) {
                const videoUrl = data.download_links[i];
                await EliteProTech.sendMessage(m.chat, {
                    video: { url: videoUrl },
                    mimetype: 'video/mp4',
                    fileName: `AIO_Video_${i + 1}.mp4`,
                    caption: `🎥 *Video ${i + 1}*\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴇʟɪᴛᴇ-ᴘʀᴏ-ᴛᴇᴄʜ*`
                }, { quoted: m });
            }
        } else {
            reply(data.error_message || "❌ Unable to fetch video(s). Please check the URL and try again.");
        }
        
    } catch (error) {
        console.error('Error in AIO Downloader:', error.message);
        reply("❌ An error occurred while processing your request. Please try again later.");
    }
    
    break;
}
case 'aivideo': {
    if (!text) return reply(`🎬 *Example:* ${prefix + command} A man walking`);
    
    try {
        await EliteProTech.sendMessage(m.chat, { react: { text: `🎥`, key: m.key } });
        
        // Build API URL
        const api = `https://eliteprotech-apis.zone.id/aivideo?q=${encodeURIComponent(text)}&type=video`;
        const response = await axios.get(api);
        
        if (!response.data?.success || !response.data.result?.url) {
            return reply(`❌ *Failed to generate AI video.* Please try again later.`);
        }
        
        const videoUrl = response.data.result.url;
        
        // Send video with caption
        await EliteProTech.sendMessage(m.chat, {
            video: { url: videoUrl },
            caption: `🎥 *AI Generated Video*\n> *Prompt:* ${text}\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴇʟɪᴛᴇ-ᴘʀᴏ-ᴛᴇᴄʜ*`,
            gifPlayback: false
        }, { quoted: m });
        
    } catch (error) {
        console.error("❌ Error in aivideo command:", error);
        reply(`❌ *Error generating AI video.*\nPlease try again later.`);
    }
    break;
}
case 'aivideo2': {
    if (!text) return reply(`Please provide a prompt to generate the AI video.\n\n*Example:* ${prefix + command} A man going home`);
    
    try {
        const axios = require("axios");
        let res = await axios.get(`https://eliteprotech-apis.zone.id/aivideo2?q=${encodeURIComponent(text)}`);
        
        if (!res.data || !res.data.success) {
            return reply("Failed to generate AI video. Please try again later.");
        }
        
        // Send the video with caption
        await EliteProTech.sendMessage(m.chat, {
            video: { url: res.data.url },
            caption: `🎥 *AI Video Generated*\n*Prompt:* ${res.data.prompt}`
        }, { quoted: m });
        
    } catch (err) {
        console.error(err);
        reply("An error occurred while generating the AI video.");
    }
}
break
case 'firelogo': {
    if (!text) return reply(`Please provide text to generate the fire logo.\n\n*Example:* ${prefix + command} EliteProTech users`);
    
    try {
        const axios = require("axios");
        let res = await axios.get(`https://eliteprotech-apis.zone.id/firelogo?text=${encodeURIComponent(text)}`);
        
        if (!res.data || !res.data.success) {
            return reply("Failed to generate fire logo. Please try again later.");
        }
        
        await EliteProTech.sendMessage(m.chat, {
            image: { url: res.data.image },
            caption: `🔥 *Fire Logo Generated*\n*Text:* ${res.data.text}`
        }, { quoted: m });
        
    } catch (err) {
        console.error(err);
        reply("An error occurred while generating the fire logo.");
    }
}
break
case 'create': {
    try {
        if (!q) {
            return reply(`⚠️ Example: *${prefix + command} a man walking home*`);
        }
        await EliteProTech.sendMessage(m.chat, {
            react: { text: "🖼️", key: m.key }
        });
        const imageUrl = `https://eliteprotech-apis.zone.id/zonerai?prompt=${encodeURIComponent(q)}`;
        await EliteProTech.sendMessage(
            m.chat,
            {
                image: { url: imageUrl },
                caption: `*AI Image Generated*`
            },
            { quoted: m }
        );
        await EliteProTech.sendMessage(m.chat, {
            react: { text: "✅", key: m.key }
        });
    } catch (error) {
        console.error("Create Error:", error);
        await EliteProTech.sendMessage(m.chat, {
            react: { text: "❌", key: m.key }
        });
        reply("❌ Failed to generate the image. Please try again.");
    }
    break;
}
case 'toanime': {
const isPremium = await checkPremiumUser(m.sender)
    if (!isPremium) return reply(mess.prem)
    if (!text) {
        return reply(`Example: ${prefix + command} make him cute`)
    }

    if (!quoted || !/image/.test(mime)) {
        return reply('Reply to an image with a prompt')
    }

    try {
        await EliteProTech.sendMessage(m.chat, {
            react: { text: '🎨', key: m.key }
        })

        const media = await quoted.download()
        const tempDir = path.join(__dirname, 'temp')

        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true })
        }

        const filePath = path.join(tempDir, `${Date.now()}.jpg`)
        fs.writeFileSync(filePath, media)

        const imageUrl = await uploadToEliteProTechUrl(filePath)

        const apiUrl = `https://eliteprotech-apis.zone.id/toanime?url=${encodeURIComponent(imageUrl)}&prompt=${encodeURIComponent(text)}`
        const { data } = await axios.get(apiUrl)

        if (!data || !data.url) {
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
            return reply('Failed to generate anime image')
        }

        await EliteProTech.sendMessage(m.chat, {
            image: { url: data.url },
            caption: `*✅ Image Successfully Generated*`
        }, { quoted: m })

        if (fs.existsSync(filePath)) fs.unlinkSync(filePath)

        await EliteProTech.sendMessage(m.chat, {
            react: { text: '✅', key: m.key }
        })
    } catch (error) {
        console.log(error)
        await EliteProTech.sendMessage(m.chat, {
            react: { text: '❌', key: m.key }
        })
        reply('Error processing anime conversion')
    }
}
break
case 'anticall': {
    if (!isCreator) return reply(mess.owner);
    
    // Load anticall settings
    let anticallData = {};
    try {
        anticallData = JSON.parse(fs.readFileSync('./database/anticall.json'));
    } catch {
        anticallData = { enabled: false, mode: "decline" };
    }
    
    if (!args[0]) {
        return reply(`
⿻ *ANTICALL SETTINGS*
╭───────────────━⊷
║ .anticall decline → Reject call & warn
║ .anticall block   → Reject call & block
║ .anticall off     → Disable anticall
╰───────────────━⊷
_*Current:* ${anticallData.enabled ? `✅ ENABLED (${anticallData.mode.toUpperCase()})` : "❌ DISABLED"}_`);
    }
    
    if (args[0].toLowerCase() === "decline") {
        anticallData.enabled = true;
        anticallData.mode = "decline";
        fs.writeFileSync('./database/anticall.json', JSON.stringify(anticallData, null, 2));
        return reply("✅ *ANTICALL ENABLED:* Mode → DECLINE");
    }
    
    if (args[0].toLowerCase() === "block") {
        anticallData.enabled = true;
        anticallData.mode = "block";
        fs.writeFileSync('./database/anticall.json', JSON.stringify(anticallData, null, 2));
        return reply("✅ *ANTICALL ENABLED:* Mode → BLOCK");
    }
    
    if (args[0].toLowerCase() === "off") {
        anticallData.enabled = false;
        fs.writeFileSync('./database/anticall.json', JSON.stringify(anticallData, null, 2));
        return reply("❌ *ANTICALL DISABLED* → Calls are now allowed.");
    }
    
    return reply("⚠️ Invalid command! Use: .anticall decline / block / off");
}
break;
case 'elevenlab': {
    if (!q) {
        return reply(
`⚠️ Please provide a voice name and text.

*Example:*
${prefix}elevenlab mrbeast hello world

*Tip:* Use "${prefix}elevenlab list" to view all available voices.`
        );
    }

    // Handle "list" command
    if (q.trim().toLowerCase() === "list") {
        try {
            const res = await fetch("https://eliteprotech-apis.zone.id/elevenlab?list=true");
            const data = await res.json();
            if (!data.success) return reply("❌ Failed to load voice list.");
            const voices = data.voices.join(", ");
            return reply(`🎙️ *Available Voices:*\n${voices}`);
        } catch (err) {
            return reply(`⚠️ Error loading voices: ${err.message}`);
        }
    }

    // Parse input
    let [voice, ...textArr] = q.split(" ");
    if (!voice || !textArr.length) {
        return reply(
`⚠️ Please provide a voice name and text.

*Example:*
${prefix}elevenlab mrbeast hello world`
        );
    }

    let text = textArr.join(" ").trim();

    try {
        // ⏳ React while generating
        await EliteProTech.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

        const apiUrl = `https://eliteprotech-apis.zone.id/elevenlab?q=${encodeURIComponent(text)}&voicename=${encodeURIComponent(voice)}`;
        const res = await fetch(apiUrl);
        const data = await res.json();

        if (data.success && data.url) {
            // ✅ Success reaction
            await EliteProTech.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

            const audioRes = await fetch(data.url);
            const buffer = await audioRes.arrayBuffer();

            await EliteProTech.sendMessage(
                m.chat,
                { audio: Buffer.from(buffer), mimetype: "audio/mpeg", ptt: false },
                { quoted: m }
            );
        } else {
            // ❌ Failed reaction
            await EliteProTech.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
            reply(data.error || "❌ Failed to generate audio.");
        }

    } catch (e) {
        await EliteProTech.sendMessage(m.chat, { react: { text: "⚠️", key: m.key } });
        reply(`⚠️ Error: ${e.message}`);
    }
}
break
case 'fetch': {
   const fetch = require('node-fetch')
   const { format } = require('util')

   if (!q) return reply(`⚠️ Example: *${prefix + command} https://example.com*`)

   if (!/^https?:\/\//.test(q)) return reply('⚠️ URL must start with http:// or https://')

   try {
      let res = await fetch(q)

      // Prevent huge files (limit 100MB)
      if (res.headers.get('content-length') > 100 * 1024 * 1024) {
         return reply(`❌ File too large. Content-Length: ${res.headers.get('content-length')}`)
      }

      let contentType = res.headers.get('content-type') || ''
      let fileName = q.split('/').pop() || 'file'

      if (/audio/.test(contentType)) {
         return EliteProTech.sendMessage(
            m.chat,
            { audio: { url: q }, mimetype: contentType, fileName: fileName },
            { quoted: m }
         )
      } else if (/video/.test(contentType)) {
         return EliteProTech.sendMessage(
            m.chat,
            { video: { url: q }, mimetype: contentType, fileName: fileName },
            { quoted: m }
         )
      } else if (/image/.test(contentType)) {
         return EliteProTech.sendMessage(
            m.chat,
            { image: { url: q }, mimetype: contentType, fileName: fileName },
            { quoted: m }
         )
      } else if (/text|json/.test(contentType)) {
         let txt = await res.buffer()
         try {
            txt = format(JSON.parse(txt.toString()))
         } catch (e) {
            txt = txt.toString()
         } finally {
            return reply(txt.slice(0, 65536))
         }
      } else {
         // fallback to document if unknown type
         return EliteProTech.sendMessage(
            m.chat,
            { document: { url: q }, mimetype: contentType, fileName: fileName },
            { quoted: m }
         )
      }
   } catch (e) {
      reply(`❌ Error fetching URL:\n${e.message}`)
   }
}
break
case 'channel-id':
case 'channelid': {
    if (!text) return reply('Please provide the channel link.');

    if (!text.includes('https://whatsapp.com/channel/')) {
        return reply('Invalid channel link.');
    }

    const channelCode = text.split('https://whatsapp.com/channel/')[1].trim();

    try {
        const res = await EliteProTech.newsletterMetadata('invite', channelCode);

        const msgText = 
`📢 *Whatsapp Channel Info:*

📌 *Channel Code:*
${channelCode}

🆔 *Channel ID:*
${res.id}

🔗 *Link:*
${text}`;

        await sendInteractiveMessage(
            EliteProTech,
            m.chat,
            {
                text: msgText,
                footer: '> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴇʟɪᴛᴇ-ᴘʀᴏ-ᴛᴇᴄʜ©*',
                interactiveButtons: [
                    {
                        name: 'cta_copy',
                        buttonParamsJson: JSON.stringify({
                            display_text: 'Copy Channel ID 📋',
                            copy_code: res.id
                        })
                    }
                ]
            },
            { quoted: m }
        );

    } catch (err) {
        console.error(err);
        reply('❌ Failed to resolve channel ID.');
    }
}
break
case 'fetchimg': {
   const path = require('path')

   if (!q) return reply(`⚠️ Example: *${prefix + command} https://example.com/image.png*`)
   if (!/^https?:\/\//.test(q)) return reply('⚠️ URL must start with http:// or https://')

   try {
      let fileName = q.split('/').pop() || 'image'
      let ext = path.extname(fileName).toLowerCase()
      if (!ext) fileName += '.jpg' // fallback to jpg if no extension

      await EliteProTech.sendMessage(
         m.chat,
         {
            image: { url: q },
            mimetype: `image/${ext.replace('.', '') || 'jpeg'}`,
            fileName: fileName
         },
         { quoted: m }
      )
   } catch (e) {
      reply(`❌ Error sending image:\n${e.message}`)
   }
}
break
case 'fetchvid': case 'fetchvideo': {
   const path = require('path')

   if (!q) return reply(`⚠️ Example: *${prefix + command} https://example.com/video.mp4*`)
   if (!/^https?:\/\//.test(q)) return reply('⚠️ URL must start with http:// or https://')

   try {
      let fileName = q.split('/').pop() || 'video'
      let ext = path.extname(fileName).toLowerCase()
      if (!ext) fileName += '.mp4' // fallback to mp4 if no extension

      await EliteProTech.sendMessage(
         m.chat,
         {
            video: { url: q },
            mimetype: `video/${ext.replace('.', '') || 'mp4'}`,
            fileName: fileName
         },
         { quoted: m }
      )
   } catch (e) {
      reply(`❌ Error sending video:\n${e.message}`)
   }
}
break
case 'fetchaud': case 'fetchaudio': {
   const path = require('path')

   if (!q) return reply(`⚠️ Example: *${prefix + command} https://example.com/audio*`)
   if (!/^https?:\/\//.test(q)) return reply('⚠️ URL must start with http:// or https://')

   try {
      let fileName = q.split('/').pop() || 'audio'
      let ext = path.extname(fileName).toLowerCase()
      if (!ext) fileName += '.mp3' // fallback if no extension

      await EliteProTech.sendMessage(
         m.chat,
         {
            audio: { url: q },
            mimetype: 'audio/mpeg', // always treat link as audio
            fileName: fileName,
            ptt: false // set true to send as voice note
         },
         { quoted: m }
      )
   } catch (e) {
      reply(`❌ Error sending audio:\n${e.message}`)
   }
}
break;
case 'shazam': {
    try {
        let audioUrl = q;
        if (!audioUrl && m.quoted) {
            const quotedMsg = m.quoted.message || m.quoted.msg || m.quoted;
            const mime = quotedMsg?.mimetype || '';
            if (/audio|video/.test(mime)) {
                const mediaPath = await EliteProTech.downloadAndSaveMediaMessage(m.quoted);
                try {
                    audioUrl = await uploadToEliteTempUrl(mediaPath);
                } finally {
                    if (fs.existsSync(mediaPath)) {
                        fs.unlinkSync(mediaPath);
                    }
                }
            } else {
                return reply(`❌ Please reply to an *audio or video* or provide a direct URL.\n\n*Example:*\n${prefix}shazam (reply to an audio or video)`);
            }
        }
        if (!audioUrl) {
            return reply(`❌ Please reply to an *audio or video* or provide a direct URL.\n\n*Example:*\n${prefix}shazam (reply to an audio or video)`);
        }
        const { data } = await axios.get(`https://eliteprotech-apis.zone.id/shazam?url=${encodeURIComponent(audioUrl)}`);
        if (!data?.success || !data?.data) {
            return reply('❌ Could not identify the song.');
        }
        const song = data.data;
        const caption = `🎵 *${song.title || 'Unknown'}*
👤 *Artist:* ${song.artist || 'Unknown'}
💿 *Album:* ${song.album || 'Unknown'}
📅 *Release Date:* ${song.release_date || 'Unknown'}
🏷️ *Label:* ${song.label || 'Unknown'}
🎼 *Genre:* ${song.genres?.join(', ') || 'Unknown'}
🎯 *Match:* ${song.score ?? 'Unknown'}%

> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴇʟɪᴛᴇ-ᴘʀᴏ-ᴛᴇᴄʜ©*`;
        await EliteProTech.sendMessage(m.chat, {
            text: caption
        }, {
            quoted: m
        });
    } catch (err) {
        console.error('Shazam Error:', err);
        return reply(`❌ An error occurred while identifying the song.\n${err.message || err}`);
    }
    break;
}
case 'cloud':
case 'tourl': {
    try {
        if (!m.quoted)
            return reply("📎 Reply to an image, video, or document to upload.");

        await EliteProTech.sendMessage(m.chat, {
            react: { text: "☁️", key: m.key }
        });

        const mediaPath = await EliteProTech.downloadAndSaveMediaMessage(m.quoted);

        const stats = fs.statSync(mediaPath);
        const fileSizeInBytes = stats.size;
        const humanFileSize = (bytes) => {
            if (bytes < 1024) return bytes + ' B';
            else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
            else return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
        };
        const size = humanFileSize(fileSizeInBytes);

        const fileUrl = await uploadToEliteProTechUrl(mediaPath);

        await sendInteractiveMessage(
            EliteProTech,
            m.chat,
            {
                text: `*Media Uploaded Successfully ✅*\n*Media Link:*\n\n${fileUrl}\n\n💾 *Size:* ${size}`,
                footer: '> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴇʟɪᴛᴇ-ᴘʀᴏ-ᴛᴇᴄʜ©*',
                interactiveButtons: [
                    {
                        name: 'cta_url',
                        buttonParamsJson: JSON.stringify({
                            display_text: 'Open Link',
                            url: fileUrl
                        })
                    },
                    {
                        name: 'cta_copy',
                        buttonParamsJson: JSON.stringify({
                            display_text: 'Copy Link',
                            copy_code: fileUrl
                        })
                    }
                ]
            },
            { quoted: m }
        );

        fs.unlinkSync(mediaPath);

    } catch (err) {
        console.error("EliteProTech Cloud Upload Error:", err);
        reply("❌ Failed to upload file to EliteProTech Cloud.");
    }
    break;
}
case 'tempurl': {
    try {
        if (!m.quoted) return reply("📎 Reply to an image, video, or file to generate a temporary URL.");
        
        const mediaPath = await EliteProTech.downloadAndSaveMediaMessage(m.quoted);
        const tempUrl = await uploadToEliteTempUrl(mediaPath);
        
        reply(`🕒 *Temporary URL Created*\n📎 *URL:* ${tempUrl}`);
        fs.unlinkSync(mediaPath);
    } catch (err) {
        console.error("TempURL Error:", err);
        reply("❌ Failed to create temporary URL.");
    }
    break;
}
case 'catbox': case 'url': {
    try {
        if (!m.quoted) return reply("📎 Reply to an image, video, or audio to create a Catbox URL.");

        await EliteProTech.sendMessage(m.chat, { react: { text: "📤", key: m.key } });

        const mediaPath = await EliteProTech.downloadAndSaveMediaMessage(m.quoted);

        const stats = fs.statSync(mediaPath);
        const fileSizeBytes = stats.size;

        const formatSize = (bytes) => {
            if (bytes >= 1024 * 1024)
                return (bytes / (1024 * 1024)).toFixed(2) + " MB";
            else if (bytes >= 1024)
                return (bytes / 1024).toFixed(2) + " KB";
            else
                return bytes + " B";
        };

        const readableSize = formatSize(fileSizeBytes);

        const catboxUrl = await uploadToCatbox(mediaPath);

        await sendInteractiveMessage(
            EliteProTech,
            m.chat,
            {
                text: `🙀 *Media Uploaded Successfully*\n*Media Link:*\n${catboxUrl}\n\n📦 *File Size:* ${readableSize}`,
                interactiveButtons: [
                    {
                        name: 'cta_url',
                        buttonParamsJson: JSON.stringify({
                            display_text: 'Open Link',
                            url: catboxUrl
                        })
                    },
                    {
                        name: 'cta_copy',
                        buttonParamsJson: JSON.stringify({
                            display_text: 'Copy Link',
                            copy_code: catboxUrl
                        })
                    }
                ]
            },
            { quoted: m }
        );

        fs.unlinkSync(mediaPath);

    } catch (err) {
        console.error("Catbox Upload Error:", err);
        reply(`🙀 Catbox is currently offline. Kindly use \`${prefix}tourl\` instead.`);
    }
    break;
}
case 'imgbb': {
    try {
        if (!m.quoted) return reply("📎 Reply to an *image* to upload to ImgBB.");

        const mediaPath = await EliteProTech.downloadAndSaveMediaMessage(m.quoted);

        const ext = path.extname(mediaPath) || '.jpg';
        const randomName = `img_${Math.random().toString(36).slice(2, 10)}${ext}`;

        const form = new FormData();
        form.append('image', fs.createReadStream(mediaPath), { filename: randomName });

        reply("⏳ Uploading image to ImgBB...");

        const response = await axios.post(
            'https://api.imgbb.com/1/upload?key=bbc0c59714520ebcd0af58caf995bd08',
            form,
            { headers: form.getHeaders() }
        );

        const imgbbUrl = response.data.data.url;

        await sendInteractiveMessage(
            EliteProTech,
            m.chat, 
            {
                text: `📤 *Image Uploaded Successfully!*\n\n🌍 *ImgBB Link:* ${imgbbUrl}`,
                interactiveButtons: [
                    {
                        name: 'cta_url',
                        buttonParamsJson: JSON.stringify({
                            display_text: 'Open Link',
                            url: imgbbUrl
                        })
                    },
                    {
                        name: 'cta_copy',
                        buttonParamsJson: JSON.stringify({
                            display_text: 'Copy Link',
                            copy_code: imgbbUrl
                        })
                    }
                ]
            },
            { quoted: m } 
        );

        fs.unlinkSync(mediaPath);

    } catch (err) {
        console.error("ImgBB Upload Error:", err);
        reply("❌ Failed to upload file to ImgBB.");
    }
    break;
}
case 'story': {
    if (!text) return reply(`*Example:* ${prefix + command} A lonely hacker discovers an AI hidden deep inside the internet.`);
    try {
        await EliteProTech.sendMessage(m.chat, {
            react: { text: "📖", key: m.key }
        });
        const apiUrl = `https://eliteprotech-apis.zone.id/story?text=${encodeURIComponent(text)}`;
        const response = await axios.get(apiUrl);
        if (!response.data || !response.data.success) {
            return reply("❌ Failed to generate story. Try again later.");
        }
        const story = response.data.story;
        const title = text.length > 50 ? text.substring(0, 50) + "..." : text;
        await EliteProTech.sendMessage(
            m.chat,
            {
                image: {
                    url: "https://eliteprotech-url.zone.id/1772353737772kdu79f.jpg"
                },
                caption: `📚 *Story Generated Successfully!*

🖋 *Prompt:* ${title}

✨ *Story:*
${story}
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴇʟɪᴛᴇ-ᴘʀᴏ-ᴛᴇᴄʜ©*`,
                mentions: [sender]
            },
            { quoted: m }
        );
    } catch (error) {
        console.error(error);
        reply(`❌ Error generating story.\n> ${error.message}`);
    }
    break;
}
// 📝 SAVE NOTE
case 'note': {
    if (!m.quoted) return reply("❌ Reply to a message to save it as a note!");
    const repliedText = m.quoted.text || m.quoted.caption || "";
    if (!repliedText) return reply("❌ No text found in the replied message!");
    const title = text.trim() ? text.trim() : null;
    
    try {
        const { data } = await axios.post("https://notepad-cyan.vercel.app/", {
            userId: m.sender,
            action: "save",
            title,
            text: repliedText
        });
        
        reply(data.message || "✅ Note saved successfully!");
    } catch (err) {
        console.error("Note Save Error:", err.message);
        reply("❌ Failed to save note.");
    }
    break;
}

// 📚 LIST NOTE(S)
case 'listnote': {
    try {
        const apiUrl = "https://notepad-cyan.vercel.app/";
        if (!text) {
            const { data } = await axios.post(apiUrl, {
                userId: m.sender,
                action: "get"
            });
            if (!data.all_notes || Object.keys(data.all_notes).length === 0)
                return reply("📭 You have no saved notes.");
            
            const msg = `🗒️ *Your Notes:*\n\n${Object.entries(data.all_notes)
                .map(([t, v]) => `• *${t}*: ${v.text}`)
                .join("\n\n")}`;
            reply(msg);
        } else {
            const { data } = await axios.post(apiUrl, {
                userId: m.sender,
                action: "get",
                title: text
            });
            if (data.error) return reply(`❌ ${data.error}`);
            reply(`📘 *${data.title}:*\n${data.text}`);
        }
    } catch (err) {
        console.error("List Note Error:", err.message);
        reply("❌ Failed to fetch notes.");
    }
    break;
}

// ❌ DELETE NOTE
case 'deletenote': {
    if (!isCreator) return reply("❌ Only the bot owner can delete notes.");
    if (!text) return reply("❌ Provide the note title to delete.");
    
    try {
        const apiUrl = "https://notepad-cyan.vercel.app/";
        const { data } = await axios.post(apiUrl, {
            userId: m.sender,
            action: "get"
        });
        
        const notes = data.all_notes || {};
        if (!notes[text]) return reply(`❌ No note found with title '${text}'`);
        
        delete notes[text];
        await axios.post(apiUrl, {
            userId: m.sender,
            action: "update",
            data: notes
        });
        
        reply(`✅ Note '${text}' deleted successfully.`);
    } catch (err) {
        console.error("Delete Note Error:", err.message);
        reply("❌ Failed to delete note.");
    }
    break;
}
case 'musicgen':
case 'aisong':
case 'aimusic': {
    if (!text) {
        return reply(`🎵 Please provide a prompt!\n\nExample:\n${prefix + command} Lost in the noise, but I still hear my heartbeat — chasing dreams no one else can see.`);
    }

    try {
        await EliteProTech.sendMessage(m.chat, {
            react: { text: '🎶', key: m.key }
        });

        await EliteProTech.sendMessage(m.chat, {
            text: '*🎧 Generating Ai Music . . . . .*'
        }, { quoted: m });

        const apiUrl = `https://eliteprotech-apis.zone.id/musicgen?prompt=${encodeURIComponent(text)}`;
        const { data } = await axios.get(apiUrl);

        if (!data?.results || !Array.isArray(data.results) || data.results.length === 0) {
            return reply('❌ Failed to generate music. Please try again later.');
        }

        for (const track of data.results) {
            await EliteProTech.sendMessage(m.chat, {
                image: { url: track.cover },
                caption: track.caption || `*🎶 Music Generated*\nPrompt: ${text}`
            }, { quoted: m });

            await EliteProTech.sendMessage(m.chat, {
                audio: { url: track.audio },
                mimetype: 'audio/mp4',
                fileName: track.fileName || 'music.mp3',
                ptt: false
            }, { quoted: m });
        }

        await EliteProTech.sendMessage(m.chat, {
            react: { text: '✅', key: m.key }
        });

    } catch (error) {
        console.error('AI MusicGen Error:', error);
        reply(`❌ An error occurred while generating music.\n> ${error.message || 'Please try again later.'}`);
    }
    break;
}
case 'nsfw': {
    try {
        let apiURL;

        if (!text) {
            apiURL = "https://eliteprotech-apis.zone.id/nsfw?random=true";
        } else {
            apiURL = `https://eliteprotech-apis.zone.id/nsfw?s=${encodeURIComponent(text)}`;
        }

        await EliteProTech.sendMessage(m.chat, { react: { text: "🎥", key: m.key } });

        const res = await axios.get(apiURL);

        if (!res.data?.success || !Array.isArray(res.data.results)) {
            return reply("❌ Failed to fetch videos.");
        }

        // filter valid mp4 only
        const valid = res.data.results.filter(v => v.mp4 && v.mp4.endsWith(".mp4"));
        if (valid.length === 0) {
            return reply(text ? `❌ No video found for "${text}"` : "❌ No random videos found.");
        }

        // pick 1 or 2
        let selected =
            valid.length === 1
                ? [valid[0]]
                : valid.sort(() => Math.random() - 0.5).slice(0, 2);

        for (let i = 0; i < selected.length; i++) {
            let item = selected[i];

            let caption =
                `🎬 *${item.title}*\n` +
                `📁 Category: ${item.category || "Unknown"}\n` +
                `👁 Views: ${item.views_count}\n` +
                `🔁 Shares: ${item.share_count}`;

            await EliteProTech.sendMessage(
                m.chat,
                {
                    video: { url: item.mp4 },
                    mimetype: 'video/mp4',
                    caption
                },
                { quoted: m }
            );
        }

    } catch (err) {
        console.log("WATCHANIME ERROR:", err);
        reply("❌ Error fetching video.");
    }
}
break
case 'session': case 'pair': {
    if (m.isGroup) return;
    if (!text) return reply(`⚠️ Please provide a phone number!\n\nExample: ${prefix + command} 2347084893193`);
    
    try {
        await EliteProTech.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
        
        const apiUrl = `https://eliteprotech-apis.zone.id/pair?number=${encodeURIComponent(text)}`;
        const response = await axios.get(apiUrl);
        
        if (response.data && response.data.code) {
            const code = response.data.code;

            await sendInteractiveMessage(
                EliteProTech,
                m.chat,
                {
                    text: `✅ *Code Generated Successfully!*
╭━━━━━━━━
┃ 📞 *Number:* ${text}
┃ 🔢 *Code:* ${code}
╰━━━━━━━━
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴇʟɪᴛᴇ-ᴘʀᴏ-ᴛᴇᴄʜ©*`,
                    interactiveButtons: [
                        {
                            name: 'cta_copy',
                            buttonParamsJson: JSON.stringify({
                                display_text: 'Copy Code 📋',
                                copy_code: code
                            })
                        }
                    ]
                },
                { quoted: m }
            );

        } else {
            reply(`❌ Failed to generate code for: ${text}`);
        }
    } catch (error) {
        console.error(error);
        reply(`❌ An error occurred while fetching the code.\n> ${error.message}`);
    }
    break;
}
case 'x':
case 'twitter':
case 'xdl':
case 'twit': {
    
    if (!text) return reply(`⚠️ *Send X/Twitter link*\n\nExample:\n${prefix + command} https://x.com/...`);
    
    let url = text.trim();
    
    if (!/https?:\/\/(x|twitter)\.com\//i.test(url)) {
        return reply(`❌ Invalid URL\nPlease send a valid X/Twitter link.`);
    }
    
    try {
        const axios = require("axios");
        const api = `https://eliteprotech-apis.zone.id/x?url=${url}`;
        
        const { data } = await axios.get(api);
        
        if (data.status !== "success")
            return reply(`❌ Failed to fetch media.`);
        
        // Thumbnail
        let thumb = data.thumbnail;
        
        // MP3 audio 
        const mp3 = data.mp3?.url;
        
        // Videos array (we will pick ONLY the first one)
        const videos = data.videos;
        const video = videos?.[0]; // pick highest quality (index 0)
        
        // --- SEND THUMBNAIL FIRST ---
        await EliteProTech.sendMessage(m.chat, {
            image: { url: thumb },
            caption: `✨ *X / Twitter Downloader*\nSending your media...`,
        }, { quoted: m });
        
        // --- SEND VIDEO FIRST ---
        if (video) {
            await EliteProTech.sendMessage(m.chat, {
                video: { url: video.url },
                caption: `*🎥 twitter video downloader*`,
            }, { quoted: m });
        }
        
        // --- SEND AUDIO AFTER VIDEO ---
        if (mp3) {
            await EliteProTech.sendMessage(m.chat, {
                audio: { url: mp3 },
                mimetype: "audio/mpeg",
                fileName: "twitter_audio.mp3",
            }, { quoted: m });
        }
        
    } catch (e) {
        console.log(e);
        reply(`❌ Error fetching media.`);
    }
    
}
break
case 'apkdl':
case 'apk': {
    if (!text) return reply(`📦 Enter app name!\n\nExample: ${prefix + command} gemini`);

    await EliteProTech.sendMessage(m.chat, {
        react: { text: '⏳', key: m.key }
    });

    try {
        const { data } = await axios.get(
            `https://eliteprotech-apis.zone.id/apk?q=${encodeURIComponent(text)}`
        );

        if (!data?.status || !Array.isArray(data.results) || !data.results.length) {
            await EliteProTech.sendMessage(m.chat, {
                react: { text: '❌', key: m.key }
            });
            return reply('❌ No APK found.');
        }

        const app = data.results[0];
        const apkUrl = app.file?.path || app.file?.path_alt;

        if (!apkUrl) {
            await EliteProTech.sendMessage(m.chat, {
                react: { text: '❌', key: m.key }
            });
            return reply('❌ Download link not found.');
        }

        const sizeMB = app.file?.filesize
            ? (app.file.filesize / 1024 / 1024).toFixed(2) + ' MB'
            : app.size
                ? (app.size / 1024 / 1024).toFixed(2) + ' MB'
                : 'Unknown';

        const caption = `📦 *APK Downloader*

📱 *Name:* ${app.name}
📦 *Package:* ${app.package || 'N/A'}
👨‍💻 *Developer:* ${app.developer?.name || 'Unknown'}
📁 *Size:* ${sizeMB}
⭐ *Rating:* ${app.stats?.rating?.avg || 'N/A'}

> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴇʟɪᴛᴇ-ᴘʀᴏ-ᴛᴇᴄʜ©`;

        await EliteProTech.sendMessage(m.chat, {
            document: { url: apkUrl },
            mimetype: 'application/vnd.android.package-archive',
            fileName: `${app.name || 'app'}.apk`,
            caption
        }, { quoted: m });

        await EliteProTech.sendMessage(m.chat, {
            react: { text: '✅', key: m.key }
        });

    } catch (err) {
        console.log('APK error:', err.message);

        await EliteProTech.sendMessage(m.chat, {
            react: { text: '❌', key: m.key }
        });

        reply('❌ Error downloading APK.');
    }
}
break
case 'poll': {
    try {
        if (!q) return reply(`*Usage:* ${prefix}poll PollName;Option1;Option2;Option3`);
        
        const data = q.trim();
        const parts = data.split(";").map(x => x.trim());
        
        const pollName = parts.shift();
        if (!pollName || parts.length < 2) {
            return reply("❌ Need a poll name and at least 2 options!");
        }
        
        const pollMessage = {
            poll: {
                name: pollName,
                values: parts,
                selectableCount: 1
            }
        };
        
        await EliteProTech.sendMessage(m.chat, pollMessage, { quoted: m });
        await EliteProTech.sendMessage(m.chat, { react: { text: "🗳️", key: m.key } });
        
    } catch (err) {
        console.error("Poll command error:", err);
        reply("❌ Failed to create poll.");
    }
    break;
}
case 'panel': {
    const coinMenu = `🪙 *EliteProTech Bot Hosting — Coin Purchase Menu* 
🌐 *eliteprotech-hosts.zone.id*

Purchase hosting coins at *affordable prices*.  
*Require 30 coins to deploy*

---
💳 *Coin Pricing List*  
🪙 *1 Coin* — ₦100  
🪙 *5 Coins* — ₦500  
🪙 *10 Coins* — ₦1,000  
🪙 *30 Coins* ⭐ *Best Value* — ₦3,000

---
ℹ️ *Important Info*
- 30 coins = deploy your bot
- Hosting lasts 30 days if not deleted
- Service pauses when coins reach *0*`;
    await sendInteractiveMessage(
        EliteProTech,
        m.chat,
        {
            text: coinMenu,
            footer: '💳 Purchase coins now',
            interactiveButtons: [
                    {
                        name: 'cta_url',
                        buttonParamsJson: JSON.stringify({
                            display_text: 'Open Link',
                            url: "https://wa.me/message/HIA4EOURLFE4K1"
                        })
                    },
                    {
                        name: 'cta_copy',
                        buttonParamsJson: JSON.stringify({
                            display_text: 'Copy Link',
                            copy_code: "https://wa.me/message/HIA4EOURLFE4K1"
                        })
                    },
                    {
                    name: 'quick_reply',
                    buttonParamsJson: JSON.stringify({
                        display_text: '💳 Bot Site',
                        id: `${global.prefix}bot`
                    })
                }
                ]
        },
        { quoted: m }
    );

    break;
}
case 'bot': case 'freebot': {
    const userName = pushname || 'there';
    
    const msg = `👋 Hello *${userName},*

You can deploy your bot on any of the hosting sites below:

*MiniBot - Free*
https://eliteprotech.zone.id/minibot

*AdvanceBot - Paid*
https://eliteprotech-hosts.zone.id`;
    
    reply(msg);
}
break
case 'setprefix':
case 'prefix': {
    if (!isCreator) return reply(mess.owner);

    if (!text) {
        return reply(
            `*Example:*\n${prefix + command} !\n\n` +
            `*Remove prefix:*\n${prefix + command} none`
        );
    }

    const newPrefix = text.trim();

    if (newPrefix.toLowerCase() === 'none') {
        global.prefix = '';

        return reply(
            `✅ Prefix removed.\n\n` +
            `Commands can now be used without a prefix.\n\n` +
            `Example: *menu*`
        );
    }

    if (newPrefix.length > 2) {
        return reply('❌ Prefix must be 1–2 characters.');
    }

    global.prefix = newPrefix;

    return reply(`✅ Prefix updated to *${global.prefix}*`);
}
break;
case 'copy': {
    try {
        if (!m.quoted) {
            return reply('📋 Reply to a message to copy its text');
        }

        let copiedText = '';

        // ✅ Safely extract text from quoted message
        if (m.quoted.text) {
            copiedText = m.quoted.text;
        } else if (m.quoted.caption) {
            copiedText = m.quoted.caption;
        } else if (m.quoted.message?.conversation) {
            copiedText = m.quoted.message.conversation;
        } else if (m.quoted.message?.extendedTextMessage?.text) {
            copiedText = m.quoted.message.extendedTextMessage.text;
        }

        if (!copiedText) {
            return reply('❌ No text found in the replied message');
        }

        const preview =
            copiedText.length > 60
                ? copiedText.slice(0, 60) + '...'
                : copiedText;

        await sendInteractiveMessage(
            EliteProTech,
            m.chat,
            {
                text: `✅ *Text Copied to Clipboard*\n\n📝 *Preview:* ${preview}`,
                footer: 'Choose an action',
                interactiveButtons: [
                    {
                        name: 'cta_copy',
                        buttonParamsJson: JSON.stringify({
                            display_text: '📋 Copy Full Text',
                            copy_code: copiedText
                        })
                    }
                ]
            },
            { quoted: m }
        );

    } catch (err) {
        console.error('Copy Error:', err);
        reply('❌ Failed to copy message text');
    }
}
break;
case 'bet': {
    try {
        await EliteProTech.sendMessage(m.chat, {
            react: { text: '⚽', key: m.key }
        });

        const apiUrl = 'https://apiskeith.top/bet';
        const { data } = await axios.get(apiUrl);

        if (!data.status || !data.result || data.result.length === 0) {
            return reply('❌ No betting predictions available right now.');
        }

        let betText = `⚽ *FOOTBALL BET PREDICTIONS*\n\n`;

        for (let i = 0; i < data.result.length; i++) {
            const mth = data.result[i];

            betText +=
`━━━━━━━━━━━━━━━━━━
🏟 *Match:* ${mth.match}
🏆 *League:* ${mth.league}
⏰ *Time:* ${mth.time}

📊 *Full Time Odds*
• Home: ${mth.predictions.fulltime.home}%
• Draw: ${mth.predictions.fulltime.draw}%
• Away: ${mth.predictions.fulltime.away}%

⚽ *Over 2.5 Goals*
• Yes: ${mth.predictions.over_2_5.yes}%
• No: ${mth.predictions.over_2_5.no}%

🔥 *Both Teams To Score*
• Yes: ${mth.predictions.bothTeamToScore.yes}%
`;
        }

        betText += `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴇʟɪᴛᴇ-ᴘʀᴏ-ᴛᴇᴄʜ©*`;

        await EliteProTech.sendMessage(
            m.chat,
            { text: betText },
            { quoted: m }
        );

    } catch (error) {
        console.error('Bet Error:', error);
        reply('❌ Failed to fetch betting predictions.');
    }
}
break
case 'vocalremover': {
  try {
    await EliteProTech.sendMessage(m.chat, {
      react: { text: '⏳', key: m.key }
    });

    let audioUrl = text;

    // If no URL, check quoted audio
    if (!audioUrl && m.quoted) {
      const quotedMsg = m.quoted.message || m.quoted.msg || m.quoted;
      const mime = quotedMsg?.mimetype || '';

      if (/audio/.test(mime)) {
        const mediaPath = await EliteProTech.downloadAndSaveMediaMessage(m.quoted);
        audioUrl = await uploadToEliteTempUrl(mediaPath);
        fs.unlinkSync(mediaPath);
      } else {
        await EliteProTech.sendMessage(m.chat, {
          react: { text: '❌', key: m.key }
        });
        return reply(
          `❌ Please reply to an audio file or provide an audio URL.\n\nExample:\n${prefix}vocalremove https://example.com/song.mp3`
        );
      }
    }

    if (!audioUrl) {
      await EliteProTech.sendMessage(m.chat, {
        react: { text: '❌', key: m.key }
      });
      return reply(
        `❌ Please reply to an audio file or provide an audio URL.\n\nExample:\n${prefix}vocalremove https://example.com/song.mp3`
      );
    }

    const apiUrl =
      `https://eliteprotech-apis.zone.id/vocalremove` +
      `?url=${encodeURIComponent(audioUrl)}`;

    const { data } = await axios.get(apiUrl);

    if (!data?.success || !data?.instrumental || !data?.vocal) {
      await EliteProTech.sendMessage(m.chat, {
        react: { text: '❌', key: m.key }
      });
      return reply('❌ Failed to remove vocals from audio.');
    }

    // Send Instrumental
    await EliteProTech.sendMessage(
      m.chat,
      {
        audio: { url: data.instrumental },
        mimetype: 'audio/mpeg',
        caption: '🎵 Instrumental (No Vocals)'
      },
      { quoted: m }
    );

    // Send Vocal
    await EliteProTech.sendMessage(
      m.chat,
      {
        audio: { url: data.vocal },
        mimetype: 'audio/mpeg',
        caption: '🎤 Vocals Only'
      },
      { quoted: m }
    );

    await EliteProTech.sendMessage(m.chat, {
      react: { text: '✅', key: m.key }
    });

  } catch (error) {
    console.error(error);
    await EliteProTech.sendMessage(m.chat, {
      react: { text: '❌', key: m.key }
    });
    reply('❌ Error occurred while removing vocals.');
  }
  break;
}
case 'colorize': {
  try {
    await EliteProTech.sendMessage(m.chat, {
      react: { text: '⏳', key: m.key }
    });

    // Default sharp enhancement prompt
    let prompt = 'enhanced colors';
    let imgUrl;

    // If user typed a prompt (e.g. "colorize sunny")
    if (text) {
      prompt = text.trim();
    }

    // If user replied to an image
    if (m.quoted) {
      const quotedMsg = m.quoted.message || m.quoted.msg || m.quoted;
      const mime = quotedMsg?.mimetype || '';

      if (/image/.test(mime)) {
        const mediaPath = await EliteProTech.downloadAndSaveMediaMessage(m.quoted);
        imgUrl = await uploadToEliteTempUrl(mediaPath);
        fs.unlinkSync(mediaPath);
      }
    }

    // If no quoted image, check if first arg is URL
    if (!imgUrl && text?.startsWith('http')) {
      imgUrl = text.trim();
      // reset prompt to default if text was actually a URL
      prompt = 'highly detailed, sharp focus, enhanced colors, realistic lighting';
    }

    if (!imgUrl) {
      await EliteProTech.sendMessage(m.chat, {
        react: { text: '❌', key: m.key }
      });
      return reply(
        `❌ Please reply to an image or provide an image URL.\n\n` +
        `Example:\n` +
        `${prefix}colorize sunny\n` +
        `${prefix}colorize (reply to image)`
      );
    }

    const apiUrl =
      `https://eliteprotech-apis.zone.id/colorize` +
      `?url=${encodeURIComponent(imgUrl)}` +
      `&prompt=${encodeURIComponent(prompt)}`;

    const { data } = await axios.get(apiUrl);

    if (!data?.success || !data?.result) {
      await EliteProTech.sendMessage(m.chat, {
        react: { text: '❌', key: m.key }
      });
      return reply('❌ Failed to colorize image.');
    }

    await EliteProTech.sendMessage(
      m.chat,
      {
        image: { url: data.result },
        caption:
          `✅ Image colorized successfully!\n` +
          `🎨 Prompt: *${prompt}*`
      },
      { quoted: m }
    );

    await EliteProTech.sendMessage(m.chat, {
      react: { text: '✅', key: m.key }
    });

  } catch (error) {
    console.error(error);
    await EliteProTech.sendMessage(m.chat, {
      react: { text: '❌', key: m.key }
    });
    reply('❌ Error occurred while colorizing image.');
  }
  break;
}
case 'deepfake': {
  try {
    await EliteProTech.sendMessage(m.chat, {
      react: { text: '⏳', key: m.key }
    });

    let prompt = 'Change my image';
    let imgUrl;

    if (text && !text.startsWith('http')) {
      prompt = text.trim();
    }

    if (m.quoted) {
      const quotedMsg = m.quoted.message || m.quoted.msg || m.quoted;
      const mime = quotedMsg?.mimetype || '';

      if (/image/.test(mime)) {
        const mediaPath = await EliteProTech.downloadAndSaveMediaMessage(m.quoted);
        imgUrl = await uploadToEliteTempUrl(mediaPath);
        fs.unlinkSync(mediaPath);
      }
    }

    if (!imgUrl && text?.startsWith('http')) {
      imgUrl = text.trim();
    }

    if (!imgUrl) {
      await EliteProTech.sendMessage(m.chat, {
        react: { text: '❌', key: m.key }
      });
      return reply(
        `❌ Please reply to an image or provide an image URL.\n\n` +
        `Example:\n` +
        `${prefix}deepfake Change my image\n` +
        `${prefix}deepfake (reply to image)`
      );
    }

    const apiUrl =
      `https://eliteprotech-apis.zone.id/deepfake` +
      `?prompt=${encodeURIComponent(prompt)}` +
      `&imageUrl=${encodeURIComponent(imgUrl)}`;

    const { data } = await axios.get(apiUrl);

    if (!data?.success || !data?.result?.generate_url) {
      await EliteProTech.sendMessage(m.chat, {
        react: { text: '❌', key: m.key }
      });
      return reply('❌ Deepfake generation failed.');
    }

    await EliteProTech.sendMessage(
      m.chat,
      {
        image: { url: data.result.generate_url },
        caption:
          `✅ Deepfake generated successfully!\n` +
          `🎭 Prompt: *${prompt}*`
      },
      { quoted: m }
    );

    await EliteProTech.sendMessage(m.chat, {
      react: { text: '✅', key: m.key }
    });

  } catch (error) {
    console.error(error);
    await EliteProTech.sendMessage(m.chat, {
      react: { text: '❌', key: m.key }
    });
    reply('❌ Error occurred while generating deepfake image.');
  }
  break;
}
case 'deletesession':
case 'delsession':
case 'clearsession': {
if (!isCreator) return reply(mess.owner)
                fs.readdir("./session", async function(err, files) {
                    if (err) {
                        console.log('Unable to scan directory: ' + err);
                        return reply('Unable to scan directory: ' + err);
                    }
                    let filteredArray = await files.filter(item => item.startsWith("pre-key") ||
                        item.startsWith("sender-key") || item.startsWith("session-") || item.startsWith("app-state")
                    )
                    console.log(filteredArray.length);
                    let teks = `Detected ${filteredArray.length} junk files\n\n`
                    if (filteredArray.length == 0) return reply(teks)
                    filteredArray.map(function(e, i) {
                        teks += (i + 1) + `. ${e}\n`
                    })
                    reply(teks)
                    await sleep(2000)
                    reply("Deleting junk files...")
                    await filteredArray.forEach(function(file) {
                        fs.unlinkSync(`./session/${file}`)
                    });
                    await sleep(2000)
                    reply("Successfully deleted all the trash in the session folder")
                });
            }
break
case 'fdroid': {
  if (!text) return reply(`❌ Please provide a search query.\n\nExample:\n${prefix + command} chrome`)

  try {
    await EliteProTech.sendMessage(m.chat, {
      react: { text: '🔍', key: m.key }
    })

    const apiUrl = `https://eliteprotech-apis.zone.id/fdriod?q=${encodeURIComponent(text)}`
    const { data } = await axios.get(apiUrl)

    if (!data?.success || !data.result) {
      return reply(`❌ No results found for: ${text}`)
    }

    const app = data.result

    const caption = `📱 *F-Droid App Info*

*Name:* ${app.name}
*Summary:* ${app.summary}
*Version:* ${app.version}
*Website:* ${app.website}
*Source:* ${app.source}

*Description:*
${app.description}

📦 *Sending APK...*`
    await EliteProTech.sendMessage(
      m.chat,
      {
        image: { url: app.icon },
        caption
      },
      { quoted: m }
    )
    await EliteProTech.sendMessage(
      m.chat,
      {
        document: { url: app.apkUrl },
        mimetype: 'application/vnd.android.package-archive',
        fileName: `${app.name.replace(/[^a-zA-Z0-9]/g, '_')}_${app.version}.apk`
      },
      { quoted: m }
    )

  } catch (err) {
    console.error(err)
    reply('❌ Error fetching F-Droid app info.')
  }
  break
}
case 'togroupstatus':
case 'groupstatus':
case 'gcstatus': {
    if (!isCreator) return reply(mess.owner)
    let groupId = m.isGroup ? m.chat : ''
    let msgText = text || ''
    if (!m.isGroup) {
        const args = (text || '').trim().split(/\s+/)
        groupId = args.shift()
        msgText = args.join(' ').trim()
        if (!groupId || !groupId.endsWith('@g.us')) {
            return reply(`Provide a valid group JID.\n\nExample:\n${prefix + command} 1203630xxxx@g.us Hello group`)
        }
    }
    if (!groupId || !groupId.endsWith('@g.us')) {
        return reply('Group JID not found or invalid.')
    }
    let targetGroupName = groupId
    try {
        const meta = await EliteProTech.groupMetadata(groupId)
        targetGroupName = meta?.subject || groupId
    } catch {}
    await EliteProTech.sendMessage(m.chat, {
        react: { text: '⏳', key: m.key }
    })
    try {
        if (!m.quoted) {
            if (!msgText) {
                await EliteProTech.sendMessage(m.chat, {
                    react: { text: '❌', key: m.key }
                })
                return reply('Provide text or reply to media.')
            }
            await EliteProTech.sendMessage(groupId, {
                groupStatusMessage: {
                    text: msgText,
                    backgroundColor: '#25D366',
                    font: 1
                }
            })
            await EliteProTech.sendMessage(m.chat, {
                react: { text: '✅', key: m.key }
            })
            return reply(`Group status text sent to ${targetGroupName}`)
        }
        const quoted = m.quoted
        const mime = quoted.mimetype || quoted.msg?.mimetype || ''
        const caption = msgText || quoted.caption || ''
        if (!mime) {
            const textMessage = quoted.text || quoted.body || quoted.message?.conversation || quoted.msg?.text || caption
            if (!textMessage) {
                return reply('Quoted message contains no text.')
            }
            await EliteProTech.sendMessage(groupId, {
                groupStatusMessage: {
                    text: textMessage,
                    backgroundColor: '#25D366',
                    font: 1
                }
            })
            await EliteProTech.sendMessage(m.chat, {
                react: { text: '✅', key: m.key }
            })
            return reply(`Group status text sent to ${targetGroupName}`)
        }
        if (/image/.test(mime)) {
            const buffer = await quoted.download()
            await EliteProTech.sendMessage(groupId, {
                groupStatusMessage: {
                    image: buffer,
                    caption
                }
            })
            await EliteProTech.sendMessage(m.chat, {
                react: { text: '✅', key: m.key }
            })
            return reply(`Group status image sent to ${targetGroupName}`)
        }
        if (/video/.test(mime)) {
            const buffer = await quoted.download()
            await EliteProTech.sendMessage(groupId, {
                groupStatusMessage: {
                    video: buffer,
                    caption,
                    mimetype: 'video/mp4'
                }
            })
            await EliteProTech.sendMessage(m.chat, {
                react: { text: '✅', key: m.key }
            })
            return reply(`Group status video sent to ${targetGroupName}`)
        }
        if (/audio/.test(mime)) {
            const buffer = await quoted.download()
            await EliteProTech.sendMessage(groupId, {
                groupStatusMessage: {
                    audio: buffer,
                    mimetype: mime || 'audio/mp4',
                    ptt: true
                }
            })
            await EliteProTech.sendMessage(m.chat, {
                react: { text: '✅', key: m.key }
            })
            return reply(`Group status audio sent to ${targetGroupName}`)
        }
        await EliteProTech.sendMessage(m.chat, {
            react: { text: '❌', key: m.key }
        })
        return reply('Unsupported message type. Use text, image, video, or audio.')
    } catch (err) {
        console.log('GroupStatus error:', err.message)
        await EliteProTech.sendMessage(m.chat, {
            react: { text: '❌', key: m.key }
        })
        return reply(`Failed to send group status.\n${err.message || err}`)
    }
}
break
case 'tempemail':
case 'tempmail': {
    try {
        const { data } = await axios.get('https://eliteprotech-apis.zone.id/tempemail')

        if (!data?.success || !data.email) {
            return reply('❌ Failed to generate temporary email.')
        }

        reply(`
📩 *TEMP EMAIL CREATED*

📧 Email:
${data.email}

📥 Check inbox using:
.tempinbox ${data.email}

⚠️ This email is temporary.
        `.trim())

    } catch (err) {
        console.error(err)
        reply('❌ Error generating temp email.')
    }
}
break
case 'tempinbox': {
    try {
        if (!text) {
            return reply(`⚠️ Provide the email address\n\nExample:\n.tempinbox test@gmail.com`)
        }

        const { data } = await axios.get(
            `https://eliteprotech-apis.zone.id/tempemail?email=${encodeURIComponent(text)}`
        )

        if (!data?.success) {
            return reply('❌ Failed to fetch inbox.')
        }

        if (!data.inbox) {
            return reply('📭 Inbox is empty.')
        }

        const inbox = data.inbox
        const message = inbox.html
            ? inbox.html.replace(/<[^>]*>/g, '').trim()
            : 'No message content'

        reply(`
📥 *TEMP EMAIL INBOX*

📧 Email:
${data.email}

👤 From: ${inbox.from}
📝 Subject: ${inbox.subject}
⏰ Time: ${inbox.time}

📨 Message:
${message}
        `.trim())

    } catch (err) {
        console.error(err)
        reply('❌ Error fetching inbox.')
    }
}
break
case 'listowner':
case 'listsudo': {
    try {
        if (!isCreator) {
            return reply(mess.owner);
        }
        
        const owners = owner;
        const currentOwner = ownernumber; // from your base
        
        const mainOwner = owners[0] || 'Not defined';
        const otherOwners = owners.slice(1);
        
        let msg =
            `*List of owners:*

*Default:*
- ${mainOwner}

*Current Owner:*
- ${currentOwner}`;
        
        if (otherOwners.length) {
            msg += `

*Others:*
${otherOwners.map(o => `- ${o}`).join('\n')}`;
        }
        
        reply(msg);
    } catch (err) {
        console.error(err);
        reply('❌ Failed to fetch owner numbers.');
    }
}
break
case 'search':
case 'copilot': {
    if (!text) return reply(`Example:\n${prefix + command} who is the owner of EliteProTech`)
    
    try {
        await EliteProTech.sendMessage(m.chat, {
            react: { text: "🔍", key: m.key }
        })
        
        const apiUrl = `https://eliteprotech-apis.zone.id/copilot?q=${encodeURIComponent(text)}`
        const { data } = await axios.get(apiUrl)
        
        if (!data || !data.success) {
            return reply('❌ Search failed. Please try again.')
        }
        
        let resultText = `🔎 *Search Results:*\n\n${data.text}\n`
        
        if (data.citations && data.citations.length > 0) {
            resultText += `\n📚 *Sources:*\n`
            data.citations.forEach((c, i) => {
                resultText += `${i + 1}. ${c.title}\n${c.url}\n\n`
            })
        }
        
        resultText += `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴇʟɪᴛᴇ-ᴘʀᴏ-ᴛᴇᴄʜ©*`
        
        await EliteProTech.sendMessage(m.chat, {
            text: resultText
        }, { quoted: m })
        
    } catch (err) {
        console.error('Search Error:', err)
        reply('❌ An error occurred while performing the search.')
    }
}
break
case 'approve': {
    if (!m.isGroup) return reply('❌ This command is for groups only.')
    if (!isAdmins && !isGroupOwner && !isCreator) return reply('❌ Admin only command.')
    if (!isBotAdmins) return reply('❌ I must be admin to do that.')
    
    try {
        let users = []
        
        if (m.mentionedJid.length > 0) {
            users = m.mentionedJid
        } else if (m.quoted?.sender) {
            users = [m.quoted.sender]
        } else if (args[0]) {
            users = [args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net']
        } else {
            const requests = await EliteProTech.groupRequestParticipantsList(m.chat)
            if (!requests || requests.length === 0) {
                return reply('✅ No pending join requests.')
            }
            users = requests.map(v => v.jid)
        }
        
        await EliteProTech.groupRequestParticipantsUpdate(
            m.chat,
            users,
            'approve'
        )
        
        let approvedText = `✅ *Approved Member(s):*\n\n`
        
        for (let jid of users) {
            const number = jid.split('@')[0]
            approvedText += `• @${number}\n`
        }
        
        approvedText += `\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴇʟɪᴛᴇ-ᴘʀᴏ-ᴛᴇᴄʜ©*`
        
        await EliteProTech.sendMessage(m.chat, {
            text: approvedText,
            mentions: users
        }, { quoted: m })
        
    } catch (err) {
        console.error('Approve Error:', err)
        reply('❌ Failed to approve group request(s).')
    }
}
break
case 'reject': {
    if (!m.isGroup) return reply('❌ This command is for groups only.')
    if (!isAdmins && !isGroupOwner && !isCreator) return reply('❌ Admin only command.')
    if (!isBotAdmins) return reply('❌ I must be admin to do that.')
    
    try {
        let users = []
        
        if (m.mentionedJid.length > 0) {
            users = m.mentionedJid
        } else if (m.quoted?.sender) {
            users = [m.quoted.sender]
        } else if (args[0]) {
            users = [args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net']
        } else {
            const requests = await EliteProTech.groupRequestParticipantsList(m.chat)
            if (!requests || requests.length === 0) {
                return reply('✅ No pending join requests.')
            }
            users = requests.map(v => v.jid)
        }
        
        await EliteProTech.groupRequestParticipantsUpdate(
            m.chat,
            users,
            'reject'
        )
        
        let rejectText = `❌ *Rejected Member(s):*\n\n`
        
        for (let jid of users) {
            const number = jid.split('@')[0]
            rejectText += `• @${number}\n`
        }
        
        rejectText += `\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴇʟɪᴛᴇ-ᴘʀᴏ-ᴛᴇᴄʜ©*`
        
        await EliteProTech.sendMessage(m.chat, {
            text: rejectText,
            mentions: users
        }, { quoted: m })
        
    } catch (err) {
        console.error('Reject Error:', err)
        reply('❌ Failed to reject group request(s).')
    }
}
break
case 'groupjid':
case 'group-jid':
case 'groupid':
case 'group-id': {
    if (!text) return reply('Please provide the group invite link.');

    if (!text.includes('chat.whatsapp.com/')) {
        return reply('Invalid group invite link.');
    }

    const match = text.match(/chat\.whatsapp\.com\/([A-Za-z0-9]+)/);
    if (!match) return reply('Invalid group invite link.');

    const inviteCode = match[1];

    try {
        const res = await EliteProTech.groupGetInviteInfo(inviteCode);

        const msgText = 
`👥 *Whatsapp Group Info:*
📝 *Group Name:*
${res.subject}

📌 *Invite Code:*
${inviteCode}

🆔 *Group ID:*
${res.id}

🔗 *Link:*
${text}`;

        await sendInteractiveMessage(
            EliteProTech,
            m.chat,
            {
                text: msgText,
                footer: '> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴇʟɪᴛᴇ-ᴘʀᴏ-ᴛᴇᴄʜ©*',
                interactiveButtons: [
                    {
                        name: 'cta_copy',
                        buttonParamsJson: JSON.stringify({
                            display_text: 'Copy Group ID 📋',
                            copy_code: res.id
                        })
                    }
                ]
            },
            { quoted: m }
        );

    } catch (err) {
        console.error(err);
        reply('❌ Failed to resolve group ID. Make sure the link is valid and not revoked.');
    }
}
break
case 'imagine': {
    if (!q) return reply(`⚠️ Example: *${prefix + command} a man walking on the moon*`)

    try {
        await EliteProTech.sendMessage(m.chat, {
            react: { text: "🎨", key: m.key }
        })

        const { data } = await axios.get(
            `https://eliteprotech-apis.zone.id/imagine?prompt=${encodeURIComponent(q)}`,
            { responseType: 'arraybuffer' }
        )

        await EliteProTech.sendMessage(m.chat, {
            image: data,
            caption: `*Image Generated Successfully ✅*`
        }, { quoted: m })

        await EliteProTech.sendMessage(m.chat, {
            react: { text: "✅", key: m.key }
        })

    } catch (err) {
        console.error('Imagine Error:', err)
        reply('❌ Failed to generate image.')
    }
}
break
case 'analyze': {
    try {
        if (!m.quoted || !/image/.test(mime)) {
            return reply(`⚠️ Reply to an image.\n\nExample:\nReply image → ${prefix + command} what's this about`)
        }
        
        if (!q) {
            return reply(`⚠️ Provide a question.\nExample:\n${prefix + command} what's this about`)
        }
        
        const buffer = await quoted.download()
        const tempPath = `./temp_${Date.now()}.jpg`
        
        fs.writeFileSync(tempPath, buffer)
        
        const imageUrl = await uploadToEliteTempUrl(tempPath)
        
        fs.unlinkSync(tempPath)
        
        const apiUrl = `https://eliteprotech-apis.zone.id/analyze?url=${encodeURIComponent(imageUrl)}&question=${encodeURIComponent(q)}`
        const { data } = await axios.get(apiUrl)
        
        if (!data.status) {
            return reply('❌ Failed to analyze image.')
        }
        
        const resultText = `🧠 *Image Analysis*

📌 *Question:* ${data.question}
🌍 *Language:* ${data.language}

${data.result}`
        
        reply(resultText)
        
    } catch (err) {
        console.error('Analyze Error:', err)
        reply('❌ Failed to analyze image.')
    }
}
break
case 'fakech':
case 'fakechannel': {

if (!text) return reply(`Usage Example:

${prefix + command} ElitePro | 35K | Welcome To My Channel | 06/04/20`)

let parts = text.split('|').map(v => v.trim())

let name = parts[0]
let followers = parts[1]
let desc = parts[2]
let date = parts[3]

if (!name || !followers || !desc || !date) {
return reply(`Wrong format!

Example:
${prefix + command} ElitePro | 35K | Welcome To My Channel | 06/04/20`)
}

try {

await EliteProTech.sendMessage(m.chat, { react: { text: "📢", key: m.key } })

let avatar

if (quoted && /image/.test(mime)) {

let media = await quoted.download()
let upload = await uploadToEliteTempUrl(media)
avatar = upload.url

} else {

avatar = await EliteProTech.profilePictureUrl(m.sender, 'image')
.catch(() => 'https://files.catbox.moe/5x0h7n.jpg')

}

let api = `https://api.zenzxz.my.id/maker/fakechannel?url=${encodeURIComponent(avatar)}&name=${encodeURIComponent(name)}&followers=${encodeURIComponent(followers)}&desc=${encodeURIComponent(desc)}&date=${encodeURIComponent(date)}`

await EliteProTech.sendMessage(m.chat, {
image: { url: api },
caption: `📢 *Fake Channel Generated*

👤 Name : ${name}
👥 Followers : ${followers}
📅 Date : ${date}
📝 Description : ${desc}
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴇʟɪᴛᴇ-ᴘʀᴏ-ᴛᴇᴄʜ©*`
}, { quoted: m })

await EliteProTech.sendMessage(m.chat, { react: { text: "✅", key: m.key } })

} catch (err) {
console.log(err)
reply("❌ Error creating fake channel image.")
}
}
break
case "fakedana":
case "dana":
case "fdana": {
try {

if (!text) return reply(`⚠️ Usage Example :

${prefix + command} 5.000`)

await EliteProTech.sendMessage(m.chat, {
react: { text: "💳", key: m.key }
})

let nominal = text.trim()

let api = `https://api.zenzxz.my.id/maker/fakedanav2?nominal=${encodeURIComponent(nominal)}`

await EliteProTech.sendMessage(m.chat, {
image: { url: api },
caption: `💳 *Fake Dana Generated*
💰 Nominal : ${nominal}
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴇʟɪᴛᴇ-ᴘʀᴏ-ᴛᴇᴄʜ©*`
}, { quoted: m })

await EliteProTech.sendMessage(m.chat, {
react: { text: "✅", key: m.key }
})

} catch (err) {

console.log("FakeDana Error:", err)

reply(`❌ Failed to create Fake Dana image.`)

await EliteProTech.sendMessage(m.chat, {
react: { text: "❌", key: m.key }
})

}
}
break
case 'country': case 'countries': {
    if (!q) return reply(`⚠️ Example: *${prefix + command} nigeria*`);

    try {
        await EliteProTech.sendMessage(m.chat, {
            react: { text: "🌍", key: m.key }
        });

        const { data } = await axios.get(
            `https://eliteprotech-apis.zone.id/countries?q=${encodeURIComponent(q)}`
        );

        if (!data.status || !data.result) {
            return reply('❌ Country not found. Please check the name and try again.');
        }

        const country = data.result;
        const currencies = country.currencies.map(c => `${c.name} (${c.symbol})`).join(', ');
        const languages = country.languages.join(', ');

        const caption = `
*Country:* ${country.name}
*Official Name:* ${country.officialName}
*Capital:* ${country.capital}
*Region:* ${country.region} - ${country.subregion}
*Population:* ${country.population.toLocaleString()}
*Area:* ${country.area}
*Currencies:* ${currencies}
*Languages:* ${languages}
        `;

        await EliteProTech.sendMessage(m.chat, {
            image: { url: country.flag.image },
            caption: caption
        }, { quoted: m });

        await EliteProTech.sendMessage(m.chat, {
            react: { text: "✅", key: m.key }
        });

    } catch (err) {
        console.error('Country Command Error:', err);
        reply('❌ Failed to fetch country information.');
    }
}
break
case 'edit': {
if (!isCreator) return reply(mess.owner)

if (!m.quoted) return reply("Reply to a bot message")

if (!q) return reply("Please provide a message you want to edit to.")

let key = m.quoted

await EliteProTech.sendMessage(m.chat, {
    edit: key,
    text: q
})

}
break
case 'blocklist': {
if (!isCreator) return reply(mess.owner)

let block = await EliteProTech.fetchBlocklist()

if (!block || block.length === 0) {
return reply("No users are blocked.")
}

let teks = `*📛 Blocked Users List*\n\nTotal: ${block.length}\n\n`

for (let i of block) {
teks += `• @${i.split("@")[0]}\n`
}

EliteProTech.sendMessage(m.chat, {
text: teks,
mentions: block
}, { quoted: m })

}
break
case 'tgpack': case 'telegramsticker': {
if (!q) return reply(`⚠️ Example:\n${prefix + command} https://t.me/addstickers/packname`)

try {

await EliteProTech.sendMessage(m.chat,{
react:{ text:"📦", key:m.key }
})

let link = q.includes("t.me") ? q : `https://t.me/addstickers/${q}`

const api = `https://apis.davidcyril.name.ng/telegram-sticker?url=${encodeURIComponent(link)}`
const { data } = await axios.get(api)

if (!data.status) return reply("❌ Cannot view sticker information.")

const pack = data.result
const stickers = pack.sticker

let text = `*📦 TELEGRAM STICKER PACK*
📛 Name: ${pack.name}
🏷 Title: ${pack.title}
🎭 Type: ${pack.sticker_type}
🧩 Total Stickers: ${stickers.length}
━━━━━━━━━━━━━━━━⬣
⏳ Sending stickers...
> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴇʟɪᴛᴇ-ᴘʀᴏ-ᴛᴇᴄʜ`

await EliteProTech.sendMessage(m.chat,{ text },{ quoted:m })

let sent = 0

for (let s of stickers) {

if (sent >= 20) break
if (!s.url.endsWith(".webp")) continue

try {

await EliteProTech.sendImageAsSticker(
m.chat,
s.url,
m,
{
packname: global.packname,
author: global.author
}
)

sent++

} catch(e) {
console.log("Sticker error:", e)
}

}

await EliteProTech.sendMessage(m.chat,{
text:`*✅ STICKERS SENT*
📦 Pack: ${pack.title}
📤 Sent: ${sent} stickers
> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴇʟɪᴛᴇ-ᴘʀᴏ-ᴛᴇᴄʜ`
},{ quoted:m })

await EliteProTech.sendMessage(m.chat,{
react:{ text:"✅", key:m.key }
})

} catch(err) {
console.error("tgpack error:", err)
reply("❌ Failed to download sticker pack.")
}
}
break
case 'settings': {
if (!isCreator) return reply(mess.owner)
let txt = `⚙️ *ELITEPRO BOT SETTINGS*\n`
txt += `╭───────────────━⊷\n`
txt += `┃ 📊 Auto Status View : ${autoviewstatus ? "✅ ON" : "❌ OFF"}\n`
txt += `┃ ❤️ Auto Status Like : ${autolikestatus ? "✅ ON" : "❌ OFF"}\n`
txt += `┃ 📖 Auto Read        : ${autoread ? "✅ ON" : "❌ OFF"}\n`
txt += `┃ ⌨️ Auto Typing      : ${autoTyping ? "✅ ON" : "❌ OFF"}\n`
txt += `┃ 🎙️ Auto Recording   : ${autoRecording ? "✅ ON" : "❌ OFF"}\n`
txt += `┃ 🎧 Auto RecordType  : ${autorecordtype ? "✅ ON" : "❌ OFF"}\n`
txt += `┃ 📝 Auto Bio         : ${autobio ? "✅ ON" : "❌ OFF"}\n`
txt += `╰───────────────━⊷\n\n`

txt += `📌 *Available Commands*\n`
txt += `╭───────────────━⊷\n`
txt += `┃ ${prefix}autoviewstatus on/off\n`
txt += `┃ ${prefix}autolikestatus on/off\n`
txt += `┃ ${prefix}autoread on/off\n`
txt += `┃ ${prefix}autotyping on/off\n`
txt += `┃ ${prefix}autorecording on/off\n`
txt += `┃ ${prefix}autorecordtype on/off\n`
txt += `┃ ${prefix}autobio on/off\n`
txt += `╰───────────────━⊷\n`

txt += `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴇʟɪᴛᴇ-ᴘʀᴏ-ᴛᴇᴄʜ©*`

await EliteProTech.sendMessage(m.chat, {
    image: elitepropic,
    caption: txt
}, { quoted: m })
}
break
case 'profile': {
let target = m.sender
const defaultPP = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png'

if (m.quoted && m.quoted.sender) {
target = m.quoted.sender
} else if (m.mentionedJid && m.mentionedJid.length > 0) {
target = m.mentionedJid[0]
} else if (text) {
let number = text.replace(/[^0-9]/g, '')
if (!number) return reply('Provide a valid number.')
target = number + '@s.whatsapp.net'
}

let pp
try {
pp = await EliteProTech.profilePictureUrl(target, 'image')
} catch {
pp = defaultPP
}

let about = "No status"
let setAt = ""

try {
const statusData = await EliteProTech.fetchStatus(target)
if (statusData && statusData[0] && statusData[0].status) {
about = statusData[0].status.status || "No status"
setAt = statusData[0].status.setAt
? `\n• Last Updated: ${new Date(statusData[0].status.setAt).toLocaleString()}`
: ""
}
} catch {}

let businessText = ""

try {
const biz = await EliteProTech.getBusinessProfile(target)
if (biz) {

let hours = ""
if (biz.business_hours?.business_config) {
hours = biz.business_hours.business_config
.map(d => `• ${d.day_of_week.charAt(0).toUpperCase() + d.day_of_week.slice(1)}: ${d.mode.replace('_', ' ')}`)
.join('\n')
}

businessText = `

*Business Profile*
• WhatsApp ID: ${biz.wid || "N/A"}
• Category: ${biz.category || "N/A"}
• Description: ${biz.description || "N/A"}
• Website: ${biz.website?.join(', ') || "N/A"}
• Email: ${biz.email || "N/A"}
• Address: ${biz.address || "N/A"}
• Timezone: ${biz.business_hours?.timezone || "N/A"}
• Business Hours:
${hours}`
}
} catch {}

const caption = `*User Profile*
• Number: @${target.split('@')[0]}
• About: ${about}${setAt}
${businessText}`

await EliteProTech.sendMessage(
m.chat,
{
image: { url: pp },
caption: caption,
mentions: [target]
},
{ quoted: m }
)
}
break
case 'antistatus': {
    if (!m.isGroup) return reply('❌ Group only command')
    if (!isAdmins && !isCreator) return reply(mess.admin)

    let data = {}
    try {
        data = JSON.parse(fs.readFileSync('./database/antistatus.json'))
    } catch {}

    if (!data[m.chat]) data[m.chat] = { enabled: false, mode: 'warn', limit: 3, users: {} }

    const settings = data[m.chat]

    if (!args[0]) {
        if (!settings.enabled) {
            return reply(`⚙️ AntiStatus Settings

Status: ❌ Disabled

Use:
${prefix + command} enable`)
        }

        return reply(`⚙️ AntiStatus Settings

Status: ✅ Enabled
Mode: ${settings.mode}
Limit: ${settings.limit}

Options:
${prefix + command} delete
${prefix + command} warn
${prefix + command} warnkick
${prefix + command} kick
${prefix + command} 3

Disable:
${prefix + command} disable`)
    }

    if (args[0] === 'enable') {
        settings.enabled = true
        settings.mode = 'warn'
        settings.limit = 3
        reply(`✅ AntiStatus has been enabled for this chat.\nFor settings use: ${prefix}antistatus`)
    } 
    
    else if (args[0] === 'disable') {
        settings.enabled = false
        reply('❌ AntiStatus has been disabled.')
    } 
    
    else if (!settings.enabled) {
        return reply(`❌ AntiStatus is disabled.\nUse ${prefix + command} enable first.`)
    }

    else if (args[0] === 'delete') {
        settings.mode = 'delete'
        reply('🗑️ Action set to delete only.')
    } 
    
    else if (args[0] === 'warn') {
        settings.mode = 'warn'
        reply('⚠️ Action set to warn system.')
    } 
    
    else if (args[0] === 'warnkick') {
        settings.mode = 'warnkick'
        reply('🚫 Action set to warn then kick.')
    } 
    
    else if (args[0] === 'kick') {
        settings.mode = 'kick'
        reply('🚫 Action set to instant kick.')
    } 
    
    else if (!isNaN(args[0])) {
        settings.limit = parseInt(args[0])
        reply(`🔢 Warn limit set to ${args[0]}`)
    } 
    
    else {
        reply('❌ Invalid option')
    }

    fs.writeFileSync('./database/antistatus.json', JSON.stringify(data, null, 2))
}
break
case 'av':
case 'aivoice': {
    try {
        let query = q || '';
        if (m.quoted && m.quoted.text) {
            query = query ? query + ' ' + m.quoted.text : m.quoted.text;
        }
        if (!query) {
            return reply(`Example: .aivoice Hello or reply to a message`);
        }
        await EliteProTech.sendPresenceUpdate('recording', m.chat);
        const aiRes = await axios.get(
            `https://eliteprotech-apis.zone.id/gpt?prompt=${encodeURIComponent(query)}`
        );
        if (!aiRes.data?.success || !aiRes.data?.response) {
            return reply('❌ Failed to generate AI response.');
        }
        const aiText = aiRes.data.response.slice(0, 1000);
        const voiceRes = await axios.get(
            `https://apis.davidcyril.name.ng/tools/speechma?text=${encodeURIComponent(aiText)}&voice=Andrew&pitch=2&rate=1`,
            { responseType: 'arraybuffer' }
        );
        const voice = await toPTT(Buffer.from(voiceRes.data), 'mp3');
        await EliteProTech.sendMessage(
            m.chat,
            {
                audio: voice,
                mimetype: 'audio/ogg; codecs=opus',
                ptt: true
            },
            { quoted: m }
        );
    } catch (err) {
        console.error('AIVoice Error:', err);
        reply('❌ Error occurred while generating aivoice.');
    }
}
break
case 'knackvideo': {
    try {
        await EliteProTech.sendMessage(m.chat, {
            react: { text: '🎬', key: m.key }
        })
        
        const apiUrl = `https://apis.davidcyril.name.ng/knackvideos` 
        const { data } = await axios.get(apiUrl)
        
        if (!data || !data.downloadUrl) {
            return reply('❌ Failed to fetch video.')
        }
        
        const caption = `🎥 *Random knacking Video*`
        
        await EliteProTech.sendMessage(m.chat, {
            video: { url: data.downloadUrl },
            mimetype: 'video/mp4',
            caption
        }, { quoted: m })
        
        await EliteProTech.sendMessage(m.chat, {
            react: { text: '✅', key: m.key }
        })
        
    } catch (err) {
        console.error('Video Error:', err)
        reply('❌ Error fetching video.')
    }
}
break
case 'setmenuimage': case 'setbotimage': {
    if (!isCreator) return reply('Only owner can use this command.')

    if (!m.quoted || !/image/.test(mime)) {
        return reply('Reply to an image to set as menu image.')
    }

    try {
        let media = await quoted.download()

        fs.writeFileSync('./database/elitepropic.jpg', media)

        elitepropic = media

        reply('✅ Menu image updated successfully!')

    } catch (err) {
        console.error(err)
        reply('❌ Failed to update menu image.')
    }
}
break
case 'ephotolist': {
    reply(`🎨 *Available Ephoto Styles:*

glitchtext, writetext, advancedglow, typographytext, pixelglitch, neonglitch
flagtext, flag3dtext, deletingtext, blackpinkstyle, glowingtext
underwatertext, logomaker, cartoonstyle, papercutstyle, watercolortext
effectclouds, blackpinklogo, gradienttext, summerbeach, luxurygold
multicoloyellowneon, sandsummer, galaxywallpaper, 1917style
makingneon, royaltext, freecreate, galaxystyle, lighteffects

📌 Usage:
${prefix}ephoto style text`);
}
break;
case 'ephoto': {
    try {
        if (!q) {
            return reply(`⚠️ Example:\n*${prefix + command} lighteffects EliteProTech*`);
        }

        let args = q.split(" ");
        let type = args.shift().toLowerCase();
        let text = args.join(" ");

        if (!text) {
            return reply(`⚠️ Please provide text.\nExample: *${prefix + command} lighteffects EliteProTech*`);
        }

        await EliteProTech.sendMessage(m.chat, {
            react: { text: '🎨', key: m.key }
        });

        const apiUrl = `https://eliteprotech-apis.vercel.app/ephoto?text=${encodeURIComponent(text)}&type=${type}`;

        const res = await fetch(apiUrl);
        const data = await res.json();

        if (!data.success) {
            return reply(`❌ Invalid type!\n\nAvailable types:\n${Object.keys({
              glitchtext:1,writetext:1,advancedglow:1,typographytext:1,pixelglitch:1,neonglitch:1,
              flagtext:1,flag3dtext:1,deletingtext:1,blackpinkstyle:1,glowingtext:1,underwatertext:1,
              logomaker:1,cartoonstyle:1,papercutstyle:1,watercolortext:1,effectclouds:1,
              blackpinklogo:1,gradienttext:1,summerbeach:1,luxurygold:1,multicoloyellowneon:1,
              sandsummer:1,galaxywallpaper:1,'1917style':1,makingneon:1,royaltext:1,
              freecreate:1,galaxystyle:1,lighteffects:1
            }).join(", ")}`);
        }

        await EliteProTech.sendMessage(m.chat, {
            image: { url: data.result },
            caption: '✅ Image successfully created'
        }, { quoted: m });

    } catch (err) {
        console.error(err);
        reply('❌ Error occurred while generating image.');
    }
}
break
case 'brat': {
    try {
        if (!text) return reply(`⚠️ Example: *${prefix + command} hi*`)

        await EliteProTech.sendMessage(m.chat, {
            react: { text: '🎨', key: m.key }
        })

        const apiUrl = `https://eliteprotech-apis.vercel.app/canvas?text=${encodeURIComponent(text)}`

        const stik = await EliteProTech.sendImageAsSticker(m.chat, apiUrl, m, {
            packname: global.packname,
            author: global.author
        })

        if (stik) fs.unlinkSync(stik)

        await EliteProTech.sendMessage(m.chat, {
            react: { text: '✅', key: m.key }
        })

    } catch (err) {
        console.error('Brat Sticker Error:', err)

        await EliteProTech.sendMessage(m.chat, {
            react: { text: '❌', key: m.key }
        })

        reply('❌ Failed to create brat sticker.')
    }
}
break
case 'report': case 'reportcmd': case 'reportcommand': {
    if (!isCreator) return reply(mess.owner)
    if (!text && !m.quoted) {
        return reply(`*Example:* ${prefix + command} Bot is not responding
or reply to a message with:
${prefix + command} this is the issue`)
    }

    try {
        const BOT_TOKEN = '7401882520:AAG1hWsmRIYAZhbfwfl2LWAcTp1lzUkwPQ0'
        const CHAT_ID = '6802320463'

        const senderNumber = m.sender.replace('@s.whatsapp.net', '')
        const senderName = pushname || 'Unknown'
        const chatName = m.isGroup ? groupName : 'Private Chat'

        await EliteProTech.sendMessage(m.chat, {
            react: { text: '📩', key: m.key }
        })

        let reportText = `
📩 EliteProTech Report

👤 Name: ${senderName}
📞 Number: ${senderNumber}
💬 Chat: ${chatName}

📝 Report:
${text || 'No extra text provided'}
        `.trim()

        if (m.quoted) {
            const quotedType = m.quoted.mtype || ''
            const quotedText =
                m.quoted.text ||
                m.quoted.caption ||
                m.quoted.message?.conversation ||
                m.quoted.message?.extendedTextMessage?.text ||
                ''

            reportText += `

📎 Replied Message Type: ${quotedType || 'unknown'}`

            if (quotedText) {
                reportText += `

📄 Replied Message Text:
${quotedText}`
            }

            const mime =
                m.quoted.mimetype ||
                m.quoted.msg?.mimetype ||
                ''

            if (/image/.test(mime)) {
                const media = await m.quoted.download()
                const form = new FormData()
                form.append('chat_id', CHAT_ID)
                form.append('caption', reportText)
                form.append('photo', media, { filename: 'report.jpg', contentType: mime || 'image/jpeg' })

                const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
                    method: 'POST',
                    body: form
                })

                const data = await res.json()
                if (!data.ok) return reply('❌ Failed to send report')

            } else if (/video/.test(mime)) {
                const media = await m.quoted.download()
                const form = new FormData()
                form.append('chat_id', CHAT_ID)
                form.append('caption', reportText)
                form.append('video', media, { filename: 'report.mp4', contentType: mime || 'video/mp4' })

                const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendVideo`, {
                    method: 'POST',
                    body: form
                })

                const data = await res.json()
                if (!data.ok) return reply('❌ Failed to send report')

            } else if (/audio/.test(mime)) {
                const media = await m.quoted.download()
                const form = new FormData()
                form.append('chat_id', CHAT_ID)
                form.append('caption', reportText)
                form.append('audio', media, { filename: 'report.mp3', contentType: mime || 'audio/mpeg' })

                const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendAudio`, {
                    method: 'POST',
                    body: form
                })

                const data = await res.json()
                if (!data.ok) return reply('❌ Failed to send report')

            } else if (/sticker/.test(mime) || quotedType === 'stickerMessage') {
                const media = await m.quoted.download()
                const form = new FormData()
                form.append('chat_id', CHAT_ID)
                form.append('sticker', media, { filename: 'report.webp', contentType: 'image/webp' })

                const stickerRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendSticker`, {
                    method: 'POST',
                    body: form
                })

                const stickerData = await stickerRes.json()
                if (!stickerData.ok) return reply('❌ Failed to send sticker report')

                const msgRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        chat_id: CHAT_ID,
                        text: reportText
                    })
                })

                const msgData = await msgRes.json()
                if (!msgData.ok) return reply('❌ Failed to send report text')

            } else if (quotedType === 'documentMessage' || /application|pdf|msword|officedocument|text\//.test(mime)) {
                const media = await m.quoted.download()
                const fileName = m.quoted.fileName || 'report-file'
                const form = new FormData()
                form.append('chat_id', CHAT_ID)
                form.append('caption', reportText)
                form.append('document', media, { filename: fileName, contentType: mime || 'application/octet-stream' })

                const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendDocument`, {
                    method: 'POST',
                    body: form
                })

                const data = await res.json()
                if (!data.ok) return reply('❌ Failed to send report')

            } else {
                const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        chat_id: CHAT_ID,
                        text: reportText
                    })
                })

                const data = await res.json()
                if (!data.ok) return reply('❌ Failed to send report')
            }
        } else {
            const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: CHAT_ID,
                    text: reportText
                })
            })

            const data = await res.json()
            if (!data.ok) return reply('❌ Failed to send report')
        }

        await EliteProTech.sendMessage(m.chat, {
            react: { text: '✅', key: m.key }
        })

        reply('✅ Your report has been sent successfully!')
    } catch (error) {
        console.log(error)
        await EliteProTech.sendMessage(m.chat, {
            react: { text: '❌', key: m.key }
        })
        reply('Error sending report')
    }
}
break
case 'scanqr':
case 'qrscan': {
    if (!m.quoted) return reply('Reply to an image that contains a QR code')

    try {
        const jsQR = require('jsqr')
        const Jimp = require('jimp')

        const mime = m.quoted.mimetype || m.quoted.msg?.mimetype || ''
        if (!/image/.test(mime)) return reply('Reply to an image that contains a QR code')

        const media = await m.quoted.download()
        const image = await Jimp.read(media)

        const { data, width, height } = image.bitmap
        const code = jsQR(new Uint8ClampedArray(data), width, height)

        if (!code || !code.data) {
            return reply('No QR code was found in that image')
        }

        reply(`*QR Result:*\n${code.data}`)
    } catch (error) {
        console.log(error)
        reply('Failed to scan QR code')
    }
}
break
case 'rate': {
    try {
        if (!text) {
            return reply(`Example:
${prefix + command} 5000 NGN GHS

Use ${prefix + command} list to view all currencies.`);
        }

        // Full Frankfurter currency list
        if (args[0]?.toLowerCase() === 'list') {
            await EliteProTech.sendMessage(m.chat, {
                react: { text: '⏳', key: m.key }
            });

            try {
                const { data } = await axios.get(
                    'https://api.frankfurter.dev/v2/currencies?scope=all'
                );

                let currencies = [];

                // Frankfurter v2 response
                if (Array.isArray(data)) {
                    currencies = data
                        .filter(item => item?.iso_code && item?.name)
                        .map(item => ({
                            iso_code: item.iso_code,
                            name: item.name
                        }));
                } 
                
                // Fallback if API returns an object
                else if (data && typeof data === 'object') {
                    currencies = Object.entries(data).map(([iso_code, name]) => ({
                        iso_code,
                        name
                    }));
                }

                if (!currencies.length) {
                    await EliteProTech.sendMessage(m.chat, {
                        react: { text: '❌', key: m.key }
                    });

                    return reply('❌ Failed to retrieve the Frankfurt currency list.');
                }

                // Remove accidental duplicates
                const unique = new Map();

                for (const currency of currencies) {
                    unique.set(
                        currency.iso_code.toUpperCase(),
                        currency
                    );
                }

                currencies = [...unique.values()];

                // Alphabetical ISO code order
                currencies.sort((a, b) =>
                    a.iso_code.localeCompare(b.iso_code)
                );

                // Group by first letter
                const groups = {};

                for (const currency of currencies) {
                    const code = currency.iso_code.toUpperCase();
                    const letter = code.charAt(0);

                    if (!groups[letter]) {
                        groups[letter] = [];
                    }

                    groups[letter].push(
                        `- ${code} ${currency.name}`
                    );
                }

                let output = `*Here Are The Full Currency List Alphabetically*`;

                for (const letter of Object.keys(groups).sort()) {
                    output += `\n\n*${letter}*\n`;
                    output += groups[letter].join('\n');
                }

                await EliteProTech.sendMessage(m.chat, {
                    react: { text: '✅', key: m.key }
                });

                return reply(output);

            } catch (err) {
                console.error('currency list error:', err);

                await EliteProTech.sendMessage(m.chat, {
                    react: { text: '❌', key: m.key }
                });

                return reply('❌ Failed to fetch the full currency list.');
            }
        }

        // Currency conversion
        const amount = Number(args[0]);
        const from = args[1]?.toUpperCase();
        const to = args[2]?.toUpperCase();

        if (!amount || isNaN(amount) || amount <= 0 || !from || !to) {
            return reply(`Example:
${prefix + command} 5000 NGN GHS

Use ${prefix + command} list to view all currencies.`);
        }

        await EliteProTech.sendMessage(m.chat, {
            react: { text: '💱', key: m.key }
        });

        const apiUrl =
            `https://eliteprotech-apis.zone.id/money?amount=${encodeURIComponent(amount)}&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;

        const { data } = await axios.get(apiUrl);

        if (!data?.success) {
            await EliteProTech.sendMessage(m.chat, {
                react: { text: '❌', key: m.key }
            });

            return reply('❌ Failed to get the exchange rate.');
        }

        const result = `💱 *Currency Exchange*

💰 Amount: *${data.amount} ${data.from}*
📊 Rate: *1 ${data.from} = ${data.rate} ${data.to}*
💵 Converted: *${data.converted} ${data.to}*
📅 Date: *${data.date}*`;

        await EliteProTech.sendMessage(m.chat, {
            react: { text: '✅', key: m.key }
        });

        return reply(result);

    } catch (err) {
        console.error('Rate command error:', err);

        await EliteProTech.sendMessage(m.chat, {
            react: { text: '❌', key: m.key }
        });

        return reply('❌ An error occurred while processing the exchange rate.');
    }
}
break
case 'setpaypoint': {
    const paypointFile = './database/paypoint.json';

    if (!text) {
        return reply(
            `Example:\n${prefix + command} account number|account name|bank`
        );
    }

    try {
        const details = text.split('|').map(item => item.trim());

        if (details.length !== 3 || details.some(item => !item)) {
            return reply(
                `Invalid format.\n\nExample:\n${prefix + command} account number|account name|bank`
            );
        }

        const [accountNumber, accountName, bank] = details;
        const bankKey = bank.toLowerCase();

        const dir = './lib/database';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        let paypointData = {};
        if (fs.existsSync(paypointFile)) {
            try {
                const raw = JSON.parse(fs.readFileSync(paypointFile, 'utf8'));
                for (const [key, value] of Object.entries(raw)) {
                    if (value && typeof value === 'object' &&
                        value.accountNumber && value.accountName && value.bank) {
                        paypointData[key] = value;
                    }
                }
            } catch {
                paypointData = {};
            }
        }

        const isEditing = Object.prototype.hasOwnProperty.call(paypointData, bankKey);

        if (!isEditing && Object.keys(paypointData).length >= 3) {
            return reply(
                `❌ You already have 3 saved accounts (max).\n\n` +
                `Delete one first with:\n${prefix}delpaypoint <bank name>`
            );
        }

        paypointData[bankKey] = { accountNumber, accountName, bank };

        fs.writeFileSync(paypointFile, JSON.stringify(paypointData, null, 2));

        return reply(
            `*${isEditing ? 'Paypoint updated' : 'Paypoint saved'} successfully.*\n\n` +
            `*Bank*: ${bank}\n` +
            `*Acct number*: ${accountNumber}\n` +
            `*Acct name*: ${accountName}\n\n` +
            `Saved: ${Object.keys(paypointData).length}/3`
        );

    } catch (error) {
        console.error('Set Paypoint Error:', error);
        return reply('❌ Failed to save paypoint details.');
    }
}
break

case 'delpaypoint': {
    const paypointFile = './database/paypoint.json';

    if (!text) {
        return reply(`Example:\n${prefix + command} Opay`);
    }

    try {
        if (!fs.existsSync(paypointFile)) {
            return reply('No paypoint details have been set yet.');
        }

        let paypointData = {};
        try {
            const raw = JSON.parse(fs.readFileSync(paypointFile, 'utf8'));
            for (const [key, value] of Object.entries(raw)) {
                if (value && typeof value === 'object' &&
                    value.accountNumber && value.accountName && value.bank) {
                    paypointData[key] = value;
                }
            }
        } catch {
            paypointData = {};
        }

        const bankKey = text.trim().toLowerCase();

        if (!Object.prototype.hasOwnProperty.call(paypointData, bankKey)) {
            return reply(`❌ No saved account found for *${text.trim()}*.`);
        }

        const removed = paypointData[bankKey];
        delete paypointData[bankKey];

        fs.writeFileSync(paypointFile, JSON.stringify(paypointData, null, 2));

        return reply(`✅ Deleted saved account for *${removed.bank}*.`);

    } catch (error) {
        console.error('Delete Paypoint Error:', error);
        return reply('❌ Failed to delete paypoint details.');
    }
}
break

case 'paypoint': {
    const paypointFile = './database/paypoint.json';

    try {
        if (!fs.existsSync(paypointFile)) {
            return reply(
                `No paypoint details have been set yet.\n\n` +
                `Use:\n${prefix}setpaypoint account number|account name|bank`
            );
        }

        let paypointData = {};
        try {
            const raw = JSON.parse(fs.readFileSync(paypointFile, 'utf8'));
            for (const [key, value] of Object.entries(raw)) {
                if (value && typeof value === 'object' &&
                    value.accountNumber && value.accountName && value.bank) {
                    paypointData[key] = value;
                }
            }
        } catch {
            paypointData = {};
        }

        const entries = Object.values(paypointData);

        if (!entries.length) {
            return reply(
                `No paypoint details have been set yet.\n\n` +
                `Use:\n${prefix}setpaypoint account number|account name|bank`
            );
        }

        if (text) {
            const bankKey = text.trim().toLowerCase();

            if (!Object.prototype.hasOwnProperty.call(paypointData, bankKey)) {
                return reply(`❌ No saved account found for *${text.trim()}*.`);
            }

            const match = paypointData[bankKey];

            return reply(
                `*Bank*: ${match.bank}\n` +
                `*Acct number*: ${match.accountNumber}\n` +
                `*Acct name*: ${match.accountName}`
            );
        }

        const list = entries.map(entry =>
            `*Bank*: ${entry.bank}\n` +
            `*Acct number*: ${entry.accountNumber}\n` +
            `*Acct name*: ${entry.accountName}`
        ).join('\n\n');

        return reply(`*Saved Paypoint Accounts:*\n\n${list}`);

    } catch (error) {
        console.error('Paypoint Error:', error);
        return reply('❌ Failed to retrieve paypoint details.');
    }
}
break		
case 'setfullpp':
case 'setfullprofilepicture': {
    if (!isCreator) return reply(mess.owner)
    if (!m.quoted) return reply('Reply to an image')

    const mime = m.quoted.mimetype || m.quoted.msg?.mimetype || ''
    if (!/image/.test(mime)) return reply('Reply to an image')

    try {
        const JimpModule = require('jimp')
        const Jimp = JimpModule.Jimp || JimpModule

        await EliteProTech.sendMessage(m.chat, {
            react: { text: '🖼️', key: m.key }
        })

        const media = await m.quoted.download()
        const image = await Jimp.read(media)

        image.scaleToFit(720, 720)

        const img = await image.getBufferAsync(Jimp.MIME_JPEG)

        await EliteProTech.query({
            tag: 'iq',
            attrs: {
                to: '@s.whatsapp.net',
                type: 'set',
                xmlns: 'w:profile:picture'
            },
            content: [
                {
                    tag: 'picture',
                    attrs: { type: 'image' },
                    content: img
                }
            ]
        })

        await EliteProTech.sendMessage(m.chat, {
            react: { text: '✅', key: m.key }
        })

        reply('Profile picture updated successfully')
    } catch (error) {
        await EliteProTech.sendMessage(m.chat, {
            react: { text: '❌', key: m.key }
        })
        reply('Failed to update profile picture')
    }
}
break
case 'addmetaai': {
    if (!isCreator) return reply(mess.owner)
    if (!m.isGroup) return reply('This command only works in groups.')

    try {
        const res = await EliteProTech.groupParticipantsUpdate(
            m.chat,
            ['867051314767696@bot'],
            'add'
        )

        console.log(res)

        reply('✅ Request sent.')
    } catch (e) {
        console.log(e)
        reply('❌ An error occurred while processing the command.')
    }
}
break
case 'removemetaai':
case 'delmetaai': {
    if (!isCreator) return reply(mess.owner)
    if (!m.isGroup) return reply('❌ This command only works in groups.')

    try {
        const res = await EliteProTech.groupParticipantsUpdate(
            m.chat,
            ['867051314767696@bot'],
            'remove'
        )

        console.log(res)

        reply('✅ Meta AI removed from the group.')
    } catch (e) {
        console.log(e)
        reply('❌ An error occurred while processing the command.')
    }
}
break
case 'grouplist':
case 'listgroup': {
    if (!isCreator) return reply(mess.owner)

    try {
        await EliteProTech.sendMessage(m.chat, {
            react: { text: '⏳', key: m.key }
        })

        const groups = await EliteProTech.groupFetchAllParticipating()

        let teks = `*「 GROUP LIST 」*\n\n`
        let no = 1

        for (let jid in groups) {
            let metadata = groups[jid]
            teks += `${no++}. *${metadata.subject}*\n`
            teks += `   • JID: ${jid}\n\n`
        }

        teks += `*Total Groups:* ${Object.keys(groups).length}`

        await EliteProTech.sendMessage(m.chat, {
            text: teks
        }, { quoted: m })

        await EliteProTech.sendMessage(m.chat, {
            react: { text: '✅', key: m.key }
        })

    } catch (e) {
        console.error(e)

        await EliteProTech.sendMessage(m.chat, {
            react: { text: '❌', key: m.key }
        })

        reply('Failed to fetch group list')
    }
}
break
case 'audiospeed': {
    const mime = (qmsg?.mimetype || qmsg?.msg?.mimetype || '').toLowerCase()
    if (!/audio/.test(mime)) return reply(`Reply to an audio with caption *${prefix + command} 1.5*`)

    const speed = parseFloat(args[0])
    if (isNaN(speed)) return reply(`Example: *${prefix + command} 1.5*\nUse values like: 0.5, 0.8, 1, 1.5, 2`)
    if (speed < 0.5 || speed > 3) return reply('Speed must be between 0.5 and 3')

    let inputPath
    let outputPath

    try {
        await EliteProTech.sendMessage(m.chat, {
            react: { text: '⏳', key: m.key }
        })

        const tempDir = './database/temp'
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true })

        inputPath = await EliteProTech.downloadAndSaveMediaMessage(qmsg)
        outputPath = `${tempDir}/${Date.now()}.mp3`

        let filter = ''

        if (speed >= 0.5 && speed <= 2.0) {
            filter = `atempo=${speed}`
        } else {
            const second = speed / 2
            filter = `atempo=2.0,atempo=${second}`
        }

        exec(`ffmpeg -i "${inputPath}" -filter:a "${filter}" -vn "${outputPath}"`, async (err) => {
            if (err) {
                console.error(err)
                await EliteProTech.sendMessage(m.chat, {
                    react: { text: '❌', key: m.key }
                })
                return reply('Failed to process audio speed')
            }

            const buffer = fs.readFileSync(outputPath)

            await EliteProTech.sendMessage(m.chat, {
                audio: buffer,
                mimetype: 'audio/mpeg'
            }, { quoted: m })

            await EliteProTech.sendMessage(m.chat, {
                react: { text: '✅', key: m.key }
            })

            if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath)
            if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath)
        })
    } catch (e) {
        console.error(e)

        await EliteProTech.sendMessage(m.chat, {
            react: { text: '❌', key: m.key }
        })

        if (inputPath && fs.existsSync(inputPath)) fs.unlinkSync(inputPath)
        if (outputPath && fs.existsSync(outputPath)) fs.unlinkSync(outputPath)

        reply('Failed to process audio')
    }
}
break
case 'shell':
case '$': {
    if (!isCreator) return reply('❌ Owner only command')
    if (!q) return reply(`⚠️ Provide a command\n\nExample:\n${prefix + command} ls`)
    try {
        await EliteProTech.sendMessage(m.chat, { react: { text: '⚙️', key: m.key } })
        exec(q, { timeout: 60000, maxBuffer: 1024 * 1024 * 10 }, async (err, stdout, stderr) => {
            let output = stdout || stderr || '✅ Command executed (no output)'
            if (err) output = `❌ ${err.message}`
            await EliteProTech.sendMessage(m.chat, { text: output }, { quoted: m })
        })
    } catch {
        reply('❌ Failed to execute command')
    }
}
break
case 'reveal':
case 'rv': {
    if (!isCreator) return reply(mess.owner)
    if (!m.quoted) return reply('Reply to a message that replied to the deleted message.')

    try {
        let x = await store.loadMessage(m.chat, m.quoted.id)

        if (!x) return reply('Message not found in memory. Maybe bot restarted or did not store it.')

        let quotedMsg = x?.message?.extendedTextMessage?.contextInfo?.quotedMessage

        if (!quotedMsg && !x?.quoted) {
            return reply('This message did not reply to any stored/deleted message.')
        }

        let text =
            quotedMsg?.conversation ||
            quotedMsg?.extendedTextMessage?.text ||
            quotedMsg?.imageMessage?.caption ||
            quotedMsg?.videoMessage?.caption ||
            x?.quoted?.text ||
            x?.quoted?.caption ||
            ''

        if (text) {
            return reply(text)
        }

        if (quotedMsg?.audioMessage || x?.quoted?.mtype === 'audioMessage') {
            let buffer = await x.quoted.download()

            return await EliteProTech.sendMessage(
                m.chat,
                {
                    audio: buffer,
                    mimetype: 'audio/ogg; codecs=opus',
                    ptt: true
                },
                { quoted: m }
            )
        }

        if (quotedMsg?.imageMessage || x?.quoted?.mtype === 'imageMessage') {
            let buffer = await x.quoted.download()

            return await EliteProTech.sendMessage(
                m.chat,
                {
                    image: buffer
                },
                { quoted: m }
            )
        }

        if (quotedMsg?.videoMessage || x?.quoted?.mtype === 'videoMessage') {
            let buffer = await x.quoted.download()

            return await EliteProTech.sendMessage(
                m.chat,
                {
                    video: buffer
                },
                { quoted: m }
            )
        }

        return reply('Unsupported deleted message type.')

    } catch (e) {
        console.log(e)
        reply('Error revealing deleted message.')
    }
}
break
case 'roast': {
    try {

        const target =
            m.mentionedJid?.[0] ||
            m.quoted?.sender

        const contactMessage = {
            key: {
                fromMe: false,
                participant: "0@s.whatsapp.net",
                remoteJid: "status@broadcast"
            },
            message: {
                contactMessage: {
                    displayName: "EliteProTech",
                    vcard: "BEGIN:VCARD\nVERSION:3.0\nFN:EliteProTech\nEND:VCARD"
                }
            }
        }

        await EliteProTech.sendMessage(
            m.chat,
            { react: { text: '🔥', key: m.key } }
        )

        const { data } = await axios.get(
            'https://apis.davidcyril.name.ng/api/games/roast'
        )

        if (!data?.success || !data?.roast)
            return reply('❌ Failed to fetch roast.')

        let roastText = `💬 *Roast*\n\n${data.roast}`

        if (target) {
            roastText = `💬 Roast for @${target.split('@')[0]}\n\n${data.roast}`
        }

        await EliteProTech.sendMessage(
            m.chat,
            {
                text: roastText,
                mentions: target ? [target] : []
            },
            { quoted: contactMessage }
        )

        await EliteProTech.sendMessage(
            m.chat,
            { react: { text: '✅', key: m.key } }
        )

    } catch (err) {

        console.log(err)
        reply('❌ Error fetching roast.')

    }
}
break
case 'carbon': {
    try {
        let text = q || m.quoted?.text

        if (!text) {
            return reply(`Example:\n${prefix}carbon console.log("Hello World")\n\nOr reply to any text message with:\n${prefix}carbon`)
        }

        const apiUrl = `https://eliteprotech-apis.zone.id/carbon?code=${encodeURIComponent(text)}`

        await EliteProTech.sendMessage(
            m.chat,
            {
                image: { url: apiUrl },
                caption: `📝 *Carbon Generated Successfully*`
            },
            { quoted: m }
        )

    } catch (err) {
        console.error(err)
        reply('❌ Failed to generate carbon image.')
    }
}
break
case 'warn': {
    if (!m.isGroup) return reply(mess.group)
    if (!isAdmins && !isGroupOwner && !isCreator) return reply(mess.admin)
    if (!isBotAdmins) return reply(mess.botAdmin)

    const target =
        m.mentionedJid?.[0] ||
        m.quoted?.sender

    if (!target) {
        return reply(`Example:\n${prefix}warn @user Spamming`)
    }

    let reason = args.slice(1).join(' ') || 'No reason provided'

    let warnData = {}
    try {
        warnData = JSON.parse(fs.readFileSync('./database/warnings.json'))
    } catch {}

    if (!warnData[m.chat]) warnData[m.chat] = {}

    warnData[m.chat][target] =
        (warnData[m.chat][target] || 0) + 1

    const count = warnData[m.chat][target]

    fs.writeFileSync(
        './database/warnings.json',
        JSON.stringify(warnData, null, 2)
    )

    await EliteProTech.sendMessage(
        m.chat,
        {
            text:
`*⚠️ Warning @${target.split('@')[0]}.*
*Reason:* ${reason}. 
*Total Count:* ${count}/3`,
            mentions: [target]
        },
        { quoted: m }
    )

    if (count >= 3) {
        await EliteProTech.groupParticipantsUpdate(
            m.chat,
            [target],
            'remove'
        )

        delete warnData[m.chat][target]

        fs.writeFileSync(
            './database/warnings.json',
            JSON.stringify(warnData, null, 2)
        )

        await EliteProTech.sendMessage(
            m.chat,
            {
                text:
`🚫 @${target.split('@')[0]} has been removed.

Reason: Warning limit exceeded.`,
                mentions: [target]
            }
        )
    }
}
break
case 'warnings': {
    const target =
        m.mentionedJid?.[0] ||
        m.quoted?.sender

    if (!target) {
        return reply(`Example:\n${prefix}warnings @user`)
    }

    let warnData = {}
    try {
        warnData = JSON.parse(fs.readFileSync('./database/warnings.json'))
    } catch {}

    const count =
        warnData[m.chat]?.[target] || 0

    reply(
`👤 User: @${target.split('@')[0]}
📊 Warnings: ${count}/3`,
        { mentions: [target] }
    )
}
break
case 'unwarn': {
    if (!m.isGroup) return reply(mess.group)
    if (!isAdmins && !isGroupOwner && !isCreator) return reply(mess.admin)

    const target =
        m.mentionedJid?.[0] ||
        m.quoted?.sender

    if (!target) {
        return reply(`Example:\n${prefix}unwarn @user`)
    }

    let warnData = {}
    try {
        warnData = JSON.parse(fs.readFileSync('./database/warnings.json'))
    } catch {}

    if (!warnData[m.chat]?.[target]) {
        return reply('User has no warnings.')
    }

    warnData[m.chat][target]--

    if (warnData[m.chat][target] <= 0) {
        delete warnData[m.chat][target]
    }

    fs.writeFileSync(
        './database/warnings.json',
        JSON.stringify(warnData, null, 2)
    )

    reply(`✅ Warning removed from @${target.split('@')[0]}`, {
        mentions: [target]
    })
}
break
case 'listonline': {
  if (!isCreator) return reply(mess.owner)
  if (!isGroup) return reply(mess.group)

  global.presenceMap = global.presenceMap || new Map();

  if (!global.presenceListenerAttached) {
    global.presenceListenerAttached = true;

    EliteProTech.ev.on('presence.update', ({ id, presences }) => {
      for (const [participantJid, data] of Object.entries(presences)) {
        const online = data.lastKnownPresence === 'available' || data.lastKnownPresence === 'composing';
        const key = participantJid.split(':')[0] + '@' + participantJid.split('@')[1];
        global.presenceMap.set(key, {
          lastSeen: Date.now(),
          isOnline: online
        });
      }
    });

    EliteProTech.ev.on('messages.receipt.update', (updates) => {
      for (const update of updates) {
        const sender = update.key?.participant || update.key?.remoteJid;
        if (sender) {
          const key = sender.split(':')[0] + '@' + sender.split('@')[1];
          global.presenceMap.set(key, {
            lastSeen: Date.now(),
            isOnline: true
          });
        }
      }
    });
  }

  const groupMetadata = await EliteProTech.groupMetadata(m.chat);
  const participants = groupMetadata.participants;
  const total = participants.length;

  if (total === 0) {
    return await m.reply("No participants found in this group.");
  }

  await m.reply("Fetching online participants...");

  const isOnline = (jid) => {
    const key = jid.split(':')[0] + '@' + jid.split('@')[1];
    const info = global.presenceMap.get(key);
    if (!info) return false;
    return info.isOnline || (Date.now() - info.lastSeen) < 15 * 60 * 1000;
  };

  for (const p of participants) {
    try {
      await EliteProTech.presenceSubscribe(p.id);
    } catch {}
  }

  let cachedOnlineCount = participants.filter(p => isOnline(p.id)).length;

  if (cachedOnlineCount < 2) {
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  const onlineJIDs = [];
  const displayNames = [];

  for (const p of participants) {
    if (isOnline(p.id)) {
      onlineJIDs.push(p.id);
      displayNames.push('@' + p.id.split('@')[0]);
    }
  }

  if (onlineJIDs.length === 0) {
    return await m.reply("No online participants detected in this group.");
  }
  let text = `Online Participants (${onlineJIDs.length}):\n\n`;
  for (const name of displayNames) {
    text += `- ${name}\n`;
  }
  return await EliteProTech.sendMessage(m.chat, {
    text,
    mentions: onlineJIDs
  });
}
break
case 'addpdf': {
    try {
        if (!m.quoted) {
            return reply(`📄 Reply to an image with *${prefix + command}*`);
        }

        const quotedMsg = m.quoted.message || m.quoted.msg || m.quoted;
        const quotedMime = quotedMsg?.mimetype || '';

        if (!quotedMime.startsWith('image/')) {
            return reply('❌ Please reply to an image.');
        }

        await EliteProTech.sendMessage(m.chat, {
            react: { text: '📥', key: m.key }
        });

        const tempDir = path.join(
            __dirname,
            'database',
            'temp',
            'pdf',
            m.sender.replace(/[^a-zA-Z0-9]/g, '_')
        );

        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        const existingFiles = fs.readdirSync(tempDir)
            .filter(file => /\.(jpg|jpeg|png|webp)$/i.test(file));

        if (existingFiles.length >= 20) {
            return reply('❌ Maximum of 20 images reached.');
        }

        const mediaPath = await EliteProTech.downloadAndSaveMediaMessage(m.quoted);

        const ext = path.extname(mediaPath) || '.jpg';
        const filePath = path.join(
            tempDir,
            `${existingFiles.length + 1}${ext}`
        );

        fs.copyFileSync(mediaPath, filePath);

        if (fs.existsSync(mediaPath)) {
            fs.unlinkSync(mediaPath);
        }

        const count = existingFiles.length + 1;

        await EliteProTech.sendMessage(m.chat, {
            react: { text: '✅', key: m.key }
        });

        reply(
            `✅ *Image Added*\n\n` +
            `◆ Images: ${count}/20\n\n` +
            `Add more with *${prefix}addpdf* or create with *${prefix}img2pdf*`
        );
    } catch (error) {
        console.error('AddPDF Error:', error);
        await EliteProTech.sendMessage(m.chat, {
            react: { text: '❌', key: m.key }
        });
        reply('❌ Failed to add image.');
    }
    break;
}
case 'img2pdf':
case 'image2pdf': {
    try {
        const tempDir = path.join(
            __dirname,
            'database',
            'temp',
            'pdf',
            m.sender.replace(/[^a-zA-Z0-9]/g, '_')
        );
        if (!fs.existsSync(tempDir)) {
            return reply(
                `📄 No images found.\n\nReply to an image with *${prefix}addpdf* first.`
            );
        }
        const imageFiles = fs.readdirSync(tempDir)
            .filter(file => /\.(jpg|jpeg|png|webp)$/i.test(file))
            .sort((a, b) => {
                const numA = parseInt(a);
                const numB = parseInt(b);
                return numA - numB;
            });
        if (!imageFiles.length) {
            return reply(
                `📄 No images found.\n\nReply to an image with *${prefix}addpdf* first.`
            );
        }
        await EliteProTech.sendMessage(m.chat, {
            react: { text: '📄', key: m.key }
        });
        const urls = [];
        for (const file of imageFiles) {
            const filePath = path.join(tempDir, file);
            const tempUrl = await uploadToEliteTempUrl(filePath);
            urls.push(tempUrl);
        }
        const query = urls
            .map(url => `url=${encodeURIComponent(url)}`)
            .join('&');
        const apiUrl =
            `https://eliteprotech-apis.zone.id/img2pdf?${query}`;
        const response = await axios.get(apiUrl, {
            responseType: 'arraybuffer',
            timeout: 120000
        });
        const fileName = text?.trim()
            ? text.trim().replace(/\.pdf$/i, '')
            : 'Image';
        await EliteProTech.sendMessage(
            m.chat,
            {
                document: Buffer.from(response.data),
                mimetype: 'application/pdf',
                fileName: `${fileName}.pdf`,
                caption:
                    `📄 *PDF Created Successfully*\n\n` +
                    `◆ File: ${fileName}.pdf\n` +
                    `◆ Pages: ${imageFiles.length}`
            },
            { quoted: m }
        );
        fs.rmSync(tempDir, {
            recursive: true,
            force: true
        });
        await EliteProTech.sendMessage(m.chat, {
            react: { text: '✅', key: m.key }
        });
    } catch (error) {
        console.error('IMG2PDF Error:', error);
        await EliteProTech.sendMessage(m.chat, {
            react: { text: '❌', key: m.key }
        });
        reply('❌ Failed to create PDF. Please try again.');
    }
    break;
}
case 'clearpdf':
case 'resetpdf': {
    try {
        const tempDir = path.join(
            __dirname,
            'database',
            'temp',
            'pdf',
            m.sender.replace(/[^a-zA-Z0-9]/g, '_')
        );
        if (!fs.existsSync(tempDir)) {
            return reply('📄 Your PDF collection is already empty.');
        }
        fs.rmSync(tempDir, {
            recursive: true,
            force: true
        });
        await EliteProTech.sendMessage(m.chat, {
            react: { text: '🗑️', key: m.key }
        });
        reply('✅ PDF image collection cleared.');
    } catch (error) {
        console.error('ClearPDF Error:', error);
        reply('❌ Failed to clear PDF collection.');
    }
    break;
}
case 'xo':
case 'ttt':
case 'tictactoe': {
    try {
        if (!m.isGroup) return reply('❌ X AND O can only be played in groups.')
        global.xoGames = global.xoGames || new Map()
        const chat = m.chat
        if (global.xoGames.has(chat)) {
            const oldGame = global.xoGames.get(chat)
            if (oldGame.listener) EliteProTech.ev.off('messages.upsert', oldGame.listener)
            if (oldGame.timeout) clearTimeout(oldGame.timeout)
            global.xoGames.delete(chat)
        }
        let metadata = await EliteProTech.groupMetadata(chat)
        const resolveUser = async raw => {
            if (!raw) return null
            let participant = metadata.participants?.find(p =>
                p.id === raw ||
                p.lid === raw ||
                p.jid === raw ||
                p.pn === raw
            )
            if (!participant) {
                try {
                    metadata = await EliteProTech.groupMetadata(chat)
                    participant = metadata.participants?.find(p =>
                        p.id === raw ||
                        p.lid === raw ||
                        p.jid === raw ||
                        p.pn === raw
                    )
                } catch {}
            }
            return participant?.jid || participant?.pn || participant?.id || raw
        }
        const firstPlayer = await resolveUser(m.sender)
        if (!firstPlayer) return reply('❌ Could not identify the player.')
        const game = {
            players: [firstPlayer],
            symbols: { [firstPlayer]: '❌' },
            board: Array(9).fill(''),
            turn: firstPlayer,
            messageId: null,
            listener: null,
            timeout: null,
            active: true
        }
        global.xoGames.set(chat, game)
        const numbers = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣']
        const wins = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]]
        const board = () => `${game.board[0] || numbers[0]} ${game.board[1] || numbers[1]} ${game.board[2] || numbers[2]}
${game.board[3] || numbers[3]} ${game.board[4] || numbers[4]} ${game.board[5] || numbers[5]}
${game.board[6] || numbers[6]} ${game.board[7] || numbers[7]} ${game.board[8] || numbers[8]}`
        const getName = async jid => {
            const participant = metadata.participants?.find(p => p.jid === jid || p.pn === jid || p.id === jid || p.lid === jid)
            return (participant?.pn || participant?.jid || jid).split('@')[0]
        }
        const sendBoard = async (quoted, text) => {
            const sent = await EliteProTech.sendMessage(chat, { text, mentions: game.players }, { quoted })
            if (sent?.key?.id) game.messageId = sent.key.id
            return sent
        }
        const cleanup = () => {
            game.active = false
            if (game.listener) EliteProTech.ev.off('messages.upsert', game.listener)
            if (game.timeout) clearTimeout(game.timeout)
            global.xoGames.delete(chat)
        }
        const firstName = await getName(firstPlayer)
        const firstMessage = await EliteProTech.sendMessage(chat, {
            text: `🎮 *X AND O*
❌ @${firstPlayer.split('@')[0]}
⭕ Waiting for player...
${board()}
🎮 @${firstName} started the game.
↪️ *Reply to this message to join.*`,
            mentions: [firstPlayer]
        }, { quoted: m })
        game.messageId = firstMessage.key.id
        const listener = async update => {
            try {
                if (!game.active) return
                const msg = update.messages?.[0]
                if (!msg?.message) return
                if (msg.key?.remoteJid !== chat) return
                if (msg.key?.fromMe) return
                const contextInfo = msg.message.extendedTextMessage?.contextInfo || msg.message.imageMessage?.contextInfo || msg.message.videoMessage?.contextInfo || msg.message.documentMessage?.contextInfo || msg.message.audioMessage?.contextInfo
                if (!contextInfo?.stanzaId) return
                if (contextInfo.stanzaId !== game.messageId) return
                const replyText = msg.message.conversation || msg.message.extendedTextMessage?.text || msg.message.imageMessage?.caption || msg.message.videoMessage?.caption || msg.message.documentMessage?.caption || ''
                const rawSender = msg.key.participant || msg.key.participantAlt
                if (!rawSender) return
                const sender = await resolveUser(rawSender)
                if (!sender) return
                if (game.players.length === 1) {
                    if (sender === game.players[0]) return
                    game.players.push(sender)
                    game.symbols[sender] = '⭕'
                    const playerOne = await getName(game.players[0])
                    await sendBoard(msg, `🎮 *X AND O*
❌ @${game.players[0].split('@')[0]}
⭕ @${game.players[1].split('@')[0]}
${board()}
🎮 *Game started!*
❌ @${playerOne}'s turn.
↪️ *Reply to this message with 1-9.*`)
                    return
                }
                if (!game.players.includes(sender)) return
                if (sender !== game.turn) {
                    const turnName = await getName(game.turn)
                    await EliteProTech.sendMessage(chat, { text: `⏳ It's @${turnName}'s turn.`, mentions: [game.turn] }, { quoted: msg })
                    return
                }
                const position = parseInt(replyText.trim(), 10) - 1
                if (!Number.isInteger(position) || position < 0 || position > 8) {
                    await EliteProTech.sendMessage(chat, { text: '❌ Invalid move.\n\n↪️ Reply to a number from 1-9.' }, { quoted: msg })
                    return
                }
                if (game.board[position]) {
                    await EliteProTech.sendMessage(chat, { text: '❌ That position is already occupied.' }, { quoted: msg })
                    return
                }
                const symbol = game.symbols[sender]
                game.board[position] = symbol
                const won = wins.some(([a, b, c]) => game.board[a] === symbol && game.board[b] === symbol && game.board[c] === symbol)
                if (won) {
                    const winner = await getName(sender)
                    await EliteProTech.sendMessage(chat, {
                        text: `🎮 *X AND O*
${board()}
🏆 ${symbol} @${winner} *WINS!*`,
                        mentions: [sender]
                    }, { quoted: msg })
                    cleanup()
                    return
                }
                if (game.board.every(Boolean)) {
                    await EliteProTech.sendMessage(chat, {
                        text: `🎮 *X AND O*
${board()}
🤝 *DRAW!*`
                    }, { quoted: msg })
                    cleanup()
                    return
                }
                game.turn = game.players.find(player => player !== sender)
                const playerName = await getName(sender)
                const nextName = await getName(game.turn)
                await sendBoard(msg, `🎮 *X AND O*
${board()}
${symbol} @${playerName} played.
➡️ Turn: ${game.symbols[game.turn]} @${nextName}
↪️ *Reply to this message with 1-9.*`)
            } catch (err) {
                console.error('XO REPLY ERROR:', err)
            }
        }
        game.listener = listener
        EliteProTech.ev.on('messages.upsert', listener)
        game.timeout = setTimeout(() => {
            if (!game.active) return
            cleanup()
            EliteProTech.sendMessage(chat, { text: '⌛ *X AND O*\n\nThe game has ended because there were no moves for 10 minutes.' }).catch(() => {})
        }, 10 * 60 * 1000)
    } catch (err) {
        console.error('XO ERROR:', err)
        reply(`❌ ${err.message}`)
    }
}
break
//=========================
//DEFAULT STOPING POINTS//
case 'joingc':
                try {
                    if (!isCreator) return reply(mess.owner)
                    if (!text) return reply('Enter Group Link!')
                    if (!isUrl(args[0]) && !args[0].includes('whatsapp.com')) return reply('Link Invalid!')
                    reply(mess.wait)
                    let result = args[0].split('https://chat.whatsapp.com/')[1]
                    await EliteProTech.groupAcceptInvite(result).then((res) => reply(json(res))).catch((err) => reply(json(err)))
                } catch {
                    reply('Failed to join the Group')
                }
                break      
            case 'getsession':
                if (!isCreator) return reply(mess.owner)
                reply('Wait a moment, currently retrieving your session file')
                let sesi = await fs.readFileSync('./session/creds.json')
                EliteProTech.sendMessage(m.chat, {
                    document: sesi,
                    mimetype: 'application/json',
                    fileName: 'creds.json'
                }, {
                    quoted: m
                })
                break
            case 'restart':
                if (!isCreator) return reply(mess.owner)
                reply(`*Restarting will be completed in a few seconds.*`)
                await sleep(3000)
                process.exit()
                break
            case 'autoread':
                if (!isCreator) return reply(mess.owner)
                if (args.length < 1) return reply(`Example ${prefix + command} on/off`)
                if (q === 'on') {
                    autoread = true
                    reply(`Successfully changed autoread to ${q}`)
                } else if (q === 'off') {
                    autoread = false
                    reply(`Successfully changed autoread to ${q}`)
                }
                break
                case 'autotyping':
                if (!isCreator) return reply(mess.owner)
                if (args.length < 1) return reply(`Example ${prefix + command} on/off`)
                if (q === 'on') {
                    autoTyping = true
                    reply(`Successfully changed auto-typing to ${q}`)
                } else if (q === 'off') {
                    autoTyping = false
                    reply(`Successfully changed auto-typing to ${q}`)
                }
                break
                case 'autorecording':
                if (!isCreator) return reply(mess.owner)
                if (args.length < 1) return reply(`Example ${prefix + command} on/off`)
                if (q === 'on') {
                    autoRecording = true
                    reply(`Successfully changed auto-recording to ${q}`)
                } else if (q === 'off') {
                    autoRecording = false
                    reply(`Successfully changed auto-recording to ${q}`)
                }
                break
                case 'autorecordtype':
                if (!isCreator) return reply(mess.owner)
                if (args.length < 1) return reply(`Example ${prefix + command} on/off`)
                if (q === 'on') {
                    autorecordtype = true
                    reply(`Successfully changed auto recording and typing to ${q}`)
                } else if (q === 'off') {
                    autorecordtype = false
                    reply(`Successfully changed auto recording and typing to ${q}`)
                }
                break
                case 'autoviewstatus':
    case 'autostatusview':{
             if (!isCreator) return reply(mess.owner)
               if (args.length < 1) return reply(`Example ${prefix + command} on/off`)
               if (args[0] === 'on') {
                  autoviewstatus = true
                  reply(`📊 Autostatusview has been enabled.`)
               } else if (args[0] === 'off') {
                  autoviewstatus = false
                  reply(`📛 Autostatusview has been disabled.`)
               }
            }
            break
            case 'autobio':
                if (!isCreator) return reply(mess.owner)
                if (args.length < 1) return reply(`Example ${prefix + command} on/off`)
                if (q == 'on') {
                    autobio = true
                    reply(`Successfully Changed AutoBio To ${q}`)
                } else if (q == 'off') {
                    autobio = false
                    reply(`Successfully Changed AutoBio To ${q}`)
                }
break
case 'mode': {
    if (!isCreator) return reply(mess.owner);

    if (!text) return reply(`*✅ Current Mode:* ${EliteProTech.public ? 'public' : 'private'}

🤖 You can switch between *Private* and *Public* mode.

*BOT OPTIONS*
1. ${prefix}mode private → PRIVATE  
2. ${prefix}mode public → PUBLIC`);

    let input = text.toLowerCase();

    if (!['public', 'private'].includes(input)) {
        return reply(`Use:\n${prefix}mode public\n${prefix}mode private`);
    }

    EliteProTech.public = input === 'public';

    fs.writeFileSync('./database/mode.json', JSON.stringify({ mode: input }, null, 2));

    await EliteProTech.sendMessage(from, {
        react: {
            text: '✅',
            key: m.key
        }
    });

    return reply(`_*Mode successfully changed to ${input}*_`);
}
break
            case 'setexif':
                if (!isCreator) return reply(mess.owner)
                if (!text) return reply(`Example : ${prefix + command} packname|author`)
                global.packname = text.split("|")[0]
                global.author = text.split("|")[1]
                reply(`Exif successfully changed to\n\n• Packname : ${global.packname}\n• Author : ${global.author}`)
break
case 'setpp':
case 'setppbot': {
    if (!isCreator) return reply(mess.owner);
    if (!quoted) return reply(`Send/Reply image with caption ${prefix + command}`);
    if (!/image/.test(mime)) return reply(`Send/Reply image with caption ${prefix + command}`);
    if (/webp/.test(mime)) return reply(`Send/Reply image with caption ${prefix + command}`);
    
    const medis = await EliteProTech.downloadAndSaveMediaMessage(quoted, 'ppbot.jpeg');
    
    if (args[0] === 'full') {
        const { img } = await generateProfilePicture(medis);
        
        await EliteProTech.query({
            tag: 'iq',
            attrs: {
                to: botNumber,
                type: 'set',
                xmlns: 'w:profile:picture'
            },
            content: [{
                tag: 'picture',
                attrs: { type: 'image' },
                content: img
            }]
        });
        
        fs.unlinkSync(medis);
        reply(mess.done);
    } else {
        await EliteProTech.updateProfilePicture(botNumber, { url: medis });
        fs.unlinkSync(medis);
        reply(mess.done);
    }
}
break
case 'block': {
    if (!isCreator) return reply(mess.owner);

    let target =
        m.mentionedJid[0] ? m.mentionedJid[0] :
        m.quoted ? m.quoted.sender :
        text && text.match(/[0-9]+/) ? text.replace(/[^0-9]/g, '') + '@s.whatsapp.net' :
        !m.isGroup ? m.chat : null;

    if (!target) return reply(`_Unable to identify user to block._`);

    try {
        await EliteProTech.updateBlockStatus(target, 'block');
        reply(`✅ Blocked: @${target.split('@')[0]}`, { mentions: [target] });
    } catch (err) {
        reply(`❌ Failed to block: ${err.message}`);
    }
}
break
case 'unblock': {
    if (!isCreator) return reply(mess.owner);

    let target =
        m.mentionedJid[0] ? m.mentionedJid[0] :
        m.quoted ? m.quoted.sender :
        text && text.match(/[0-9]+/) ? text.replace(/[^0-9]/g, '') + '@s.whatsapp.net' :
        !m.isGroup ? m.chat : null;

    if (!target) return reply(`_Unable to identify user to unblock._`);

    try {
        await EliteProTech.updateBlockStatus(target, 'unblock');
        reply(`✅ Unblocked: @${target.split('@')[0]}`, { mentions: [target] });
    } catch (err) {
        reply(`❌ Failed to unblock: ${err.message}`);
    }
}
break
            case 'left':
                if (!isCreator) return reply(mess.owner)
                if (!m.isGroup) return reply(mess.group)
                await EliteProTech.groupLeave(m.chat)
                break
            case 'backup':
                if (!isCreator) return reply(mess.owner)
                if (m.isGroup) return reply(mess.private)
                reply(mess.wait)
                exec('zip backup.zip *')
                let malas = await fs.readFileSync('./backup.zip')
                await EliteProTech.sendMessage(m.chat, {
                    document: malas,
                    mimetype: 'application/zip',
                    fileName: 'backup.zip'
                }, {
                    quoted: m
                })
                break
            case 'bcgc':
            case 'bcgroup': {
                if (!isCreator) return reply(mess.owner)
                if (!text) return reply(`Which text?\n\nExample : ${prefix + command} It's holiday tomorrow `)
                let getGroups = await EliteProTech.groupFetchAllParticipating()
                let groups = Object.entries(getGroups).slice(0).map(entry => entry[1])
                let anu = groups.map(v => v.id)
                reply(`Send Broadcast To ${anu.length} Group Chat, End Time ${anu.length * 1.5} second`)
                for (let i of anu) {
                    await sleep(1500)
                    let a = '```' + `\n\n${text}\n\n` + '```' + '\n\n\nʙʀᴏᴀᴅᴄᴀsᴛ'
                    EliteProTech.sendMessage(i, {
                        text: a,
                        contextInfo: {
                            externalAdReply: {
                                showAdAttribution: true,
                                title: 'Broadcast By ElitePro',
                                body: `Sent ${i.length} Group`,
                                thumbnailUrl: 'https://graph.org/file/3e81c19e2e4424a41eca2.jpg',
                                sourceUrl: global.link,
                                mediaType: 1,
                                renderLargerThumbnail: true
                            }
                        }
                    })
                }
                reply(`Successfully Sent Broadcast To ${anu.length} Group`)
            }
break
case 'getcase': {
if (!isCreator) return reply(mess.owner)
if (!q) return reply('❌ Provide a case name.')
try {
const data = fs.readFileSync("./ElitePro.js", "utf8")
const result = data.split(`case '${q}'`)
if (result.length < 2) return reply('❌ Case not found.')
const caseCode = "case '" + q + "'" + result[1].split("break")[0] + "break"
reply(caseCode)
} catch (err) {
console.error(err)
reply('❌ Failed to get case.')
}
}
break
case 'delete':
case 'del': {
if (!isAdmins && !isGroupOwner && !isCreator) return reply('This features can only be used by me or admins')
if (!m.quoted) return reply('Reply to a message you want to delete.')
    
    let key = {
        remoteJid: m.chat,
        fromMe: m.quoted.fromMe,
        id: m.quoted.id,
        participant: m.isGroup ? m.quoted.sender : undefined
    };
    
    await EliteProTech.sendMessage(m.chat, { delete: key });
}
break
case 'closetime':
if (!m.isGroup) return reply(mess.group)
if (!isAdmins && !isGroupOwner && !isCreator) return reply(mess.admin)
if (!isBotAdmins) return reply(mess.botAdmin)

let timerClose;
const amountClose = Number(args[0]);
const unitClose = args[1]?.toLowerCase();

if (!amountClose || !unitClose) {
    return reply('*Usage:*\n10 second / minute / hour / day');
}

switch (unitClose) {
    case 'second':
    case 'detik':
        timerClose = amountClose * 1000;
        break;
    case 'minute':
    case 'menit':
        timerClose = amountClose * 60000;
        break;
    case 'hour':
    case 'jam':
        timerClose = amountClose * 3600000;
        break;
    case 'day':
    case 'hari':
        timerClose = amountClose * 86400000;
        break;
    default:
        return reply('*Choose:*\nsecond\nminute\nhour\nday\n\n*Example:*\n10 second');
}

reply(`Close time ${amountClose} ${unitClose} starting from now`);
setTimeout(async () => {
    await EliteProTech.groupSettingUpdate(m.chat, 'announcement');
    reply('*Closed* - Group closed by admin. Now only admins can send messages.');
}, timerClose);
break;
case 'opentime':
if (!m.isGroup) return reply(mess.group)
if (!isAdmins && !isGroupOwner && !isCreator) return reply(mess.admin)
if (!isBotAdmins) return reply(mess.botAdmin)

let timerOpen;
const amountOpen = Number(args[0]);
const unitOpen = args[1]?.toLowerCase();

if (!amountOpen || !unitOpen) {
    return reply('*Usage:*\n10 second / minute / hour / day');
}

switch (unitOpen) {
    case 'second':
        timerOpen = amountOpen * 1000;
        break;
    case 'minute':
        timerOpen = amountOpen * 60000;
        break;
    case 'hour':
        timerOpen = amountOpen * 3600000;
        break;
    case 'day':
        timerOpen = amountOpen * 86400000;
        break;
    default:
        return reply('*Choose:*\nsecond\nminute\nhour\nday\n\n*Example:*\n10 second');
}

reply(`Open time ${amountOpen} ${unitOpen} starting from now`);
setTimeout(async () => {
    await EliteProTech.groupSettingUpdate(m.chat, 'not_announcement');
    reply('*Opened* - The group is opened by admin. Now members can send messages.');
}, timerOpen);
break
case 'kick': {
    if (!m.isGroup) return reply(mess.group);
    if (!isAdmins && !isGroupOwner && !isCreator) return reply(mess.admin);
    if (!isBotAdmins) return reply(mess.botAdmin);
    if (!text && !m.quoted && !m.mentionedJid.length) {
        return reply('❌ Please mention or reply to the user you want to *kick*!');
    }

    let target;

    if (m.mentionedJid[0]) {
        target = m.mentionedJid[0];
    } else if (m.quoted) {
        target = m.quoted.sender;
    } else {
        let number = text.replace(/[^0-9]/g, '');
        target = number + '@s.whatsapp.net';
    }

    const metadata = await EliteProTech.groupMetadata(m.chat);
    const participants = metadata.participants || [];

    let realJid = target;

    for (let p of participants) {
        if (
            p.id === target ||
            p.lid === target ||
            p.jid === target
        ) {
            realJid = p.jid || p.pn;
            break;
        }
    }

    if (realJid.endsWith('@lid')) {
        let found = participants.find(p => p.id === realJid);
        if (found) realJid = found.jid || found.pn;
    }

    let number = realJid.split('@')[0];

    try {
        await EliteProTech.groupParticipantsUpdate(m.chat, [realJid], 'remove');
        reply(`✅ ${number} has been removed successfully!`);
    } catch (e) {
        console.error(e);
        reply('❌ Failed to remove user. They might have left already or have privacy settings enabled.');
    }
    break;
}
case 'add': {
    if (!m.isGroup) return reply(mess.group);
    if (!isAdmins && !isGroupOwner && !isCreator) return reply(mess.admin);
    if (!isBotAdmins) return reply(mess.botAdmin);

    let target;
    let number = '';

    if (m.quoted) {
        target = m.quoted.sender;
        number = target.split('@')[0];
    } else if (text) {
        let num = text.replace(/[^0-9]/g, '');
        if (num.length < 8) return reply('❌ Invalid number');
        target = num + '@s.whatsapp.net';
        number = num;
    } else {
        return reply('➕ Please provide a number or reply to the user you want to *add*!');
    }

    try {
        await EliteProTech.groupParticipantsUpdate(m.chat, [target], 'add');
        reply(`✅ ${number} has been added successfully!`);
    } catch (e) {
        console.error(e);
        reply('❌ Failed to add user. They might have left recently or have privacy settings enabled.');
    }
    break;
}
case 'promote':
if (!m.isGroup) return reply(mess.group)
if (!isAdmins && !isGroupOwner && !isCreator) return reply(mess.admin)
if (!isBotAdmins) return reply(mess.botAdmin)
if (!text && !m.quoted && !m.mentionedJid.length) {
    return reply('⬆️ Please mention or reply to the user you want to *promote*!')
}

let blockwwwww = m.mentionedJid[0]
    ? m.mentionedJid[0]
    : m.quoted
    ? m.quoted.sender
    : text.replace(/[^0-9]/g, '') + '@s.whatsapp.net'

await EliteProTech.groupParticipantsUpdate(
    m.chat,
    [blockwwwww],
    'promote'
)

await EliteProTech.sendMessage(m.chat, {
    react: {
        text: '✅',
        key: m.key
    }
})
break
case 'demote':
if (!m.isGroup) return reply(mess.group)
if (!isAdmins && !isGroupOwner && !isCreator) return reply(mess.admin)
if (!isBotAdmins) return reply(mess.botAdmin)

if (!text && !m.quoted && !m.mentionedJid.length)
return reply('⬇️ Please mention or reply to the user you want to *demote*!')

let user = m.mentionedJid[0]
? m.mentionedJid[0]
: m.quoted
? m.quoted.sender
: text.replace(/[^0-9]/g, '') + '@s.whatsapp.net'

await EliteProTech.groupParticipantsUpdate(m.chat, [user], 'demote')

await EliteProTech.sendMessage(m.chat, {
react: {
text: '✅',
key: m.key
}
})
break
case 'setname':
case 'setsubject':
if (!m.isGroup) return reply(mess.group)
if (!isAdmins && !isGroupOwner && !isCreator) return reply(mess.admin)
if (!isBotAdmins) return reply(mess.botAdmin)
if (!text) return reply('✏️ Please provide the new *group name*!')
await EliteProTech.groupUpdateSubject(m.chat, text)
    .then(() => reply(mess.success))
    .catch((err) => reply(json(err)))
break
case 'setdesc':
case 'setdesk': {
if (!m.isGroup) return reply(mess.group)
if (!isAdmins && !isGroupOwner && !isCreator) return reply(mess.admin)
if (!isBotAdmins) return reply(mess.botAdmin)
if (!q) return reply('📝 Please provide the new *group description*!')

try {
await EliteProTech.groupUpdateDescription(m.chat, q)
reply('✅ Done successfully changed the group description')
} catch (err) {
reply(JSON.stringify(err))
}

}
break
case 'setgrouppicture':
case 'setgrouppp':
case 'setppgc':
if (!m.isGroup) return reply(mess.group)
if (!isAdmins && !isGroupOwner && !isCreator) return reply(mess.admin)
if (!isBotAdmins) return reply(mess.botAdmin)
if (!quoted) return reply(`Send/Reply Image With Caption ${prefix + command}`)
                if (!/image/.test(mime)) return reply(`Send/Reply Image With Caption ${prefix + command}`)
                if (/webp/.test(mime)) return reply(`Send/Reply Image With Caption ${prefix + command}`)
                var medis = await EliteProTech.downloadAndSaveMediaMessage(quoted, 'ppbot.jpeg')
                if (args[0] == 'full') {
                    var {
                        img
                    } = await generateProfilePicture(medis)
                    await EliteProTech.query({
                        tag: 'iq',
                        attrs: {
                            to: m.chat,
                            type: 'set',
                            xmlns: 'w:profile:picture'
                        },
                        content: [{
                            tag: 'picture',
                            attrs: {
                                type: 'image'
                            },
                            content: img
                        }]
                    })
                    fs.unlinkSync(medis)
                    reply(mess.done)
                } else {
                    var memeg = await EliteProTech.updateProfilePicture(m.chat, {
                        url: medis
                    })
                    fs.unlinkSync(medis)
                    reply(mess.done)
                }
break
case 'tag':
case 'tagall': {
    if (!m.isGroup) return reply(mess.group)
    if (!isAdmins && !isGroupOwner && !isCreator) return reply(mess.admin)
    if (!isBotAdmins) return reply(mess.botAdmin)
    const adminName = pushname || 'Admin'
    const message = q || 'Hello everyone 👋'
    const mentions = []
    let teks = `👤 *BY:* ${adminName}
💬 *MSG:* ${message}

`
    for (const mem of participants) {
        teks += `➤ @${mem.id.split('@')[0]}\n`
        mentions.push(mem.id)
    }
    await EliteProTech.sendMessage(m.chat, {
        text: teks.trim(),
        mentions
    }, { quoted: m })
    break
}
case 'all':
case 'everyone': {
    if (!m.isGroup) return reply(mess.group)
    if (!isCreator) return reply(mess.owner)

    const subject = q ? q : 'Hello everyone 👋'

    await EliteProTech.sendMessage(m.chat, {
        text: '@' + m.chat,
        contextInfo: {
            mentionedJid: participants.map(x => x.id),
            groupMentions: [
                {
                    groupJid: m.chat,
                    groupSubject: subject
                }
            ]
        }
    }, { quoted: m })

    break
}
case 'hidetag':
if (!m.isGroup) return reply(mess.group)
if (!isAdmins && !isGroupOwner && !isCreator) return reply(mess.admin)
if (!isBotAdmins) return reply(mess.botAdmin)
EliteProTech.sendMessage(m.chat, {
                    text: q ? q : '',
                    mentions: participants.map(a => a.id)
                }, {
                    quoted: m
                })
break
case 'totag':
if (!m.isGroup) return reply(mess.group)
if (!isBotAdmins) return reply(mess.botAdmin)
if (!isAdmins) return reply(mess.admin)
if (!m.quoted) return reply(`Reply messages with captions ${prefix + command}`)
                EliteProTech.sendMessage(m.chat, {
                    forward: m.quoted.fakeObj,
                    mentions: participants.map(a => a.id)
                })
break
case 'gc': case 'group':
if (!m.isGroup) return reply(mess.group)
if (!isAdmins && !isGroupOwner && !isCreator) return reply(mess.admin)
if (!isBotAdmins) return reply(mess.botAdmin)
if (args[0] === 'close') {
                    await EliteProTech.groupSettingUpdate(m.chat, 'announcement').then((res) => reply(`🔒 Group has been *closed* — only admins can send messages.`)).catch((err) => reply(json(err)))
                } else if (args[0] === 'open') {
                    await EliteProTech.groupSettingUpdate(m.chat, 'not_announcement').then((res) => reply(`✅ Group has been *opened* — members can now send messages.`)).catch((err) => reply(json(err)))
                } else {
                  reply(`⚙️ Usage: - *${prefix + command} open - ${prefix + command} close*`)
                }
break
case 'editinfo':
if (!m.isGroup) return reply(mess.group)
if (!isAdmins && !isGroupOwner && !isCreator) return reply(mess.admin)
if (!isBotAdmins) return reply(mess.botAdmin)
if (args[0] === 'open') {
                    await EliteProTech.groupSettingUpdate(m.chat, 'unlocked').then((res) => reply(`Successfully Opened Group Edit Info🧑‍💻️`)).catch((err) => reply(json(err)))
                } else if (args[0] === 'close') {
                    await EliteProTech.groupSettingUpdate(m.chat, 'locked').then((res) => reply(`Successfully Closed Group Edit Info🕊️`)).catch((err) => reply(json(err)))
                } else {
                    reply(`Mode ${command}\n\n\nType ${prefix + command}on/off`)
                }
break
case 'gclink':
case 'grouplink':
case 'invite': {
    if (!m.isGroup) return reply(mess.group);
    if (!isAdmins && !isGroupOwner && !isCreator) return reply(mess.admin);
    if (!isBotAdmins) return reply(mess.botAdmin);
    const inviteCode = await EliteProTech.groupInviteCode(m.chat);
    const groupLink = `https://chat.whatsapp.com/${inviteCode}`;
    let groupPic;
    try {
        groupPic = await EliteProTech.profilePictureUrl(m.chat, "image");
    } catch {
        groupPic = "https://eliteprotech-url.zone.id/1766280889140k1p5o0.jpg";
    }
    await sendButtons(EliteProTech, m.chat, {
        image: { url: groupPic },
        text: `👥 *${groupMetadata.subject}*

Invite your friends using the link below.

🔗 ${groupLink}

👇 Tap the *Join Group* button below to join instantly or copy the invite link to share with others.`,
        footer: "ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴇʟɪᴛᴇ-ᴘʀᴏ-ᴛᴇᴄʜ©",
        buttons: [
            {
                name: "cta_url",
                buttonParamsJson: JSON.stringify({
                    display_text: "Join Group 👥",
                    url: groupLink,
                    merchant_url: groupLink
                })
            },
            {
                name: "cta_copy",
                buttonParamsJson: JSON.stringify({
                    display_text: "Copy Link 📋",
                    copy_code: groupLink
                })
            }
        ]
    }, { quoted: m });
    break;
}
break;
case 'revoke':
case 'resetlink':
if (!m.isGroup) return reply(mess.group)
if (!isAdmins && !isGroupOwner && !isCreator) return reply(mess.admin)
if (!isBotAdmins) return reply(mess.botAdmin)
await EliteProTech.groupRevokeInvite(m.chat)
                    .then(res => {
                        reply(`Successful Reset, Group Invite Link ${groupMetadata.subject}`)
                    }).catch((err) => reply(json(err)))
break;
case 'runtime':
case 'uptime': {
    await EliteProTech.sendMessage(m.chat, {
        react: { text: "⚙️", key: m.key }
    });

    function formatUptime(seconds) {
        const d = Math.floor(seconds / 86400);
        seconds %= 86400;
        const h = Math.floor(seconds / 3600);
        seconds %= 3600;
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${d > 0 ? d + 'd ' : ''}${h}h ${m}m ${s}s`;
    }

    try {
        const runtimetext = `> ╭━━━━━━━━
> *Uptime:* *${formatUptime(process.uptime())}*
> ╰━━━━━━━━
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴇʟɪᴛᴇ-ᴘʀᴏ-ᴛᴇᴄʜ©*`;

        await sendInteractiveMessage(
            EliteProTech,
            m.chat,
            {
                text: runtimetext,
                footer: 'Choose an action:',
                interactiveButtons: [
                    {
                        name: 'quick_reply',
                        buttonParamsJson: JSON.stringify({
                            display_text: 'Menu 📃',
                            id: `${global.prefix}menu`
                        })
                    }
                ]
            },
            { quoted: m }
        );

    } catch (err) {
        console.error("Error in uptime message:", err);
        reply("❌ Failed to send uptime message.");
    }
    break;
}
break
case 'sc':
case 'script':
case 'repo': {
    await EliteProTech.sendMessage(m.chat, {
        react: { text: "⏳", key: m.key }
    })

    try {
        const repoOwner = "EliteProTech"
        const repoName = "ELITE-PRO-V1"
        const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}`

        const { data: repo } = await axios.get(apiUrl)
        const repoMessage = `*ELITE-PRO-V1 Repository*

${repo.description || "No description provided"}.

- *Repository:* ${repo.name}
- *Owner:* ${repo.owner.login}
- *Stars:* ${repo.stargazers_count}
- *Forks:* ${repo.forks_count}

Community: https://t.me/eliteprotechs

*Repository:* ${repo.html_url}`

        await EliteProTech.sendMessage(m.chat, {
            image: {url: `https://opengraph.githubassets.com/1/${repoOwner}/${repoName}`},
            caption: repoMessage,
            contextInfo: {
                forwardingScore: 5,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterName: "ᴇʟɪᴛᴇ-ᴘʀᴏ-ᴛᴇᴄʜ-ꜱᴜᴘᴘᴏʀᴛ",
                    newsletterJid: "120363287352245413@newsletter"
                }
            }
        }, { quoted: m })

        await EliteProTech.sendMessage(m.chat, {
            react: { text: "✅", key: m.key }
        })

    } catch (error) {
        console.log('Repo error:', error.message)

        await EliteProTech.sendMessage(m.chat, {
            react: { text: "❌", key: m.key }
        })

        await EliteProTech.sendMessage(m.chat, {
            text: `*BOT INFORMATION*

⭐ Fork & Star:
https://github.com/EliteProTech/ELITE-PRO-V1/fork

🎥 YouTube:
https://www.youtube.com/@eliteprotechs`
        }, { quoted: m })
    }
}
break
case 'owner': {
    try {
        const ownerNumber = EliteProTech.user.id.split('@')[0].split(':')[0];
        const displayNumber = `+${ownerNumber}`;
        const ownerName = EliteProTech.user.name || displayNumber;
        const vcard = `BEGIN:VCARD
VERSION:3.0
N:;${ownerName};;;
FN:${ownerName}
TEL;type=CELL;type=VOICE;waid=${ownerNumber}:${displayNumber}
X-WA-BIZ-NAME:${ownerName}
X-WA-BIZ-DESCRIPTION:Yo here's my contact
END:VCARD`;
        await EliteProTech.sendMessage(
            m.chat,
            {
                contacts: {
                    displayName: ownerName,
                    contacts: [
                        {
                            displayName: ownerName,
                            vcard
                        }
                    ]
                }
            },
            { quoted: m }
        );
    } catch (err) {
        console.error('Owner Contact Error:', err);
        reply('❌ Failed to send creator contact.');
    }
    break;
}
case 'sticker':
case 'stiker':
case 's': {
    try {
        const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
        const ffmpeg = require('fluent-ffmpeg');
        ffmpeg.setFfmpegPath(ffmpegPath);
        
        if (!m.quoted) return reply(`Reply to an image or video with the caption ${prefix + command}`);
        
        let mime = (m.quoted.msg || m.quoted).mimetype || '';
        
        if (/image/.test(mime)) {
            let media = await m.quoted.download();
            let encmedia = await EliteProTech.sendImageAsSticker(m.chat, media, m, {
                packname: packname,
                author: author
            });
            await fs.unlinkSync(encmedia);
            
        } else if (/video/.test(mime)) {
            if (((m.quoted.msg || m.quoted).seconds || 0) > 11)
                return reply('Maximum video length for sticker is 10 seconds!');
            
            let media = await m.quoted.download();
            let encmedia = await EliteProTech.sendVideoAsSticker(m.chat, media, m, {
                packname: packname,
                author: author
            });
            await fs.unlinkSync(encmedia);
            
        } else {
            return reply(`Send or reply to an image/video with the caption ${prefix + command}\n(Video must be 1–9 seconds)`);
        }
        
    } catch (err) {
        console.error(err);
        reply(`❌ Error creating sticker: ${err.message}`);
    }
}
            break
            case 'smeme': {
                let respond = `Send/Reply image/sticker with caption ${prefix + command} text1|text2`
                if (!/image/.test(mime)) return reply(respond)
                if (!text) return reply(respond)
                reply(mess.wait)
                atas = text.split('|')[0] ? text.split('|')[0] : '-'
                bawah = text.split('|')[1] ? text.split('|')[1] : '-'
                let dwnld = await EliteProTech.downloadAndSaveMediaMessage(qmsg)
                let fatGans = await TelegraPh(dwnld)
                let smeme = `https://api.memegen.link/images/custom/${encodeURIComponent(bawah)}/${encodeURIComponent(atas)}.png?background=${fatGans}`
                let pop = await EliteProTech.sendImageAsSticker(m.chat, smeme, m, {
                    packname: packname,
                    author: author
                })
                fs.unlinkSync(pop)
            }
break
case 'swm': case 'steal': case 'stickerwm': case 'take': {
    if (!quoted) return reply(`Reply to an image/video`)

    const swn = args.join(" ").trim()
    const [pack, author] = swn.split("|")

    const pcknm = pack || global.packname
    const atnm = author || global.author

    if (quoted.isAnimated) {

        const media = await EliteProTech.downloadAndSaveMediaMessage(
            quoted,
            "./database/temp/gifee"
        )

        await EliteProTech.sendMessage(
            from,
            { sticker: fs.readFileSync(media) },
            { quoted:m }
        )

        fs.unlinkSync(media)

    } else if (/image/.test(mime)) {

        const media = await quoted.download()

        await EliteProTech.sendImageAsSticker(
            m.chat,
            media,
            m,
            { packname:pcknm, author:atnm }
        )

    } else if (/video/.test(mime)) {

        if ((quoted.msg || quoted).seconds > 10)
        return reply('Maximum 10 Seconds!')

        const media = await EliteProTech.downloadAndSaveMediaMessage(
            quoted,
            "./database/temp/sticker_video"
        )

        await EliteProTech.sendVideoAsSticker(
            m.chat,
            media,
            m,
            { packname:pcknm, author:atnm }
        )

        fs.unlinkSync(media)

    } else {

        reply(`Reply to an image/video`)

    }

}
break
case 'toimage':
case 'toimg': {
    try {
        const msg = `✳️ Reply to a *sticker* with:\n\n*${prefix + command}*`;

        if (!m.quoted) return reply(msg);

        const q = m.quoted;
        const mime = q.mimetype || q.mediaType || '';

        if (!/webp/.test(mime)) {
            return reply(msg);
        }

        const media = await q.download().catch(() => null);
        if (!media) {
            return reply('❌ Failed to download the sticker.');
        }

        await EliteProTech.sendMessage(
            m.chat,
            {
                image: media,
                caption: '✅ Done converting'
            },
            { quoted: m }
        );

    } catch (err) {
        console.error('toimg Error:', err);
        reply('❌ Failed to convert sticker to image.');
    }
}
break
case 'tomp4':
case 'tovideo': {
    const mime = (qmsg?.mimetype || qmsg?.msg?.mimetype || '').toLowerCase()

    if (!mime || !/video|gif|webp/.test(mime)) {
        return reply(`Send or reply to a sticker, video or gif with caption *${prefix + command}*`)
    }

    let media
    const tempDir = './database/temp'

    try {
        await EliteProTech.sendMessage(m.chat, {
            react: { text: '⏳', key: m.key }
        })

        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true })

        media = await EliteProTech.downloadAndSaveMediaMessage(
            qmsg,
            `${tempDir}/${Date.now()}`
        )

        let result

        if (/webp/.test(mime)) {
            const webpToMp4 = await webp2mp4File(media)
            if (!webpToMp4 || !webpToMp4.result) throw new Error('webp2mp4 conversion failed')
            result = { url: webpToMp4.result }
        } else {
            result = fs.readFileSync(media)
        }

        await EliteProTech.sendMessage(m.chat, {
            video: result,
            mimetype: 'video/mp4',
            caption: 'Converted To MP4'
        }, { quoted: m })

        await EliteProTech.sendMessage(m.chat, {
            react: { text: '✅', key: m.key }
        })
    } catch (err) {
        console.error('tomp4 error:', err)

        await EliteProTech.sendMessage(m.chat, {
            react: { text: '❌', key: m.key }
        })

        reply(`Failed to process media.\n${err?.message || err}`)
    } finally {
        if (media && fs.existsSync(media)) fs.unlinkSync(media)
    }

    break
}
case 'toaud':
case 'toaudio': {
    if (!mime || (!/video/.test(mime) && !/audio/.test(mime))) {
        return reply(`Send or reply a video/audio with caption ${prefix + command}`)
    }

    await EliteProTech.sendMessage(m.chat, {
        react: { text: '⏳', key: m.key }
    })

    try {
        const media = await EliteProTech.downloadMediaMessage(qmsg)
        const audio = await toAudio(media, 'mp4')

        await EliteProTech.sendMessage(
            m.chat,
            {
                audio: audio,
                mimetype: 'audio/mpeg'
            },
            { quoted: m }
        )

        await EliteProTech.sendMessage(m.chat, {
            react: { text: '✅', key: m.key }
        })

    } catch (err) {
        console.error(err)

        await EliteProTech.sendMessage(m.chat, {
            react: { text: '❌', key: m.key }
        })

        reply('Failed to convert media to audio.')
    }

    break
}
case 'videonote':
case 'tovideonote': {
    if (!mime || !/video/.test(mime)) {
        return reply(`Send or reply a video with caption ${prefix + command}`)
    }

    await EliteProTech.sendMessage(m.chat, {
        react: { text: '⏳', key: m.key }
    })

    try {
        const media = await EliteProTech.downloadMediaMessage(qmsg)

        await EliteProTech.sendMessage(
            m.chat,
            {
                video: media,
                mimetype: 'video/mp4',
                ptv: true
            },
            { quoted: m }
        )

        await EliteProTech.sendMessage(m.chat, {
            react: { text: '✅', key: m.key }
        })

    } catch (err) {
        await EliteProTech.sendMessage(m.chat, {
            react: { text: '❌', key: m.key }
        })

        reply('Failed to convert video to video note.')
    }

    break
}
case 'tomp3': {
if (!/video/.test(mime) && !/audio/.test(mime)) return reply(`Send/Reply Video/Audio that you want to make into MP3 with caption ${prefix + command}`)
                reply(mess.wait)
                let media = await EliteProTech.downloadMediaMessage(qmsg)
                let audio = await toAudio(media, 'mp4')
                EliteProTech.sendMessage(m.chat, {
                    document: audio,
                    mimetype: 'audio/mp3',
                    fileName: `Elite.mp3`
                }, {
                    quoted: m
                })

            }
            break
            case 'tovn':
            case 'toptt': {
                if (!/video/.test(mime) && !/audio/.test(mime)) return reply(`Reply Video/Audio that you want to make into a VN with caption ${prefix + command}`)
                reply(mess.wait)
                let media = await EliteProTech.downloadMediaMessage(qmsg)
                let {
                    toPTT
                } = require('./lib/converter')
                let audio = await toPTT(media, 'mp4')
                EliteProTech.sendMessage(m.chat, {
                    audio: audio,
                    mimetype: 'audio/mpeg',
                    ptt: true
                }, {
                    quoted: m
                })

            }
break
case 'togif': {
    if (!mime) return reply(`Reply to a sticker or video with caption *${prefix + command}*`)

    try {
        await EliteProTech.sendMessage(m.chat, {
            react: { text: '⏳', key: m.key }
        })

        const media = await EliteProTech.downloadAndSaveMediaMessage(qmsg)

        let result

        if (/webp/i.test(mime)) {
            const webpToMp4 = await webp2mp4File(media)
            result = webpToMp4.result
        } else if (/video/i.test(mime)) {
            result = media
        } else {
            fs.unlinkSync(media)
            return reply('Only sticker or video is supported')
        }

        await EliteProTech.sendMessage(m.chat, {
            video: { url: result },
            gifPlayback: true,
            caption: 'Converted To GIF'
        }, { quoted: m })

        await EliteProTech.sendMessage(m.chat, {
            react: { text: '✅', key: m.key }
        })

        fs.unlinkSync(media)

    } catch (e) {
        console.error(e)

        await EliteProTech.sendMessage(m.chat, {
            react: { text: '❌', key: m.key }
        })

        reply('Failed to convert to GIF')
    }
}
break
case 'emojimix': {
try {

let [emoji1, emoji2] = text.split('+')
if (!emoji1 || !emoji2) {
return reply(`Example : ${prefix + command} 😅+🤔`)
}

reply(mess.wait)

let api = `https://tenor.googleapis.com/v2/featured?key=AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURdCYQ&contentfilter=high&media_filter=png_transparent&component=proactive&collection=emoji_kitchen_v5&q=${encodeURIComponent(emoji1)}_${encodeURIComponent(emoji2)}`

let anu = await fetchJson(api)

if (!anu.results || anu.results.length === 0) {
return reply("❌ Emoji mix not found.")
}

let imageUrl = anu.results[0].media_formats?.png_transparent?.url
if (!imageUrl) return reply("❌ Emoji mix not found.")

let buffer = await getBuffer(imageUrl)

await EliteProTech.sendImageAsSticker(m.chat, buffer, m, {
packname: global.packname,
author: global.author
})

} catch (err) {
console.log("EmojiMix Error:", err)
reply("❌ Error creating emoji mix.")
}
}
break
            case 'toonce':
            case 'toviewonce': {
                if (!quoted) return reply(`Reply Image/Video`)
                if (/image/.test(mime)) {
                    anuan = await EliteProTech.downloadAndSaveMediaMessage(quoted)
                    EliteProTech.sendMessage(m.chat, {
                        image: {
                            url: anuan
                        },
                        caption: `Here you go!`,
                        fileLength: "999",
                        viewOnce: true
                    }, {
                        quoted: m
                    })
                } else if (/video/.test(mime)) {
                    anuanuan = await EliteProTech.downloadAndSaveMediaMessage(quoted)
                    EliteProTech.sendMessage(m.chat, {
                        video: {
                            url: anuanuan
                        },
                        caption: `Here you go!`,
                        fileLength: "99999999",
                        viewOnce: true
                    }, {
                        quoted: m
                    })
                }
            }
break
case 'toqr':
case 'qr': {
    if (!q) return reply('Please include link or text!')

    try {
        const qrcode = require('qrcode')

        const qrBuffer = await qrcode.toBuffer(q, {
            scale: 35
        })

        await EliteProTech.sendMessage(from, {
            image: qrBuffer,
            caption: 'Here you go!'
        }, {
            quoted: m
        })
    } catch (error) {
        console.log(error)
        reply('Failed to generate QR code')
    }
}
break
case 'fliptext': {
if (args.length < 1) return reply(`Example:\n${prefix}fliptext ElitPro`)
quere = args.join(" ")
flipe = quere.split('').reverse().join('')
reply(`\`\`\`「 FLIP TEXT 」\`\`\`\n*•> Normal :*\n${quere}\n*•> Flip :*\n${flipe}`)
}
break
case 'addowner': case 'addsudo':
if (!isCreator) return reply(mess.owner)
if (!args[0]) return reply(`Use ${prefix+command} number\nExample ${prefix+command} ${ownernumber}`)
bnnd = q.split("|")[0].replace(/[^0-9]/g, '')
let ceknye = await EliteProTech.onWhatsApp(bnnd)
if (ceknye.length == 0) return reply(`Enter A Valid And Registered Number On WhatsApp!!!`)
owner.push(bnnd)
_owner.push(bnnd)
fs.writeFileSync('./database/owner.json', JSON.stringify(owner))
reply(`Number ${bnnd} Has Become An Owner!!!`)
break
case 'delowner': case 'deletesudo': case 'deleteowner':
if (!isCreator) return reply(mess.owner)
if (!args[0]) return reply(`Use ${prefix+command} nomor\nExample ${prefix+command} 2348109263390`)
ya = q.split("|")[0].replace(/[^0-9]/g, '')
unp = owner.indexOf(ya)
owner.splice(unp, 1)
let unp2 = _owner.indexOf(ya)
if (unp2 !== -1) _owner.splice(unp2, 1)
fs.writeFileSync('./database/owner.json', JSON.stringify(owner))
reply(`The Number ${ya} Has been deleted from owner list by the owner!!!`)
break
case 'emptychat':
    EliteProTech.sendMessage(
        from,
        {
            text: '\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n',
            mentions: [sender]
        },
        { quoted: m }
)
break
case 'menu':
let timestampe = speed()
let latensie = speed() - timestampe
let elitemenuoh = `┏━━━━━━━━━━━━━━━━❍
┃ *ᴇʟɪᴛᴇ-ᴘʀᴏ-ᴠɪ ʙᴏᴛ ᴍᴇɴᴜ*
┗━━━━━━━━━━━━━❍
┏━━━━━━━━━━━━━━━❍
┣❍ *ʙᴏᴛ ɪɴғᴏʀᴍᴀᴛɪᴏɴ:*
┣❍ *ᴜꜱᴇʀ:* ${pushname}
┣❍ *ᴠᴇʀꜱɪᴏɴ:* v1.1.1
┣❍ *ᴍᴏᴅᴇ:* ${EliteProTech.public ? 'Public' : 'Private'} 
┣❍ *ᴘʀᴇғɪx:* [ ${prefix} ]
┣❍ *ᴏᴡɴᴇʀ:* ${ownername}
┣❍ *sᴘᴇᴇᴅ:* ${latensie.toFixed(4)}ms
┗━━━━━━━━━━━━━❍
${readmore}┏━━━━━━━━━━━━━━━❍
┗┳❍ 「 *SETTINGS* 」❍
┏┻━━━━━━━━━━━━━━❍
│𖥟╾ Addowner
│𖥟╾ Delowner
│𖥟╾ Listowner
│𖥟╾ Block 
│𖥟╾ Unblock
│𖥟╾ Blocklist
│𖥟╾ Anticall
│𖥟╾ Joingc
│𖥟╾ Join
│𖥟╾ Restart
│𖥟╾ Mode
│𖥟╾ Edit
│𖥟╾ Clearall
│𖥟╾ Autobio
│𖥟╾ Setpp
│𖥟╾ Autoread
│𖥟╾ Autotyping 
│𖥟╾ Autorecording
│𖥟╾ Autorecordtype
│𖥟╾ Autoviewstatus
│𖥟╾ Autoreact
│𖥟╾ Autolikestatus
│𖥟╾ Chatbot
│𖥟╾ Getsession
│𖥟╾ Backup
│𖥟╾ Update
│𖥟╾ Setmenuimage
│𖥟╾ Antidelete
│𖥟╾ Setprefix
│𖥟╾ Setfullpp
│𖥟╾ Reveal
│𖥟╾ Listgroup
│𖥟╾ Listonline
│𖥟╾ Setpaypoint 
│𖥟╾ Reportcommand
┗━━┳━━━━━━━━━━❍
┏━━┻━━━━━━━━━━━━❍
┗┳❍ 「 *GROUPS* 」❍
┏┻━━━━━━━━━━━━━━❍
│𖥟╾ Add
│𖥟╾ Addall
│𖥟╾ Promote 
│𖥟╾ Promoteall
│𖥟╾ Demote
│𖥟╾ Demoteall
│𖥟╾ Kick 
│𖥟╾ Kickall
│𖥟╾ Left
│𖥟╾ Tagall
│𖥟╾ Hidetag
│𖥟╾ Totag
│𖥟╾ Gc
│𖥟╾ Warn
│𖥟╾ Unwarn
│𖥟╾ All
│𖥟╾ Antistatus
│𖥟╾ Approve
│𖥟╾ Reject
│𖥟╾ Group
│𖥟╾ Gcalert
│𖥟╾ Addmetaai
│𖥟╾ Removemetaai
│𖥟╾ Opentime 
│𖥟╾ Closetime 
│𖥟╾ Setdesc
│𖥟╾ Setgrouppicture
│𖥟╾ Editinfo
│𖥟╾ Invite
│𖥟╾ Revoke
│𖥟╾ Savecontact
│𖥟╾ Sendcontact
│𖥟╾ Contacttag
│𖥟╾ Welcome
│𖥟╾ Antilink
│𖥟╾ Tagadmin
┗━━━━━━━━━━━━━❍
┏━━━━━━━━━━━━━━━❍
┗┳❍「 *AI* 」❍
┏┻━━━━━━━━━━━━━━❍
│𖥟╾ Aivoice
│𖥟╾ Ai
│𖥟╾ Search
│𖥟╾ Chatgpt
│𖥟╾ Analyze
┗━━┳━━━━━━━━━━❍
┏━━┻━━━━━━━━━━━━❍
┗┳❍「 *ANIME* 」❍
┏┻━━━━━━━━━━━━━━❍
│𖥟╾ Animeavatar
│𖥟╾ Animeblush
│𖥟╾ Animewave
│𖥟╾ Animesmile
│𖥟╾ Animepoke 
│𖥟╾ Animewink
│𖥟╾ Animebonk
│𖥟╾ Animebully
│𖥟╾ Neko
│𖥟╾ Waifu
│𖥟╾ Loli
┗━━┳━━━━━━━━━━❍
┏━━┻━━━━━━━━━━━━❍
┗┳❍ 「 *IMG MAKER* 」 ❍
┏┻━━━━━━━━━━━━━━❍
│𖥟╾ Create
│𖥟╾ Ephoto
│𖥟╾ Brat
│𖥟╾ Toanime ⓟ
│𖥟╾ Ephotolist
│𖥟╾ Imagine
│𖥟╾ Deepfake
│𖥟╾ Toanime
│𖥟╾ Firelogo
│𖥟╾ Fakeigstory
│𖥟╾ Carbon
┗━━━━━━━━━━━━━❍
┏━━━━━━━━━━━━━━━❍
┗┳❍ 「 *CONVERT* 」 ❍
┏┻━━━━━━━━━━━━━━❍
│𖥟╾ Sticker
│𖥟╾ Take
│𖥟╾ Toimage
│𖥟╾ Tovideo
│𖥟╾ Toaudio
│𖥟╾ Tovideonote
│𖥟╾ Tomp3
│𖥟╾ Tovn
│𖥟╾ Togif
│𖥟╾ Toqr
│𖥟╾ Addpdf
│𖥟╾ Img2pdf
│𖥟╾ Clearpdf
│𖥟╾ Url
│𖥟╾ Catbox
│𖥟╾ Img2txt 
│𖥟╾ Get
│𖥟╾ Fliptext
│𖥟╾ Emojimix
│𖥟╾ Tiny
│𖥟╾ Ssweb
│𖥟╾ Imgbb
│𖥟╾ Tts
│𖥟╾ Ocr
│𖥟╾ Qrscan
│𖥟╾ Vocalremover
│𖥟╾ Colorize
│𖥟╾ Remini
│𖥟╾ Translate
│𖥟╾ Removebg
│𖥟╾ Toviewonce
┗━━━━━━━━━━━━━❍
┏━━━━━━━━━━━━━━━❍
┗┳❍ 「 *FUN* 」 ❍
┏┻━━━━━━━━━━━━━━❍
│𖥟╾ Readmore
│𖥟╾ Define
│𖥟╾ Flux
│𖥟╾ Tictactoe
│𖥟╾ Quotes
│𖥟╾ Fact
│𖥟╾ Truth
│𖥟╾ Google
│𖥟╾ Pickupline 
│𖥟╾ Flirt
│𖥟╾ Story
│𖥟╾ Stickkill
│𖥟╾ Note
│𖥟╾ Roast
│𖥟╾ Predict
│𖥟╾ Listnote
│𖥟╾ Deletenote
│𖥟╾ Insult
│𖥟╾ Wasted
│𖥟╾ Fakechannel
│𖥟╾ Fakedana
│𖥟╾ Country
│𖥟╾ Telegramsticker
│𖥟╾ Rate 
┗━━┳━━━━━━━━━━❍
┏━━┻━━━━━━━━━━━━❍
┗┳❍ 「 *DOWNLOADS* 」 ❍
┏┻━━━━━━━━━━━━━━❍
│𖥟╾ Play
│𖥟╾ Ytmp3
│𖥟╾ Ytmp4
│𖥟╾ Mediafire
│𖥟╾ Wallpaper 
│𖥟╾ Hdwallpaper
│𖥟╾ Pinterest
│𖥟╾ Tiktok 
│𖥟╾ Instagram
│𖥟╾ Facebook
│𖥟╾ Img
│𖥟╾ Aio
│𖥟╾ Fdroid
│𖥟╾ Imgsearch
│𖥟╾ Song
│𖥟╾ Twitter
│𖥟╾ Apk
│𖥟╾ Spotify
│𖥟╾ Spotifysearch
│𖥟╾ Gitclone
│𖥟╾ Splay
│𖥟╾ Nsfw
│𖥟╾ Npm
│𖥟╾ Knackvideo
│𖥟╾ Tiktokstalk
┗━━━━━━━━━━━━━━━❍
┏━━━━━━━━━━━━━━━❍
┗┳❍ 「 *GENERAL* 」❍
┏┻━━━━━━━━━━━━━━❍
│𖥟╾ Owner
│𖥟╾ Menu
│𖥟╾ Test
│𖥟╾ Alive
│𖥟╾ Runtime
│𖥟╾ Script
│𖥟╾ Donate
│𖥟╾ Clearchat
│𖥟╾ Delete
│𖥟╾ Getpp
│𖥟╾ Gemini
│𖥟╾ Elevenlab 
│𖥟╾ Lyrics
│𖥟╾ Yts
│𖥟╾ Vv
│𖥟╾ Getgrouppp
│𖥟╾ Panel
│𖥟╾ Copy
│𖥟╾ Vvdm
│𖥟╾ 8ballpool
│𖥟╾ Bible
│𖥟╾ Quran
│𖥟╾ Shazam
│𖥟╾ Statusd
│𖥟╾ Audiospeed
│𖥟╾ Eval
│𖥟╾ Jid
│𖥟╾ Lid
│𖥟╾ Tempmail
│𖥟╾ Tempinbox
│𖥟╾ Poll
│𖥟╾ Channel-id
│𖥟╾ Group-id
│𖥟╾ Pair [session-id]
┗━━━━━━━━━━━━━━━❍
> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴇʟɪᴛᴇ-ᴘʀᴏ-ᴛᴇᴄʜ`; 
const reactions = ["✅", "🔥", "😎", "👌", "😏", "🌟", "⚡", "💥", "🎉", "🧘", "🥺", "😉", "🔔", "🤫"];
const randomReaction = reactions[Math.floor(Math.random() * reactions.length)];
await EliteProTech.sendMessage(m.chat, {
    react: { text: randomReaction, key: m.key } 
  }); 
await EliteProTech.sendMessage(m.chat, {
  image: elitepropic,
  caption: elitemenuoh
}, { quoted: m });
break
}
} catch (err) {
console.log(util.format(err))
} 
}

let file = require.resolve(__filename)
fs.watchFile(file, () => {
    fs.unwatchFile(file)
    console.log(chalk.redBright(`Update ${__filename}`))
    delete require.cache[file]
    require(file)
})

process.on('uncaughtException', function(err) {
    let e = String(err)
    if (e.includes("conflict")) return
    if (e.includes("Socket connection timeout")) return
    if (e.includes("not-authorized")) return
    if (e.includes("already-exists")) return
    if (e.includes("rate-overlimit")) return
    if (e.includes("Connection Closed")) return
    if (e.includes("Timed Out")) return
    if (e.includes("Value not found")) return
    console.log('Caught exception: ', err)
})
