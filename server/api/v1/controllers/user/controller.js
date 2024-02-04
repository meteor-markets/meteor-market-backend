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
//*********************************** Import Services ************************/
import { userServices } from "../../services/user";
const { createUser, findUser, updateUser } = userServices;
import { referralServices } from "../../services/referral";
import { ObjectId } from "mongodb";
const { createReferral, findReferral, updateReferral, aggregatelistIndirectReferral, aggregatelistDirectReferral, listReferral, referralList } = referralServices;


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
   *       - name: referralCode
   *         description: referralCode
   *         in: formData
   *         required: false
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

  /**
   * @swagger
   * /user/editProfile:
   *   put:
   *     tags:
   *       - USER
   *     description: editProfile
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *       - name: firstName
   *         description: firstName
   *         in: formData
   *         required: false
   *       - name: lastName
   *         description: lastName
   *         in: formData
   *         required: false
   *       - name: email
   *         description: email
   *         in: formData
   *         required: false
   *       - name: countryCode
   *         description: countryCode
   *         in: formData
   *         required: false
   *       - name: mobileNumber
   *         description: mobileNumber
   *         in: formData
   *         required: false
   *       - name: city
   *         description: city
   *         in: formData
   *         required: false
   *       - name: state
   *         description: state
   *         in: formData
   *         required: false
   *       - name: country
   *         description: country
   *         in: formData
   *         required: false
   *       - name: profilePic
   *         description: profilePic
   *         in: formData
   *         required: false
   *     responses:
   *       200:
   *         description: Returns success message
   */

  async editProfile(req, res, next) {
    try {
      let userResult = await findUser({
        userType: userType.USER,
        _id: req.userId,
      });
      if (!userResult) {
        throw apiError.notFound(responseMessage.ADMIN_NOT_FOUND);
      }
      if (req.body.email && req.body.email != "") {
        var emailResult = await findUser({
          email: req.body.email,
          _id: { $ne: userResult._id },
          status: { $ne: status.DELETE },
        });
        if (emailResult) {
          throw apiError.conflict(responseMessage.EMAIL_EXIST);
        }
      }
      if (req.body.mobileNumber && req.body.mobileNumber != "") {
        var mobileResult = await findUser({
          mobileNumber: req.body.mobileNumber,
          _id: { $ne: userResult._id },
          status: { $ne: status.DELETE },
        });
        if (mobileResult) {
          throw apiError.conflict(responseMessage.MOBILE_EXIST);
        }
      }
      var result = await updateUser(
        { _id: userResult._id },
        { $set: req.body }
      );
      return res.json(new response(result, responseMessage.UPDATE_SUCCESS));
    } catch (error) {
      return next(error);
    }
  }


  /**
   * @swagger
   * /user/directIndirectUserList:
   *   post:
   *     tags:
   *       - USER 
   *     description: directIndirectUserList
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *       - name: category
   *         description: category 
   *         in: formData
   *         enum: ["DIRECT", "INDIRECT"]
   *         required: false
   *     responses:
   *       200:
   *         description: Returns success message
   */

  async directIndirectUserList(req, res, next) {
    const validationSchema = Joi.object({
      category: Joi.string().optional(),
    });

    try {
      let { category, } = await validationSchema.validateAsync(req.body);
      let userResult = await findUser({
        _id: req.userId,
        userType: userType.USER,
      });
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      let query = { referredBy: userResult._id, status: status.ACTIVE };
      if (category) {
        query.category = category;
      }
      const result = await aggregatelistIndirectReferral(query);
      if (result.length === 0) {
        throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
      }
      return res.json(new response(result, responseMessage.DETAILS_FETCHED));
    } catch (error) {
      return next(error);
    }
  }


}




export default new userController();


