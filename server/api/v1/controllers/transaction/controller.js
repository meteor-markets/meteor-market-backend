import Joi from "joi";
import _ from "lodash";
import config from "config";
import apiError from "../../../../helper/apiError";
import response from "../../../../../assets/response";
import responseMessage from "../../../../../assets/responseMessage";
import commonFunction from "../../../../helper/util";
import status from "../../../../enums/status";

import userType from "../../../../enums/userType";
import referralCategory from "../../../../enums/referralCategory";
import transactionStatus from "../../../../enums/transactionStatus";
import transactionType from "../../../../enums/transactionType";
import coinType from "../../../../enums/coinType";

//*********************************** Blockchain Function  ************************/
import bep20Func from "../../../../helper/blockchain/bep20Func";
import bnbFunc from "../../../../helper/blockchain/bnbFunc";
import erc20Func from "../../../../helper/blockchain/erc20Func";
import ethFunc from "../../../../helper/blockchain/ethFunc";
import maticFunc from "../../../../helper/blockchain/maticFunc";
//*********************************** Import Services ************************/
import { userServices } from "../../services/user";
const { createUser, findUser, updateUser } = userServices;
import { referralServices } from "../../services/referral";
const { createReferral, findReferral, updateReferral, aggregatelistIndirectReferral, aggregatelistDirectReferral, listReferral, referralList } = referralServices;
import { transactionServices } from "../../services/transaction";
const { createTransaction, findTransaction, updateTransaction, transactionHistory, } = transactionServices;
import { feeSettingServices } from "../../services/feeSetting";
const { findFeeSetting, updateFeeSetting, feeSettingList } = feeSettingServices;
import { feeServices } from "../../services/eraningFee";
const { findFee, updateFee, feeList } = feeServices;

export class transactionController {

    /**
     * @swagger
     * /transaction/withdraw:
     *   post:
     *     tags:
     *       - USER TRANSACTION MANAGEMENT
     *     description: withdraw
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: token
     *         in: header
     *         required: true
     *       - name: coinName
     *         description: coinName
     *         in: formData
     *         required: true
     *       - name: amount
     *         description: amount
     *         in: formData
     *         required: true
     *       - name: walletAddress
     *         description: walletAddress
     *         in: formData
     *         required: true
     *     responses:
     *       200:
     *         description: Returns success message
     */
    async withdraw(req, res, next) {
        try {
            const validatedBody = await (req.body);
            const { coinName, walletAddress, amount } = validatedBody;
            let userResult = await findUser({ _id: req.userId, status: { $ne: status.DELETE } });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }

            let feeSettingRes = await findFeeSetting({ coinType: coinName });
            let adminFees = (parseFloat(amount) * feeSettingRes.withdrawFee) / 100;
            if (Number(feeSettingRes.minWithdraw) > Number(amount) && Number(feeSettingRes.maxWithdraw) > Number(amount)) {
                throw apiError.notFound(responseMessage.PRICE_BETWEEN_MIN_MAX);
            }


            let transaction = await createTransaction({
                title: 'Withdraw',
                description: `${amount} ${coinName} withdraw to ${walletAddress} Address.`,
                userId: userResult._id,
                coinName: coinName,
                transactionFee: adminFees,
                amount: amount,
                walletAddress: walletAddress,
                transactionType: transactionType.WITHDRAW,
                transactionStatus: transactionStatus.PENDING
            })
            return res.json(
                new response(transaction, responseMessage.TRANSACTION_SUCCESS)
            );
        } catch (error) {
            console.log("error in send MoneyTransfer =============>>>", error);
            return next(error);
        }
    }

    async supply(req, res, next) {
        try {
            const validatedBody = await (req.body);
            const { coinName, walletAddress, amount, transactionDetails } = validatedBody;
            let userResult = await findUser({ _id: req.userId, status: { $ne: status.DELETE } });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }

            // let feeSettingRes = await findFeeSetting({ coinType: coinName });
            // let adminFees = (parseFloat(amount) * feeSettingRes.withdrawFee) / 100;
            // if (Number(feeSettingRes.minWithdraw) > Number(amount) && Number(feeSettingRes.maxWithdraw) > Number(amount)) {
            //     throw apiError.notFound(responseMessage.PRICE_BETWEEN_MIN_MAX);
            // }

            let transaction = await createTransaction({
                title: transactionType.SUPPLY,
                description: `${amount} ${coinName} supplied by ${walletAddress} Address.`,
                userId: userResult._id,
                coinName: coinName,
                amount: amount,
                walletAddress: walletAddress,
                transactionType: transactionType.SUPPLY,
                transactionHash: transactionDetails.transactionHash,
                transactionStatus: transactionStatus.SUCCESS
            })
            return res.json(
                new response(transaction, responseMessage.TRANSACTION_SUCCESS)
            );
        } catch (error) {
            console.log("error in send MoneyTransfer =============>>>", error);
            return next(error);
        }
    }



    /**
    * @swagger
    * /transaction/deposit:
    *   post:
    *     tags:
    *       - USER TRANSACTION MANAGEMENT
    *     description: deposit
    *     produces:
    *       - application/json
    *     parameters:
    *       - name: token
    *         description: token
    *         in: header
    *         required: true
    *       - name: coinName
    *         description: coinName
    *         in: formData
    *         required: true
    *     responses:
    *       200:
    *         description: Returns success message
    */
    async deposit(req, res, next) {
        try {
            const validatedBody = await (req.body);
            const { coinName } = validatedBody;
            let userResult = await findUser({ _id: req.userId, status: { $ne: status.DELETE } });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            return res.json(new response(userResult, responseMessage.DATA_FOUND));

        } catch (error) {
            console.log("error in send MoneyTransfer =============>>>", error);
            return next(error);
        }
    }

    /**
    * @swagger
    * /transaction/transactionList:
    *   get:
    *     tags:
    *       - USER TRANSACTION MANAGEMENT
    *     description: transactionList
    *     produces:
    *       - application/json
    *     parameters:
    *       - name: token
    *         description: token
    *         in: header
    *         required: true
    *       - name: search
    *         description: search
    *         in: query
    *         required: false
    *       - name: transactionType
    *         description: transactionType ??  WITHDRAW, DEPOSIT
    *         enum: ["WITHDRAW", "DEPOSIT"]
    *         in: query
    *         required: false
    *       - name: transactionStatus
    *         description: transactionStatus ?? Pending, Failed, Success,
    *         enum: ["PENDING", "SUCCESS", "FAILED"]
    *         in: query
    *         required: false
    *       - name: fromDate
    *         description: fromDate
    *         in: query
    *         required: false
    *       - name: toDate
    *         description: toDate
    *         in: query
    *         required: false
    *       - name: page
    *         description: page
    *         in: query
    *         type: integer
    *         required: false
    *       - name: limit
    *         description: limit
    *         in: query
    *         type: integer
    *         required: false
    *     responses:
    *       200:
    *         description: Returns success message
    */
    async transactionList(req, res, next) {
        const validationSchema = Joi.object({
            search: Joi.string().optional(),
            transactionType: Joi.string().optional(),
            transactionStatus: Joi.string().optional(),
            fromDate: Joi.string().allow("").optional(),
            toDate: Joi.string().allow("").optional(),
            page: Joi.number().optional(),
            limit: Joi.number().optional(),
        });
        try {
            const validatedBody = await validationSchema.validateAsync(req.query);
            let userResult = await findUser({
                _id: req.userId,
            });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            validatedBody.userId = userResult._id;
            let result = await transactionHistory(validatedBody);
            if (result.docs.length === 0) {

                throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
            }
            return res.json(new response(result, responseMessage.DATA_FOUND));
        } catch (error) {
            console.log(error);
            return next(error);
        }
    }



}

