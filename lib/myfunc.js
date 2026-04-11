const {
    proto,
    delay,
    getContentType
} = require('baileys')
const chalk = require('chalk')
const fs = require('fs')
const Crypto = require('crypto')
const axios = require('axios')
const moment = require('moment-timezone')
const {
    sizeFormatter
} = require('human-readable')
const util = require('util')
const Jimp = require('jimp')
const {
    defaultMaxListeners
} = require('stream')

const unixTimestampSeconds = (date = new Date()) => Math.floor(date.getTime() / 1000)

exports.unixTimestampSeconds = unixTimestampSeconds

exports.generateMessageTag = (epoch) => {
    let tag = (0, exports.unixTimestampSeconds)().toString()
    if (epoch) tag += '.--' + epoch
    return tag
}

exports.processTime = (timestamp, now) => {
    return moment.duration(now - moment(timestamp * 1000)).asSeconds()
}

exports.getRandom = (ext) => {
    return `${Math.floor(Math.random() * 10000)}${ext}`
}

exports.getBuffer = async (url, options = {}) => {
    try {
        const res = await axios({
            method: 'get',
            url,
            headers: {
                DNT: 1,
                'Upgrade-Insecure-Request': 1
            },
            ...options,
            responseType: 'arraybuffer'
        })
        return res.data
    } catch (err) {
        return err
    }
}

exports.getImg = async (url, options = {}) => {
    try {
        const res = await axios({
            method: 'get',
            url,
            headers: {
                DNT: 1,
                'Upgrade-Insecure-Request': 1
            },
            ...options,
            responseType: 'arraybuffer'
        })
        return res.data
    } catch (err) {
        return err
    }
}

exports.fetchJson = async (url, options = {}) => {
    try {
        const res = await axios({
            method: 'GET',
            url,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36'
            },
            ...options
        })
        return res.data
    } catch (err) {
        return err
    }
}

exports.runtime = function(seconds) {
    seconds = Number(seconds)
    var d = Math.floor(seconds / (3600 * 24))
    var h = Math.floor(seconds % (3600 * 24) / 3600)
    var m = Math.floor(seconds % 3600 / 60)
    var s = Math.floor(seconds % 60)
    var dDisplay = d > 0 ? d + (d == 1 ? ' day, ' : ' days, ') : ''
    var hDisplay = h > 0 ? h + (h == 1 ? ' hour, ' : ' hours, ') : ''
    var mDisplay = m > 0 ? m + (m == 1 ? ' minute, ' : ' minutes, ') : ''
    var sDisplay = s > 0 ? s + (s == 1 ? ' second' : ' seconds') : ''
    return dDisplay + hDisplay + mDisplay + sDisplay
}

exports.clockString = (ms) => {
    let h = isNaN(ms) ? '--' : Math.floor(ms / 3600000)
    let m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60
    let s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60
    return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':')
}

exports.sleep = async (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms))
}

exports.isUrl = (url = '') => {
    return url.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/, 'gi'))
}

exports.getTime = (format, date) => {
    if (date) {
        return moment(date).locale('id').format(format)
    } else {
        return moment.tz('Asia/Jakarta').locale('id').format(format)
    }
}

exports.formatDate = (n, locale = 'id') => {
    let d = new Date(n)
    return d.toLocaleDateString(locale, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric'
    })
}

exports.tanggal = (numer) => {
    const myMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    const myDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const tgl = new Date(numer)
    const day = tgl.getDate()
    const bulan = tgl.getMonth()
    const thisDay = myDays[tgl.getDay()]
    const yy = tgl.getYear()
    const year = yy < 1000 ? yy + 1900 : yy

    return `${thisDay}, ${day} - ${myMonths[bulan]} - ${year}`
}

exports.jam = (numer, options = {}) => {
    const format = options.format || 'HH:mm'
    const jam = options.timeZone
        ? moment(numer).tz(options.timeZone).format(format)
        : moment(numer).format(format)

    return `${jam}`
}

exports.formatp = sizeFormatter({
    std: 'JEDEC',
    decimalPlaces: 2,
    keepTrailingZeroes: false,
    render: (literal, symbol) => `${literal} ${symbol}B`
})

exports.json = (string) => {
    return JSON.stringify(string, null, 2)
}

