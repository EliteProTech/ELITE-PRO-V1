const { spawn } = require("child_process");
if (process.argv[2] !== "--child") {
    
    function launch() {
        let p = spawn("node", ["index.js", "--child"], {
            stdio: ["inherit", "inherit", "inherit", "ipc"]
        });
        
        p.on("message", (msg) => {
            if (msg === "reset") {
                p.kill();
                launch();
            }
        });
        
        p.on("exit", (code) => {
            if (code === 0 || code === 1) launch();
        });
    }
    launch();
    return;
}
const path = require('path');
const fs = require('fs');
require('./config')
if (!fs.existsSync(__dirname + '/session/creds.json') && global.sessionid) {
    try {
        const sessionData = JSON.parse(global.sessionid);
        fs.mkdirSync(__dirname + '/session', { recursive: true });
        fs.writeFileSync(__dirname + '/session/creds.json', JSON.stringify(sessionData, null, 2));
    } catch (err) {
    }
}
const pino = require('pino')
const { Boom } = require('@hapi/boom')
const chalk = require('chalk')
const FileType = require('file-type')
const axios = require('axios')
const PhoneNumber = require('awesome-phonenumber')
const { imageToWebp, videoToWebp, writeExifImg, writeExifVid } = require('./lib/exif')
const { smsg, isUrl, generateMessageTag, getBuffer, getSizeMedia, fetch, sleep, reSize, getGroupAdmins } = require('./lib/myfunc')
const { default: EliteProTechConnect, delay, PHONENUMBER_MCC, makeCacheableSignalKeyStore, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, generateForwardMessageContent, prepareWAMessageMedia, generateWAMessageFromContent, generateMessageID, downloadContentFromMessage, makeInMemoryStore, jidDecode, proto } = require("baileys")
const NodeCache = require("node-cache")
const Pino = require("pino")
const readline = require("readline")
const { parsePhoneNumber } = require("libphonenumber-js")
const makeWASocket = require("baileys").default
const EliteProHandler = require("./ElitePro")
const setupConsoleFilters = require('./lib/filter')
const http = require('http')
setupConsoleFilters()
const PORT = process.env.PORT || 3000;
const INDEX_PATH = path.join(__dirname, 'lib', 'index.html');
http.createServer((req, res) => {
    fs.readFile(INDEX_PATH, (err, data) => {
        if (err) {
            res.writeHead(404);
            return res.end('Not found');
        }
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data);
    });
}).listen(PORT, "0.0.0.0", () => {});

const store = {
    messages: {},
    contacts: {},
    chats: {},
    groupMetadata: async (jid) => {
        return {}
    },
    bind: function(ev) {
        ev.on('messages.upsert', ({ messages }) => {
            messages.forEach(msg => {
                if (msg.key && msg.key.remoteJid) {
                    this.messages[msg.key.remoteJid] = this.messages[msg.key.remoteJid] || {}
                    this.messages[msg.key.remoteJid][msg.key.id] = msg
                }
            })
        })
        
        ev.on('contacts.update', (contacts) => {
            contacts.forEach(contact => {
                if (contact.id) {
                    this.contacts[contact.id] = contact
                }
            })
        })
        
        ev.on('chats.set', (chats) => {
            this.chats = chats
        })
    },
    loadMessage: async function (jid, id) {
    return this.messages[jid]?.[id] || null
    }
}
let phoneNumber = "2347047504860"
let owner = JSON.parse(fs.readFileSync('./database/owner.json'))
let connectedMessageSent = false

const pairingCode = !!phoneNumber || process.argv.includes("--pairing-code")
const useMobile = process.argv.includes("--mobile")

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const question = (text) => new Promise((resolve) => rl.question(text, resolve))

