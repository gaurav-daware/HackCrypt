import "@nomicfoundation/hardhat-toolbox";
import dotenv from "dotenv";

dotenv.config();

/** @type import("hardhat/config").HardhatUserConfig */
const config = {
  solidity: "0.8.20",
  networks: {
    baseGoerli: {
      url: process.env.BASE_GOERLI_RPC,
      accounts: [process.env.PRIVATE_KEY],
      chainId: 84531,
    },
    localhost: {
    url: "http://127.0.0.1:8545",
  },
  },
};

export default config;
