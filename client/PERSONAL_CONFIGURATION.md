# Personal Configuration Checklist

## ✅ Things You Need to Replace/Configure

### 1. **Contract Address** ⚠️ REQUIRED
**File:** `src/blockchain/config.js`

**Current:**
```javascript
export const CONTRACT_ADDRESS = "0x30732864C1fF27Cbe992F61Ed21783761Dc72911";
```

**Action:** 
- ✅ If this is your deployed contract address, you're good!
- ❌ If not, replace with your actual deployed contract address

**How to get it:**
- Check your deployment output when you ran: `npx hardhat run scripts/verify/deploy.js --network amoy`
- Or check Base Sepolia explorer: https://sepolia.basescan.org/ (search your wallet address)

---

### 2. **Web3 Environment Variables** (For Contract Deployment)
**File:** `web3/.env` (create this file if it doesn't exist)

**Required variables:**
```env
AMOY_RPC=https://sepolia.base.org
PRIVATE_KEY=your_private_key_here
```

**Action:**
- Create `.env` file in `web3/` folder
- Add your private key (NEVER commit this to git!)
- Add to `.gitignore` if not already there

**⚠️ SECURITY WARNING:**
- Never share your private key
- Never commit `.env` to version control
- Use a test account, not your main wallet

---

### 3. **MetaMask Wallet** (Runtime Configuration)
**Action:** 
- Install MetaMask browser extension
- Create or import a wallet
- Get test MATIC from faucet: https://faucet.polygon.technology/
- No code changes needed - handled at runtime

---

## ✅ Already Configured (No Changes Needed)

### Network Configuration
- ✅ Base Sepolia Chain ID: 84532
- ✅ RPC URL: https://sepolia.base.org
- ✅ Block Explorer: https://sepolia.basescan.org/
- ✅ Network name and currency settings

### ABI Configuration
- ✅ Contract ABI is already loaded from `CrowdFundingABI.json`
- ✅ All contract functions are properly configured

### UI Components
- ✅ All components are ready to use
- ✅ No hardcoded values need replacement

---

## 📋 Quick Checklist

Before running the project, ensure:

- [ ] **Contract Address** updated in `src/blockchain/config.js`
- [ ] **Web3 .env file** created with `AMOY_RPC` and `PRIVATE_KEY` (if deploying)
- [ ] **MetaMask** installed and set up
- [ ] **Test MATIC** obtained from faucet
- [ ] **Dependencies** installed (`npm install`)

---

## 🔍 How to Verify Your Configuration

### Check Contract Address:
```bash
# Open the file
cat src/blockchain/config.js

# Or check in your editor
# Look for: export const CONTRACT_ADDRESS = "0x..."
```

### Verify Contract is Deployed:
1. Go to https://sepolia.basescan.org/
2. Search for your contract address
3. Should show contract code and transactions

### Test Connection:
1. Run `npm run dev`
2. Open browser console (F12)
3. Connect wallet
4. Check for any errors related to contract address

---

## 🚨 Common Issues

### "Contract address not configured"
- **Fix:** Update `CONTRACT_ADDRESS` in `config.js`

### "Invalid contract address"
- **Fix:** Ensure address starts with `0x` and is 42 characters long
- **Example:** `0x30732864C1fF27Cbe992F61Ed21783761Dc72911`

### "Contract not found on network"
- **Fix:** Verify contract is deployed to Base Sepolia
- Check block explorer with your contract address

---

## 📝 Summary

**Minimum Required Changes:**
1. ✅ Contract Address in `src/blockchain/config.js` (if not already correct)

**Optional (for deployment):**
2. Web3 `.env` file with private key (only if deploying new contracts)

**Everything else is already configured!** 🎉
