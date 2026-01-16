# How to Run the Project

## Prerequisites Checklist

- [ ] Node.js installed (v18 or higher)
- [ ] MetaMask browser extension installed
- [ ] Contract deployed to Polygon Amoy (or ready to deploy)
- [ ] Polygon Amoy testnet MATIC in your wallet

---

## Step-by-Step Instructions

### Step 1: Navigate to Frontend Directory

```bash
cd client/Blockchaincrowdfundingplatform
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages including:
- React
- Vite
- ethers.js
- Tailwind CSS
- And all other dependencies

### Step 3: Update Contract Address

**Option A: If you already deployed the contract:**

1. Open `src/blockchain/config.js`
2. Find this line:
   ```javascript
   export const CONTRACT_ADDRESS = "0xYOUR_DEPLOYED_CONTRACT_ADDRESS";
   ```
3. Replace `0xYOUR_DEPLOYED_CONTRACT_ADDRESS` with your actual deployed contract address
4. Save the file

**Option B: If you need to deploy the contract first:**

1. Navigate to the web3 folder:
   ```bash
   cd ../../web3
   ```

2. Make sure you have a `.env` file with:
   ```
   AMOY_RPC=https://rpc-amoy.polygon.technology/
   PRIVATE_KEY=your_private_key_here
   ```

3. Deploy the contract:
   ```bash
   npx hardhat run scripts/verify/deploy.js --network amoy
   ```

4. Copy the contract address from the output
5. Go back to frontend and update `config.js` as in Option A

### Step 4: Get Test MATIC (if needed)

1. Visit [Polygon Faucet](https://faucet.polygon.technology/)
2. Select "Polygon Amoy" network
3. Enter your MetaMask wallet address
4. Request test MATIC tokens
5. Wait for tokens to arrive (usually instant)

### Step 5: Start the Development Server

```bash
npm run dev
```

You should see output like:
```
  VITE v6.3.5  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### Step 6: Open in Browser

1. Open your browser and go to: `http://localhost:5173`
2. The app should load

### Step 7: Connect Your Wallet

1. Click the **"Connect Wallet"** button in the header
2. MetaMask will pop up asking for permission
3. Click **"Connect"** or **"Next"** then **"Connect"**
4. If you're not on Polygon Amoy, you'll see a prompt to switch networks
5. Click **"OK"** to switch automatically, or manually switch in MetaMask

### Step 8: Test the Application

**View Campaigns:**
- Campaigns will automatically load from the blockchain
- If no campaigns exist, you'll see "No campaigns yet"

**Create a Campaign:**
1. Click **"Create"** in the navigation
2. Fill in the form:
   - Title
   - Description
   - Funding Goal (in MATIC)
   - Duration (days)
   - Image URL
3. Click **"Deploy Campaign on Blockchain"**
4. Approve the transaction in MetaMask
5. Wait for confirmation
6. Your campaign will appear!

**Donate to a Campaign:**
1. Click on any campaign
2. Click **"Back This Campaign"**
3. Enter amount (in MATIC)
4. Click **"Confirm Contribution"**
5. Approve transaction in MetaMask
6. Wait for confirmation

---

## Troubleshooting

### ❌ "Contract address not configured"
**Solution:** Update `CONTRACT_ADDRESS` in `src/blockchain/config.js`

### ❌ "MetaMask is not installed"
**Solution:** Install MetaMask browser extension from [metamask.io](https://metamask.io)

### ❌ "Please switch to Polygon Amoy testnet"
**Solution:** 
- Click OK when prompted, OR
- In MetaMask: Click network dropdown → Add Network → Enter:
  - Network Name: Polygon Amoy
  - RPC URL: https://rpc-amoy.polygon.technology/
  - Chain ID: 80002
  - Currency: MATIC
  - Block Explorer: https://amoy.polygonscan.com/

### ❌ "Insufficient funds"
**Solution:** Get test MATIC from [Polygon Faucet](https://faucet.polygon.technology/)

### ❌ "Transaction failed"
**Solution:**
- Check browser console (F12) for error details
- Ensure you have enough MATIC for gas
- Verify contract address is correct
- Make sure you're on Polygon Amoy network

### ❌ Port 5173 already in use
**Solution:** 
- Close other applications using that port, OR
- Run: `npm run dev -- --port 3000` (or any other port)

### ❌ "Cannot find module" errors
**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## Quick Command Reference

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# View production build locally
npm run preview
```

---

## Expected Behavior

✅ **On Load:**
- App loads at http://localhost:5173
- Shows loading spinner while fetching campaigns
- Displays campaigns from blockchain (or "No campaigns yet")

✅ **After Connecting Wallet:**
- Wallet address appears in header
- Button changes to show address (e.g., "0x742d...0bEb")
- Can create campaigns and donate

✅ **After Creating Campaign:**
- Transaction appears in MetaMask
- Toast notification shows success
- Campaign appears in explore page
- Can click to view details

✅ **After Donating:**
- Transaction appears in MetaMask
- Toast notification with transaction link
- Campaign raised amount updates
- Contribution appears in history

---

## Network Information

- **Network:** Polygon Amoy Testnet
- **Chain ID:** 80002
- **RPC URL:** https://rpc-amoy.polygon.technology/
- **Block Explorer:** https://amoy.polygonscan.com/
- **Currency:** MATIC (test tokens)

---

## Need Help?

1. Check browser console (F12) for errors
2. Verify contract address is correct
3. Ensure you're on Polygon Amoy network
4. Check you have test MATIC
5. Review the README.md for more details
