const hre = require("hardhat");
const { writeClaims } = require('./writeClaims.js');


async function main() {
    
    const tgeTimestamp = Date.parse("01 Jun 2024 00:00:00 GMT") / 1000;
    const airdropTgeTimestamp = Date.parse("02 Jun 2024 00:00:00 GMT") / 1000;

    const tokenAllocations = {
        advisor: 40 * 10 ** 6,
        communityRewards: 300 * 10 ** 6,
        liquidity: 120 * 10 ** 6,
        marketing: 100 * 10 ** 6,
        team: 80 * 10 ** 6,
        treasury: 40 * 10 ** 6,
        airdrop: 20 * 10 ** 6,
        kol: 20 * 10 ** 6,
        private: 100 * 10 ** 6,
        public: 60 * 10 ** 6,
        seed: 95 * 10 ** 6,
        strategic: 25 * 10 ** 6
    };
  
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address, "\n\n");

    // Deploy token contract
    const midle = await hre.ethers.deployContract("Midle");
    await midle.waitForDeployment();
    const midleTokenAddress = await midle.getAddress();
    console.log("Midle Token deployed to:", midleTokenAddress , "\n\n");

    // Deploy Vestings

    const [advisorVesting , advisorVestingAddress] = await deployVestingContract("AdvisorVesting", midleTokenAddress, tgeTimestamp);
    const [communityRewardsVesting , communityRewardsVestingAddress] = await deployVestingContract("CommunityRewardsVesting", midleTokenAddress, tgeTimestamp);
    const [liquidityVesting , liquidityVestingAddress] = await deployVestingContract("LiquidityVesting", midleTokenAddress, tgeTimestamp);
    const [marketingVesting , marketingVestingAddress] = await deployVestingContract("MarketingVesting", midleTokenAddress, tgeTimestamp);
    const [teamVesting , teamVestingAddress] = await deployVestingContract("TeamVesting", midleTokenAddress, tgeTimestamp);
    const [treasuryVesting , treasuryVestingAddress] = await deployVestingContract("TreasuryVesting", midleTokenAddress, tgeTimestamp);

    console.log("\n\nVesting deployments are done!\n\n");

    // Deploy Claims

    const [airdropClaim , airdropClaimAddress] = await deployVestingContract("AirdropClaim", midleTokenAddress, airdropTgeTimestamp);
    const [kolClaim , kolClaimAddress] = await deployVestingContract("KolClaim", midleTokenAddress, tgeTimestamp);
    const [privateClaim , privateClaimAddress] = await deployVestingContract("PrivateClaim", midleTokenAddress, tgeTimestamp);
    const [publicClaim , publicClaimAddress] = await deployVestingContract("PublicClaim", midleTokenAddress, tgeTimestamp);
    const [seedClaim , seedClaimAddress] = await deployVestingContract("SeedClaim", midleTokenAddress, tgeTimestamp);
    const [strategicClaim , strategicClaimAddress] = await deployVestingContract("StrategicClaim", midleTokenAddress, tgeTimestamp);

    console.log("\n\nClaim deployments are done!\n\n");

    // Transfer tokens to the contracts

    await midle.connect(deployer).transfer(advisorVestingAddress, parse(tokenAllocations.advisor));
    console.log("Advisor tokens transferred!");
    await midle.connect(deployer).transfer(communityRewardsVestingAddress, parse(tokenAllocations.communityRewards));
    console.log("Community Rewards tokens transferred!");
    await midle.connect(deployer).transfer(liquidityVestingAddress, parse(tokenAllocations.liquidity));
    console.log("Liquidity tokens transferred!");
    await midle.connect(deployer).transfer(marketingVestingAddress, parse(tokenAllocations.marketing));
    console.log("Marketing tokens transferred!");
    await midle.connect(deployer).transfer(teamVestingAddress, parse(tokenAllocations.team));
    console.log("Team tokens transferred!");
    await midle.connect(deployer).transfer(treasuryVestingAddress, parse(tokenAllocations.treasury));
    console.log("Treasury tokens transferred!");
    await midle.connect(deployer).transfer(airdropClaimAddress, parse(tokenAllocations.airdrop));
    console.log("Airdrop tokens transferred!");
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

    await Promise.all([
        midle.balanceOf(advisorVestingAddress),
        midle.balanceOf(communityRewardsVestingAddress),
        midle.balanceOf(liquidityVestingAddress),
        midle.balanceOf(marketingVestingAddress),
        midle.balanceOf(teamVestingAddress),
        midle.balanceOf(treasuryVestingAddress),
        midle.balanceOf(airdropClaimAddress),
        midle.balanceOf(kolClaimAddress),
        midle.balanceOf(privateClaimAddress),
        midle.balanceOf(publicClaimAddress),
        midle.balanceOf(seedClaimAddress),
        midle.balanceOf(strategicClaimAddress),
        midle.balanceOf(deployer.address)
    ]).then((values) => {
        console.log("Balance of advisorVesting:", ethers.formatEther(values[0].toString()));
        console.log("Balance of communityRewardsVesting:", ethers.formatEther(values[1].toString()));
        console.log("Balance of liquidityVesting:", ethers.formatEther(values[2].toString()));
        console.log("Balance of marketingVesting:", ethers.formatEther(values[3].toString()));
        console.log("Balance of teamVesting:", ethers.formatEther(values[4].toString()));
        console.log("Balance of treasuryVesting:", ethers.formatEther(values[5].toString()));
        console.log("Balance of airdropClaim:", ethers.formatEther(values[6].toString()));
        console.log("Balance of kolClaim:", ethers.formatEther(values[7].toString()));
        console.log("Balance of privateClaim:", ethers.formatEther(values[8].toString()));
        console.log("Balance of publicClaim:", ethers.formatEther(values[9].toString()));
        console.log("Balance of seedClaim:", ethers.formatEther(values[10].toString()));
        console.log("Balance of strategicClaim:", ethers.formatEther(values[11].toString()));
        console.log("Balance of deployer:", ethers.formatEther(values[12].toString()));
    }
    );

    // Enter claim lists to the contracts

    await writeClaims(deployer , seedClaim , 'seed');
    await writeClaims(deployer , strategicClaim , 'strategic');
    await writeClaims(deployer , privateClaim , 'private');
    await writeClaims(deployer , publicClaim , 'public');
    await writeClaims(deployer , kolClaim , 'kol');
    await writeClaims(deployer , airdropClaim , 'airdrop');

}

function parse (num) {
    return ethers.parseEther(num.toString());
}

async function deployVestingContract(contractName, tokenAddress, tgeTimestamp) {
    const contract = await hre.ethers.deployContract(contractName, [tokenAddress, tgeTimestamp]);
    await contract.waitForDeployment();
    const contractAddress = await contract.getAddress();
    console.log(contractName + " deployed to:", contractAddress);
    return [contract , contractAddress];
}

async function seeDeployer() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address, "\n\n");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
