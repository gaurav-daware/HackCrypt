# Quick Setup Guide

## Step 1: Update Contract Address

Edit `src/blockchain/config.js`:

```javascript
export const CONTRACT_ADDRESS = "0xYOUR_ACTUAL_CONTRACT_ADDRESS";
```

## Step 2: Install Dependencies

```bash
npm install
```

## Step 3: Get Test MATIC

1. Visit https://faucet.polygon.technology/
2. Select "Polygon Amoy"
3. Enter your wallet address
4. Request tokens

## Step 4: Run the App

```bash
npm run dev
```

## Step 5: Connect Wallet

1. Click "Connect Wallet" in the header
2. Approve MetaMask connection
3. Switch to Polygon Amoy if prompted

## Important Notes

⚠️ **Contract Address**: You MUST update the contract address in `config.js` before using the app.

⚠️ **Network**: The app requires Polygon Amoy testnet. It will automatically prompt you to switch.

⚠️ **Test Tokens**: You need Polygon Amoy MATIC for gas fees. Get them from the faucet.

## File Structure

```
src/blockchain/
├── config.js              ← UPDATE CONTRACT ADDRESS HERE
├── wallet.js              ← Wallet connection logic
├── contract.js            ← Contract interaction functions
└── CrowdFundingABI.json   ← Contract ABI (already configured)
```

## Testing Checklist

- [ ] Contract address updated in config.js
- [ ] Dependencies installed (npm install)
- [ ] MetaMask installed and connected
- [ ] Polygon Amoy network added to MetaMask
- [ ] Test MATIC obtained from faucet
- [ ] Can connect wallet successfully
- [ ] Can view campaigns (if any exist)
- [ ] Can create a new campaign
- [ ] Can donate to a campaign

## Common Issues

**"Contract address not configured"**
→ Update CONTRACT_ADDRESS in src/blockchain/config.js

**"Please switch to Polygon Amoy"**
→ Click OK when prompted, or manually add the network

**"Insufficient funds"**
→ Get test MATIC from the faucet

**"Transaction failed"**
→ Check browser console for detailed error message
