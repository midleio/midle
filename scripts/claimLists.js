const airdropUsers = [];
const airdropAmounts = [];
const kolUsers = [];
const kolAmounts = [];
const privateUsers = [];
const privateAmounts = [];
const publicUsers = [];
const publicAmounts = [];
const seedUsers = [];
const seedAmounts = [];
const strategicUsers = [];
const strategicAmounts = [];

const claimLists = {
    'airdrop': {
        users: airdropUsers,
        amounts: airdropAmounts
    },

    'kol': {
        users: kolUsers,
        amounts: kolAmounts
    },

    'private': {
        users: privateUsers,
        amounts: privateAmounts
    },

    'seed': {
        users: seedUsers,
        amounts: seedAmounts
    },

    'strategic': {
        users: strategicUsers,
        amounts: strategicAmounts
    },

    'public': {
        users: publicUsers,
        amounts: publicAmounts
    },

    'seed': {
        users: seedUsers,
        amounts: seedAmounts
    },
};

exports.claimLists = claimLists;