async function startEliteProTech() {
let { version, isLatest } = await fetchLatestBaileysVersion()
const {  state, saveCreds } =await useMultiFileAuthState(`./session`)
    const msgRetryCounterCache = new NodeCache()
    const groupMetadataCache = new NodeCache({ stdTTL: 5 * 60, useClones: false })
    const handledMessages = new Set()
    const BOT_START_TIME = Date.now()
    const EliteProTech = makeWASocket({
        version,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: !pairingCode, 
        browser: [ "Ubuntu", "Chrome", "20.0.04" ],
        auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, Pino({ level: "fatal" }).child({ level: "fatal" })),
      },
	  fireInitQueries: false,
      markOnlineOnConnect: false, 
      generateHighQualityLinkPreview: true, 
      syncFullHistory: false,
	  shouldSyncHistoryMessage: () => false,
      getMessage: async (key) => {
      const msg = await store.loadMessage(key.remoteJid, key.id)
      return msg?.message || undefined
     },
      msgRetryCounterCache,
      cachedGroupMetadata: async (jid) => groupMetadataCache.get(jid),
      defaultQueryTimeoutMs: undefined,
   })
   const _rawGroupMetadata = EliteProTech.groupMetadata.bind(EliteProTech)
   EliteProTech.groupMetadata = async (jid) => {
       const cached = groupMetadataCache.get(jid)
       if (cached) return cached
       try {
           const fresh = await _rawGroupMetadata(jid)
           if (fresh) groupMetadataCache.set(jid, fresh)
           return fresh
       } catch (err) {
           return {}
       }
   }
   EliteProTech.ev.on('groups.update', (updates) => {
       for (const update of updates) {
           if (update?.id) {
               groupMetadataCache.del(update.id)
           }
       }
   })
   EliteProTech.ev.on('group-participants.update', ({ id }) => {
       if (id) groupMetadataCache.del(id)
   })

   store.bind(EliteProTech.ev)

   if (pairingCode && !EliteProTech.authState.creds.registered) {
      if (useMobile) throw new Error('Cannot use pairing code with mobile api')

      let phoneNumber
      if (!!phoneNumber) {
         phoneNumber = phoneNumber.replace(/[^0-9]/g, '')

         if (!Object.keys(PHONENUMBER_MCC).some(v => phoneNumber.startsWith(v))) {
            console.log(chalk.bgBlack(chalk.redBright("Start with country code of your WhatsApp Number, Example : +2347047504860")))
            process.exit(0)
         }
      } else {
         phoneNumber = await question(chalk.bgBlack(chalk.greenBright(`Please type your number below 🥰.\nFor example +2347047504860: `)))
         phoneNumber = phoneNumber.replace(/[^0-9]/g, '')

         // Ask again when entering the wrong number
         if (phoneNumber == "rien" ){
            console.log(chalk.bgBlack(chalk.redBright("Start with country code of your WhatsApp Number, Example : +2347047504860")))

            phoneNumber = await question(chalk.bgBlack(chalk.greenBright(`Please type your WhatsApp number. 🥰\nFor example: +2347047504860 : `)))
            phoneNumber = phoneNumber.replace(/[^0-9]/g, '')
            rl.close()
         }
      }

      setTimeout(async () => {
         let code = await EliteProTech.requestPairingCode(phoneNumber)
         code = code?.match(/.{1,4}/g)?.join("-") || code
         console.log(chalk.black(chalk.bgGreen(`Your Pairing Code : `)), chalk.black(chalk.white(code)))
      }, 3000)
   }
//AUTO STATUS WATCHER//
const processedStatusMessages = new Set()
function resolveStatusTarget(EliteProTech, mek) {
    const candidates = [
        mek?.key?.participantPn,
        mek?.participantPn,
        mek?.key?.participant,
        mek?.participant,
        mek?.sender,
        mek?.key?.remoteJid
    ].filter(Boolean)
    for (let jid of candidates) {
        if (EliteProTech.decodeJid) jid = EliteProTech.decodeJid(jid)
        if (jid?.endsWith('@s.whatsapp.net')) return jid
    }
    for (let jid of candidates) {
        if (EliteProTech.decodeJid) jid = EliteProTech.decodeJid(jid)
        if (jid) return jid
    }
    return null
}

async function handleStatusWatcher(EliteProTech, mek) {
    try {
        if (!mek?.message || !mek?.key || mek.key.fromMe) return
        if (mek.key.remoteJid !== 'status@broadcast') return
        if (!global.autoviewstatus && !global.autolikestatus) return

        const msg = mek.message

        if (msg?.reactionMessage) return
        if (msg?.protocolMessage) return

        const msgId = mek.key.id

        if (processedStatusMessages.has(msgId)) return
        processedStatusMessages.add(msgId)

        setTimeout(() => {
            processedStatusMessages.delete(msgId)
        }, 5 * 60 * 1000)

        const participantJid = resolveStatusTarget(EliteProTech, mek)
        if (!participantJid) return

        const statusKey = {
            remoteJid: 'status@broadcast',
            id: msgId,
            fromMe: false,
            participant: participantJid
        }

        if (global.autoviewstatus) {
            await EliteProTech.readMessages([statusKey])
            console.log(`👀 Viewed status from ${participantJid}`)
        }

        if (!global.autolikestatus) return

        const emojis = [
            '❤️','💸','😇','🍂','💥','💯','🔥','💫','💎','💗',
            '🤍','🖤','👀','🙌','🙆','🚩','🥰','💐','😎','🤎',
            '✅','⚡','🧡','😁','😄','🌸','🕊️','🌷','⛅','🌟',
            '🗿','☠️','💜','💙','🌝','💚'
        ]

        const emoji = emojis[Math.floor(Math.random() * emojis.length)]

        await EliteProTech.sendMessage(
            'status@broadcast',
            {
                react: {
                    text: emoji,
                    key: statusKey
                }
            },
            {
                statusJidList: [participantJid]
            }
        )

        console.log(`✅ Reacted to status from ${participantJid} with ${emoji}`)

    } catch (err) {
        console.error('❌ Status handler error:', err.message)
    }
}
//ANTISTATUS GROUP WATCHER//
async function handleAntiStatus(EliteProTech, mek) {
    try {
        if (!mek?.message || !mek?.key) return

        const from = mek.key.remoteJid
        if (!from || !from.endsWith('@g.us')) return

        const sender = mek.key.participant || from

        if (!mek.message?.groupStatusMentionMessage) return

        let data = {}
        try {
            data = JSON.parse(fs.readFileSync('./database/antistatus.json', 'utf8'))
        } catch {}

        if (!data[from]?.enabled) return

        const metadata = await EliteProTech.groupMetadata(from)
        const admins = metadata.participants
            .filter(v => v.admin !== null)
            .map(v => v.id)

        if (mek.key.fromMe || admins.includes(sender)) return

        const mode = data[from].mode || 'warn'
        const limit = data[from].limit || 3

        if (!data[from].users) data[from].users = {}
        if (!data[from].users[sender]) data[from].users[sender] = 0

        data[from].users[sender] += 1

        await EliteProTech.sendMessage(from, { delete: mek.key })

        if (mode === 'delete') {
            await EliteProTech.sendMessage(from, {
                text: `⚠️ @${sender.split('@')[0]} status mention not allowed.`,
                mentions: [sender]
            }, { quoted: mek })
        }

        if (mode === 'warn') {
            const count = data[from].users[sender]

            await EliteProTech.sendMessage(from, {
                text: `⚠️ Warning ${count}/${limit} @${sender.split('@')[0]}`,
                mentions: [sender]
            }, { quoted: mek })
        }

        if (mode === 'warnkick') {
            const count = data[from].users[sender]

            if (count >= limit) {
                await EliteProTech.groupParticipantsUpdate(from, [sender], 'remove')

                await EliteProTech.sendMessage(from, {
                    text: `🚫 @${sender.split('@')[0]} removed (limit ${limit}).`,
                    mentions: [sender]
                }, { quoted: mek })

                data[from].users[sender] = 0
            } else {
                await EliteProTech.sendMessage(from, {
                    text: `⚠️ Warning ${count}/${limit}`,
                    mentions: [sender]
                }, { quoted: mek })
            }
        }

        if (mode === 'kick') {
            await EliteProTech.groupParticipantsUpdate(from, [sender], 'remove')

            await EliteProTech.sendMessage(from, {
                text: `🚫 @${sender.split('@')[0]} removed for status mention.`,
                mentions: [sender]
            }, { quoted: mek })
        }

        fs.writeFileSync('./database/antistatus.json', JSON.stringify(data, null, 2))

    } catch (err) {
        console.error('AntiStatus Error:', err.message)
    }
}
// AUTOREACT MESSAGE
const emojiFile = path.join(__dirname, './database/autoreact.json')
let emojis = []

