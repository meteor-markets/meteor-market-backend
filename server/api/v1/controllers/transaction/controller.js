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
import status from "../../../../enums/status";

import userType from "../../../../enums/userType";
import referralCategory from "../../../../enums/referralCategory";
import transactionStatus from "../../../../enums/transactionStatus";
import transactionType from "../../../../enums/transactionType";
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

export class userController {

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
            console.log(userResult);
            let feeResult = await findFee({ coinType: coinName });
            let adminFees = (parseFloat(amount) * feeSettingRes.withdrawFee) / 100;
            let userAmount = parseFloat(amount) + adminFees;
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

export default new userController();


