const { expect } = require("chai");
const { ethers } = require("hardhat");
const { writeClaims } = require('../scripts/writeClaims.js');
const { claimLists } = require('../scripts/claimLists.js');


describe("Midle Token Deployment Tests", function () {
    let midle;
    let owner;
    let addrs;
    const tgeTimestamp = Math.floor(Date.now() / 1000) - 3600 * 24; // 1 days before from now

    const tokenAllocations = {
        advisor: 40 * 10 ** 6,
        communityRewards: 240 * 10 ** 6,
        liquidity: 210 * 10 ** 6,
        marketing: 50 * 10 ** 6,
        team: 80 * 10 ** 6,
        treasury: 40 * 10 ** 6,
        airdrop: 20 * 10 ** 6,
        kol: 6666667, // 6.666M
        private: 100 * 10 ** 6,
        public: 15 * 10 ** 6,
        seed: 97 * 10 ** 6,
        strategic: 3 * 10 ** 6
    };


    const vestingReceivers = {
        advisorAddress: {
            address: "0x4B7f6bc11e392Ed82913E01fA9B0488770668a59",
            tgeAmount: 0, // 0%
            lockAmount: tokenAllocations.advisor, // 100%
        },
        communityRewardsAddress: {
            address: "0x8cA38aC9C38C87896A8eFa65e6eacc9dbdCE78ec",
            tgeAmount: 0, // 0%
            lockAmount: tokenAllocations.communityRewards, // 100%
        },
        liquidityAddress: {
            address: "0xDFfb0b8c75ecCBdaB76Af41077addf6366d51bb1",
            tgeAmount: 0, // 0%
            lockAmount: tokenAllocations.liquidity, // 100%
        },
        marketingAddress: {
            address: "0xB871989554b35F0F3D4406b839DF63EA88C7757E",
            tgeAmount: 0, // 0%
            lockAmount: tokenAllocations.marketing, // 100%
        },
        teamAddress: {
            address: "0x5f64E510E6c78A25226D473592e2B471b84DD7c1",
            tgeAmount: 0, // 0%
            lockAmount: tokenAllocations.team, // 100%
        },
        treasuryAddress: {
            address: "0xFfA55B79e8475Ae276F83f17c559B74bEBf7d6CC",
            tgeAmount: 0, // 0%
            lockAmount: tokenAllocations.treasury, // 100%
        },
    };

    beforeEach(async function () {
        [owner, ...addrs] = await ethers.getSigners();
        
        // Deploy Midle token
        const Midle = await ethers.getContractFactory("Midle");
        midle = await Midle.deploy();
        await midle.waitForDeployment();
    });

    describe("Vesting Contract Deployments", function () {
        let vestingContracts = {};
        let vestingAddresses = {};

        beforeEach(async function () {
            // Deploy all vesting contracts
            const vestingTypes = [
                "AdvisorVesting",
                "CommunityRewardsVesting",
                "LiquidityVesting",
                "MarketingVesting",
                "TeamVesting",
                "TreasuryVesting"
            ];

            for (const vestingType of vestingTypes) {
                const Contract = await ethers.getContractFactory(vestingType);
                const contract = await Contract.deploy(await midle.getAddress(), tgeTimestamp);
                await contract.waitForDeployment();
                vestingContracts[vestingType] = contract;
                vestingAddresses[vestingType] = await contract.getAddress();
            }
        });

        it("Should deploy all vesting contracts with correct parameters", async function () {
            for (const [name, contract] of Object.entries(vestingContracts)) {
                expect(await contract.midleTokenAddress()).to.equal(await midle.getAddress());
                expect(await contract.tgeTimestamp()).to.equal(tgeTimestamp);
            }
        });

        it("Should transfer correct amounts to vesting contracts and receivers", async function () {
            const vestingMap = {
                "advisorAddress": "AdvisorVesting",
                "communityRewardsAddress": "CommunityRewardsVesting",
                "liquidityAddress": "LiquidityVesting",
                "marketingAddress": "MarketingVesting",
                "teamAddress": "TeamVesting",
                "treasuryAddress": "TreasuryVesting"
            };

            for (const [key, value] of Object.entries(vestingReceivers)) {
                const contractName = vestingMap[key];
                if (!contractName || !vestingAddresses[contractName]) continue;
                
                const contractAddress = vestingAddresses[contractName];
                
                // Transfer locked amount to vesting contract
                const lockAmount = ethers.parseEther(value.lockAmount.toString());
                await midle.transfer(contractAddress, lockAmount);
                expect(await midle.balanceOf(contractAddress)).to.equal(lockAmount);

                // Transfer TGE amount to receiver address if any
                if (value.tgeAmount > 0) {
                    const tgeAmount = ethers.parseEther(value.tgeAmount.toString());
                    await midle.transfer(value.address, tgeAmount);
                    expect(await midle.balanceOf(value.address)).to.equal(tgeAmount);
                }
            }
        });

        it("Should show correct vesting info for all receivers", async function () {
            const vestingMap = {
                "advisorAddress": "AdvisorVesting",
                "communityRewardsAddress": "CommunityRewardsVesting",
                "liquidityAddress": "LiquidityVesting",
                "marketingAddress": "MarketingVesting",
                "teamAddress": "TeamVesting",
                "treasuryAddress": "TreasuryVesting"
            };


            for (const [key, value] of Object.entries(vestingReceivers)) {
                const contractName = vestingMap[key];
                if (!contractName || !vestingAddresses[contractName]) continue;
                
                const contractAddress = vestingAddresses[contractName];
                const lockAmount = ethers.parseEther(value.lockAmount.toString());
                await midle.transfer(contractAddress, lockAmount);
            }


            for (const [key, value] of Object.entries(vestingReceivers)) {
                const contractName = vestingMap[key];
                if (!contractName || !vestingAddresses[contractName]) continue;

                const contract = vestingContracts[contractName];
                const vestingInfo = await contract.getNextVestingInfo(value.address);
                console.log(`\nTGE is  ${new Date(Number(tgeTimestamp) * 1000).toLocaleString()}:`);
                console.log(`Vesting Info for ${contractName}:`);
                console.log("Next Vesting Time:", new Date(Number(vestingInfo[0]) * 1000).toLocaleString());
                console.log("Next Total Vesting Amount:", ethers.formatEther(vestingInfo[1]));
                console.log("Total Amount:", ethers.formatEther(vestingInfo[2]));
                console.log("Claimed So Far:", ethers.formatEther(vestingInfo[3]));
                console.log("Claimable Amount Now:", ethers.formatEther(vestingInfo[4]));
            }
        });
    });

    describe("Claim Contract Deployments", function () {
        let claimContracts = {};
        let claimAddresses = {};
        let vestingContracts = {};
        let vestingAddresses = {};
        const tgePlus15MinutesTimestamp = tgeTimestamp + 15 * 60;
        const tgePlus30MinutesTimestamp = tgeTimestamp + 30 * 60;
        const tgePlus3DaysTimestamp = tgeTimestamp + 2 * 24 * 60 * 60;

        beforeEach(async function () {
            // Deploy vesting contracts first
            const vestingTypes = [
                "AdvisorVesting",
                "CommunityRewardsVesting",
                "LiquidityVesting",
                "MarketingVesting",
                "TeamVesting",
                "TreasuryVesting"
            ];

            for (const vestingType of vestingTypes) {
                const Contract = await ethers.getContractFactory(vestingType);
                const contract = await Contract.deploy(await midle.getAddress(), tgeTimestamp);
                await contract.waitForDeployment();
                vestingContracts[vestingType] = contract;
                vestingAddresses[vestingType] = await contract.getAddress();
            }

            // Deploy claim contracts
            const claimConfigs = {
                "AirdropClaim": tgePlus3DaysTimestamp,
                "KolClaim": tgePlus15MinutesTimestamp,
                "PrivateClaim": tgePlus30MinutesTimestamp,
                "PublicClaim": tgePlus15MinutesTimestamp,
                "SeedClaim": tgePlus30MinutesTimestamp,
                "StrategicClaim": tgePlus30MinutesTimestamp
            };

            for (const [claimType, timestamp] of Object.entries(claimConfigs)) {
                const Contract = await ethers.getContractFactory(claimType);
                const contract = await Contract.deploy(await midle.getAddress(), timestamp);
                await contract.waitForDeployment();
                claimContracts[claimType] = contract;
                claimAddresses[claimType] = await contract.getAddress();
            }
        });

        it("Should deploy all claim contracts with correct parameters", async function () {
            const claimTimestamps = {
                "AirdropClaim": tgePlus3DaysTimestamp,
                "KolClaim": tgePlus15MinutesTimestamp,
                "PrivateClaim": tgePlus30MinutesTimestamp,
                "PublicClaim": tgePlus15MinutesTimestamp,
                "SeedClaim": tgePlus30MinutesTimestamp,
                "StrategicClaim": tgePlus30MinutesTimestamp
            };

            for (const [name, contract] of Object.entries(claimContracts)) {
                expect(await contract.midleTokenAddress()).to.equal(await midle.getAddress());
                expect(await contract.tgeTimestamp()).to.equal(claimTimestamps[name]);
            }
        });

        it("Should transfer correct amounts to claim contracts", async function () {
            const transferConfigs = {
                "AirdropClaim": tokenAllocations.airdrop,
                "KolClaim": tokenAllocations.kol,
                "PrivateClaim": tokenAllocations.private,
                "PublicClaim": tokenAllocations.public,
                "SeedClaim": tokenAllocations.seed,
                "StrategicClaim": tokenAllocations.strategic
            };

            for (const [name, amount] of Object.entries(transferConfigs)) {
                const transferAmount = ethers.parseEther(amount.toString());
                await midle.transfer(claimAddresses[name], transferAmount);
                expect(await midle.balanceOf(claimAddresses[name])).to.equal(transferAmount);
            }
        });

        it("Should write claims, show vesting info, and allow claims", async function () {
            // Transfer tokens to vesting contracts first
            const vestingMap = {
                "advisorAddress": "AdvisorVesting",
                "communityRewardsAddress": "CommunityRewardsVesting",
                "liquidityAddress": "LiquidityVesting",
                "marketingAddress": "MarketingVesting",
                "teamAddress": "TeamVesting",
                "treasuryAddress": "TreasuryVesting"
            };

            for (const [key, value] of Object.entries(vestingReceivers)) {
                const contractName = vestingMap[key];
                if (!contractName || !vestingAddresses[contractName]) continue;
                
                const contractAddress = vestingAddresses[contractName];
                const lockAmount = ethers.parseEther(value.lockAmount.toString());
                await midle.transfer(contractAddress, lockAmount);
            }

            // Transfer tokens to all claim contracts
            for (const [name, amount] of Object.entries(tokenAllocations)) {
                if (["airdrop", "kol", "private", "public", "seed", "strategic"].includes(name)) {
                    const transferAmount = ethers.parseEther(amount.toString());
                    const contractName = name.charAt(0).toUpperCase() + name.slice(1) + "Claim";
                    await midle.transfer(claimAddresses[contractName], transferAmount);
                }
            }

            // Write all claims in one go
            const claimTypes = ['seed', 'strategic', 'private', 'public', 'kol', 'airdrop'];
            for (const claimType of claimTypes) {
                const contractName = claimType.charAt(0).toUpperCase() + claimType.slice(1) + "Claim";
                await writeClaims(owner, claimContracts[contractName], claimType, tokenAllocations[claimType]);
            }

            console.log("\nTGE is", new Date(Number(tgeTimestamp) * 1000).toLocaleString());
            
            // Check and claim from vesting contracts first
            console.log("\nVESTING CONTRACT CLAIMS");
            for (const [key, value] of Object.entries(vestingReceivers)) {
                const contractName = vestingMap[key];
                if (!contractName || !vestingAddresses[contractName]) continue;

                const contract = vestingContracts[contractName];
                const vestingInfo = await contract.getNextVestingInfo(value.address);
                
                console.log(`\nVesting Info for ${contractName}:`);
                console.log("Next Vesting Time:", new Date(Number(vestingInfo[0]) * 1000).toLocaleString());
                console.log("Next Total Vesting Amount:", ethers.formatEther(vestingInfo[1]));
                console.log("Total Amount:", ethers.formatEther(vestingInfo[2]));
                console.log("Claimed So Far:", ethers.formatEther(vestingInfo[3]));
                console.log("Claimable Amount Now:", ethers.formatEther(vestingInfo[4]));

                // Test claiming if there's a claimable amount
                if (vestingInfo[4] > 0n) {
                    // Fund the account with ETH for gas
                    await owner.sendTransaction({
                        to: value.address,
                        value: ethers.parseEther("1.0")
                    });
                    
                    // Impersonate the vesting receiver
                    await hre.network.provider.request({
                        method: "hardhat_impersonateAccount",
                        params: [value.address],
                    });
                    const signer = await ethers.provider.getSigner(value.address);

                    // Get balance before claim
                    const balanceBefore = await midle.balanceOf(value.address);
                    
                    // Claim tokens
                    await contract.connect(signer).claim();
                    
                    // Get balance after claim
                    const balanceAfter = await midle.balanceOf(value.address);
                    
                    console.log(`${contractName} claimed ${ethers.formatEther(vestingInfo[4])} tokens`);
                    console.log(`Balance before: ${ethers.formatEther(balanceBefore)}`);
                    console.log(`Balance after: ${ethers.formatEther(balanceAfter)}`);
                    expect(balanceAfter - balanceBefore).to.equal(vestingInfo[4]);

                    // Stop impersonating
                    await hre.network.provider.request({
                        method: "hardhat_stopImpersonatingAccount",
                        params: [value.address],
                    });
                } else {
                    console.log(`Nothing to claim for ${contractName} vesting`);
                }
            }
            
            // Check and claim from claim contracts
            console.log("\nCLAIM CONTRACT CLAIMS");

            // Log current block timestamp
            const currentBlock = await ethers.provider.getBlock('latest');
            console.log("\nCurrent block timestamp:", new Date(Number(currentBlock.timestamp) * 1000).toLocaleString());
            const sampleUsers = {
                "AirdropClaim": "0xa00e80e8b2a170e5a53f927f8c312c02a6ee5a11",
                "KolClaim": "0xE484A833e2b0516F5b3F851fDE3F462B365716Da",
                "PrivateClaim": "0xb160243b352F1c86D753147F9D15Be7A318C8D53",
                "PublicClaim": "0x3141e6325cd40951729fafafa966b3a251db3268",
                "SeedClaim": "0x167AbcAA7124eD11577691263d53CFf85DBeB053",
                "StrategicClaim": "0x63174dadbe7f9a816da937914b8a07a4aafd6cf4"
            };


            console.log("\nTGE is", new Date(Number(tgeTimestamp) * 1000).toLocaleString());
            
            
            console.log("\nTGE is", new Date(Number(tgeTimestamp) * 1000).toLocaleString());
            
            // Check vesting info for each claim type
            for (const [contractName, userAddress] of Object.entries(sampleUsers)) {
                const contract = claimContracts[contractName];
                const vestingInfo = await contract.getNextVestingInfo(userAddress);
                
                console.log(`\nVesting Info for ${contractName} user ${userAddress}:`);
                console.log("Next Vesting Time:", new Date(Number(vestingInfo[0]) * 1000).toLocaleString());
                console.log("Next Total Vesting Amount:", ethers.formatEther(vestingInfo[1]));
                console.log("Total Amount:", ethers.formatEther(vestingInfo[2]));
                console.log("Claimed So Far:", ethers.formatEther(vestingInfo[3]));
                console.log("Claimable Amount Now:", ethers.formatEther(vestingInfo[4]));

                // Test claiming if there's a claimable amount
                if (vestingInfo[4] > 0n) {
                    // Fund the account with ETH for gas
                    await owner.sendTransaction({
                        to: userAddress,
                        value: ethers.parseEther("1.0")
                    });
                    
                    // Impersonate the user
                    await hre.network.provider.request({
                        method: "hardhat_impersonateAccount",
                        params: [userAddress],
                    });
                    const signer = await ethers.provider.getSigner(userAddress);

                    // Get balance before claim
                    const balanceBefore = await midle.balanceOf(userAddress);
                    
                    // Claim tokens
                    await contract.connect(signer).claim();
                    
                    // Get balance after claim
                    const balanceAfter = await midle.balanceOf(userAddress);
                    
                    console.log(`${contractName} user claimed ${ethers.formatEther(vestingInfo[4])} tokens`);
                    console.log(`Balance before: ${ethers.formatEther(balanceBefore)}`);
                    console.log(`Balance after: ${ethers.formatEther(balanceAfter)}`);
                    expect(balanceAfter - balanceBefore).to.equal(vestingInfo[4]);

                    // Stop impersonating
                    await hre.network.provider.request({
                        method: "hardhat_stopImpersonatingAccount",
                        params: [userAddress],
                    });
                } else {
                    console.log(`Nothing to claim for ${contractName} user`);
                }
            }

            // Check random addresses from each claim list
            const getRandomIndices = (max, count) => {
                const indices = new Set();
                while (indices.size < count) {
                    indices.add(Math.floor(Math.random() * max));
                }
                return Array.from(indices);
            };

            for (const [claimType, list] of Object.entries(claimLists)) {
                const contractName = claimType.charAt(0).toUpperCase() + claimType.slice(1) + "Claim";
                const contract = claimContracts[contractName];
                const randomIndices = getRandomIndices(list.users.length, 7);

                console.log(`\n${contractName} Random Users:`);
                for (const idx of randomIndices) {
                    const userAddress = list.users[idx];
                    const vestingInfo = await contract.getNextVestingInfo(userAddress);
                    console.log(`\nWallet: ${userAddress} , ${ethers.formatEther(vestingInfo[2])} tokens`);
                }
            }
        });
    });
});