function loadEmojis() {
    try {
        const data = fs.readFileSync(emojiFile, 'utf8')
        const parsed = JSON.parse(data)

        if (!Array.isArray(parsed)) throw new Error('Emoji file is not an array')

        emojis = parsed
    } catch (err) {
        emojis = []
        console.error('❌ Failed to load autoreact emojis:', err.message)
    }
}

loadEmojis()

async function handleAutoReact(EliteProTech, mek) {
    try {
        if (!mek?.key || mek.key.fromMe || !mek.key.remoteJid) return
        if (!global.autoreact || emojis.length < 1) return

        const jid = mek.key.remoteJid
        if (jid === 'status@broadcast') return

        const chatType = jid.endsWith('@g.us') ? 'Group' : 'DM'
        const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)]

        await EliteProTech.sendMessage(jid, {
            react: {
                text: randomEmoji,
                key: mek.key
            }
        })

        console.log(`✅ Auto-reacted in ${chatType} (${jid}) with ${randomEmoji}`)

    } catch (err) {
        console.error('❌ Auto-react error:', err.message)
    }
}
//CHATBOT CODES//
const chatbotProcessedMessages=new Set()
async function handleChatbot(EliteProTech,mek){
    try{
        if(!mek?.message||!mek?.key||mek.key.fromMe)return
        const from=mek.key.remoteJid
        if(!from||from==='status@broadcast')return
        const messageKey=`${from}:${mek.key.id}`
        if(chatbotProcessedMessages.has(messageKey))return
        chatbotProcessedMessages.add(messageKey)
        setTimeout(()=>chatbotProcessedMessages.delete(messageKey),60000)
        let chatbotData={global:false,dm:false,group:false,chats:{}}
        try{
            const data=fs.readFileSync('./database/chatbot.json','utf8')
            chatbotData=JSON.parse(data)
        }catch{
            return
        }
        const isGroup=from.endsWith('@g.us')
        const isDM=from.endsWith('@s.whatsapp.net')
        const chatEnabled=chatbotData.chats?.[from]===true
        const typeEnabled=isGroup?chatbotData.group===true:chatbotData.dm===true
        if(!chatbotData.global&&!typeEnabled&&!chatEnabled)return
        const text=mek.message.conversation||mek.message.extendedTextMessage?.text||mek.message.imageMessage?.caption||mek.message.videoMessage?.caption||''
        if(!text.trim())return
        const prefix=global.prefix||'.'
        if(text.trim().startsWith(prefix))return
        const sender=mek.key.participant||from
        global.userChats=global.userChats||{}
        global.userChatTimestamps=global.userChatTimestamps||{}
        global.userChats[sender]=global.userChats[sender]||[]
        global.userChatTimestamps[sender]=Date.now()
        global.userChats[sender].push(`User: ${text}`)
        if(global.userChats[sender].length>15)global.userChats[sender].shift()
        const history=global.userChats[sender].join('\n').slice(-3000)
        const basePrompt=`
You're ElitePro, an intelligent assistant developed by Chinedu (cyrilix-xmd). Respond clearly and naturally. Do not ask, "How can I assist you?"

Owner: Chinedu-md
WhatsApp: https://wa.me/2347047504860
Telegram: https://t.me/eliteprotechs
Website: https://eliteprotech.zone.id/
YouTube: https://www.youtube.com/@eliteprotechs
GitHub: https://eliteproverified.vercel.app/

Services Guide:
- If someone requests a song, reply: ".play [song name]".
- If someone requests a video, reply: ".video [video name]".
- If someone requests an image, reply: ".img [image name]".
- If someone requests menu, reply: ".menu".
- If someone requests a song, reply: ".song [song name]".

Conversation History:
${history}
        `.trim()
        await EliteProTech.sendPresenceUpdate('composing',from)
        await new Promise(resolve=>setTimeout(resolve,1000))
        const apiUrl=`https://eliteprotech-apis.zone.id/deepai?prompt=${encodeURIComponent(text)}`
        const response=await axios.get(apiUrl,{headers:{Accept:'*/*','User-Agent':'Mozilla/5.0'},timeout:30000})
        const botReply=response?.data?.success&&response?.data?.response?response.data.response:'I couldn’t generate a reply at this time. Please try again.'
        await EliteProTech.sendPresenceUpdate('paused',from)
        global.userChats[sender].push(`Bot: ${botReply}`)
        if(global.userChats[sender].length>15)global.userChats[sender].shift()
        await EliteProTech.sendMessage(from,{text:botReply},{quoted:mek})
    }catch(err){
        console.error('❌ Chatbot Error:',err.message)
        try{
            const from=mek?.key?.remoteJid
            if(from)await EliteProTech.sendMessage(from,{text:'❌ An error occurred while processing your message.'},{quoted:mek})
        }catch(fallbackErr){
            console.error('❌ Failed to send error message:',fallbackErr.message)
        }
    }
}
setInterval(()=>{
    if(!global.userChatTimestamps||!global.userChats)return
    const now=Date.now()
    for(const user in global.userChatTimestamps){
        if(now-global.userChatTimestamps[user]>30*60*1000){
            delete global.userChats[user]
            delete global.userChatTimestamps[user]
            console.log(`🧹 Cleared memory for inactive user: ${user}`)
        }
    }
},10*60*1000)
//ANTILINK DETECT//
async function handleAntiLink(EliteProTech, mek) {
    try {
        if (!mek?.message || !mek?.key) return
        if (mek.message.protocolMessage) return
        const from = mek.key.remoteJid
        if (!from || !from.endsWith('@g.us')) return
        const sender = mek.key.participant || from
        const text =
            mek.message.conversation ||
            mek.message.extendedTextMessage?.text ||
            mek.message.imageMessage?.caption ||
            mek.message.videoMessage?.caption ||
            mek.message.documentMessage?.caption ||
            ''
        if (!isUrl(text)) return
        let antilinkData = {}
        try {
            antilinkData = JSON.parse(
                fs.readFileSync('./database/antilink.json', 'utf8')
            )
        } catch (err) {
            console.error('Error loading antilink.json:', err.message)
            return
        }
        if (!antilinkData[from]?.enabled) return
        const actionType = antilinkData[from].action || 'warn'
        const warnings = antilinkData[from].warnings || {}
        const groupMetadata = await EliteProTech.groupMetadata(from)
        const admins = groupMetadata.participants
            .filter(v => v.admin !== null)
            .map(v => v.id)
        const botJid =
            EliteProTech.user.id.split(':')[0] + '@s.whatsapp.net'
        const botParticipant = groupMetadata.participants.find(
            p => p.jid === botJid
        )
        const isBotMessage = mek.key.fromMe
        const isAdmin = admins.includes(sender)
        const isOwner =
            Array.isArray(owner) &&
            owner.some(num =>
                sender === num ||
                sender === num + '@s.whatsapp.net'
            )
        const isBotAdmin = botParticipant?.admin !== null
        if (isBotMessage || isAdmin || isOwner) return
        console.log(`🔗 Link detected from ${sender}: ${text}`)
        if (!isBotAdmin) return
        if (actionType === 'delete') {
            await EliteProTech.sendMessage(from, {
                delete: mek.key
            })
            await EliteProTech.sendMessage(
                from,
                {
                    text: `⚠️ @${sender.split('@')[0]} links are not allowed in this group.`,
                    mentions: [sender]
                },
                { quoted: mek }
            )
        }
        else if (actionType === 'kick') {
            await EliteProTech.sendMessage(from, {
                delete: mek.key
            })
            await EliteProTech.sendMessage(
                from,
                {
                    text: `🚫 @${sender.split('@')[0]} has been removed for sending links.`,
                    mentions: [sender]
                },
                { quoted: mek }
            )
            await EliteProTech.groupParticipantsUpdate(
                from,
                [sender],
                'remove'
            )
        }
        else if (actionType === 'warn') {
            warnings[sender] = (warnings[sender] || 0) + 1
            antilinkData[from].warnings = warnings
            fs.writeFileSync(
                './database/antilink.json',
                JSON.stringify(antilinkData, null, 2)
            )
            const warnCount = warnings[sender]
            await EliteProTech.sendMessage(from, {
                delete: mek.key
            })
            await EliteProTech.sendMessage(
                from,
                {
                    text: `⚠️ @${sender.split('@')[0]} links are not allowed.\nWarning ${warnCount}/4`,
                    mentions: [sender]
                },
                { quoted: mek }
            )
            if (warnCount >= 4) {
                await EliteProTech.groupParticipantsUpdate(
                    from,
                    [sender],
                    'remove'
                )
                await EliteProTech.sendMessage(
                    from,
                    {
                        text: `🚫 @${sender.split('@')[0]} has been removed.\nLimit exceeded (4/4).`,
                        mentions: [sender]
                    },
                    { quoted: mek }
                )
                delete warnings[sender]
                antilinkData[from].warnings = warnings
                fs.writeFileSync(
                    './database/antilink.json',
                    JSON.stringify(antilinkData, null, 2)
                )
            }
        }
    } catch (err) {
        console.error('❌ Error in anti-link detection:', err.message)
    }
}
//CHANNEL AUTOREACT//
const CHANNEL_ID = "120363287352245413@newsletter"
async function handleChannelReact(EliteProTech, mek) {
    try {
        if (!mek?.message || !mek?.key) return

        const from = mek.key.remoteJid
        const serverId = mek.key.server_id

        if (from !== CHANNEL_ID) return
        if (!serverId) return

        const emojis = [
            "❤️", "💛", "👍", "💜", "😮", "🤍", "💙", "🔥", "💯", "⚡"
        ]

        const emoji = emojis[Math.floor(Math.random() * emojis.length)]

        await EliteProTech.newsletterReactMessage(
            from,
            serverId.toString(),
            emoji
        )

    } catch (err) {
        console.log("Channel React Error:", err.message)
    }
}
//ANTIDELETE CODES//
const { downloadMediaMessage } = require('baileys')
const antiDeleteDir = path.join(__dirname, 'anti_delete')
const toggleFile = path.join(__dirname, 'database', 'antidelete.json')