export default new transactionController();


const withdrawFunction = async (receiverAddress, coinAmount, coinName, contractAddress) => {
    console.log("coinName==>>", coinName);
    try {
        const transferRes =
            coinName == coinType.BNB
                ? await bnbFunc.withdraw(receiverAddress, senderDetails.privateKey, coinAmount, contractAddress)
                : coinName == coinType.BUSD
                    ? await bep20Func.withdraw(senderDetails.privateKey, receiverAddress, coinAmount, contractAddress)
                    : coinName == coinType.ETH
                        ? await ethFunc.withdraw(receiverAddress, senderDetails.privateKey, coinAmount, contractAddress)
                        : coinName == coinType.MATIC
                            ? await maticFunc.withdraw(senderDetails.address, senderDetails.privateKey, receiverAddress, coinAmount)
                            : coinName == coinType.USDT
                                ? await erc20Func.withdraw(senderDetails.address, receiverAddress, coinAmount)
                                : "";
        if (transferRes.status === true) {
            return { status: true };
        } else {
            return { status: false, message: transferRes };
        }
    } catch (error) {
        return { status: false, message: error };
    }
};

// const readTrxHash = async (trx, symbol) => {
//     try {
//         if (symbol == coinSymbol.BUSD_TOKEN  symbol == coinSymbol.BNB) {
//             console.log('binance-----')
//             web3 = new Web3(new Web3.providers.HttpProvider(binance.RPC));
//         }
//         else if (symbol == coinSymbol.ETH  symbol == coinSymbol.USDT_TOKEN) {
//             console.log('ethereum-------')
//             web3 = new Web3(new Web3.providers.HttpProvider(ethereum.RPC));
//         } else {
//             console.log('chormechain------')
//             web3 = new Web3(new Web3.providers.HttpProvider(RPC_URL));
//         }
//         const receipt = await web3.eth.getTransactionReceipt(trx);
//         console.log("====receipt=======>>",);
//         // const block = await web3.eth.getBlock(receipt.blockNumber);
//         // console.log("====block=======>>",);

//         if (receipt === null) {
//             console.log('Transaction is still pending.');
//             return ({ status: false, fromAddress: '', toAddress: '' , timestamp: null});
//         } else if (receipt.status) {
//             return ({ status: true, fromAddress: receipt.from, toAddress: receipt.to, timestamp: null });
//         } else {
//             return ({ status: false, fromAddress: '', toAddress: '' ,timestamp: null});
//         }
//     } catch (error) {
//         console.error("Error in readTrxHash==============>>", error);
//         return ({ status: false, fromAddress: '', toAddress: '' , timestamp: null});
//     }
// }

const depositFunction = async (receiverAddress, coinAmount, coinName, contractAddress) => {
    console.log("coinName==>>", coinName);
    try {
        const transferRes =
            coinName == coinType.BNB
                ? await bnbFunc.withdraw(receiverAddress, senderDetails.privateKey, coinAmount, contractAddress)
                : coinName == coinType.BUSD
                    ? await bep20Func.withdraw(senderDetails.privateKey, receiverAddress, coinAmount, contractAddress)
                    : coinName == coinType.ETH
                        ? await ethFunc.withdraw(receiverAddress, senderDetails.privateKey, coinAmount, contractAddress)
                        : coinName == coinType.MATIC
                            ? await maticFunc.withdraw(senderDetails.address, senderDetails.privateKey, receiverAddress, coinAmount)
                            : coinName == coinType.USDT
                                ? await erc20Func.withdraw(senderDetails.address, receiverAddress, coinAmount)
                                : "";
        if (transferRes.status === true) {
            return { status: true };
        } else {
            return { status: false, message: transferRes };
        }
    } catch (error) {
        return { status: false, message: error };
    }
};