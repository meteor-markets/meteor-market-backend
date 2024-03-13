import Joi from "joi";
import _ from "lodash";
import apiError from "../../../../helper/apiError";
import response from "../../../../../assets/response";
import responseMessage from "../../../../../assets/responseMessage";
import commonFunction from "../../../../helper/util";
import status from "../../../../enums/status";
import transactionStatus from "../../../../enums/transactionStatus";
import transactionType from "../../../../enums/transactionType";
import coinType from "../../../../enums/coinType";
import userType from "../../../../enums/userType";

//*********************************** Import Services ************************/
import { userServices } from "../../services/user";
import { assets } from "../../../../helper/constants";
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

import { overviewService } from "../../services/overview";
const { getAssets, updateAssets } = overviewService;

export class userController {
  /**
   * @swagger
   * /user/uploadFile:
   *   post:
   *     tags:
   *       - UPLOAD_FILE
   *     description: uploadFile
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: files
   *         description: uploaded_file
   *         in: formData
   *         type: file
   *         required: true
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async uploadFile(req, res, next) {
    try {
      const imageFiles = await commonFunction.getImageUrl(req.files[0].path);
      const obj = {
        fileName: req.files[0].originalname,
        secureUrl: imageFiles,
      };
      return res.json(new response(obj, responseMessage.UPLOAD_SUCCESS));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/connectWallet:
   *   post:
   *     tags:
   *       - USER
   *     description: connectWallet
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: walletAddress
   *         description: walletAddress
   *         in: formData
   *         required: true
   *     responses:
   *       200:
   *         description: Wallet connect successfully.
   *       500:
   *         description: Internal server error.
   *       501:
   *         description: Something went wrong.
   */

