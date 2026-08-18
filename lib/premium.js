const axios = require("axios");
async function checkPremiumUser(userId) {
    try {
        const { data } = await axios.get("https://accesses-1.zone.id/botprem", {
            params: {
                number: userId
            },
            timeout: 15000
        });
        return data?.status === true;
    } catch (error) {
        console.log("Premium API check error:", error.message);
        return false;
    }
}
module.exports = {
    checkPremiumUser
};
