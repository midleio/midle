# midle-contracts

### Deployment

- Local Deployment:
npx hardhat run scripts/deploy.js --network hardhat 

- Testnet Deployment:
npx hardhat run scripts/deploy.js --network bsc_testnet 

- Mainnet Deployment 
npx hardhat run scripts/deploy.js --network bsc


### Cliff Calculation

The cliff calculation in the vesting contracts follows these rules:

1. TGE (Token Generation Event) Date: This is the starting point for all calculations
2. Cliff Period: Specified in months (e.g., cliff = 1 means 1 month cliff)
3. Lock Start Time: Calculated as `TGE Date + (cliff * 30 days)`
4. First Claim Availability:
   - If TGE Rate > 0: Users can claim TGE portion immediately on TGE date
   - If TGE Rate = 0: Users must wait until AFTER the first full period following Lock Start Time

Example:
- TGE Date: March 15th
- Cliff: 1 month
- Period: 1 day
- Lock Start Time: April 14th
- First Claim Date: April 15th (after one full period)

Note: The vesting calculation is based on completed periods after the Lock Start Time. This means users need to wait for both the cliff period AND the first vesting period to complete before their first claim (if TGE Rate is 0).