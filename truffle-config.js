const HDWalletProvider = require('@truffle/hdwallet-provider');
require('dotenv').config();
module.exports = {
  networks: {     
    development: {
      provider: () =>{
        return new HDWalletProvider(
          process.env.MNEMONIC, process.env.WALLETPROVIDER
        );
      },
      network_id: "*", // Network id match
    }
  },
  solc: {
    optimizer: {
      enabled: true,
      runs: 200
    }
  }
}