  async connectWallet(req, res, next) {
    const validationSchema = Joi.object({
      walletAddress: Joi.string().required(),
    });

    try {
      const validatedBody = await validationSchema.validateAsync(req.body);
      let resultRes = await findUser({
        walletAddress: validatedBody.walletAddress,
        status: { $ne: status.DELETE },
      });

      if (resultRes) {
        const token = await commonFunction.getToken({
          _id: resultRes._id,
          userType: resultRes.userType,
        });
        let obj = {
          _id: resultRes._id,
          walletAddress: resultRes.walletAddress,
          userType: resultRes.userType,
          token: token,
          assets: assets,
          supplyBalance: resultRes.supplyBalance,
          borrowBalance: resultRes.borrowBalance,
          netAPY: resultRes.netAPY,
          borrowLimit: resultRes.borrowLimit,
        };

        return res.json(new response(obj, responseMessage.LOGIN));
      } else {
        let saveRes = await createUser({
          walletAddress: validatedBody.walletAddress,
          assets: assets,
        });

        const token = await commonFunction.getToken({
          _id: saveRes._id,
          userType: saveRes.userType,
        });

        let obj = {
          _id: saveRes._id,
          walletAddress: saveRes.walletAddress,
          userType: saveRes.userType,
          token: token,
          assets: assets,
          supplyBalance: saveRes.supplyBalance,
          borrowBalance: saveRes.borrowBalance,
          netAPY: saveRes.netAPY,
          borrowLimit: saveRes.borrowLimit,
        };

        return res.json(new response(obj, responseMessage.LOGIN));
      }
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/getPortfolio:
   *   get:
   *     tags:
   *       - USER
   *     description: getPortfolio
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *       - name: walletAddress
   *         description: walletAddress
   *         in: query
   *         required: true
   *     responses:
   *       200:
   *         description: Return success message
   */

  async getPortfolio(req, res, next) {
    const validationSchema = Joi.object({
      walletAddress: Joi.string().required(),
    });

    try {
      const validatedBody = await validationSchema.validateAsync(req.query);
      let userResult = await findUser({
        walletAddress: validatedBody.walletAddress,
        status: { $ne: status.DELETE },
      });

      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      return res.json(new response(userResult, responseMessage.USER_DETAILS));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/transactionList:
   *   get:
   *     tags:
   *       - USER
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

  /**
   * @swagger
   * /user/supply:
   *   post:
   *     tags:
   *       - USER
   *     description: Supply 
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: User token
   *         in: header
   *         required: true
   *       - name: walletAddress
   *         description: User walletAddress
   *         in: formData
   *         required: true
   *       - name: coinId
   *         description: coinId
   *         in: formData
   *         required: true
   *       - name: amount
   *         description: amount
   *         in: formData
   *         required: true
   *       - name: transactionStatus
   *         description: transactionStatus
   *         in: formData
   *         required: true
   *       - name: transactionHash
   *         description: transactionHash
   *         in: formData
   *         required: true
   *     responses:
   *       200:
   *         description: Returns success message
   */

  async supply(req, res, next) {
    const validationSchema = Joi.object({
      walletAddress: Joi.string().required(),
      coinId: Joi.string().required(),
      amount: Joi.number().required(),
      transactionStatus: Joi.string().required(),
      transactionHash: Joi.string().required(),
    });

    try {
      const validatedBody = await validationSchema.validateAsync(req.body);
      let userResult = await findUser({ _id: req.userId, status: { $ne: status.DELETE }, });
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }

      const coin = await coinList({ status: { $ne: status.DELETE }, _id: validatedBody.coinId, });

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
        transactionHash: validatedBody.transactionHash,
        transactionStatus: validatedBody.transactionStatus,
      });

      if (transaction) {
        let assets = await getAssets({});

        if (assets && assets.length > 0) {
          let asset = assets[0];
          asset.totalSupply = asset.totalSupply + validatedBody.amount;

          let assetUpdate = await updateAssets({ _id: asset._id }, asset);
          if (assetUpdate) {
            console.log("assets updated successfully", assetUpdate);
          }
        }

        let userAssets = userResult.assets;
        const coinFound = userAssets.find((c) => c._id == coin[0]._id);
        if (coinFound) {
          coinFound.supplyAmount = parseInt(coinFound.supplyAmount) + validatedBody.amount;
          userAssets = userAssets.filter((c) => c._id != coinFound._id);
          userAssets = [coinFound].concat(userAssets);

          userResult.assets = userAssets;
          userResult.supplyAmount = userResult.supplyAmount + Number(validatedBody.amount);

          const userUpdated = await updateUser({ _id: userResult._id }, userResult);
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
          userResult.supplyAmount = userResult.supplyAmount + Number(validatedBody.amount);
          const userUpdated = await updateUser({ _id: userResult._id }, userResult);
        }
      }

      return res.json(new response(transaction, responseMessage.TRANSACTION_SUCCESS));
    } catch (error) {
      return next(error);
    }
  }



  /**
   * @swagger
   * /user/withdraw:
   *   post:
   *     tags:
   *       - USER
   *     description: withdraw 
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: User token
   *         in: header
   *         required: true
   *       - name: walletAddress
   *         description: User walletAddress
   *         in: formData
   *         required: true
   *       - name: coinId
   *         description: coinId
   *         in: formData
   *         required: true
   *       - name: amount
   *         description: amount
   *         in: formData
   *         required: true
   *       - name: transactionStatus
   *         description: transactionStatus
   *         in: formData
   *         required: true
   *       - name: transactionHash
   *         description: transactionHash
   *         in: formData
   *         required: true
   *     responses:
   *       200:
   *         description: Returns success message
   */

  async withdraw(req, res, next) {
    const validationSchema = Joi.object({
      walletAddress: Joi.string().required(),
      coinId: Joi.string().required(),
      amount: Joi.number().required(),
      transactionStatus: Joi.string().required(),
      transactionHash: Joi.string().required(),
    });

    try {
      const validatedBody = await validationSchema.validateAsync(req.body);
      let userResult = await findUser({ _id: req.userId, status: { $ne: status.DELETE }, });
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }

      const coin = await coinList({ status: { $ne: status.DELETE }, _id: validatedBody.coinId, });

      if (!coin) {
        throw apiError.notFound(responseMessage.COIN_NOT_FOUND);
      }

      let userAssets = userResult.assets;
      const coinFound = userAssets.find((c) => c._id == coin[0]._id);
      if (coinFound) {
        if (coinFound.supplyAmount >= validatedBody.amount) {

          let transaction = await createTransaction({
            title: transactionType.WITHDRAW,
            description: `${validatedBody.amount} of ${coin[0].coinName} withdraw by ${validatedBody.walletAddress} Address.`,
            userId: userResult._id,
            coinName: coin[0].coinName,
            amount: validatedBody.amount,
            walletAddress: validatedBody.walletAddress,
            transactionType: transactionType.WITHDRAW,
            transactionHash: validatedBody.transactionHash,
            transactionStatus: validatedBody.transactionStatus,
          });

          if (transaction) {
            let assets = await getAssets({});

            if (assets && assets.length > 0) {
              let asset = assets[0];
              asset.totalSupply = asset.totalSupply - Number(validatedBody.amount);

              let assetUpdate = await updateAssets({ _id: asset._id }, asset);
              if (assetUpdate) {
                console.log("assets updated successfully", assetUpdate);
              }
            }

            // let userAssets = userResult.assets;
            // const coinFound = userAssets.find((c) => c._id == coin[0]._id);
            coinFound.supplyAmount = Number(coinFound.supplyAmount) - Number(validatedBody.amount);
            userAssets = userAssets.filter((c) => c._id != coinFound._id);
            userAssets = [coinFound].concat(userAssets);

            userResult.assets = userAssets;

            const userUpdated = await updateUser({ _id: userResult._id }, userResult);
            return res.json(new response(transaction, responseMessage.TRANSACTION_SUCCESS));
          }
        } else {
          throw apiError.notFound(responseMessage.INSUFFICIENT__SUPPLY_BALANCE);
        }
      }
    } catch (error) {
      return next(error);
    }
  }



  /**
   * @swagger
   * /user/listCoin:
   *   get:
   *     tags:
   *       - COIN
   *     description: listCoin
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async listCoin(req, res, next) {
    try {
      let coinResult = await coinList({ status: { $ne: status.DELETE } });
      if (coinResult.length <= 0) {
        throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
      } else {
        return res.json(new response(coinResult, responseMessage.DATA_FOUND));
      }
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/overview:
   *   get:
   *     tags:
   *       - USER
   *     description: overview
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async overview(req, res, next) {
    try {
      let overview = await getAssets({});
      if (overview.length <= 0) {
        throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
      } else {
        return res.json(new response(overview, responseMessage.DATA_FOUND));
      }
    } catch (error) {
      return next(error);
    }
  }
}

export default new userController();
