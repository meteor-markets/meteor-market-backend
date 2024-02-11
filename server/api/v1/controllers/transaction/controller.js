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
const { createTransaction, findTransaction, updateTransaction, transactionHistory, } = transactionServices;

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



}

export default new transactionController();