if (!fs.existsSync(antiDeleteDir)) fs.mkdirSync(antiDeleteDir, { recursive: true })
if (!fs.existsSync(path.dirname(toggleFile))) fs.mkdirSync(path.dirname(toggleFile), { recursive: true })
if (!fs.existsSync(toggleFile)) fs.writeFileSync(toggleFile, JSON.stringify({ enabled: false }, null, 2))

let antiDeleteConfig = JSON.parse(fs.readFileSync(toggleFile, 'utf8'))

function reloadConfig() {
    try {
        antiDeleteConfig = JSON.parse(fs.readFileSync(toggleFile, 'utf8'))
    } catch {
        antiDeleteConfig = { enabled: false }
    }
}

function saveMessage(remoteJid, msgId, msg) {
    const filePath = path.join(antiDeleteDir, `${remoteJid}_${msgId}.json`)
    const minimalMsg = {
        key: msg.key,
        message: msg.message,
        pushName: msg.pushName,
        _ts: Date.now()
    }

    try {
        fs.writeFileSync(filePath, JSON.stringify(minimalMsg, null, 2))
    } catch (err) {
        console.error('❌ Error saving message:', err.message)
    }
}

function loadMessage(remoteJid, msgId) {
    const filePath = path.join(antiDeleteDir, `${remoteJid}_${msgId}.json`)
    try {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'))
    } catch {
        return null
    }
}

