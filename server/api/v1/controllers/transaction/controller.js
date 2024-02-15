import Joi from "joi";
import _ from "lodash";
import config from "config";
import apiError from "../../../../helper/apiError";
import response from "../../../../../assets/response";
import responseMessage from "../../../../../assets/responseMessage";
import commonFunction from "../../../../helper/util";
import status from "../../../../enums/status";

import userType from "../../../../enums/userType";
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
import { transactionServices } from "../../services/transaction";
const {
  createTransaction,
  findTransaction,
  updateTransaction,
  transactionHistory,
} = transactionServices;

import { coinServices } from "../../services/coin";
const { coinList } = coinServices;

export class transactionController {
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
   *         enum: ["WITHDRAW", "SUPPLY", "BORROW", "REPAY"]
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

  async supply(req, res, next) {
    const validationSchema = Joi.object({
      walletAddress: Joi.string().required(),
      coinId: Joi.string().required(),
      amount: Joi.number().required(),
      transactionStatus: Joi.string().required(),
      transactionDetails: Joi.object()
        .keys({
          transactionHash: Joi.string(),
        })
        .default({}),
    });

    try {
      const validatedBody = await validationSchema.validateAsync(req.body);
      //   const { coinName, walletAddress, amount, transactionDetails } =
      let userResult = await findUser({
        walletAddress: validatedBody.walletAddress,
        status: { $ne: status.DELETE },
      });
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }

      const coin = await coinList({
        status: { $ne: status.DELETE },
        _id: validatedBody.coinId,
      });

      console.log("coin found", coin);
      if (!coin) {
        throw apiError.notFound(responseMessage.COIN_NOT_FOUND);
      }

      let transaction = await createTransaction({
        title: transactionType.SUPPLY,
        description: `${validatedBody.amount} ${coin[0].coinName} supplied by ${validatedBody.walletAddress} Address.`,
        userId: userResult._id,
        coinName: coin[0].coinName,
        amount: validatedBody.amount,
        walletAddress: validatedBody.walletAddress,
        transactionType: transactionType.SUPPLY,
        transactionHash: validatedBody.transactionDetails.transactionHash,
        transactionStatus: validatedBody.transactionStatus,
      });

      if (transaction) {
        let userAssets = userResult.assets;
        const coinFound = userAssets.find((c) => c._id == coin[0]._id);
        if (coinFound) {
          coinFound.supplyAmount =
            parseInt(coinFound.supplyAmount) + validatedBody.amount;
          userAssets = userAssets.filter((c) => c._id != coinFound._id);
          userAssets = [coinFound].concat(userAssets);

          userResult.assets = userAssets;

          const userUpdated = await updateUser(
            { _id: userResult._id },
            userResult
          );
        } else {
          let asset = {
            _id: validatedBody.coinId,
            coinName: coin[0].coinName,
            coinIndex: coin[0].coinIndex,
            coinImage: coin[0].coinImage,
            chainId: coin[0].chainId,
            chianIdHEX: coin[0].chianIdHEX,
            supplyAPY: coin[0].supplyAPY,
            sRewardAPR: coin[0].sRewardAPR,
            borrowAPY: coin[0].borrowAPY,
            bRewardAPR: coin[0].bRewardAPR,
            status: coin[0].status,
            supplyAmount: validatedBody.amount,
            supplyBalance: 0,
            borrowAmount: 0,
            borrowBalance: 0,
          };

          userResult.assets = [asset].concat(userResult.assets);
          const userUpdated = await updateUser(
            { _id: userResult._id },
            userResult
          );
        }
      }

      return res.json(
        new response(transaction, responseMessage.TRANSACTION_SUCCESS)
      );
    } catch (error) {
      console.log("error in send MoneyTransfer =============>>>", error);
      return next(error);
    }
  }
}

export default new transactionController();
