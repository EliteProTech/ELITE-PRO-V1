import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import makeWASocket, {
    DisconnectReason,
    downloadContentFromMessage,
    downloadMediaMessage,
    extractMessageContent,
    fetchLatestBaileysVersion,
    jidDecode,
    makeCacheableSignalKeyStore,
    WAMessageStubType,
    useMultiFileAuthState
} from 'baileys';
import './config.js';
import { imageToWebp, videoToWebp, writeExifImg, writeExifVid } from './lib/exif.js';
import { smsg, isUrl, getBuffer, reSize } from './lib/myfunc.js';
import setupConsoleFilters from './lib/filter.js';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (process.argv[2] !== "--child") {
    let childProcess;
    let shuttingDown = false;
    
    function launch() {
        childProcess = spawn(process.execPath, [__filename, "--child"], {
            stdio: ["inherit", "inherit", "inherit", "ipc"]
        });
        
        childProcess.on("message", (msg) => {
            if (msg === "reset") {
                childProcess.kill();
                launch();
            }
        });
        
        childProcess.on("exit", (code) => {
            if (shuttingDown) process.exit(code ?? 0);
            if (code === 0 || code === 1) launch();
        });
    }

    const shutdown = (signal) => {
        shuttingDown = true;
        if (childProcess) childProcess.kill(signal);
        else process.exit(0);
        setTimeout(() => process.exit(0), 12000).unref();
    };

    process.once("SIGINT", () => shutdown("SIGINT"));
    process.once("SIGTERM", () => shutdown("SIGTERM"));
    launch();
} else {
const { default: EliteProHandlerModule } = await import('./ElitePro.js');
const BOT_ID = 'elite-pro-v1'
const SETTINGS_FILE = path.join(__dirname, 'database', 'settings.json')
const OWNER_FILE = path.join(__dirname, 'database', 'owner.json')
let savedSettings = {}
try {
    savedSettings = JSON.parse(fs.readFileSync('./database/settings.json', 'utf8'))
    for (const key of ['prefix', 'autoviewstatus', 'autolikestatus', 'autolikestatusEmoji', 'autoread', 'autoTyping', 'autoRecording', 'autorecordtype', 'autobio', 'autoreact']) {
        if (savedSettings[key] !== undefined) global[key] = savedSettings[key]
    }
} catch {}
global.botMode = savedSettings.mode || 'private'
let userChatCleanupInterval
let sessionCleanupInterval

function isPlainObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function applyBotSettings(settings) {
    if (!isPlainObject(settings)) return
    for (const key of ['prefix', 'autoviewstatus', 'autolikestatus', 'autolikestatusEmoji', 'autoread', 'autoTyping', 'autoRecording', 'autorecordtype', 'autobio', 'autoreact']) {
        if (settings[key] !== undefined) global[key] = settings[key]
    }
    if (settings.mode !== undefined) global.botMode = settings.mode
}

function readJson(file, fallback) {
    try { return JSON.parse(fs.readFileSync(file, 'utf8')) } catch { return fallback }
}

function getDatabaseIdentity(jid) {
    return String(jid || '').replace(/:\d+(?=@)/, '').replace(/\D/g, '')
}

function settingsApiUrl(pathname) {
    const base = String(global.dbSite || '').trim().replace(/\/+$/, '')
    return base ? `${base}${pathname}` : ''
}

let remoteSettingsRestored = false
let remoteSettingsNumber = ''
let remoteBackupInFlight = null

global.backupBotData = async () => {
    if (!remoteSettingsNumber || !global.dbSite) return false
    if (remoteBackupInFlight) return remoteBackupInFlight

    const url = settingsApiUrl(`/api/botsettings/${encodeURIComponent(remoteSettingsNumber)}/${BOT_ID}`)
    const payload = {
        settings: {
            botSettings: readJson(SETTINGS_FILE, {}),
            owners: readJson(OWNER_FILE, [])
        }
    }
    remoteBackupInFlight = axios.put(url, payload, { timeout: 10000 })
        .then(() => true)
        .catch((err) => {
            console.warn(`Settings backup failed: ${err.message}`)
            return false
        })
        .finally(() => { remoteBackupInFlight = null })
    return remoteBackupInFlight
}

function watchBackupFile(file) {
    fs.watchFile(file, { interval: 1000 }, (current, previous) => {
        if (current.mtimeMs !== previous.mtimeMs) void global.backupBotData?.()
    })
}

watchBackupFile(SETTINGS_FILE)
watchBackupFile(OWNER_FILE)

async function restoreBotData(jid) {
    if (remoteSettingsRestored) return
    if (!global.dbSite) {
        remoteSettingsRestored = true
        return
    }
    const number = getDatabaseIdentity(jid)
    if (!number) return
    remoteSettingsNumber = number

    try {
        const url = settingsApiUrl(`/api/botsettings/${encodeURIComponent(number)}/${BOT_ID}`)
        const { data } = await axios.get(url, { timeout: 10000 })
        const backup = data?.settings
        if (!isPlainObject(backup?.botSettings) || !Array.isArray(backup?.owners)) {
            throw new Error('Remote backup has an invalid format')
        }

        fs.writeFileSync(SETTINGS_FILE, JSON.stringify(backup.botSettings, null, 2))
        fs.writeFileSync(OWNER_FILE, JSON.stringify(backup.owners, null, 2))
        savedSettings = backup.botSettings
        applyBotSettings(backup.botSettings)
        remoteSettingsRestored = true
        EliteProHandler = EliteProHandlerModule
        console.log('Settings backup restored')
    } catch (err) {
        if (err.response?.status !== 404) console.warn(`Settings restore failed: ${err.message}`)
        remoteSettingsRestored = true
        await global.backupBotData()
    }
}

async function backupBeforeShutdown() {
    await global.backupBotData?.()
    process.exit(0)
}

process.once('SIGINT', backupBeforeShutdown)
process.once('SIGTERM', backupBeforeShutdown)

function parseSessionId(sessionId) {
    const value = String(sessionId || '').trim()
    const base64Value = value
        .replace(/^data:application\/json;base64,/i, '')
        .replace(/^base64:/i, '')
    const candidates = [value]

    if (base64Value !== value || /^[A-Za-z0-9+/_=-]+$/.test(base64Value)) {
        candidates.push(Buffer.from(base64Value, 'base64').toString('utf8'))
    }

    for (const candidate of candidates) {
        try {
            const parsed = JSON.parse(candidate)
            if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed
        } catch {}
    }

    throw new Error('SESSION_ID must contain credentials JSON or Base64-encoded credentials JSON')
}

if (!fs.existsSync(__dirname + '/session/creds.json') && global.sessionid) {
    try {
        const sessionData = parseSessionId(global.sessionid);
        fs.mkdirSync(__dirname + '/session', { recursive: true });
        fs.writeFileSync(__dirname + '/session/creds.json', JSON.stringify(sessionData, null, 2));
    } catch (err) {
    }
}
const pino = require('pino')
const mediaDownloadLogger = pino({ level: 'silent' })
const chalk = require('chalk')
const FileType = require('file-type')
const axios = require('axios')
const PhoneNumber = require('awesome-phonenumber')
const NodeCache = require("node-cache")
const Pino = require("pino")
const readline = require("readline")
let EliteProHandler = EliteProHandlerModule
setupConsoleFilters()
const PORT = Number(process.env.PORT || process.env.SERVER_PORT || 3000);
const INDEX_PATH = path.join(__dirname, 'lib', 'index.html');
const healthServer = http.createServer((req, res) => {
    fs.readFile(INDEX_PATH, (err, data) => {
        if (err) {
            res.writeHead(404);
            return res.end('Not found');
        }
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data);
    });
});
healthServer.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.warn(`[HTTP] Port ${PORT} is already in use. Set PORT or SERVER_PORT to the port assigned by your host.`);
        return;
    }
    console.error('[HTTP] Health page server error:', err.message);
});
healthServer.listen(PORT, '0.0.0.0');

