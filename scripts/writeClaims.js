const hre = require("hardhat");
const { claimLists } = require("./claimLists");


async function writeClaims( _signer , _contract,  claimListType, totalAllocation=0 ) {
    let claimList = claimLists[claimListType];
    
    const totalAmount = claimList.amounts.reduce((sum, amount) => 
        BigInt(sum) + BigInt(hre.ethers.parseUnits(amount.toString(), "ether")), 
        BigInt(0)
    );
    console.log(`\nTotal amount to be locked for ${claimListType}: ${hre.ethers.formatUnits(totalAmount, "ether")} tokens`);
    
    if (totalAllocation > 0) {
        const totalAllocationBigInt = BigInt(hre.ethers.parseUnits(totalAllocation.toString(), "ether"));
        const notLockedAmount = totalAllocationBigInt - totalAmount;
        console.log(`Total allocation: ${hre.ethers.formatUnits(totalAllocationBigInt, "ether")}, not locked amount: ${Number(hre.ethers.formatUnits(notLockedAmount, "ether"))}`);
    }
    
    const bulkClaimEnterCount = 300;

    if (claimList.users.length == 0 || claimList.amounts.length == 0 || 
        claimList.users.length != claimList.amounts.length
    ) {
        console.log('something wrong with the ' , claimListType , ' list.');
        return
    }

    const division = claimList.users.length / bulkClaimEnterCount;
    const transactionCount = Math.floor(division) == division ?  
    division : Math.floor(division) + 1;

    console.log('\nTransaction count for', claimListType , 'claim : ' , transactionCount, '\n');

    for (let i = 0; i < transactionCount; i++) {
        let users = claimList.users.slice(
            i * bulkClaimEnterCount ,
            (i+1) * bulkClaimEnterCount
        );
        
        let amounts = claimList.amounts.slice(
            i * bulkClaimEnterCount ,
            (i+1) * bulkClaimEnterCount
        );

        for (j = 0; j < amounts.length; j++) {
            amounts[j] = hre.ethers.parseEther(amounts[j].toString());
        }

        try {
            let tx = await _contract.lockTokensMultiple(users, amounts);
            await tx.wait();
            console.log(claimListType ,' tx ', i+1 , ' done');
        } catch (error) {
            console.log(error);
            console.log(claimListType ,' tx ', i+1 , ' FAILED');
        }
    }

    console.log(claimListType ,' transactions are done.\n\n');

}


module.exports = {
    writeClaims : writeClaims,
}