async function restoreMessage(EliteProTech, from, note, msg, quoted, mentions) {
    try {
        if (msg.conversation) {
            return EliteProTech.sendMessage(
                from,
                { text: `${note}\n♻️ *Message:* \`\`\`${msg.conversation}\`\`\``, mentions },
                { quoted }
            )
        }

        if (msg.extendedTextMessage?.text) {
            return EliteProTech.sendMessage(
                from,
                { text: `${note}\n♻️ *Message:* \`\`\`${msg.extendedTextMessage.text}\`\`\``, mentions },
                { quoted }
            )
        }

        const sendNote = async () =>
            EliteProTech.sendMessage(from, { text: note, mentions }, { quoted })

        if (msg.imageMessage) {
            const media = await downloadMediaMessage(quoted, 'buffer', {}, {
                reuploadRequest: EliteProTech.updateMediaMessage
            })
            await EliteProTech.sendMessage(from, { image: media }, { quoted })
            return sendNote()
        }

        if (msg.videoMessage) {
            const media = await downloadMediaMessage(quoted, 'buffer', {}, {
                reuploadRequest: EliteProTech.updateMediaMessage
            })
            await EliteProTech.sendMessage(from, { video: media }, { quoted })
            return sendNote()
        }

        if (msg.audioMessage) {
            const media = await downloadMediaMessage(quoted, 'buffer', {}, {
                reuploadRequest: EliteProTech.updateMediaMessage
            })
            await EliteProTech.sendMessage(
                from,
                {
                    audio: media,
                    ptt: msg.audioMessage.ptt,
                    mimetype: msg.audioMessage.mimetype || 'audio/mpeg',
                    fileName: 'restored.mp3'
                },
                { quoted }
            )
            return sendNote()
        }

        if (msg.stickerMessage) {
            const media = await downloadMediaMessage(quoted, 'buffer', {}, {
                reuploadRequest: EliteProTech.updateMediaMessage
            })
            await EliteProTech.sendMessage(from, { sticker: media }, { quoted })
            return sendNote()
        }

        if (msg.documentMessage) {
            const media = await downloadMediaMessage(quoted, 'buffer', {}, {
                reuploadRequest: EliteProTech.updateMediaMessage
            })
            await EliteProTech.sendMessage(
                from,
                {
                    document: media,
                    fileName: msg.documentMessage.fileName || 'restored.file',
                    mimetype: msg.documentMessage.mimetype || 'application/octet-stream'
                },
                { quoted }
            )
            return sendNote()
        }

        return EliteProTech.sendMessage(
            from,
            {
                text: `${note}\n❌ *Cannot restore deleted media – possibly expired or unsupported.*`,
                mentions
            },
            { quoted }
        )
    } catch (err) {
        console.error('❌ Restore error:', err.message)
    }
}

