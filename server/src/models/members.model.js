const members = require('./members.mongo');
const membersData = require('../../data/members');

// Makes the database match data/members.js every time the server starts:
// new names get added, removed names get removed.
async function syncMembers() {
    for (const [index, name] of membersData.entries()) {
        await members.updateOne({ name }, { name, order: index }, { upsert: true });
    }
    await members.deleteMany({ name: { $nin: membersData } });

    console.log(`${membersData.length} members loaded!`);
}

async function getMemberNames() {
    const found = await members.find({}, { '_id': 0, 'name': 1 }).sort({ order: 1 });
    return found.map((member) => member.name);
}

async function existsMember(name) {
    return Boolean(await members.exists({ name }));
}

module.exports = {
    syncMembers,
    getMemberNames,
    existsMember,
};
