// Addresses should be in quotes
// Amounts should be without decimals
// Addresses should be in the same order as the amounts

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

};

exports.claimLists = claimLists;