const lidToPnCache = new NodeCache({
    stdTTL: 24 * 60 * 60,
    useClones: false,
    checkperiod: 300
})
let lidResolverSocket

function normalizeJid(jid) {
    if (!jid) return ''
    return String(jid).trim().replace(/:\d+(?=@)/, '')
}

function normalizePnJid(jid) {
    const value = normalizeJid(jid)
    if (!value) return ''
    if (value.endsWith('@s.whatsapp.net') || value.endsWith('@hosted')) return value
    if (/^\d+$/.test(value)) return `${value}@s.whatsapp.net`
    return ''
}

function normalizeLidJid(jid) {
    const value = normalizeJid(jid)
    return value.endsWith('@lid') || value.endsWith('@hosted.lid') ? value : ''
}

function storeLidMapping(lid, pn) {
    const lidJid = normalizeLidJid(lid) || normalizeLidJid(pn)
    const pnJid = normalizePnJid(lid) || normalizePnJid(pn)
    if (lidJid && pnJid) lidToPnCache.set(lidJid, pnJid)
}

function getMappedPn(lid) {
    const lidJid = normalizeLidJid(lid)
    return lidJid ? lidToPnCache.get(lidJid) : undefined
}

function updateLidMappingsFromMessage(msg) {
    const key = msg?.key || {}
    storeLidMapping(key.senderLid, key.senderPn)
    storeLidMapping(key.participantLid, key.participantPn)
    storeLidMapping(key.participant, key.participantAlt)
    storeLidMapping(key.remoteJid, key.remoteJidAlt)
    storeLidMapping(key.remoteJid, key.senderPn)
    storeLidMapping(msg?.senderLid, msg?.senderPn)
    storeLidMapping(msg?.participantLid, msg?.participantPn)
}

function updateLidMappingsFromMetadata(metadata) {
    for (const participant of metadata?.participants || []) {
        const lid = participant?.lid || (participant?.id?.endsWith('@lid') ? participant.id : '')
        const pn = participant?.phoneNumber || participant?.pn || participant?.jid ||
            (participant?.id?.endsWith('@s.whatsapp.net') ? participant.id : '')
        storeLidMapping(lid, pn)
    }
}

