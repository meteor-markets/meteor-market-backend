import Joi from "joi";
import _ from "lodash";
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
//*********************************** Import Services ************************/
import { userServices } from "../../services/user";
import { assets } from "../../../../helper/constants";
const { createUser, findUser, updateUser } = userServices;

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

  async getPortfolio(req, res, next) {
    const validationSchema = Joi.object({
      walletAddress: Joi.string().required(),
    });

    try {
      const validatedBody = await validationSchema.validateAsync(req.query);

      console.log("validate body", validatedBody);

      console.log("portfolio params", req.query);
      let userResult = await findUser({
        walletAddress: req.query.walletAddress,
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
}

export default new userController();
