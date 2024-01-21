import axios from "axios";
import bip39 from "bip39";
import Web3 from "web3";
import EthereumTx from "ethereumjs-tx";
import Common from "ethereumjs-common";
import { hdkey } from "ethereumjs-wallet";
import { ethereum } from "./constant/constant"

const web3 = new Web3(new Web3.providers.HttpProvider(ethereum.rpc));

const getCurrentGasPrices = async (gasFee) => {
  try {
    const apiKey = ethereum.apiKey;
    const apiUrl = ethereum.apiUrl;
    const response = await axios.get(apiUrl);
    console.log(response.data);
    gasFee = response.data;
    return (gasFee);
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
    return {
      responseCode: 200,
      responseMessage: "Generated.",
      responseResult: mnemonic,
    };
  } catch (error) {
    return {
      responseCode: 501,
      responseMessage: "Something went wrong",
      responseResult: error.message,
    };
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
    if (amountToSend >= 0) {
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
          name: "ETH",
          networkId: "0x5", //testnet
          chainId: "0x5", //testnet
        },
        "petersburg",
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

const withdraw = async (senderAddress, recieverAddress, amountToSend, privateKey) => {
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
        name: "ETH",
        networkId: "0x5", //testnet
        chainId: "0x5", //testnet
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

const getPrice = async (ids, vs_currencies) => {
  try {
    console.log("ids==>>", ids);
    console.log("vs_currencies==>>", vs_currencies);
    const responseData = await axios.get(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=${vs_currencies}`
    );
    console.log("result==>>", responseData.data);
    return responseData.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const getMarketPrice = async () => {
  try {
    const responseData = await axios.get(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,tether,tron&order=market_cap_desc&price_change_percentage=1h%2C24h`
    );
    console.log("result==>>", responseData.data);
    return {
      responseCode: 200,
      responseMessage: "Success",
      responseResult: responseData.data,
    };
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const getMarketPriceById = async (ids) => {
  try {
    console.log("ids==>>", ids);
    const responseData = await axios.get(
      `https://min-api.cryptocompare.com/data/price?fsym=${ids}&tsyms=usd,inr`
    );
    console.log("result==>>", responseData.data);
    return responseData.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const coinconvertById = async (ids, amount) => {
  try {
    const responseData = await axios.get(
      `https://api.coinconvert.net/convert/${ids}/usd?amount=${amount}`
    );
    console.log("result==>>", responseData.data);
    return responseData.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export {
  generateMnemonic,
  getBalance,
  transfer,
  withdraw,
  getPrice,
  getMarketPrice,
  getMarketPriceById,
  coinconvertById,
};
