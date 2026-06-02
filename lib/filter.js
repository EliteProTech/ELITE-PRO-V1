const originalConsoleInfo = console.info
const originalConsoleLog = console.log
const originalConsoleError = console.error
const originalConsoleWarn = console.warn

const suppressedPatterns = [
    /Closing session/i,
    /Closing open session/i,
    /Removing old closed session/i,
    /Decrypted message with closed session/i,
    /in favor of incoming/i,
    /prekey bundle/i,
    /SessionEntry/i,
    /failed to decrypt/i,
    /Bad MAC/i,
    /Session error/i,
    /libsignal/i,
    /session_cipher/i,
    /_chains/i,
    /ephemeralKeyPair/i,
    /rootKey/i,
    /baseKey/i,
    /pendingPreKey/i,
    /indexInfo/i,
    /currentRatchet/i,
    /registrationId/i,
    /remoteIdentityKey/i,
    /lastRemoteEphemeralKey/i,
    /verifyMAC/i,
    /decryptWithSessions/i,
    /doDecryptWhisperMessage/i,
    /_asyncQueueExecutor/i,
    /Interactive send/i,
    /noise-handler/i,
    /Cannot parse message/i,
    /No session found/i,
    /failed to decode/i
]

function argToString(arg) {
    try {
        if (typeof arg === "string")
            return arg

        if (arg instanceof Error)
            return `${arg.message} ${arg.stack || ""}`

        if (arg && typeof arg === "object") {
            try {
                return JSON.stringify(arg)
            } catch {
                return String(arg)
            }
        }

        return String(arg)

    } catch {
        return ""
    }
}

function shouldSuppress(args) {
    const text = args
        .map(argToString)
        .join(" ")

    if (
        suppressedPatterns.some(
            pattern => pattern.test(text)
        )
    ) return true

    if (
        args.some(
            x =>
                x &&
                typeof x === "object" &&
                (
                    x._chains ||
                    x.indexInfo ||
                    x.currentRatchet ||
                    x.ephemeralKeyPair
                )
        )
    ) return true

    return false
}

function setupConsoleFilters() {

    console.info = (...args) => {
        if (shouldSuppress(args))
            return

        originalConsoleInfo(...args)
    }

    console.log = (...args) => {
        if (shouldSuppress(args))
            return

        originalConsoleLog(...args)
    }

    console.warn = (...args) => {
        if (shouldSuppress(args))
            return

        originalConsoleWarn(...args)
    }

    console.error = (...args) => {
        if (shouldSuppress(args))
            return

        originalConsoleError(...args)
    }

}

module.exports = setupConsoleFilters
