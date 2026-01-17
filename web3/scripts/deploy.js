const hre = require("hardhat");

async function main() {
    console.log("Deploying Crowdfunding contract...");

    const crowdfund = await hre.ethers.deployContract("CrowdFunding");

    await crowdfund.waitForDeployment();

    const address = await crowdfund.getAddress();

    console.log(`Crowdfunding deployed to: ${address}`);

    // Update config.js
    const fs = require("fs");
    const path = require("path");

    // Assuming script is run from 'web3' root, so client is ../client
    const configPath = path.join(__dirname, "../../client/src/blockchain/config.js");

    if (fs.existsSync(configPath)) {
        let configContent = fs.readFileSync(configPath, "utf8");
        const newConfigContent = configContent.replace(
            /export const CONTRACT_ADDRESS = ".*";/,
            `export const CONTRACT_ADDRESS = "${address}";`
        );
        fs.writeFileSync(configPath, newConfigContent);
        console.log(`Updated contract address in ${configPath}`);
    } else {
        console.error("Could not find config.js to update address");
    }

    // Update ABI
    const artifactPath = path.join(__dirname, "../artifacts/contracts/CrowdFunding.sol/CrowdFunding.json");
    const abiDestination = path.join(__dirname, "../../client/src/blockchain/CrowdFundingABI.json");

    if (fs.existsSync(artifactPath)) {
        const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
        fs.writeFileSync(abiDestination, JSON.stringify(artifact, null, 2));
        console.log(`Updated ABI in ${abiDestination}`);
    } else {
        console.error("Artifact not found. Make sure to compile first.");
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
