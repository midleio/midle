// In case of tokenomics change, change the tokenAllocations object and the vestingReceivers object, 
// change amounts on vesting contracts, change comments on vesting contracts

const hre = require("hardhat");
const { writeClaims } = require('./writeClaims.js');
//const deployedMidleAddress = "0x7e0d753d44d5A7492d31ffc020c9B0d07c6D05D7"; // For mainnet deployment
const deployedMidleAddress = ""; // For local deployment

let allAddresses= {};
async function main() {
    
    const tgeTimestamp = Date.parse("22 Jan 2025 13:00:00 GMT") / 1000; // TGE Date 
    const tgePlus15MinutesTimestamp = tgeTimestamp + 15 * 60; // TGE + 15 Minutes
    const tgePlus30MinutesTimestamp = tgeTimestamp + 30 * 60; // TGE + 30 Minutes
    const tgePlus3DaysTimestamp = tgeTimestamp + 2 * 24 * 60 * 60; // TGE + 2 Days to get in 3 days, 

    // Token amounts for allocations as millions
    const tokenAllocations = {
        advisor: 40 * 10 ** 6,
        communityRewards: 240 * 10 ** 6,
        liquidity: 205 * 10 ** 6,
        marketing: 50 * 10 ** 6,
        team: 80 * 10 ** 6,
        treasury: 40 * 10 ** 6,
        airdrop: 20 * 10 ** 6,
        kol: 9755556, // 9.75M
        private: 100 * 10 ** 6,
        public: 15 * 10 ** 6,
        seed: 97 * 10 ** 6,
        strategic: 3 * 10 ** 6
    };
  
    const vestingReceivers = {
        advisorAddress: {
            address : "0x4B7f6bc11e392Ed82913E01fA9B0488770668a59",
            tgeAmount: tokenAllocations.advisor * 0 / 100, // 0%
            lockAmount: tokenAllocations.advisor - tokenAllocations.advisor * 0 / 100,  // 100%
        },
        communityRewardsAddress: {
            address : "0x8cA38aC9C38C87896A8eFa65e6eacc9dbdCE78ec",
            tgeAmount: tokenAllocations.communityRewards * 0 / 100, // 0%
            lockAmount: tokenAllocations.communityRewards - tokenAllocations.communityRewards * 0 / 100, // 100%
        },
        liquidityAddress: {
            address : "0xDFfb0b8c75ecCBdaB76Af41077addf6366d51bb1",
            tgeAmount: tokenAllocations.liquidity * 0 / 100, // 0% // Already Sent
            lockAmount: tokenAllocations.liquidity - tokenAllocations.liquidity * 0 / 100, // 100% Already Sent
        },
        marketingAddress: {
            address : "0xB871989554b35F0F3D4406b839DF63EA88C7757E",
            tgeAmount: tokenAllocations.marketing * 0 / 100, // 0%
            lockAmount: tokenAllocations.marketing - tokenAllocations.marketing * 0 / 100, // 100%
        },
        teamAddress: {
            address : "0x5f64E510E6c78A25226D473592e2B471b84DD7c1",
            tgeAmount: tokenAllocations.team * 0 / 100, // 0%
            lockAmount: tokenAllocations.team - tokenAllocations.team * 0 / 100, // 100%
        },
        treasuryAddress: {
            address : "0xFfA55B79e8475Ae276F83f17c559B74bEBf7d6CC",
            tgeAmount: tokenAllocations.treasury * 0 / 100, // 0%
            lockAmount: tokenAllocations.treasury - tokenAllocations.treasury * 0 / 100, // 100%
        },
    }; 

    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address, "\n\n");
    allAddresses['deployer'] = deployer.address;

    // Deploy token contract
    let midle ;

    if (deployedMidleAddress == "") {
        midle = await hre.ethers.deployContract("Midle");
        await midle.waitForDeployment();
    } else {
        midle = await hre.ethers.getContractAt("Midle", deployedMidleAddress , deployer);
    }
    
    const midleTokenAddress = await midle.getAddress();
    console.log("Midle Token deployed to:", midleTokenAddress , "\n\n");

    console.log("Variables for verification:");
    console.log("TGE Timestamp:", tgeTimestamp);
    console.log("TGE + 15 Minutes Timestamp:", tgePlus15MinutesTimestamp);
    console.log("TGE + 30 Minutes Timestamp:", tgePlus30MinutesTimestamp);
    console.log("TGE + 3 Days Timestamp:", tgePlus3DaysTimestamp);

    // Deploy Vestings

    [vestingReceivers.advisorAddress.contract , advisorVestingAddress] = await deployVestingContract("AdvisorVesting", midleTokenAddress, tgeTimestamp);
    [vestingReceivers.communityRewardsAddress.contract , communityRewardsVestingAddress] = await deployVestingContract("CommunityRewardsVesting", midleTokenAddress, tgeTimestamp);
    [vestingReceivers.liquidityAddress.contract , liquidityVestingAddress] = await deployVestingContract("LiquidityVesting", midleTokenAddress, tgeTimestamp);
    [vestingReceivers.marketingAddress.contract , marketingVestingAddress] = await deployVestingContract("MarketingVesting", midleTokenAddress, tgeTimestamp);
    [vestingReceivers.teamAddress.contract , teamVestingAddress] = await deployVestingContract("TeamVesting", midleTokenAddress, tgeTimestamp);
    [vestingReceivers.treasuryAddress.contract , treasuryVestingAddress] = await deployVestingContract("TreasuryVesting", midleTokenAddress, tgeTimestamp);

    console.log("\n\nVesting deployments are done!\n\n");

    // Deploy Claims

    console.log("Airdrop claim deploy args : ", midleTokenAddress, tgePlus3DaysTimestamp)
    const [airdropClaim , airdropClaimAddress] = await deployVestingContract("AirdropClaim", midleTokenAddress, tgePlus3DaysTimestamp);
    const [kolClaim , kolClaimAddress] = await deployVestingContract("KolClaim", midleTokenAddress, tgePlus15MinutesTimestamp);
    const [privateClaim , privateClaimAddress] = await deployVestingContract("PrivateClaim", midleTokenAddress, tgePlus30MinutesTimestamp);
    const [publicClaim , publicClaimAddress] = await deployVestingContract("PublicClaim", midleTokenAddress, tgePlus15MinutesTimestamp);
    const [seedClaim , seedClaimAddress] = await deployVestingContract("SeedClaim", midleTokenAddress, tgePlus30MinutesTimestamp);
    const [strategicClaim , strategicClaimAddress] = await deployVestingContract("StrategicClaim", midleTokenAddress, tgePlus30MinutesTimestamp);

    console.log("\n\nClaim deployments are done!\n\n");

    // Transfer tokens to the vesting contracts

    await midle.connect(deployer).transfer(advisorVestingAddress, parse(tokenAllocations.advisor - vestingReceivers.advisorAddress.tgeAmount));
    console.log("Advisor tokens transferred!");
    await midle.connect(deployer).transfer(communityRewardsVestingAddress, parse(tokenAllocations.communityRewards - vestingReceivers.communityRewardsAddress.tgeAmount));
    console.log("Community Rewards tokens transferred!");
    await midle.connect(deployer).transfer(liquidityVestingAddress, parse(tokenAllocations.liquidity - vestingReceivers.liquidityAddress.tgeAmount));
    console.log("Liquidity tokens transferred!");
    await midle.connect(deployer).transfer(marketingVestingAddress, parse(tokenAllocations.marketing - vestingReceivers.marketingAddress.tgeAmount));
    console.log("Marketing tokens transferred!");
    await midle.connect(deployer).transfer(teamVestingAddress, parse(tokenAllocations.team - vestingReceivers.teamAddress.tgeAmount));
    console.log("Team tokens transferred!");
    await midle.connect(deployer).transfer(treasuryVestingAddress, parse(tokenAllocations.treasury - vestingReceivers.treasuryAddress.tgeAmount));
    console.log("Treasury tokens transferred!\n\n");

    // Transfer TGE tokens to the related addresses if there is any

    for (const [key, value] of Object.entries(vestingReceivers)) {
        allAddresses[key] = value.address;
        if (value.tgeAmount == 0) continue;
        await midle.connect(deployer).transfer(value.address, parse(value.tgeAmount));
        console.log(key + " TGE tokens transferred!");
    }

    // Transfer tokens to the claim contracts

    await midle.connect(deployer).transfer(airdropClaimAddress, parse(tokenAllocations.airdrop));
    console.log("\n\nAirdrop tokens transferred!");
    await midle.connect(deployer).transfer(kolClaimAddress, parse(tokenAllocations.kol));
    console.log("Kol tokens transferred!");
    await midle.connect(deployer).transfer(privateClaimAddress, parse(tokenAllocations.private));
    console.log("Private tokens transferred!");
    await midle.connect(deployer).transfer(publicClaimAddress, parse(tokenAllocations.public));
    console.log("Public tokens transferred!");
    await midle.connect(deployer).transfer(seedClaimAddress, parse(tokenAllocations.seed));
    console.log("Seed tokens transferred!");
    await midle.connect(deployer).transfer(strategicClaimAddress, parse(tokenAllocations.strategic));
    console.log("Strategic tokens transferred!");

    console.log("\n\nTransfers are done!\n\n");

    await seeBalances(midle , allAddresses);

    // Enter claim lists to the contracts

    console.log("\n\nWriting claims to contracts...\n\n");
    
    await writeClaims(deployer , seedClaim , 'seed', tokenAllocations.seed);
    await writeClaims(deployer , strategicClaim , 'strategic', tokenAllocations.strategic);
    await writeClaims(deployer , privateClaim , 'private', tokenAllocations.private);
    await writeClaims(deployer , publicClaim , 'public', tokenAllocations.public);
    await writeClaims(deployer , kolClaim , 'kol', tokenAllocations.kol);
    await writeClaims(deployer , airdropClaim , 'airdrop', tokenAllocations.airdrop);

}

function parse (num) {
    return ethers.parseEther(num.toString());
}

async function deployVestingContract(contractName, tokenAddress, _tgeTimestamp) {
    const contract = await hre.ethers.deployContract(contractName, [tokenAddress, _tgeTimestamp]);
    await contract.waitForDeployment();
    const contractAddress = await contract.getAddress();
    allAddresses[contractName] = contractAddress;
    console.log(contractName + " deployed to:", contractAddress);
    return [contract , contractAddress];
}

async function seeBalances(token , addresses) {
    let total = 0;
    await Promise.all(
        Object.entries(addresses).map(async ([key, value]) => {
            let balance = await token.balanceOf(value);
            balance = ethers.formatEther(balance.toString());
            total += Number(balance);
            console.log("Balance of", key, ":", balance);
        })
    );
    console.log("Total balance of all addresses:", total.toString());
}

async function seeDeployer() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address, "\n\n");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
