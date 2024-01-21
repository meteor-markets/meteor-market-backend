import Joi from "joi";
import _ from "lodash";
import config from "config";
import moment from "moment";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import speakeasy from "speakeasy";
import apiError from "../../../../helper/apiError";
import response from "../../../../../assets/response";
import responseMessage from "../../../../../assets/responseMessage";
import commonFunction from "../../../../helper/util";

import userType from "../../../../enums/userType";
import status from "../../../../enums/status";
import coinType from "../../../../enums/coinType";
import coinImage from "../../../../enums/coinImage";
import transactionStatus from "../../../../enums/transactionStatus";
import transactionType from "../../../../enums/transactionType";
import feeType from "../../../../enums/feeType";
import referralCategory from "../../../../enums/referralCategory";
//*********************************** Import Services ************************/
import { userServices } from "../../services/user";
const { createUser, findUser, updateUser } = userServices;
import { stakeServices } from '../../services/stake';
const { createStake, findStake, updateStake, stakeList, paginateSearchStake } = stakeServices;
import { feeSettingServices } from "../../services/feeSetting";
const { findFeeSetting, updateFeeSetting, feeSettingList } = feeSettingServices;
import { feeServices } from "../../services/eraningFee";
const { findFee, updateFee, feeList } = feeServices;


export class userController {

  /**
   * @swagger
   * /stake/addStake:
   *   post:
   *     tags:
   *       - STAKE MANAGEMENT
   *     description: addStake by USER 
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *       - name: price
   *         description: price
   *         in: formData
   *         required: true
   *       - name: coinType
   *         description: coinTypeName ? USDT
   *         enum: ["USDT"]
   *         in: formData
   *         required: true
   *       - name: durationDays
   *         description: durationDays
   *         in: formData
   *         required: true
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async addStake(req, res, next) {
    try {
      const validationSchema = Joi.object({
        price: Joi.number().required(),
        coinType: Joi.string().valid('USDT').required(),
        durationDays: Joi.string().required(),
      });

      const validatedBody = await validationSchema.validateAsync(req.body);
      const userResult = await findUser({ _id: req.userId, status: { $ne: 'DELETE' } });

      if (!userResult) {
        throw new Error(responseMessage.USER_NOT_FOUND);
      }

      const stakeSettingData = await findFeeSetting({ coinType: validatedBody.coinType });
      const adminFeeRes = await findFee({ coinType: validatedBody.coinType, feeType: feeType.STAKE_FEE });
      const adminFees = (parseFloat(validatedBody.price) * stakeSettingData.stakeFee) / 100;
      const userAmount = parseFloat(validatedBody.price) + adminFees;

      // [ ] add functionality to fetch user balance
      // if (balance < userAmount) {
      //   throw new Error(responseMessage.INSUFFICIENT_BALANCE);
      // }
      if (Number(stakeSettingData.minStake) > Number(validatedBody.price) || Number(stakeSettingData.maxStake) < Number(validatedBody.price)) {
        throw new Error(responseMessage.PRICE_BETWEEN_MIN_MAX);
      }

      validatedBody.fromDate = new Date();
      validatedBody.toDate = new Date();
      validatedBody.toDate.setDate(validatedBody.fromDate.getDate() + Number(validatedBody.durationDays));
      validatedBody.userId = userResult._id;
      validatedBody.coinTypeName = validatedBody.coinType;

      switch (validatedBody.durationDays) {
        case stakeSettingData.stakeDuration1:
          validatedBody.interest = stakeSettingData.stakeInterestFor1;
          break;
        case stakeSettingData.stakeDuration2:
          validatedBody.interest = stakeSettingData.stakeInterestFor2;
          break;
        case stakeSettingData.stakeDuration3:
          validatedBody.interest = stakeSettingData.stakeInterestFor3;
          break;
        default:
          throw new Error('Invalid durationDays');
      }

      await updateFee({ _id: adminFeeRes._id }, { $inc: { earning: adminFees } });
      validatedBody.stakeFee = adminFees;

      const createRes = await createStake(validatedBody);

      return res.json({ data: createRes, message: responseMessage.DATA_SAVED });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /stake/listStake:
   *   get:
   *     tags:
   *       - STAKE MANAGEMENT
   *     description: listStake ,All the stake added by USER will list all the stake Result
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *       - name: coinType
   *         description: coinType
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
  async listStake(req, res, next) {
    const validationSchema = Joi.object({
      coinType: Joi.string().allow('').optional(),
      fromDate: Joi.string().allow('').optional(),
      toDate: Joi.string().allow('').optional(),
      page: Joi.number().allow('').optional(),
      limit: Joi.number().allow('').optional(),
    }) ;
    try {
      const validatedBody = await validationSchema.validateAsync(req.query);
      let userResult = await findUser({ _id: req.userId, status: { $ne: status.DELETE } });
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      validatedBody.userId = userResult._id;
      let dataResults = await paginateSearchStake(validatedBody);
      if (dataResults.docs.length == 0) {
        throw apiError.notFound(responseMessage.DATA_NOT_FOUND)
      }
      return res.json(new response(dataResults, responseMessage.DATA_FOUND));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /stake/viewStake:
   *   get:
   *     tags:
   *       - STAKE MANAGEMENT
   *     description: viewStake, Particular stake details will get
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *       - name: stakeId
   *         description: stakeId
   *         in: query
   *         required: true
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async viewStake(req, res, next) {
    try {
      let userResult = await findUser({ _id: req.userId, status: { $ne: status.DELETE } });
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }

      let stakeResutl = await findStake({ _id: req.query.stakeId, userId: userResult._id, status: { $ne: status.DELETE } })
      if (!stakeResutl) {
        throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
      }
      return res.json(new response(stakeResutl, responseMessage.DATA_FOUND));
    } catch (error) {
      return next(error);
    }
  }

  /**
  * @swagger
  * /stake/unstake:
  *   put:
  *     tags:
  *       - STAKE MANAGEMENT
  *     description: unstakeBalance
  *     produces:
  *       - application/json
  *     parameters:
  *       - name: token
  *         description: token
  *         in: header
  *         required: true
  *       - name: stakeId
  *         description: stakeId
  *         in: formData
  *         required: true
  *     responses:
  *       200:
  *         description: Returns success message
  */
  async unstake(req, res, next) {
    const validationSchema = Joi.object({
      stakeId: Joi.string().required(),
    });
    try {
      const validatedBody = await validationSchema.validateAsync(req.body);
      let userResult = await findUser({ _id: req.userId, userType: { $in: userType.USER } });
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      var stakeInfo = await findStake({ _id: validatedBody.stakeId, userId: userResult._id, isWithdraw: false, status: { $ne: status.DELETE } });
      if (!stakeInfo) {
        throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
      }
      if (stakeInfo.toDate > new Date()) {
        throw apiError.notFound(responseMessage.DATE_IS_LESS);
      }
      let earning = Number((stakeInfo.interest / 100) * stakeInfo.price);
      let walletBal = earning + stakeInfo.price;
      await updateStake({ _id: stakeInfo._id }, { $inc: { earning: + earning }, isWithdraw: true });

      // [ ] add functionality for add user balance

      return res.json(new response(updateRes, responseMessage.UN_STAKE));
    } catch (error) {
      console.log("error===in line 1321", error)
      return next(error);
    }
  }