function format(...args) {
    return util.format(...args)
}

exports.logic = (check, inp, out) => {
    if (inp.length !== out.length) throw new Error('Input and Output must have same length')
    for (let i in inp) {
        if (util.isDeepStrictEqual(check, inp[i])) return out[i]
    }
    return null
}

exports.generateProfilePicture = async (buffer) => {
    const jimp = await Jimp.read(buffer)
    const min = jimp.getWidth()
    const max = jimp.getHeight()
    const cropped = jimp.crop(0, 0, min, max)
    return {
        img: await cropped.scaleToFit(720, 720).getBufferAsync(Jimp.MIME_JPEG),
        preview: await cropped.scaleToFit(720, 720).getBufferAsync(Jimp.MIME_JPEG)
    }
}

exports.bytesToSize = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes'

    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

exports.getSizeMedia = (path) => {
    return new Promise((resolve, reject) => {
        if (/http/.test(path)) {
            axios.get(path).then((res) => {
                let length = parseInt(res.headers['content-length'])
                let size = exports.bytesToSize(length, 3)
                if (!isNaN(length)) resolve(size)
                else reject('Invalid content-length')
            }).catch(reject)
        } else if (Buffer.isBuffer(path)) {
            let length = Buffer.byteLength(path)
            let size = exports.bytesToSize(length, 3)
            if (!isNaN(length)) resolve(size)
            else reject('Invalid buffer length')
        } else {
            reject('error gatau apah')
        }
    })
}

exports.parseMention = (text = '') => {
    return [...text.matchAll(/@([0-9]{5,16}|0)/g)].map(v => v[1] + '@s.whatsapp.net')
}

exports.getGroupAdmins = (participants = []) => {
    let admins = []
    for (let i of participants) {
        if (i.admin === 'superadmin' || i.admin === 'admin') {
            admins.push(i.jid)
        }
    }
    return admins || []
}

function getCleanParticipantId(EliteProTech, m) {
    const isGroup = m?.chat?.endsWith('@g.us')
    let jid = m?.key?.participantPn || m?.key?.participant || m?.participant || null

    if (jid?.includes(':')) {
        jid = jid.split(':')[0] + '@s.whatsapp.net'
    }

    if (!jid && isGroup) {
        jid = EliteProTech?.user?.id || null
    }

    return jid
}

