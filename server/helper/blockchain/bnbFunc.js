import axios from 'axios';
import bip39 from 'bip39';
import Web3 from 'web3';
import EthereumTx from 'ethereumjs-tx';
import Common from 'ethereumjs-common';
import { hdkey } from 'ethereumjs-wallet';

const BNB_URL = 'https://data-seed-prebsc-1-s1.binance.org:8545/'; // testnet
// const BNB_URL = 'https://bsc-dataseed.binance.org/'; // mainet

const web3 = new Web3(new Web3.providers.HttpProvider(BNB_URL));

const getCurrentGasPrices = async () => {
  try {
    const apiKey = 'QGYRYI2PU2KI1KDN6T4I5GZ5RQUZ16RSPT';
    const apiUrl = `https://api.etherscan.io/api?module=gastracker&action=gasestimate&gasprice=gasoracle&apikey=${apiKey}`;
    const response = await axios.get(apiUrl);
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error(error);
  }
};

const EthHelper = async () => {
  let currentGasPrice = await getCurrentGasPrices();
  let gasPrice = 10 * 1000000000;
  let gasLimit = 21000;
  let fee = gasLimit * gasPrice;
  let txFee = Number(web3.utils.fromWei(fee.toString(), "ether"));
  return { fee: txFee, gasPrice: gasPrice };
};

const accountBalance = async (senderAddress) => {
  try {
    const response = await web3.eth.getBalance(senderAddress);
    let balance = web3.utils.fromWei(response, "ether");
    return Number(balance);
  } catch (error) {
    console.log("accountBalance catch err==>>>", error);
  }
};

const preTransfer = async (senderAddress, amountToSend) => {
  const { fee } = await EthHelper();
  let balance = await accountBalance(senderAddress);
  if (balance - amountToSend - fee < 0) {
    console.log('insufficient funds', balance);
    return { status: false, message: 'Low Balance', balance: balance };
  } else {
    return { status: true, message: 'Transfer Possible' };
  }
};

const generateMnemonic = () => {
  try {
    let mnemonic = bip39.generateMnemonic();
    return { responseCode: 200, responseMessage: "Generated.", responseResult: mnemonic };
  } catch (error) {
    console.log(error);
    return { responseCode: 501, responseMessage: "Something went wrong!!!", responseResult: `${error}` };
  }
};


const getBalance = async (address) => {
  try {
    const response = await web3.eth.getBalance(address);
    let balance = web3.utils.fromWei(response, "ether");
    return { responseCode: 200, responseMessage: "Balance fetched successfully.", responseResult: { balance: Number(balance) } };
  } catch (error) {
    console.log(error);
    return { responseCode: 501, responseMessage: "Something went wrong!!!", responseResult: error.message };
  }
};

const transfer = async (senderAddress, recieverAddress, privateKey) => {
  try {
    var nonce = await web3.eth.getTransactionCount(senderAddress);
    const { fee, gasPrice } = await EthHelper();
    let balance = await accountBalance(senderAddress);
    let amountToSend = balance - fee;
    if (amountToSend > 0) {
      let txObject = {
        "to": recieverAddress,
        "value": web3.utils.toHex(
          web3.utils.toWei(amountToSend.toString(), "ether")
        ),
        "gas": 21000,
        "gasPrice": gasPrice,
        "nonce": nonce,
      };

      const common = Common.default.forCustomChain(
        "mainnet",
        {
          name: 'bnb',
          networkId: '0x61', // testnet
          chainId: '0x61', // testnet
          // chainId: '0x38', // mainet
          // networkId: '0x38', // mainet
        },
        "petersburg"
      );
      const transaction = new EthereumTx(txObject, { common: common });
      let privKey = Buffer.from(privateKey, 'hex');
      transaction.sign(privKey);
      const serializedTransaction = transaction.serialize();
      const signTransaction = await web3.eth.sendSignedTransaction('0x' + serializedTransaction.toString('hex'));
      console.log(signTransaction.transactionHash);
      console.log({ responseCode: 200, Status: "Success", Hash: signTransaction.transactionHash });
      return { responseCode: 200, Status: "Transfer Successful", responseResult: signTransaction };
    } else {
      console.log({ status: true, message: 'Transfer Possible' });
      return { status: true, message: 'Transfer Possible' };
    }
  } catch (error) {
    console.log({ responseCode: 501, responseMessage: "Something went wrong!", responseResult: error });
    return { responseCode: 501, responseMessage: "Something went wrong!", responseResult: error };
  }
};

const bnbWithdraw = async (senderAddress, recieverAddress, privateKey, amountToSend) => {
  try {
    var nonce = await web3.eth.getTransactionCount(senderAddress);
    const { gasPrice } = await EthHelper();
    const { status } = await preTransfer(senderAddress, amountToSend);

    if (status == false) {
      console.log({ status: status, message: "Low Balance" });
      return { responseCode: 404, responseMessage: "Low balance.", responseResult: [] };
    }

    let txObject = {
      to: recieverAddress,
      value: web3.utils.toHex(
        web3.utils.toWei(amountToSend.toString(), "ether")
      ),
      gas: 21000,
      gasPrice: gasPrice,
      nonce: nonce,
    };
    const common = Common.default.forCustomChain(
      "mainnet",
      {
        name: 'bnb',
        networkId: '0x61', // testnet
        chainId: '0x61', // testnet
        // chainId: '0x38', // mainet
        // networkId: '0x38', // mainet
      },
      "petersburg"
    );
    const transaction = new EthereumTx(txObject, { common: common });
    let privKey = Buffer.from(privateKey, "hex");
    transaction.sign(privKey);
    const serializedTransaction = transaction.serialize();
    const raw = "0x" + Buffer.from(serializedTransaction).toString("hex");
    const signTransaction = await web3.eth.sendSignedTransaction(raw);
    console.log({
      responseCode: 200,
      Status: "Success",
      Hash: signTransaction.transactionHash,
    });
    return { responseCode: 200, responseMessage: "Withdraw successful.", responseResult: signTransaction };
  } catch (error) {
    console.log(error);
    return { responseCode: 501, responseMessage: "Something went wrong!!!", responseResult: `${error}` };
  }
};

export { generateMnemonic, getBalance, transfer, bnbWithdraw };