  /**
  * @swagger
  * /stake/emergencyUnstake:
  *   put:
  *     tags:
  *       - STAKE MANAGEMENT
  *     description: emergencyUnstake
  *     produces:
  *       - application/json
  *     parameters:
  *       - name: token
  *         description: token
  *         in: header
  *         required: true
  *       - name: stakeId
  *         description: stakeId
  *         in: formData
  *         required: true
  *     responses:
  *       200:
  *         description: Returns success message
  */
  async emergencyUnstake(req, res, next) {
    const validationSchema = {
      stakeId: Joi.string().required(),
    };
    try {
      const validatedBody = await Joi.validate(req.body, validationSchema);
      let userResult = await findUser({ _id: req.userId, userType: { $in: userType.USER } });
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      var stakeInfo = await findStake({ _id: validatedBody.stakeId, isWithdraw: false, userId: userResult._id, status: { $ne: status.DELETE } });
      if (!stakeInfo) {
        throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
      }
      if (stakeInfo.isEmergency == true) {
        throw apiError.notFound(responseMessage.ALREADY_APPLY);
      }
      let updateRes = await updateStake({ _id: stakeInfo._id }, { isRequested: true, isEmergency: true })
      return res.json(new response(updateRes, responseMessage.STAKE_REQUEST));

    } catch (error) {
      console.log("error===in line 1321", error)
      return next(error);
    }
  }

}




export default new userController();


