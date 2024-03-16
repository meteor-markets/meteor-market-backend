import Web3 from 'web3';
import bip39 from 'bip39';
import { hdkey } from 'ethereumjs-wallet';
import ethers from 'ethers';

const web3 = new Web3(new Web3.providers.HttpProvider("https://sepolia.blast.io"));

const  contractABI  = require("./constant/erc20ABI.json");

const mnemonic = "uncover slide spray lab gospel echo brush enable stairs quick truck verify";

const generateMnemonic = async () => {
    try {
        let mnemonic = bip39.generateMnemonic();
        return { responseCode: 200, responseMessage: "Generated.", responseResult: mnemonic };
    } catch (error) {
        return { responseCode: 501, responseMessage: "Couldn't Generate Wallet", responseResult: error };
    }
};

const getBalance = async (address, contract) => {
    try {
        if (!address) {
            return { responseCode: 404, responseMessage: `Invalid payment details.` };
        }
        const myContract = new web3.eth.Contract(contractABI, contract);
        var userBalance = await myContract.methods.balanceOf(address).call();
        const decimals = await myContract.methods.decimals().call();
        userBalance = ethers.utils.formatUnits(userBalance, decimals);
        return { responseCode: 200, responseMessage: "Balance fetched successfully.", responseResult: { balance: Number(userBalance) } };
    } catch (error) {
        return { responseCode: 501, responseMessage: "Something went wrong!", error: error.message };
    }
};

const withdraw = async (recieverAddress, privateKey, amountToSend, contract) => {
    try {
        if (!recieverAddress || !privateKey || !amountToSend) {
            return { responseCode: 404, responseMessage: `Invalid payment details.` };
        }
        const myContract = new web3.eth.Contract(contractABI, contract);
        const decimals = await myContract.methods.decimals().call();
        const balance = ethers.utils.parseUnits(amountToSend.toString(), decimals);

        const Data = await myContract.methods.transfer(recieverAddress, balance.toString()).encodeABI();

        const rawTransaction = {
            to: contract,
            gasPrice: web3.utils.toHex('30000000000'),
            gasLimit: web3.utils.toHex('200000'),
            data: Data
        };
        const signPromise = await web3.eth.accounts.signTransaction(rawTransaction, privateKey.toString());

        const data = await web3.eth.sendSignedTransaction(signPromise.rawTransaction);
        console.log({ responseCode: 200, Status: "Success", Hash: signPromise.transactionHash });
        return { responseCode: 200, responseMessage: "Success", responseResult: data };
    } catch (error) {
        console.log({ responseCode: 501, responseMessage: "Something went wrong!", error: error });
        return { responseCode: 501, responseMessage: "Something went wrong!", error: error };
    }
};

const transfer = async (senderAddress, recieverAddress, privateKey, contract) => {
    try {
        if (!senderAddress || !recieverAddress || !privateKey) {
            return { responseCode: 404, responseMessage: `Invalid payment details.` };
        }
        const myContract = new web3.eth.Contract(contractABI, contract);
        var balance = await myContract.methods.balanceOf(senderAddress).call();

        const Data = await myContract.methods.transfer(recieverAddress, balance.toString()).encodeABI();

        const rawTransaction = {
            to: contract,
            gasPrice: web3.utils.toHex('30000000000'),
            gasLimit: web3.utils.toHex('200000'),
            data: Data
        };
        const signPromise = await web3.eth.accounts.signTransaction(rawTransaction, privateKey.toString());

        const data = await web3.eth.sendSignedTransaction(signPromise.rawTransaction);
        console.log({ responseCode: 200, Status: "Success", Hash: signPromise.transactionHash });
        return { responseCode: 200, responseMessage: "Success", responseResult: data };
    } catch (error) {
        return { responseCode: 501, responseMessage: "Something went wrong!", error: error.message };
    }
};

export { generateMnemonic, getBalance, withdraw, transfer };




