# Blockchain Crowdfunding Platform

A decentralized crowdfunding platform built with React, Vite, and Solidity smart contracts deployed on Base Sepolia testnet.

## Features

- ✅ **MetaMask Wallet Integration** - Connect your wallet and interact with the blockchain
- ✅ **Create Campaigns** - Deploy campaigns directly on the blockchain
- ✅ **View Campaigns** - Load and display all campaigns from the blockchain
- ✅ **Donate to Campaigns** - Contribute MATIC to campaigns with real-time updates
- ✅ **Base Sepolia Network** - Automatic network detection and switching
- ✅ **Real-time Blockchain Data** - All data is fetched directly from smart contracts
- ✅ **Transaction History** - View all contributions on-chain
- ✅ **Responsive UI** - Modern, beautiful interface built with Tailwind CSS

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MetaMask browser extension installed
- Base Sepolia testnet MATIC (get from [Polygon Faucet](https://faucet.polygon.technology/))

## Setup Instructions

### 1. Install Dependencies

```bash
cd client/Blockchaincrowdfundingplatform
npm install
```

### 2. Configure Contract Address

Edit `src/blockchain/config.js` and replace the placeholder with your deployed contract address:

```javascript
export const CONTRACT_ADDRESS = "0xYOUR_DEPLOYED_CONTRACT_ADDRESS";
```

**Important:** Make sure you have deployed your contract to Base Sepolia testnet and have the correct address.

### 3. Get Base Sepolia Testnet MATIC

1. Visit [Polygon Faucet](https://faucet.polygon.technology/)
2. Select "Base Sepolia" network
3. Enter your wallet address
4. Request test MATIC tokens

### 4. Configure MetaMask

The app will automatically prompt you to switch to Base Sepolia network. If you need to add it manually:

1. Open MetaMask
2. Click on the network dropdown
3. Select "Add Network" or "Add a network manually"
4. Enter the following details:
   - **Network Name:** Base Sepolia
   - **RPC URL:** https://sepolia.base.org
   - **Chain ID:** 84532
   - **Currency Symbol:** MATIC
   - **Block Explorer:** https://sepolia.basescan.org/

### 5. Run the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173` (or the port shown in the terminal).

## Project Structure

```
client/Blockchaincrowdfundingplatform/
├── src/
│   ├── blockchain/          # Web3 integration files
│   │   ├── config.js       # Network and contract configuration
│   │   ├── wallet.js        # MetaMask wallet connection utilities
│   │   ├── contract.js     # Smart contract interaction functions
│   │   └── CrowdFundingABI.json  # Contract ABI
│   ├── components/         # React components
│   │   ├── Header.tsx      # Navigation and wallet connection
│   │   ├── CampaignList.tsx # Campaign listing
│   │   ├── CampaignDetail.tsx # Campaign details and donations
│   │   ├── CreateCampaign.tsx # Campaign creation form
│   │   └── ...
│   ├── App.tsx             # Main application component
│   └── main.tsx            # Application entry point
└── package.json
```

## Usage

### Connecting Your Wallet

1. Click the "Connect Wallet" button in the header
2. Approve the MetaMask connection request
3. If you're not on Base Sepolia, the app will prompt you to switch networks
4. Once connected, your wallet address will be displayed

### Creating a Campaign

1. Click "Create" in the navigation
2. Fill in the campaign details:
   - Title
   - Description
   - Funding Goal (in MATIC)
   - Duration (in days)
   - Campaign Image URL
3. Click "Deploy Campaign on Blockchain"
4. Approve the transaction in MetaMask
5. Wait for transaction confirmation
6. Your campaign will appear in the explore page

### Donating to a Campaign

1. Browse campaigns in the "Explore" section
2. Click on a campaign to view details
3. Click "Back This Campaign"
4. Enter the donation amount (in MATIC)
5. Click "Confirm Contribution"
6. Approve the transaction in MetaMask
7. Wait for confirmation
8. Your contribution will be reflected immediately

### Viewing Campaigns

- All campaigns are loaded directly from the blockchain
- Click the refresh button to reload campaigns
- Use the search and filter options to find specific campaigns

## Smart Contract Functions

The platform uses the following smart contract functions:

- `createCampaign()` - Create a new crowdfunding campaign
- `donateToCampaign(uint256 _id)` - Donate to a campaign
- `getCampaigns()` - Get all campaigns
- `getDonators(uint256 _id)` - Get donators for a specific campaign
- `numberOfCampaigns()` - Get total number of campaigns

## Network Information

- **Network:** Base Sepolia Testnet
- **Chain ID:** 84532
- **RPC URL:** https://sepolia.base.org
- **Block Explorer:** https://sepolia.basescan.org/
- **Currency:** MATIC (test tokens)

## Troubleshooting

### "MetaMask is not installed"
- Install the MetaMask browser extension
- Refresh the page

### "Please switch to Base Sepolia testnet"
- The app will automatically prompt you to switch
- Click "OK" when prompted
- If it doesn't work, manually add the network (see Setup Instructions)

### "Contract address not configured"
- Edit `src/blockchain/config.js`
- Replace `0xYOUR_DEPLOYED_CONTRACT_ADDRESS` with your actual contract address

### "Insufficient funds"
- Get test MATIC from the [Polygon Faucet](https://faucet.polygon.technology/)
- Make sure you're on Base Sepolia network

### "Transaction failed"
- Check that you have enough MATIC for gas fees
- Ensure you're on the correct network (Base Sepolia)
- Verify the contract address is correct

## Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Technologies Used

- **React 18** - UI framework
- **Vite** - Build tool
- **TypeScript** - Type safety
- **ethers.js v6** - Ethereum library
- **Tailwind CSS** - Styling
- **Radix UI** - UI components
- **Sonner** - Toast notifications
- **Solidity** - Smart contracts
- **Hardhat** - Development environment
- **Base Sepolia** - Test network

## Security Notes

- This is a testnet application - do not use real funds
- Always verify contract addresses before interacting
- Never share your private keys or seed phrases
- Test thoroughly before deploying to mainnet

## License

This project is for educational purposes.

## Support

For issues or questions:
1. Check the troubleshooting section
2. Verify your contract is deployed correctly
3. Ensure you're on the correct network
4. Check browser console for error messages
