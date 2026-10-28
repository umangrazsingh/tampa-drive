const { isValidInviteCode } = require('../../middleware/requireInvite');
const { getMemberNames } = require('../../models/members.model');

// POST /session  { inviteCode }  ->  { members: [...] }
async function httpCreateSession(req, res) {
    const { inviteCode } = req.body || {};

    if (!isValidInviteCode(inviteCode)) {
        return res.status(401).json({
            error: "That code didn't work. Try again.",
        });
    }

    return res.status(200).json({
        members: await getMemberNames(),
    });
}

module.exports = {
    httpCreateSession,
};