async function getChatName(EliteProTech, jid, fallback = jid) {
    try {
        if (jid.endsWith('@g.us')) {
            const meta = await EliteProTech.groupMetadata(jid)
            return meta.subject || fallback
        }

        const contact = EliteProTech.contacts?.[jid] || {}
        return contact.name || contact.verifiedName || contact.notify || fallback
    } catch {
        return fallback
    }
}

const handledDeletes = new Set()

setInterval(() => {
    const now = Date.now()

    for (const key of [...handledDeletes]) {
        const [, ts] = key.split('|')
        if (now - parseInt(ts) > 10 * 60 * 1000) handledDeletes.delete(key)
    }

    for (const file of fs.readdirSync(antiDeleteDir)) {
        try {
            const filePath = path.join(antiDeleteDir, file)
            const content = JSON.parse(fs.readFileSync(filePath, 'utf8'))

            if (now - (content._ts || 0) > 10 * 60 * 1000) {
                fs.unlinkSync(filePath)
            }
        } catch {}
    }
}, 60 * 1000)

async function handleAntiDeleteCapture(EliteProTech, mek) {
    try {
        reloadConfig()
        if (!antiDeleteConfig.enabled) return
        if (!mek?.message || !mek?.key || mek.key.fromMe) return

        saveMessage(mek.key.remoteJid, mek.key.id, mek)
    } catch (err) {
        console.error('❌ Anti-delete capture error:', err.message)
    }
}

EliteProTech.ev.on('messages.update', async updates => {
    reloadConfig()
    if (!antiDeleteConfig.enabled) return

    for (const update of updates) {
        const remoteJid = update.key?.remoteJid
        const msgId = update.key?.id
        if (!remoteJid || !msgId) continue

        const isDeleted =
            update.update?.messageStubType === 1 ||
            update.message?.protocolMessage?.type === 0

        if (!isDeleted) continue

        const baseKey = `${remoteJid}-${msgId}`
        if ([...handledDeletes].some(e => e.startsWith(baseKey))) continue

        handledDeletes.add(`${baseKey}|${Date.now()}`)

        const old = loadMessage(remoteJid, msgId)
        if (!old?.message) continue

        const deletedBy = update.participant || update.key.participant || remoteJid
        const sentBy = old.key.participant || old.key.remoteJid
        const botId = EliteProTech.user.id.split('@')[0]

        if ((deletedBy && deletedBy.includes(botId)) || (sentBy && sentBy.includes(botId))) continue

        const whoDeleted = `@${(deletedBy || '').split('@')[0]}`
        const whoSent = `@${(sentBy || '').split('@')[0]}`

        const ownerNumber = EliteProTech.user.id.split(':')[0] + '@s.whatsapp.net'
        const from = ownerNumber

        const chatName = await getChatName(EliteProTech, remoteJid, remoteJid)

        const note = `╭━━[ *× ANTI DELETE MESSAGES ×* ]━┉
┣━ *Deleted:* ${whoDeleted}
┣━
┣━ *Sender:* ${whoSent}
┣━
┣━ *Chat:* ${chatName}
╰━━━━━━━━━━━━━━━━━━━━┉`

        await restoreMessage(
            EliteProTech,
            from,
            note,
            old.message,
            { key: old.key, message: old.message },
            [deletedBy, sentBy]
        )

        try {
            fs.unlinkSync(path.join(antiDeleteDir, `${remoteJid}_${msgId}.json`))
        } catch {}
    }
})

EliteProTech.ev.on('messages.upsert', async chatUpdate => {
    try {
        const { messages, type } = chatUpdate
        if (type !== 'notify') return

        const mek = messages[0]
        if (!mek?.message || !mek?.key?.id) return

        const msgId = mek.key.id
        if (handledMessages.has(msgId)) return
        handledMessages.add(msgId)
        setTimeout(() => handledMessages.delete(msgId), 60000)

        const rawTs = mek.messageTimestamp
        const msgTimestamp = (typeof rawTs === 'object' ? (rawTs?.toNumber?.() ?? rawTs?.low ?? 0) : (rawTs ?? 0)) * 1000
        if (msgTimestamp && msgTimestamp < BOT_START_TIME) return

        mek.message =
            mek.message?.ephemeralMessage?.message ||
            mek.message?.viewOnceMessageV2?.message ||
            mek.message?.viewOnceMessage?.message ||
            mek.message

        if (mek.message?.protocolMessage || mek.message?.pollUpdateMessage) return

        const jid = mek.key?.remoteJid
        const isStatus = jid === 'status@broadcast'
        const isGroup = jid?.endsWith('@g.us')
        const isNewsletter = jid?.endsWith('@newsletter')

        if (isStatus) {
            handleStatusWatcher(EliteProTech, mek)
            return
        }

        if (mek.key.id.startsWith('BAE5') && mek.key.id.length === 16) return

        const m = smsg(EliteProTech, mek, store)
        EliteProHandler(EliteProTech, m, chatUpdate, store)

        if (isGroup) {
            handleAntiStatus(EliteProTech, mek)
            handleAntiLink(EliteProTech, mek)
        }

        if (isNewsletter) handleChannelReact(EliteProTech, mek)

        handleAntiDeleteCapture(EliteProTech, mek)
        handleAutoReact(EliteProTech, mek)
        handleChatbot(EliteProTech, mek)

    } catch (err) {
        console.log(err)
    }
})