exports.smsg = (EliteProTech, m, store) => {
    if (!m) return m

    let M = proto.WebMessageInfo

    if (m.key) {
        m.id = m.key.id || ''
        m.isBaileys = typeof m.id === 'string' && m.id.startsWith('BAE5') && m.id.length === 16
        m.chat = m.key.remoteJid || ''
        m.fromMe = !!m.key.fromMe
        m.isGroup = typeof m.chat === 'string' && m.chat.endsWith('@g.us')
        m.cleanParticipantId = getCleanParticipantId(EliteProTech, m)

        m.sender = EliteProTech.decodeJid(
            (m.fromMe && EliteProTech?.user?.id) ||
            m.cleanParticipantId ||
            m.key.senderPn ||
            m.key.participant ||
            m.participant ||
            m.chat ||
            ''
        )

        if (m.isGroup) {
            m.participant = EliteProTech.decodeJid(m.key.participant || m.cleanParticipantId || '') || ''
        }
    }

    if (m.message) {
        m.mtype = getContentType(m.message)

        if (m.mtype === 'viewOnceMessage') {
            const viewOnce = m.message?.viewOnceMessage?.message || {}
            const innerType = getContentType(viewOnce)
            m.msg = innerType ? viewOnce?.[innerType] || {} : {}
        } else {
            m.msg = m.message?.[m.mtype] || {}
        }

        if (['ephemeralMessage'].includes(m.mtype)) {
            const innerMessage = m.message?.ephemeralMessage?.message || {}
            const innerType = getContentType(innerMessage)
            m.mtype = innerType || m.mtype
            m.msg = innerType ? innerMessage?.[innerType] || {} : m.msg
        }

        m.body =
            m.message?.conversation ||
            m.msg?.caption ||
            m.msg?.text ||
            m.msg?.contentText ||
            (m.mtype === 'listResponseMessage' ? m.msg?.singleSelectReply?.selectedRowId : '') ||
            (m.mtype === 'buttonsResponseMessage' ? m.msg?.selectedButtonId : '') ||
            (m.mtype === 'templateButtonReplyMessage' ? m.msg?.selectedId : '') ||
            ''

        let quoted = m.quoted = m.msg?.contextInfo?.quotedMessage || null
        m.mentionedJid = m.msg?.contextInfo?.mentionedJid || []

        if (m.quoted) {
            let type = getContentType(quoted || {})
            m.quoted = type ? m.quoted?.[type] || {} : {}

            if (type === 'productMessage') {
                type = getContentType(m.quoted || {})
                m.quoted = type ? m.quoted?.[type] || {} : {}
            }

            if (typeof m.quoted === 'string') {
                m.quoted = { text: m.quoted }
            }

            m.quoted.mtype = type || ''
            m.quoted.id = m.msg?.contextInfo?.stanzaId || ''
            m.quoted.chat = m.msg?.contextInfo?.remoteJid || m.chat
            m.quoted.isBaileys = typeof m.quoted.id === 'string' && m.quoted.id.startsWith('BAE5') && m.quoted.id.length === 16
            m.quoted.sender = EliteProTech.decodeJid(m.msg?.contextInfo?.participant || '')
            m.quoted.fromMe = m.quoted.sender === (EliteProTech?.user?.id || '')
            m.quoted.text =
                m.quoted.text ||
                m.quoted.caption ||
                m.quoted.conversation ||
                m.quoted.contentText ||
                m.quoted.selectedDisplayText ||
                m.quoted.title ||
                ''
            m.quoted.mentionedJid = m.msg?.contextInfo?.mentionedJid || []

            m.getQuotedObj = m.getQuotedMessage = async () => {
                if (!m.quoted?.id) return false
                if (!store || !store.loadMessage) return false
                let q = await store.loadMessage(m.chat, m.quoted.id, EliteProTech)
                return exports.smsg(EliteProTech, q, store)
            }

            let vM = m.quoted.fakeObj = {
                key: {
                    remoteJid: m.quoted.chat,
                    fromMe: m.quoted.fromMe,
                    id: m.quoted.id
                },
                message: quoted,
                ...(m.isGroup ? { participant: m.quoted.sender } : {})
            }

            m.quoted.delete = () => EliteProTech.sendMessage(m.quoted.chat, {
                delete: vM.key
            })

            m.quoted.copyNForward = (jid, forceForward = false, options = {}) => {
                return EliteProTech.copyNForward(jid, vM, forceForward, options)
            }

            m.quoted.download = () => EliteProTech.downloadMediaMessage(m.quoted)
        }
    } else {
        m.mtype = ''
        m.msg = {}
        m.body = ''
        m.quoted = null
        m.mentionedJid = []
    }

    if (m.msg?.url) {
        m.download = () => EliteProTech.downloadMediaMessage(m.msg)
    }

    m.text =
        m.msg?.text ||
        m.msg?.caption ||
        m.message?.conversation ||
        m.msg?.contentText ||
        m.msg?.selectedDisplayText ||
        m.msg?.title ||
        m.body ||
        ''

    m.reply = (text, chatId = m.chat, options = {}) => {
        return Buffer.isBuffer(text)
            ? EliteProTech.sendMedia(chatId, text, 'file', '', m, { ...options })
            : EliteProTech.sendText(chatId, text, m, { ...options })
    }

    m.copy = () => exports.smsg(EliteProTech, M.fromObject(M.toObject(m)), store)

    m.copyNForward = (jid = m.chat, forceForward = false, options = {}) => {
        return EliteProTech.copyNForward(jid, m, forceForward, options)
    }

    return m
}

exports.reSize = (buffer, ukur1, ukur2) => {
    return new Promise(async (resolve, reject) => {
        try {
            var baper = await Jimp.read(buffer)
            var ab = await baper.resize(ukur1, ukur2).getBufferAsync(Jimp.MIME_JPEG)
            resolve(ab)
        } catch (e) {
            reject(e)
        }
    })
}

let file = require.resolve(__filename)
fs.watchFile(file, () => {
    fs.unwatchFile(file)
    console.log(chalk.redBright(`Update ${__filename}`))
    delete require.cache[file]
    require(file)
})