const MAX_STORED_MESSAGES = 10000
const store = {
    messageIndex: new Map(),
    messageJidIndex: new Map(),
    contacts: {},
    chats: {},
    groupMetadata: async (jid) => {
        return {}
    },
    bind: function(ev) {
        ev.on('messages.upsert', ({ messages }) => {
            for (const msg of messages || []) {
                // Baileys may emit a revoke under the deleted message's key. Never let
                // that protocol notice replace the original payload in the memory cache.
                if (msg?.message?.protocolMessage?.type === 0 ||
                    msg?.messageStubType === WAMessageStubType.REVOKE) continue
                const jid = normalizeJid(msg?.key?.remoteJid)
                const id = msg?.key?.id
                if (!jid || !id) continue
                updateLidMappingsFromMessage(msg)
                const cacheKey = `${jid}:${id}`
                this.messageJidIndex.delete(cacheKey)
                this.messageJidIndex.set(cacheKey, msg)
                this.messageIndex.delete(id)
                this.messageIndex.set(id, msg)
                while (this.messageJidIndex.size > MAX_STORED_MESSAGES) {
                    const oldestKey = this.messageJidIndex.keys().next().value
                    const oldestMessage = this.messageJidIndex.get(oldestKey)
                    this.messageJidIndex.delete(oldestKey)
                    if (oldestMessage?.key?.id && this.messageIndex.get(oldestMessage.key.id) === oldestMessage) {
                        this.messageIndex.delete(oldestMessage.key.id)
                    }
                }
            }
        })
        ev.on('contacts.update', (contacts) => {
            for (const contact of contacts || []) {
                if (contact.id) {
                    this.contacts[normalizeJid(contact.id)] = contact
                }
            }
        })
        ev.on('chats.set', (chats) => {
            this.chats = chats
        })
    },
    loadMessage: async function(jid, id) {
        const normalizedJid = normalizeJid(jid)
        if (!normalizedJid || !id) return null
        const exact = this.messageJidIndex.get(`${normalizedJid}:${id}`)
        if (exact) return exact
        let mappedPn = getMappedPn(normalizedJid)
        if (!mappedPn && normalizeLidJid(normalizedJid)) {
            try {
                mappedPn = await lidResolverSocket?.signalRepository?.lidMapping?.getPNForLID?.(normalizedJid)
                if (mappedPn) {
                    storeLidMapping(normalizedJid, mappedPn)
                }
            } catch {}
        }
        if (mappedPn) {
            const mapped = this.messageJidIndex.get(`${mappedPn}:${id}`)
            if (mapped) return mapped
        }
        const message = this.messageIndex.get(id)
        if (message) {
            const messageJid = normalizeJid(message?.key?.remoteJid)
            if (messageJid === normalizedJid || (mappedPn && messageJid === mappedPn)) return message
            const messagePn = normalizePnJid(message?.key?.senderPn || message?.key?.participantPn)
            const requestedPn = normalizePnJid(normalizedJid)
            if (requestedPn && messagePn && requestedPn === messagePn) return message

            // Baileys can emit the revoke key with the deleting device's LID/chat
            // perspective. Message IDs are generated uniquely; accept an ID-only
            // match only if it appears once in our bounded cache.
            let duplicateId = false
            for (const candidate of this.messageJidIndex.values()) {
                if (candidate !== message && candidate?.key?.id === id) {
                    duplicateId = true
                    break
                }
            }
            if (!duplicateId) return message

        }
        return null
    }
}
let owner = readJson(OWNER_FILE, [])

const useMobile = process.argv.includes("--mobile")
const hasInteractiveTerminal = Boolean(process.stdin.isTTY && process.stdout.isTTY)
const pairingCode = process.argv.includes("--pairing-code") || hasInteractiveTerminal

let rl
const question = (text) => {
   if (!hasInteractiveTerminal) {
      return Promise.reject(new Error('Interactive terminal input is unavailable'))
   }
   if (!rl || rl.closed) rl = readline.createInterface({ input: process.stdin, output: process.stdout })
   return new Promise((resolve) => rl.question(text, resolve))
}

async function promptForPairingNumber() {
   while (true) {
      const phoneNumber = (await question(chalk.green('Enter your number below Eg, 234xxxxxxxxxx\n'))).replace(/[^0-9]/g, '')
      if (process.stdout.isTTY) process.stdout.write('\x1b[1A\x1b[2K\r')
      if (/^[1-9]\d{6,14}$/.test(phoneNumber)) return phoneNumber
      console.log(chalk.red('Enter a valid number with country code. Eg, 234xxxxxxxxxx'))
   }
}

