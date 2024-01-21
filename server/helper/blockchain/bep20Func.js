import Web3 from 'web3';
import { hdkey } from 'ethereumjs-wallet';
import { utils } from 'ethers';
import  contractABI  from './constant/bep20ABI.json';

const web3 = new Web3(new Web3.providers.HttpProvider("https://data-seed-prebsc-1-s1.binance.org:8545/")); //NOTE: testnet
// const web3 = new Web3(new Web3.providers.HttpProvider("https://bsc-dataseed.binance.org/")); // NOTE: Mainet


// const myContract = new web3.eth.Contract(contractABI, contract)

const mnemonic = "uncover slide spray lab gospel echo brush enable stairs quick truck verify";

const getBalance = async (address, contract) => {
  try {
    const myContract = new web3.eth.Contract(contractABI, contract);
    const userBalance = await myContract.methods.balanceOf(address).call();
    const decimals = await myContract.methods.decimals().call();
    const formattedBalance = utils.formatUnits(userBalance, decimals);
    return { responseCode: 200, responseMessage: "Balance fetched successfully.", responseResult: { balance: Number(formattedBalance) } };
  } catch (error) {
    return { responseCode: 501, responseMessage: "Something went wrong!", error: error.message };
  }
};

const withdraw = async (receiverAddress, privateKey, amountToSend, contract) => {
  try {
    const myContract = new web3.eth.Contract(contractABI, contract);
    const decimals = await myContract.methods.decimals().call();
    const balance = utils.parseUnits(amountToSend.toString(), decimals);
    const data = await myContract.methods.transfer(receiverAddress, balance.toString()).encodeABI();
    const rawTransaction = {
      to: contract,
      gasPrice: web3.utils.toHex('30000000000'), // Always in Wei (30 gwei)
      gasLimit: web3.utils.toHex('200000'), // Always in Wei
      data: data
    };
    const signPromise = await web3.eth.accounts.signTransaction(rawTransaction, privateKey.toString());
    const result = await web3.eth.sendSignedTransaction(signPromise.rawTransaction);
    return { responseCode: 200, responseMessage: "Success", responseResult: result };
  } catch (error) {
    return { responseCode: 501, responseMessage: "Something went wrong!", error: error.message };
  }
};

const transfer = async (senderAddress, receiverAddress, privateKey, contract) => {
  try {
    const myContract = new web3.eth.Contract(contractABI, contract);
    const balance = await myContract.methods.balanceOf(senderAddress).call();
    const data = await myContract.methods.transfer(receiverAddress, balance.toString()).encodeABI();
    const rawTransaction = {
      to: contract,
      gasPrice: web3.utils.toHex('30000000000'), // Always in Wei (30 gwei)
      gasLimit: web3.utils.toHex('200000'), // Always in Wei
      data: data
    };
    const signPromise = await web3.eth.accounts.signTransaction(rawTransaction, privateKey.toString());
    const result = await web3.eth.sendSignedTransaction(signPromise.rawTransaction);
    return { responseCode: 200, responseMessage: "Success", responseResult: result };
  } catch (error) {
    return { responseCode: 501, responseMessage: "Something went wrong!", error: error.message };
  }
};

export { getBalance, withdraw, transfer };




