const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
    // Read deployment addresses
    const DEPLOYMENT_PATH = path.join(__dirname, '../deployments.json');
    let deployments;
    
    try {
        deployments = JSON.parse(fs.readFileSync(DEPLOYMENT_PATH, 'utf8'));
    } catch (error) {
        console.error("Could not find deployments.json file. Please make sure contracts are deployed first.");
        console.error("Path : ", DEPLOYMENT_PATH)
        return;
    }

    const network = hre.network.name;
    console.log(`Verifying contracts on ${network}...`);

    const networkDeployments = deployments[network];
    if (!networkDeployments) {
        console.error(`No deployments found for network ${network}`);
        return;
    }

    // Parse timestamps from strings to numbers
    const timestamps = {
        tgeTimestamp: parseInt(networkDeployments.tgeTimestamp),
        tgePlus15MinutesTimestamp: parseInt(networkDeployments.tgePlus15MinutesTimestamp),
        tgePlus30MinutesTimestamp: parseInt(networkDeployments.tgePlus30MinutesTimestamp),
        tgePlus3DaysTimestamp: parseInt(networkDeployments.tgePlus3DaysTimestamp)
    };

    // Verify Midle Token
    if (networkDeployments.token) {
        console.log("\nVerifying Midle Token...");
        try {
            await hre.run("verify:verify", {
                address: networkDeployments.token,
                contract: "contracts/Midle.sol:Midle",
                constructorArguments: []
            });
        } catch (error) {
            if (!error.message.includes("Already Verified")) {
                console.error("Error verifying Midle Token:", error);
            } else {
                console.log("Midle Token already verified");
            }
        }
    }

    // Verify Vesting Contracts
    const vestingContracts = {
        advisorVesting: ["AdvisorVesting", "contracts/vesting/AdvisorVesting.sol:AdvisorVesting"],
        communityRewardsVesting: ["CommunityRewardsVesting", "contracts/vesting/CommunityRewardsVesting.sol:CommunityRewardsVesting"],
        liquidityVesting: ["LiquidityVesting", "contracts/vesting/LiquidityVesting.sol:LiquidityVesting"],
        marketingVesting: ["MarketingVesting", "contracts/vesting/MarketingVesting.sol:MarketingVesting"],
        teamVesting: ["TeamVesting", "contracts/vesting/TeamVesting.sol:TeamVesting"],
        treasuryVesting: ["TreasuryVesting", "contracts/vesting/TreasuryVesting.sol:TreasuryVesting"]
    };

    for (const [key, [name, contractPath]] of Object.entries(vestingContracts)) {
        if (networkDeployments[key]) {
            console.log(`\nVerifying ${name}...`);
            try {
                await hre.run("verify:verify", {
                    address: networkDeployments[key],
                    contract: contractPath,
                    constructorArguments: [
                        networkDeployments.token,
                        timestamps.tgeTimestamp
                    ]
                });
            } catch (error) {
                if (!error.message.includes("Already Verified")) {
                    console.error(`Error verifying ${name}:`, error);
                } else {
                    console.log(`${name} already verified`);
                }
            }
        }
    }

    // Verify Claim Contracts
    const claimContracts = {
        airdropClaim: ["AirdropClaim", "contracts/claim/AirdropClaim.sol:AirdropClaim", timestamps.tgePlus3DaysTimestamp],
        kolClaim: ["KolClaim", "contracts/claim/KolClaim.sol:KolClaim", timestamps.tgePlus15MinutesTimestamp],
        privateClaim: ["PrivateClaim", "contracts/claim/PrivateClaim.sol:PrivateClaim", timestamps.tgePlus30MinutesTimestamp],
        publicClaim: ["PublicClaim", "contracts/claim/PublicClaim.sol:PublicClaim", timestamps.tgePlus15MinutesTimestamp],
        seedClaim: ["SeedClaim", "contracts/claim/SeedClaim.sol:SeedClaim", timestamps.tgePlus30MinutesTimestamp],
        strategicClaim: ["StrategicClaim", "contracts/claim/StrategicClaim.sol:StrategicClaim", timestamps.tgePlus30MinutesTimestamp]
    };

    for (const [key, [name, contractPath, timestamp]] of Object.entries(claimContracts)) {
        if (networkDeployments[key]) {
            console.log(`\nVerifying ${name}...`);
            console.log(`Timestamp is :  ${timestamp}...`);
            try {
                await hre.run("verify:verify", {
                    address: networkDeployments[key],
                    contract: contractPath,
                    constructorArguments: [
                        networkDeployments.token,
                        timestamp
                    ]
                });
            } catch (error) {
                if (!error.message.includes("Already Verified")) {
                    console.error(`Error verifying ${name}:`, error);
                } else {
                    console.log(`${name} already verified`);
                }
            }
        }
    }

    console.log("\nVerification process completed!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 