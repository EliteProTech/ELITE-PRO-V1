// ELITE-PRO XP / LEVEL SYSTEM
// Members earn XP by chatting in a group. Every level-up is announced in the group.
// Data is kept in memory and saved to database/levels.json (every 30s and when the bot stops).
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const FILE = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'database', 'levels.json')

// ================= SETTINGS YOU CAN TWEAK =================
export const XP_MIN = 5                    // XP given per counted message (random between MIN and MAX)
export const XP_MAX = 15
export const COOLDOWN_MS = 30 * 1000       // a member can earn XP only once per 30s (stops spam-farming)
export const xpToNextLevel = (level) => 100 * level * level   // lvl1->2: 100, lvl2->3: 400, lvl3->4: 900 ...
export const TITLES = [                    // [from level, title]
    [1, '🌱 Newbie'],
    [5, '🌿 Active Member'],
    [10, '🔥 Regular'],
    [15, '⚡ Veteran'],
    [20, '💎 Elite'],
    [30, '👑 Legend'],
    [40, '🌟 Mythic'],
    [50, '🏆 Grandmaster']
]
// ==========================================================

// ---------- storage ----------
let data = { groups: {} }
try {
    const parsed = JSON.parse(fs.readFileSync(FILE, 'utf8'))
    if (parsed && typeof parsed.groups === 'object') data = parsed
} catch (err) {
    // keep a copy of a damaged file instead of silently overwriting it
    if (err.code !== 'ENOENT') { try { fs.copyFileSync(FILE, FILE + '.corrupt') } catch {} }
}

let dirty = false
export function flush() {
    if (!dirty) return
    try {
        fs.mkdirSync(path.dirname(FILE), { recursive: true })
        const tmp = FILE + '.tmp'
        fs.writeFileSync(tmp, JSON.stringify(data))
        fs.renameSync(tmp, FILE)
        dirty = false
    } catch (err) {
        console.error('[levels] save failed:', err.message)
    }
}
setInterval(flush, 30 * 1000).unref?.()
process.on('exit', flush)   // also runs on process.exit(), restarts and shutdowns

const normalizeId = (jid) => String(jid || '').trim().toLowerCase().replace(/:\d+(?=@)/, '')

function getGroup(gid, create = false) {
    let g = data.groups[gid]
    if (!g && create) g = data.groups[gid] = { enabled: false, users: {} }
    return g
}

export function isEnabled(gid) {
    return getGroup(gid)?.enabled === true
}

export function setEnabled(gid, on) {
    getGroup(gid, true).enabled = !!on
    dirty = true
    flush()
}

// ---------- level maths ----------
export function levelFromXp(xp) {
    let level = 1
    let rem = Math.max(0, Math.floor(Number(xp) || 0))
    while (level < 1000 && rem >= xpToNextLevel(level)) {
        rem -= xpToNextLevel(level)
        level++
    }
    return { level, current: rem, target: xpToNextLevel(level) }
}

export function getTitle(level) {
    let title = TITLES[0][1]
    for (const [from, name] of TITLES) if (level >= from) title = name
    return title
}

// ---------- XP ----------
export function addXp(gid, jid, now = Date.now()) {
    const g = getGroup(gid)
    if (!g?.enabled) return null
    const id = normalizeId(jid)
    if (!id) return null
    const u = g.users[id] || (g.users[id] = { xp: 0, msgs: 0, last: 0 })
    u.msgs++
    dirty = true
    if (now - u.last < COOLDOWN_MS) return { gained: 0, leveledUp: false }
    const before = levelFromXp(u.xp).level
    const gained = XP_MIN + Math.floor(Math.random() * (XP_MAX - XP_MIN + 1))
    u.xp += gained
    u.last = now
    const after = levelFromXp(u.xp)
    return { gained, leveledUp: after.level > before, xp: u.xp, ...after, title: getTitle(after.level) }
}

export function getStats(gid, jid) {
    const g = getGroup(gid)
    const id = normalizeId(jid)
    const u = g?.users?.[id] || { xp: 0, msgs: 0 }
    const prog = levelFromXp(u.xp)
    const all = Object.values(g?.users || {})
    const rank = g?.users?.[id] ? all.filter(x => x.xp > u.xp).length + 1 : null
    return { xp: u.xp, msgs: u.msgs, ...prog, title: getTitle(prog.level), rank, total: all.length }
}

export function getTop(gid, n = 10) {
    const g = getGroup(gid)
    return Object.entries(g?.users || {})
        .map(([id, u]) => ({ id, xp: u.xp, msgs: u.msgs, level: levelFromXp(u.xp).level }))
        .sort((a, b) => b.xp - a.xp || b.msgs - a.msgs)
        .slice(0, n)
}

