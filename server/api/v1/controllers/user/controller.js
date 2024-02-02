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
//*********************************** Import Services ************************/
import { userServices } from "../../services/user";
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
        secureUrl: imageFiles
      }
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
      walletAddress: Joi.string().required()
    });

    try {
      const validatedBody = await validationSchema.validateAsync(req.body);
      let resultRes = await findUser({
        walletAddress: validatedBody.walletAddress,
        status: { $ne: status.DELETE },
      });

      if (resultRes) {
        var token = await commonFunction.getToken({
          _id: resultRes._id,
          userType: resultRes.userType,
        });
        var obj = {
          _id: resultRes._id,
          walletAddress: resultRes.walletAddress,
          userType: resultRes.userType,
          token: token,
        };
        return res.json(new response(obj, responseMessage.LOGIN));
      } else {
        let saveRes = await createUser({
          walletAddress: validatedBody.walletAddress,
        });



        var token = await commonFunction.getToken({
          _id: saveRes._id,
          userType: saveRes.userType,
        });
        var obj = {
          _id: saveRes._id,
          walletAddress: saveRes.walletAddress,
          userType: saveRes.userType,
          token: token,
        };

        return res.json(new response(obj, responseMessage.LOGIN));
      }
    } catch (error) {
      return next(error);
    }
  }


  /**
   * @swagger
   * /user/getProfile:
   *   get:
   *     tags:
   *       - USER
   *     description: profile
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async getProfile(req, res, next) {
    try {
      let userResult = await findUser({
        _id: req.userId,
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


