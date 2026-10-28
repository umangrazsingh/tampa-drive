// Blocks any request that doesn't send the right invite code.
// The browser sends it in the "x-invite-code" header (see client/src/hooks/requests.js).

function isValidInviteCode(code) {
    const expected = String(process.env.INVITE_CODE || '').trim().toUpperCase();
    return Boolean(expected) && String(code || '').trim().toUpperCase() === expected;
}

function requireInvite(req, res, next) {
    if (!isValidInviteCode(req.get('x-invite-code'))) {
        return res.status(401).json({
            error: 'Invite code required',
        });
    }
    next();
}

module.exports = requireInvite;
module.exports.isValidInviteCode = isValidInviteCode;