EliteProTech.decodeJid = (jid) => {
        if (!jid) return jid
        if (/:\d+@/gi.test(jid)) {
            let decode = jidDecode(jid) || {}
            return decode.user && decode.server && decode.user + '@' + decode.server || jid
        } else return jid
}

EliteProTech.ev.on('contacts.update', update => {
        for (let contact of update) {
            let id = EliteProTech.decodeJid(contact.id)
            if (store && store.contacts) store.contacts[id] = {
                id,
                name: contact.notify
            }
        }
})

    EliteProTech.getName = (jid, withoutContact = false) => {
        id = EliteProTech.decodeJid(jid)
        withoutContact = EliteProTech.withoutContact || withoutContact
        let v
        if (id.endsWith("@g.us")) return new Promise(async (resolve) => {
            v = store.contacts[id] || {}
            if (!(v.name || v.subject)) v = EliteProTech.groupMetadata(id) || {}
            resolve(v.name || v.subject || PhoneNumber('+' + id.replace('@s.whatsapp.net', '')).getNumber('international'))
        })
        else v = id === '0@s.whatsapp.net' ? {
                id,
                name: 'WhatsApp'
            } : id === EliteProTech.decodeJid(EliteProTech.user.id) ?
            EliteProTech.user :
            (store.contacts[id] || {})
        return (withoutContact ? '' : v.name) || v.subject || v.verifiedName || PhoneNumber('+' + jid.replace('@s.whatsapp.net', '')).getNumber('international')
    }
    
let modeData
try {
    modeData = JSON.parse(fs.readFileSync('./database/mode.json'))
} catch {
    modeData = { mode: 'public' }
    fs.writeFileSync('./database/mode.json', JSON.stringify(modeData, null, 2))
}

EliteProTech.public = modeData.mode === 'public'

EliteProTech.serializeM = (m) => smsg(EliteProTech, m, store)

EliteProTech.ev.on("connection.update", async (s) => {
        const { connection, lastDisconnect } = s
        if (connection == "open") {
            console.log(chalk.yellow(`]`));
            console.log(chalk.yellow(`✅  ${botname} is now Connected`));
            console.log(chalk.cyan(`Logged in as: ${EliteProTech.user?.name || 'Unknown'} (${EliteProTech.user?.id?.split(':')[0]})`));
            console.log(chalk.yellow(`]`));

			await delay(1999)

            if (!connectedMessageSent) {
                connectedMessageSent = true

                const botJid = EliteProTech.decodeJid(EliteProTech.user.id)
                await EliteProTech.sendMessage(botJid, {
                    text: `*✅ ELITE-PRO-V1 is now connected and online!* Bot Prefix: ${global.prefix || '.'} | Mode: ${modeData.mode}\n\n*Join us:* https://t.me/eliteprotechs`
                })
            }
        }
if (
    connection === "close" &&
    lastDisconnect &&
    lastDisconnect.error
) {
    const statusCode = lastDisconnect.error.output?.statusCode;

    if (statusCode === 401) {
        console.log(chalk.red("❌ Your device was logged out. Please Re-pair."));
    } else {
        return startEliteProTech();
    }
}      
   })
    EliteProTech.ev.on('creds.update', saveCreds)

    EliteProTech.sendText = (jid, text, quoted = '', options) => EliteProTech.sendMessage(jid, {
        text: text,
        ...options
    }, {
        quoted,
        ...options
    })
    EliteProTech.sendTextWithMentions = async (jid, text, quoted, options = {}) => EliteProTech.sendMessage(jid, {
        text: text,
        mentions: [...text.matchAll(/@(\d{0,16})/g)].map(v => v[1] + '@s.whatsapp.net'),
        ...options
    }, {
        quoted
    })