async function startEliteProTech() {
let { version, isLatest } = await fetchLatestBaileysVersion()
const {  state, saveCreds } =await useMultiFileAuthState(`./session`)
   if (!state.creds.registered && state.creds.pairingCode) {
      delete state.creds.pairingCode
      delete state.creds.me
      await saveCreds()
   }
   if (!state.creds.registered && !hasInteractiveTerminal) {
      console.error('No session detected. Add SESSION_ID to your .env variables or config.js, then restart the bot.')
      return
   }
   const needsPairing = pairingCode && !state.creds.registered
   let pairingPhoneNumber = null
   let pairingCodeRequested = false
   let awaitingNumber = false
   let reconnecting = false
    const msgRetryCounterCache = new NodeCache()
    const groupMetadataCache = new NodeCache({ stdTTL: 5 * 60, useClones: false })
    const handledMessages = new Map()
const MESSAGE_DEDUPE_TTL = 30 * 60 * 1000
const MESSAGE_DEDUPE_MAX = 20000

function getMessageDedupeKey(key) {
    if (!key?.id) return ''
    return `${normalizeJid(key.remoteJid)}:${key.id}`
}

function getDisconnectStatus(lastDisconnect) {
    try {
        const error = lastDisconnect?.error
        const statusCode = error?.output?.statusCode ??
            error?.statusCode ??
            error?.data?.statusCode ??
            error?.data?.output?.statusCode ??
            error?.cause?.output?.statusCode ??
            error?.cause?.statusCode ??
            error?.cause?.data?.statusCode
        return Number(statusCode) || 0
    } catch {
        return 0
    }
}

function hasProcessedMessage(key) {
    const dedupeKey = getMessageDedupeKey(key)
    if (!dedupeKey) return false
    const now = Date.now()
    const timestamp = handledMessages.get(dedupeKey)
    if (!timestamp) return false
    if (now - timestamp > MESSAGE_DEDUPE_TTL) {
        handledMessages.delete(dedupeKey)
        return false
    }
    return true
}

function markMessageProcessed(key) {
    const dedupeKey = getMessageDedupeKey(key)
    if (!dedupeKey) return
    handledMessages.set(dedupeKey, Date.now())
    if (handledMessages.size <= MESSAGE_DEDUPE_MAX) return
    const oldest = handledMessages.keys().next().value
    if (oldest) handledMessages.delete(oldest)
}

    const BOT_START_TIME = Date.now()
    const EliteProTech = makeWASocket({
        version,
        logger: pino({ level: 'silent' }),
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
        try {
            const msg = await store.loadMessage(key?.remoteJid, key?.id)
            return msg?.message || undefined
        } catch {
            return undefined
        }
      },
      msgRetryCounterCache,
      cachedGroupMetadata: async (jid) => groupMetadataCache.get(jid),
      defaultQueryTimeoutMs: undefined,
   })
   lidResolverSocket = EliteProTech
   const _rawGroupMetadata = EliteProTech.groupMetadata.bind(EliteProTech)
   EliteProTech.groupMetadata = async (jid) => {
       const cached = groupMetadataCache.get(jid)
       if (cached) return cached
       try {
           const fresh = await _rawGroupMetadata(jid)
           if (fresh) {
                updateLidMappingsFromMetadata(fresh)
                groupMetadataCache.set(jid, fresh)
            }
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
   EliteProTech.ev.on('lid-mapping.update', ({ lid, pn }) => {
       storeLidMapping(lid, pn)
   })

   store.bind(EliteProTech.ev)

   if (needsPairing) {
      if (useMobile) throw new Error('Cannot use pairing code with mobile api')
      awaitingNumber = true
      try {
         pairingPhoneNumber = await promptForPairingNumber()
         pairingCodeRequested = true
         console.log(chalk.green(`Requesting code for: ${pairingPhoneNumber}`))
         setTimeout(async () => {
            try {
               const code = await EliteProTech.requestPairingCode(pairingPhoneNumber)
               console.log(chalk.yellow(`Your Pairing Code: ${code?.match(/.{1,4}/g)?.join("-") || code}`))
            } catch (err) {
               pairingCodeRequested = false
               if (!reconnecting) console.log(chalk.red('Unable to request a pairing code. Waiting to reconnect...'))
            }
         }, 3000)
      } catch (err) {
         if (!reconnecting) console.log(chalk.red('Unable to read the pairing number. Waiting to reconnect...'))
      } finally {
         awaitingNumber = false
      }
   }
//AUTO STATUS WATCHER//
async function resolveStatusTarget(EliteProTech, mek) {
    const key = mek?.key || {}
    const candidates = [
        key.participantPn,
        mek?.participantPn,
        key.participantAlt,
        key.remoteJidAlt,
        key.participant,
        mek?.participant,
        mek?.sender
    ].filter(Boolean).map(jid => EliteProTech.decodeJid?.(jid) || jid)

    for (const jid of candidates) {
        const phoneJid = normalizePnJid(jid)
        if (phoneJid) return phoneJid
    }

    for (const jid of candidates) {
        const lidJid = normalizeLidJid(jid)
        if (!lidJid) continue
        let phoneJid = getMappedPn(lidJid)
        if (!phoneJid) {
            try {
                phoneJid = await EliteProTech.signalRepository?.lidMapping?.getPNForLID?.(lidJid)
            } catch {}
        }
        phoneJid = normalizePnJid(phoneJid)
        if (phoneJid) {
            storeLidMapping(lidJid, phoneJid)
            return phoneJid
        }
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


        const participantJid = await resolveStatusTarget(EliteProTech, mek)
        if (!participantJid) return
        const ownPn = normalizePnJid(state.creds.me?.id || EliteProTech.user?.id)
        if (ownPn && participantJid === ownPn) return

        const statusKey = {
            ...mek.key,
            remoteJid: 'status@broadcast',
            id: msgId,
            fromMe: false,
            participant: mek.key.participant || participantJid
        }

        if (global.autoviewstatus) {
            try {
                await EliteProTech.readMessages([statusKey])
            } catch (err) {
                console.error('❌ Status view error:', err.message)
            }
        }

        if (!global.autolikestatus) return

        const emoji = global.autolikestatusEmoji || '💚'

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
const reactedMessages = new Map()
const REACTION_DEDUPE_TTL = 30 * 60 * 1000

function hasReactedToMessage(key) {
    if (!key?.id) return false
    const id = `${key.remoteJid || ''}:${key.id}`
    const timestamp = reactedMessages.get(id)
    if (!timestamp) return false
    if (Date.now() - timestamp > REACTION_DEDUPE_TTL) {
        reactedMessages.delete(id)
        return false
    }
    return true
}

function markMessageReacted(key) {
    if (!key?.id) return
    reactedMessages.set(`${key.remoteJid || ''}:${key.id}`, Date.now())
}

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
        if (hasReactedToMessage(mek.key)) return
        markMessageReacted(mek.key)

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
async function handleChatbot(EliteProTech,mek){
    try{
        if(!mek?.message||!mek?.key||mek.key.fromMe)return
        const from=mek.key.remoteJid
        if(!from||from==='status@broadcast')return
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
        const apiUrl=`https://eliteprotech-apis.zone.id/ai/talkai?q=${encodeURIComponent(text)}`
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
if (!userChatCleanupInterval) {
    userChatCleanupInterval = setInterval(() => {
        if (!global.userChatTimestamps || !global.userChats) return
        const now = Date.now()
        for (const user in global.userChatTimestamps) {
            if (now - global.userChatTimestamps[user] > 30 * 60 * 1000) {
                delete global.userChats[user]
                delete global.userChatTimestamps[user]
                console.log(`🧹 Cleared memory for inactive user: ${user}`)
            }
        }
    }, 10 * 60 * 1000)
    userChatCleanupInterval.unref?.()
}
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
//ANTISPAM//
const spamTracker = new Map()
const spamSeen = new Set()
async function handleAntiSpam(EliteProTech, mek) {
    try {
        if (!mek?.message || !mek?.key || mek.key.fromMe) return
        const from = mek.key.remoteJid
        if (!from?.endsWith('@g.us')) return
        if (mek.message.protocolMessage || mek.message.reactionMessage) return

        if (spamSeen.has(mek.key.id)) return
        spamSeen.add(mek.key.id)
        setTimeout(() => spamSeen.delete(mek.key.id), 60000)

        let data = {}
        try { data = JSON.parse(fs.readFileSync('./database/antispam.json', 'utf8')) } catch { return }
        const cfg = data[from]
        if (!cfg?.enabled) return
                const sender = mek.key.participant || mek.participant
        if (!sender) return

        const limit = cfg.limit || 5
        const windowMs = (cfg.seconds || 8) * 1000
        const now = Date.now()
        const trackKey = `${from}:${sender}`

        const list = (spamTracker.get(trackKey) || []).filter(e => now - e.ts < windowMs)
        list.push({ ts: now, key: mek.key })
        spamTracker.set(trackKey, list)
        if (list.length <= limit) return

        // Over the limit: only now do the (cached) metadata checks
        const metadata = await EliteProTech.groupMetadata(from)
        const participants = metadata.participants || []
        const matches = (p, id) => id && (p.id === id || p.lid === id || p.jid === id || p.phoneNumber === id)

        const senderP = participants.find(p => matches(p, sender))
        const botIds = [EliteProTech.user?.id, EliteProTech.user?.lid]
            .filter(Boolean).map(i => i.replace(/:\d+/, ''))
        const botP = participants.find(p => botIds.some(b => matches(p, b)))

        const senderNums = [sender, senderP?.jid, senderP?.phoneNumber, senderP?.pn]
            .filter(Boolean).map(x => x.split('@')[0])
        const isOwner = Array.isArray(owner) &&
            owner.some(n => senderNums.includes(String(n).replace(/[^0-9]/g, '')))

        if (senderP?.admin || isOwner || botIds.some(b => sender === b)) {
            spamTracker.delete(trackKey)
            return
        }
        if (!botP?.admin) return
        const keys = list.map(e => e.key)
        spamTracker.delete(trackKey) // reset so the next burst is judged fresh

        for (const k of keys) {
            await EliteProTech.sendMessage(from, { delete: k }).catch(() => {})
            await new Promise(r => setTimeout(r, 300))
        }

        const tag = `@${sender.split('@')[0]}`
        const removeId = senderP?.id || sender
        const mode = cfg.action || 'warn'

        if (mode === 'delete') {
            await EliteProTech.sendMessage(from, {
                text: `🚫 ${tag} stop spamming. Messages deleted.`,
                mentions: [sender]
            })
        } else if (mode === 'kick') {
            await EliteProTech.groupParticipantsUpdate(from, [removeId], 'remove')
            await EliteProTech.sendMessage(from, {
                text: `🚫 ${tag} was removed for spamming.`,
                mentions: [sender]
            })
        } else {
            cfg.warnings = cfg.warnings || {}
            cfg.warnings[sender] = (cfg.warnings[sender] || 0) + 1
            const count = cfg.warnings[sender]
            const max = cfg.maxWarn || 3

            if (count >= max) {
                await EliteProTech.groupParticipantsUpdate(from, [removeId], 'remove')
                await EliteProTech.sendMessage(from, {
                    text: `🚫 ${tag} was removed for spamming (${max}/${max} warnings).`,
                    mentions: [sender]
                })
                delete cfg.warnings[sender]
            } else {
                await EliteProTech.sendMessage(from, {
                    text: `⚠️ ${tag} stop spamming. Warning ${count}/${max}`,
                    mentions: [sender]
                })
            }
            fs.writeFileSync('./database/antispam.json', JSON.stringify(data, null, 2))
        }
    } catch (err) {
        console.error('❌ AntiSpam error:', err.message)
    }
}
setInterval(() => {
    const now = Date.now()
    for (const [k, list] of spamTracker) {
        if (!list.length || now - list[list.length - 1].ts > 60000) spamTracker.delete(k)
    }
}, 5 * 60 * 1000)
////AntiSpam ends here///
	
//ANTIBOT//
const botSeen = new Set()
const botWarnCooldown = new Set()
const BOT_PREFIX_CHARS = ',*@/?!>.&√#$%+~_=|\\:;^-'
const PREFIX_CMD_REGEX = new RegExp(`^[${BOT_PREFIX_CHARS.replace(/[\]\\^-]/g, '\\$&')}]+[a-zA-Z]{2,}`)

const looksLikeBotId = (key) => {
    const id = key?.id || ''
    const sender = key?.participant || ''
    return /^BAE5.{12}$/.test(id) ||
           /^3EB0[0-9A-F]{36}$/i.test(id) ||
           sender.endsWith('@bot')
}

const getPlainText = (message) => {
    const c = extractMessageContent(message) || message || {}
    return (c.conversation || c.extendedTextMessage?.text || c.imageMessage?.caption ||
            c.videoMessage?.caption || c.documentMessage?.caption || '').trim()
}

const looksLikePrefixCommand = (text) => {
    if (!text) return false
    const own = global.prefix
    if (own && text.startsWith(own)) return false          // never touch our own bot's commands
    if (!PREFIX_CMD_REGEX.test(text)) return false
    if (text.startsWith('*') && text.indexOf('*', 1) > 0) return false   // *bold text*
    return true
}

async function handleAntiBot(EliteProTech, mek) {
    try {
        if (!mek?.message || !mek?.key || mek.key.fromMe) return
        const from = mek.key.remoteJid
        if (!from?.endsWith('@g.us')) return
        if (mek.message.protocolMessage || mek.message.reactionMessage) return

        const byId = looksLikeBotId(mek.key)
        const text = getPlainText(mek.message)
        const byPrefix = looksLikePrefixCommand(text)
        if (!byId && !byPrefix) return

        if (botSeen.has(mek.key.id)) return
        botSeen.add(mek.key.id)
        setTimeout(() => botSeen.delete(mek.key.id), 60000)

        let data = {}
        try { data = JSON.parse(fs.readFileSync('./database/antibot.json', 'utf8')) } catch { return }
        const cfg = data[from]
        if (!cfg?.enabled) return
        if (!byId && !cfg.prefix) return   // prefix rule is off

        const sender = mek.key.participant || mek.participant
        if (!sender) return
        const metadata = await EliteProTech.groupMetadata(from)
        const participants = metadata.participants || []
        const matches = (p, id) => id && (p.id === id || p.lid === id || p.jid === id || p.phoneNumber === id)

        const senderP = participants.find(p => matches(p, sender))
        const botIds = [EliteProTech.user?.id, EliteProTech.user?.lid]
            .filter(Boolean).map(i => i.replace(/:\d+/, ''))
        const botP = participants.find(p => botIds.some(b => matches(p, b)))

        const senderNums = [sender, senderP?.jid, senderP?.phoneNumber, senderP?.pn]
            .filter(Boolean).map(x => x.split('@')[0])
        const isOwner = Array.isArray(owner) &&
            owner.some(n => senderNums.includes(String(n).replace(/[^0-9]/g, '')))

        if (senderP?.admin || isOwner || botIds.some(b => sender === b)) return
        if (!botP?.admin) return

        await EliteProTech.sendMessage(from, { delete: mek.key })
            .then(() => console.log('[antibot] deleted message'))
            .catch(e => console.log('[antibot] delete failed:', e.message))

        const tag = `@${sender.split('@')[0]}`
        const removeId = senderP?.id || sender
        let mode = cfg.action || 'delete'
        if (!byId && mode === 'kick') mode = 'warn'   // never kick a human just for typing a prefix

        if (mode === 'delete') return

        if (mode === 'kick') {
            await EliteProTech.groupParticipantsUpdate(from, [removeId], 'remove')
            await EliteProTech.sendMessage(from, {
                text: `🤖 ${tag} was removed. Bots are not allowed in this group.`,
                mentions: [sender]
            })
            return
        }

        const cdKey = `${from}:${sender}`
        if (botWarnCooldown.has(cdKey)) return
        botWarnCooldown.add(cdKey)
        setTimeout(() => botWarnCooldown.delete(cdKey), 10000)

        cfg.warnings = cfg.warnings || {}
        cfg.warnings[sender] = (cfg.warnings[sender] || 0) + 1
        const count = cfg.warnings[sender]
        const max = cfg.maxWarn || 3
        const reason = byId ? 'bots are not allowed in this group' : 'other bot commands are not allowed in this group'

        if (count >= max) {
            await EliteProTech.groupParticipantsUpdate(from, [removeId], 'remove')
            await EliteProTech.sendMessage(from, {
                text: `🚫 ${tag} was removed (${max}/${max} warnings).`,
                mentions: [sender]
            })
            delete cfg.warnings[sender]
        } else {
            await EliteProTech.sendMessage(from, {
                text: `⚠️ ${tag} ${reason}. Warning ${count}/${max}`,
                mentions: [sender]
            })
        }
        fs.writeFileSync('./database/antibot.json', JSON.stringify(data, null, 2))
    } catch (err) {
        console.error('❌ AntiBot error:', err.message)
    }
}
///Antibot ends here////
	
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
const settingsFile = path.join(__dirname, 'database', 'settings.json')
function getAntiDeleteStatus() {
    try {
        const settings = JSON.parse(fs.readFileSync(settingsFile, 'utf8'))
        return settings.antiDelete === true
    } catch {
        return false
    }
}
function setAntiDeleteStatus(enabled) {
    let settings = {}
    try {
        settings = JSON.parse(fs.readFileSync(settingsFile, 'utf8'))
    } catch {}
    settings.antiDelete = enabled
    fs.writeFileSync(
        settingsFile,
        JSON.stringify(settings, null, 2)
    )
    return enabled
}
global.getAntiDeleteStatus = getAntiDeleteStatus
global.setAntiDeleteStatus = setAntiDeleteStatus

function getRestorableText(content) {
    const candidates = [
        content?.conversation,
        content?.extendedTextMessage?.text,
        content?.imageMessage?.caption,
        content?.videoMessage?.caption,
        content?.ptvMessage?.caption,
        content?.documentMessage?.caption,
        content?.audioMessage?.caption,
        content?.buttonsResponseMessage?.selectedDisplayText,
        content?.buttonsResponseMessage?.selectedButtonId,
        content?.listResponseMessage?.singleSelectReply?.selectedRowId,
        content?.templateButtonReplyMessage?.selectedDisplayText,
        content?.templateButtonReplyMessage?.selectedId,
        content?.interactiveResponseMessage?.body?.text,
        content?.messageContextInfo?.selectedButtonId,
        content?.messageContextInfo?.selectedRowId
    ]
    const text = candidates.find(value => typeof value === 'string' && value.trim())
    if (text) return text

    // Some Baileys wrappers (or cached legacy messages) nest the payload more deeply.
    const seen = new WeakSet()
    const findNestedText = (value, depth = 0) => {
        if (!value || typeof value !== 'object' || Buffer.isBuffer(value) || depth > 5 || seen.has(value)) return ''
        seen.add(value)
        for (const key of ['conversation', 'text', 'caption', 'contentText', 'selectedDisplayText', 'selectedButtonId', 'selectedId']) {
            if (typeof value[key] === 'string' && value[key].trim()) return value[key]
        }
        for (const child of Object.values(value)) {
            const nested = findNestedText(child, depth + 1)
            if (nested) return nested
        }
        return ''
    }
    return findNestedText(content)
}

async function restoreMessage(EliteProTech, from, note, msg, quoted, mentions) {
    try {
        const rawContent = msg?.message && typeof msg.message === 'object' ? msg.message : msg
        const contentMessage = extractMessageContent(rawContent) || rawContent
        const sendNote = async () =>
            EliteProTech.sendMessage(from, { text: note, mentions }, { quoted })

        const mediaTypes = [
            ['imageMessage', 'image'],
            ['videoMessage', 'video'],
            ['ptvMessage', 'video'],
            ['audioMessage', 'audio'],
            ['stickerMessage', 'sticker'],
            ['documentMessage', 'document']
        ]
        const mediaEntry = mediaTypes.find(([messageType]) => contentMessage[messageType])
        if (mediaEntry) {
            const [messageType, contentType] = mediaEntry
            const mediaDetails = contentMessage[messageType]
            const downloadableMessage = { ...quoted, message: contentMessage }
            const downloadOptions = {
                reuploadRequest: EliteProTech.updateMediaMessage.bind(EliteProTech),
                logger: mediaDownloadLogger
            }
            let media
            try {
                media = await downloadMediaMessage(downloadableMessage, 'buffer', {}, downloadOptions)
            } catch (error) {
                const status = Number(error?.status ?? error?.statusCode ?? error?.output?.statusCode)
                if (![404, 410].includes(status)) throw error
                const refreshedMessage = await EliteProTech.updateMediaMessage(downloadableMessage)
                media = await downloadMediaMessage(refreshedMessage, 'buffer', {}, downloadOptions)
            }
            const content = { [contentType]: media }
            if (contentType === 'image' || contentType === 'video') {
                if (mediaDetails.caption) content.caption = mediaDetails.caption
                if (mediaDetails.mimetype) content.mimetype = mediaDetails.mimetype
                if (mediaDetails.gifPlayback) content.gifPlayback = true
            }
            if (messageType === 'audioMessage') {
                content.ptt = mediaDetails.ptt
                content.mimetype = mediaDetails.mimetype || 'audio/mpeg'
            } else if (messageType === 'documentMessage') {
                content.fileName = mediaDetails.fileName || 'restored.file'
                content.mimetype = mediaDetails.mimetype || 'application/octet-stream'
                if (mediaDetails.caption) content.caption = mediaDetails.caption
            }
            await EliteProTech.sendMessage(from, content, { quoted })
            return sendNote()
        }

        const text = getRestorableText(contentMessage)
        if (text) {
            return EliteProTech.sendMessage(
                from,
                { text: `${note}\n♻️ *Message:* \`\`\`${text}\`\`\``, mentions },
                { quoted }
            )
        }

        return EliteProTech.sendMessage(
            from,
            {
                text: `${note}\n❌ *Cannot restore this message type.*`,
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

        let phoneJid = getMappedPn(jid)
        if (!phoneJid && normalizeLidJid(jid)) {
            try {
                phoneJid = await EliteProTech.signalRepository?.lidMapping?.getPNForLID?.(jid) || ''
                if (phoneJid) storeLidMapping(jid, phoneJid)
            } catch {}
        }
        const contact = EliteProTech.contacts?.[phoneJid] || EliteProTech.contacts?.[jid] || {}
        return contact.name || contact.verifiedName || contact.notify || phoneJid?.split('@')[0] || fallback
    } catch {
        return fallback
    }
}

const handledDeletes = new Map()
const HANDLED_DELETE_TTL = 10 * 60 * 1000
const HANDLED_DELETE_LIMIT = 5000

async function handleAntiDeleteEvent(EliteProTech, targetKey, actorKey = {}) {
    if (!getAntiDeleteStatus()) return
    const remoteJid = targetKey?.remoteJid
    const msgId = targetKey?.id
    if (!remoteJid || !msgId) return

    // A single revoke can be reported with different LID/PN chat perspectives.
    // Baileys message IDs are unique, so dedupe by target ID across those events.
    const deleteKey = msgId
    const now = Date.now()
    const handledAt = handledDeletes.get(deleteKey)
    if (handledAt && now - handledAt < HANDLED_DELETE_TTL) return
    handledDeletes.set(deleteKey, now)
    while (handledDeletes.size > HANDLED_DELETE_LIMIT) {
        handledDeletes.delete(handledDeletes.keys().next().value)
    }

    const old = await store.loadMessage(remoteJid, msgId)
    if (!old?.message) {
        return
    }
    if (old.key?.fromMe) return

    const deletedByRaw = actorKey.participantPn || actorKey.participantAlt || actorKey.participant ||
        actorKey.senderPn || actorKey.senderLid || actorKey.remoteJid
    const sentByRaw = old.key?.participantPn || old.key?.participantAlt || old.key?.participant ||
        old.key?.senderPn || old.key?.senderLid || old.key?.remoteJid
    const resolveIdentity = async jid => {
        if (!jid) return ''
        const cached = getMappedPn(jid)
        if (cached) return cached
        if (normalizeLidJid(jid)) {
            try {
                const pn = await EliteProTech.signalRepository?.lidMapping?.getPNForLID?.(jid)
                if (pn) {
                    storeLidMapping(jid, pn)
                    return pn
                }
            } catch {}
        }
        return jid
    }
    const [deletedBy, sentBy] = await Promise.all([
        resolveIdentity(deletedByRaw),
        resolveIdentity(sentByRaw)
    ])
    const whoDeleted = `@${String(deletedBy || '').split('@')[0].split(':')[0]}`
    const whoSent = `@${String(sentBy || '').split('@')[0].split(':')[0]}`
    const from = EliteProTech.decodeJid(EliteProTech.user?.id || '')
    if (!from) return
    const originalChat = old.key?.remoteJid || remoteJid
    const chatName = await getChatName(EliteProTech, originalChat)
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
        [deletedBy, sentBy].filter(jid => jid?.includes('@'))
    )
}

EliteProTech.ev.on('messages.update', async updates => {
    if (!Array.isArray(updates)) return
    try {
        for (const update of updates) {
            const isDeleted = update.update?.messageStubType === WAMessageStubType.REVOKE ||
                update.message?.protocolMessage?.type === 0
            if (!isDeleted) continue
            // Baileys 7 emits the deleted message's ID on update.key. Its nested
            // update.key is the revoke notification's own key, not the target.
            const targetKey = update.message?.protocolMessage?.key || update.key
            const actorKey = update.update?.key || {}
            await handleAntiDeleteEvent(EliteProTech, targetKey, actorKey)
      }
    } catch (err) {
        console.error('[ANTI-DELETE] Failed to process deletion update:', err.message)
    }
})
	

EliteProTech.ev.on('messages.upsert', async chatUpdate => {
    try {
        const { messages, type } = chatUpdate
        if (type !== 'notify') return
        for (const incomingMessage of messages) {
            if (!incomingMessage?.message || !incomingMessage?.key?.id) continue
            const mek = {
                ...incomingMessage,
                message: extractMessageContent(incomingMessage.message) || incomingMessage.message
            }
            const msgId = mek.key.id
            if (hasProcessedMessage(mek.key)) continue
            markMessageProcessed(mek.key)
            const rawTs = mek.messageTimestamp
            const msgTimestamp = (typeof rawTs === 'object' ? (rawTs?.toNumber?.() ?? rawTs?.low ?? 0) : (rawTs ?? 0)) * 1000
            if (msgTimestamp && msgTimestamp < BOT_START_TIME) continue
            if (mek.message?.protocolMessage?.type === 0) {
                try {
                    await handleAntiDeleteEvent(
                        EliteProTech,
                        mek.message.protocolMessage.key,
                        mek.key || {}
                    )
                } catch (err) {
                    console.error('[ANTI-DELETE] Failed to restore revoked message:', err.message)
                }
                continue
            }
            if (mek.message?.protocolMessage || mek.message?.pollUpdateMessage) continue
            const jid = mek.key?.remoteJid
            const isStatus = jid === 'status@broadcast'
            const isGroup = jid?.endsWith('@g.us')
            const isNewsletter = jid?.endsWith('@newsletter')
            if (isStatus) {
                handleStatusWatcher(EliteProTech, mek)
                continue
            }
            if (mek.key.id.startsWith('BAE5') && mek.key.id.length === 16) continue
            const m = smsg(EliteProTech, mek, store)
            EliteProHandler(EliteProTech, m, chatUpdate, store)
            if (isGroup) {
                handleAntiStatus(EliteProTech, mek)
                handleAntiLink(EliteProTech, mek)
            }
            if (isNewsletter) handleChannelReact(EliteProTech, mek)
            handleAutoReact(EliteProTech, mek)
            handleChatbot(EliteProTech, mek)
        }
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
        const id = EliteProTech.decodeJid(jid)
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
    
const modeData = { mode: global.botMode }

EliteProTech.public = modeData.mode === 'public'

EliteProTech.serializeM = (m) => smsg(EliteProTech, m, store)

EliteProTech.ev.on("connection.update", async (s) => {
    const { connection, lastDisconnect } = s
    if (connection == "open") {
        reconnecting = false
        modeData.mode = global.botMode
        EliteProTech.public = global.botMode === 'public'
        console.log(chalk.yellow(`]`))
        console.log(chalk.yellow(`✅  ${botname} is now Connected`))
        console.log(chalk.cyan(`Logged in as: ${EliteProTech.user?.name || 'Unknown'} (${EliteProTech.user?.id?.split(':')[0]})`))
        console.log(chalk.yellow(`]`))
        restoreBotData(EliteProTech.user?.id).catch(() => {})
    }
    if (connection === "close" && lastDisconnect && lastDisconnect.error) {
        if (reconnecting) return
        reconnecting = true
        if (awaitingNumber && rl && !rl.closed) rl.close()
        const statusCode = getDisconnectStatus(lastDisconnect)
        if (statusCode === DisconnectReason.loggedOut) {
            console.log(chalk.red("❌ Your device was logged out. Please Re-pair."))
            return
        }
        if (statusCode === DisconnectReason.connectionReplaced) {
            console.log(chalk.red("❌ This session was opened on another instance. Reconnect stopped."))
            return
        }

        if (pairingCodeRequested && !state.creds.registered) {
            console.log(chalk.yellow('Pairing code expired. Please enter your number again.'))
        }

        const reconnectDelay = statusCode === DisconnectReason.restartRequired ? 0 : 1000
        if (reconnectDelay) {
            await new Promise(resolve => setTimeout(resolve, reconnectDelay))
        }
        return startEliteProTech()
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
if (!sessionCleanupInterval) {
    sessionCleanupInterval = setInterval(cleanSessionFiles, 8 * 60 * 60 * 1000)
    sessionCleanupInterval.unref?.()
}
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
void startEliteProTech()

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
}
