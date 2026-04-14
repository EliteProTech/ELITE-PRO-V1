const axios = require("axios")

const PREMIUM_API = "https://eliteprotech-bot-db.zone.id/botprem"

const checkPremiumUser = async (userId) => {
    try {
        const { data } = await axios.get(PREMIUM_API, {
            params: {
                number: userId
            },
            timeout: 15000
        })

        return data?.status === true
    } catch (error) {
        console.log("Premium API check error:", error.message)
        return false
    }
}

module.exports = {
    checkPremiumUser
}