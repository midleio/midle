const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Midle Token Tests", function () {
    let midle;
    let owner;
    let addr1;
    let addr2;
    let addrs;
    const MAX_SUPPLY = ethers.parseEther("1000000000"); // 1 billion tokens

    // Deploy a new token before each test
    beforeEach(async function () {
        [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
        
        const Midle = await ethers.getContractFactory("Midle");
        midle = await Midle.deploy();
        await midle.waitForDeployment();
    });

    describe("Deployment", function () {
        it("Should have correct name and symbol", async function () {
            expect(await midle.name()).to.equal("MIDLE");
            expect(await midle.symbol()).to.equal("MIDLE");
        });

        it("Should have correct MAX_SUPPLY", async function () {
            expect(await midle.MAX_SUPPLY()).to.equal(MAX_SUPPLY);
        });

        it("Should mint total supply to owner", async function () {
            const ownerBalance = await midle.balanceOf(owner.address);
            expect(await midle.totalSupply()).to.equal(MAX_SUPPLY);
            expect(ownerBalance).to.equal(MAX_SUPPLY);
        });
    });

    describe("Transactions", function () {
        it("Should transfer tokens between accounts", async function () {
            const transferAmount = ethers.parseEther("50");
            await midle.transfer(addr1.address, transferAmount);
            
            expect(await midle.balanceOf(addr1.address)).to.equal(transferAmount);

            await midle.connect(addr1).transfer(addr2.address, transferAmount);
            
            expect(await midle.balanceOf(addr2.address)).to.equal(transferAmount);
            expect(await midle.balanceOf(addr1.address)).to.equal(0);
        });

        it("Should fail if sender doesn't have enough tokens", async function () {
            const initialOwnerBalance = await midle.balanceOf(owner.address);
            
            await expect(
                midle.connect(addr1).transfer(owner.address, 1)
            ).to.be.revertedWith("ERC20: transfer amount exceeds balance");

            expect(await midle.balanceOf(owner.address)).to.equal(initialOwnerBalance);
        });
    });

    describe("Burning", function () {
        it("Should allow users to burn their tokens", async function () {
            const burnAmount = ethers.parseEther("1000");
            
            // First transfer some tokens to addr1
            await midle.transfer(addr1.address, burnAmount);
            const initialSupply = await midle.totalSupply();
            
            // Burn tokens
            await midle.connect(addr1).burn(burnAmount);
            
            // Check balances and supply
            expect(await midle.balanceOf(addr1.address)).to.equal(0);
            expect(await midle.totalSupply()).to.equal(initialSupply - burnAmount);
        });

        it("Should fail if trying to burn more tokens than owned", async function () {
            const burnAmount = ethers.parseEther("1");
            
            await expect(
                midle.connect(addr1).burn(burnAmount)
            ).to.be.revertedWith("ERC20: burn amount exceeds balance");
        });
    });

    describe("ERC20Permit", function () {
        it("Should process permit correctly", async function () {
            const value = ethers.parseEther("100");
            const deadline = ethers.MaxUint256;
            
            // Get the current nonce
            const nonce = await midle.nonces(owner.address);
            
            // Get the EIP712 domain separator
            const domainSeparator = await midle.DOMAIN_SEPARATOR();
            
            // Create the permit signature
            const signature = await owner.signTypedData(
                // Domain
                {
                    name: "MIDLE",
                    version: "1",
                    chainId: (await ethers.provider.getNetwork()).chainId,
                    verifyingContract: await midle.getAddress()
                },
                // Types
                {
                    Permit: [
                        { name: "owner", type: "address" },
                        { name: "spender", type: "address" },
                        { name: "value", type: "uint256" },
                        { name: "nonce", type: "uint256" },
                        { name: "deadline", type: "uint256" }
                    ]
                },
                // Values
                {
                    owner: owner.address,
                    spender: addr1.address,
                    value: value,
                    nonce: nonce,
                    deadline: deadline
                }
            );

            const { v, r, s } = ethers.Signature.from(signature);

            // Execute the permit
            await midle.permit(owner.address, addr1.address, value, deadline, v, r, s);

            // Check the allowance
            expect(await midle.allowance(owner.address, addr1.address)).to.equal(value);
        });
    });
});