// ---------- text styling ----------
const SMALL = { a: 'ᴀ', b: 'ʙ', c: 'ᴄ', d: 'ᴅ', e: 'ᴇ', f: 'ꜰ', g: 'ɢ', h: 'ʜ', i: 'ɪ', j: 'ᴊ', k: 'ᴋ', l: 'ʟ', m: 'ᴍ', n: 'ɴ', o: 'ᴏ', p: 'ᴘ', q: 'ǫ', r: 'ʀ', s: 's', t: 'ᴛ', u: 'ᴜ', v: 'ᴠ', w: 'ᴡ', x: 'x', y: 'ʏ', z: 'ᴢ' }
export const sc = (s) => String(s).toLowerCase().replace(/[a-z]/g, c => SMALL[c])
export const bold = (s) => String(s).replace(/[A-Za-z0-9]/g, c => {
    if (c >= 'A' && c <= 'Z') return String.fromCodePoint(0x1D400 + c.charCodeAt(0) - 65)
    if (c >= 'a' && c <= 'z') return String.fromCodePoint(0x1D41A + c.charCodeAt(0) - 97)
    return String.fromCodePoint(0x1D7CE + c.charCodeAt(0) - 48)
})

const TOP = (title) => [
    '╭── ⋅ ── ♡ ── ⋅ ⋅ ──╮',
    `   𓆩 ${bold(title)} 𓆪`,
    '╰── ⋅ ⋅ ── ♡ ── ⋅ ⋅ ──╯'
]
const BOTTOM = '╰──────────────❏'
const row = (label, value) => `│  𓆩♡𓆪 ${sc(label)} : ${value}`

// The card sent when someone levels up
export function levelUpCard({ tag, level, title, current, target }) {
    return [
        ...TOP('LEVEL UP'),
        '',
        `╭─❏ ${bold('CONGRATULATIONS')}`,
        `│  𓆩♡𓆪 ${sc('user')} : ${tag}`,
        `│  𓆩♡𓆪 ${sc('lvl')}  : ${level}`,
        `│  𓆩♡𓆪 ${sc('title')} : ${title}`,
        BOTTOM,
        '',
        `╭─❏ ${bold('NEXT GOAL')}`,
        row('target', `${target} ${sc('xp')}`),
        row('current', `${current} ${sc('xp')}`),
        BOTTOM
    ].join('\n')
}

// The card for the .level command
export function levelCard({ tag, level, title, current, target, xp, msgs, rank, total }) {
    return [
        ...TOP('MY LEVEL'),
        '',
        `╭─❏ ${bold('PROFILE')}`,
        row('user', tag),
        row('lvl', level),
        row('title', title),
        row('rank', rank ? `#${rank} / ${total}` : '-'),
        row('msgs', msgs),
        BOTTOM,
        '',
        `╭─❏ ${bold('NEXT GOAL')}`,
        row('target', `${target} ${sc('xp')}`),
        row('current', `${current} ${sc('xp')}`),
        row('total', `${xp} ${sc('xp')}`),
        BOTTOM
    ].join('\n')
}

// The card for the .leaderboard command. rows = getTop() result.
export function leaderboardCard(rows) {
    const medals = ['🥇', '🥈', '🥉']
    const lines = rows.map((r, i) =>
        `│ ${medals[i] || `${i + 1}.`} @${r.id.split('@')[0]}\n│    ${sc('lvl')} ${r.level} • ${r.xp} ${sc('xp')} • ${r.msgs} ${sc('msgs')}`)
    return [
        ...TOP('TOP CHATTERS'),
        '',
        `╭─❏ ${bold('LEADERBOARD')}`,
        ...lines,
        BOTTOM
    ].join('\n')
}

// ---------- called by index.js for every group message ----------
export async function trackMessage(EliteProTech, m) {
    try {
        if (!m?.isGroup || m.fromMe || m.isBaileys || !m.sender) return
        if (m.mtype === 'reactionMessage' || m.mtype === 'protocolMessage') return
        if (!getGroup(m.chat)?.enabled) return
        const prefix = global.prefix
        const text = typeof m.text === 'string' ? m.text.trim() : ''
        if (prefix && text.startsWith(prefix)) return      // bot commands do not earn XP
        const res = addXp(m.chat, m.sender)
        if (!res?.leveledUp) return
        await EliteProTech.sendMessage(m.chat, {
            text: levelUpCard({ tag: `@${m.sender.split('@')[0]}`, ...res }),
            mentions: [m.sender]
        }, { quoted: m })
    } catch (err) {
        console.error('[levels] error:', err.message)
    }
}