//WELCOME WATCHER// 
EliteProTech.ev.on('group-participants.update', async (anu) => {
    try {
        const welcomeDBPath = './database/welcome.json';
        let welcomeDB = {};
        try { welcomeDB = JSON.parse(fs.readFileSync(welcomeDBPath, 'utf-8')); } catch {}

        const chatId = anu.id;
        const isEnabled = welcomeDB[chatId]?.enabled || global.welcome;
        if (!isEnabled) return;

        const metadata = await EliteProTech.groupMetadata(chatId);
        const groupName = metadata.subject;
        const groupDesc = metadata.desc || "No description available.";

        const getRealJid = (jid) => {
            const participants = metadata.participants || [];
            for (let p of participants) {
                if (p.id === jid || p.lid === jid || p.jid === jid) return p.jid || p.pn;
            }
            return jid;
        };

        for (let num of anu.participants) {
            const realNum = getRealJid(num);
            const userTag = `@${realNum.split("@")[0]}`;

            let ppuser;
            try { ppuser = await EliteProTech.profilePictureUrl(realNum, 'image'); } 
            catch { ppuser = 'https://i.ibb.co/WRsDhwd/img-jxl3d4p3.png'; }

            const updatedMeta = await EliteProTech.groupMetadata(chatId);
            const memberCount = updatedMeta.participants.length;

            const baseContext = {
                forwardingScore: 5,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterName: "ᴇʟɪᴛᴇ-ᴘʀᴏ-ᴛᴇᴄʜ-ꜱᴜᴘᴘᴏʀᴛ",
                    newsletterJid: "120363287352245413@newsletter",
                },
                mentionedJid: [realNum],
            };

            if (anu.action === "add") {
                const welcomeText = `*Welcome ${userTag} to ${groupName}!* 🎉
We now have ${memberCount} members.

*Please Read Group Description:*  
${groupDesc}
> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴇʟɪᴛᴇ-ᴘʀᴏ-ᴛᴇᴄʜ`;

                await EliteProTech.sendMessage(chatId, { image: { url: ppuser }, caption: welcomeText, contextInfo: baseContext }, { quoted: null });
            } 
            else if (anu.action === "remove") {
                const goodbyeText = `*😢 ${userTag} left ${groupName}!*

Thanks for being part of the community. Hope to see you again! 👋

We now have ${memberCount} members. 👥
> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴇʟɪᴛᴇ-ᴘʀᴏ-ᴛᴇᴄʜ`;

                await EliteProTech.sendMessage(chatId, { image: { url: ppuser }, caption: goodbyeText, contextInfo: baseContext }, { quoted: null });
            }
        }

    } catch (err) {
        console.error("Welcome/Left Error:", err);
    }
}); 
// === AUTO CALL HANDLER (Decline / Block) ===
EliteProTech.ev.on("call", async (callEvents) => {
    let anticallData;
    try {
        anticallData = JSON.parse(fs.readFileSync('./database/anticall.json'));
    } catch {
        anticallData = { enabled: false, mode: "decline" };
    }
    
    if (!anticallData.enabled) return; // not active
    
    for (const call of callEvents) {
        try {
            if (call.status === "offer") {
                const callerId = call.from;
                
                // Always reject the call
                await EliteProTech.rejectCall(call.id, callerId);
                
                if (anticallData.mode === "decline") {
                    await EliteProTech.sendMessage(callerId, {
                        text: "🚫 Calls are not allowed.\nYour call was auto-declined."
                    });
                    console.log(`❌ Call from ${callerId} auto-declined.`);
                } else if (anticallData.mode === "block") {
                    await EliteProTech.sendMessage(callerId, {
                        text: "⛔ Calls are strictly forbidden.\nYou have been *blocked* for calling the bot."
                    });
                    await EliteProTech.updateBlockStatus(callerId, "block");
                    console.log(`⛔ ${callerId} was blocked for calling.`);
                }
            }
        } catch (err) {
            console.error("❌ Error handling call:", err.message);
        }
    }
});
// === AUTO SESSION CLEANER ===
const sessionDir = path.join(__dirname, 'session');
function cleanSessionFiles() {
    try {
        if (!fs.existsSync(sessionDir)) return;
        
        const files = fs.readdirSync(sessionDir);
        
        for (const file of files) {
            if (file === 'creds.json') continue;
            
            if (
                file.startsWith('pre-key') ||
                file.startsWith('sender-key') ||
                file.startsWith('session-') ||
                file.startsWith('app-state')
            ) {
                try {
                    fs.unlinkSync(path.join(sessionDir, file));
                } catch {}
            }
        }
    } catch {}
}
setInterval(cleanSessionFiles, 8 * 60 * 60 * 1000);
////Sticker code    
    EliteProTech.sendImageAsSticker = async (jid, path, quoted, options = {}) => {
        let buff = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,` [1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
        let buffer
        if (options && (options.packname || options.author)) {
            buffer = await writeExifImg(buff, options)
        } else {
            buffer = await imageToWebp(buff)
        }

        await EliteProTech.sendMessage(jid, {
            sticker: {
                url: buffer
            },
            ...options
        }, {
            quoted
        })
        return buffer
    }
    EliteProTech.sendVideoAsSticker = async (jid, path, quoted, options = {}) => {
        let buff = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,` [1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
        let buffer
        if (options && (options.packname || options.author)) {
            buffer = await writeExifVid(buff, options)
        } else {
            buffer = await videoToWebp(buff)
        }
        await EliteProTech.sendMessage(jid, {
            sticker: {
                url: buffer
            },
            ...options
        }, {
            quoted
        })
        return buffer
    }
    EliteProTech.downloadAndSaveMediaMessage = async (message, filename, attachExtension = true) => {
        let quoted = message.msg ? message.msg : message
        let mime = (message.msg || message).mimetype || ''
        let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0]
        const stream = await downloadContentFromMessage(quoted, messageType)
        let buffer = Buffer.from([])
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk])
        }
        let type = await FileType.fromBuffer(buffer)
        trueFileName = attachExtension ? (filename + '.' + type.ext) : filename
        // save to file
        await fs.writeFileSync(trueFileName, buffer)
        return trueFileName
    }

    EliteProTech.downloadMediaMessage = async (message) => {
        let mime = (message.msg || message).mimetype || ''
        let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0]
        const stream = await downloadContentFromMessage(message, messageType)
        let buffer = Buffer.from([])
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk])
        }

        return buffer
    }
    }
return startEliteProTech()

let file = require.resolve(__filename)
fs.watchFile(file, () => {
    fs.unwatchFile(file)
    console.log(chalk.redBright(`Update ${__filename}`))
    delete require.cache[file]
    require(file)
})

process.on('uncaughtException', function (err) {
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
