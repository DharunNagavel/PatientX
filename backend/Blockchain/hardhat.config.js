require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-waffle");

module.exports = {
  solidity: "0.8.28",
  networks: {
    hardhat: {
      accounts: {
        count: 100,              // 🔥 Create 100 accounts
        accountsBalance: "1000000000000000000000" // Optional: give 1000 ETH each
      }
    },
    localhost: {
      url: "http://127.0.0.1:8545"
    }
  }
};
