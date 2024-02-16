import Joi from "joi";
import _ from "lodash";
import apiError from "../../../../helper/apiError";
import response from "../../../../../assets/response";
import bcrypt from "bcryptjs";
import responseMessage from "../../../../../assets/responseMessage";
import commonFunction from "../../../../helper/util";
import status from "../../../../enums/status";
import userType from "../../../../enums/userType";

// ******************* Importing services *************************************//
import { userServices } from "../../services/user";
const { findUser, findUserData, updateUser, updateUserById, paginateSearch } =
  userServices;
import { overviewService } from "../../services/overview";
const { getAssets } = overviewService;
import { coinServices } from "../../services/coin";
const { coinList } = coinServices;

//******************************************************************************/

export class adminController {
  /**
   * @swagger
   * /admin/login:
   *   post:
   *     tags:
   *       - ADMIN
   *     description: Admin login with email and Password
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: email
   *         description: email is required
   *         in: formData
   *         required: true
   *         default: suraj@mailinator.com
   *       - name: password
   *         description: password is required
   *         in: formData
   *         default: Suraj@1234
   *         required: true
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async login(req, res, next) {
    var validationSchema = Joi.object({
      email: Joi.string().required(),
      password: Joi.string().required(),
    });
    try {
      if (req.body.email) {
        req.body.email = req.body.email.toLowerCase();
      }
      var results;
      var validatedBody = await validationSchema.validateAsync(req.body);
      const { email, password } = validatedBody;
      let adminResult = await findUser({
        email: email,
        userType: userType.ADMIN,
        status: { $ne: status.DELETE },
      });
      if (!adminResult) {
        throw apiError.notFound(responseMessage.ADMIN_NOT_FOUND);
      }
      if (!bcrypt.compareSync(password, adminResult.password)) {
        throw apiError.conflict(responseMessage.INCORRECT_LOGIN);
      } else {
        var token = await commonFunction.getToken({
          _id: adminResult._id,
          email: adminResult.email,
          mobileNumber: adminResult.mobileNumber,
          userType: adminResult.userType,
        });
        results = {
          _id: adminResult._id,
          email: email,
          speakeasy: adminResult.speakeasy,
          userType: adminResult.userType,
          token: token,
        };
      }
      return res.json(new response(results, responseMessage.LOGIN));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /admin/viewUser:
   *   get:
   *     tags:
   *       - ADMIN_USER_MANAGEMENT
   *     description: view basic Details of any USER with _id
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *       - name: _id
   *         description: _id
   *         in: query
   *         required: false
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async viewUser(req, res, next) {
    const validationSchema = Joi.object({
      _id: Joi.string().required(),
    });
    try {
      const validatedBody = await validationSchema.validateAsync(req.query);
      let adminResult = await findUser({
        _id: req.userId,
        userType: userType.ADMIN,
      });
      if (!adminResult) {
        throw apiError.notFound(responseMessage.ADMIN_NOT_FOUND);
      }
      var userInfo = await findUser({
        _id: validatedBody._id,
        status: { $ne: status.DELETE },
      });
      if (!userInfo) {
        throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
      }
      return res.json(new response(userInfo, responseMessage.DATA_FOUND));
    } catch (error) {
      return next(error);
    }
  }

  // [FIX]
  /**
   * @swagger
   * /admin/deleteUser:
   *   delete:
   *     tags:
   *       - ADMIN_USER_MANAGEMENT
   *     description: deleteUser When Admin want to delete Any USER from plateform
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *       - name: _id
   *         description: _id
   *         in: formData
   *         required: true
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async deleteUser(req, res, next) {
    const validationSchema = Joi.object({
      _id: Joi.string().required(),
    });
    try {
      const validatedBody = await validationSchema.validateAsync(req.body);
      let adminResult = await findUser({
        _id: req.userId,
        userType: { $in: "ADMIN" },
      });
      if (!adminResult) {
        throw apiError.notFound(responseMessage.ADMIN_NOT_FOUND);
      }
      var userInfo = await findUser({
        _id: validatedBody._id,
        userType: { $ne: "ADMIN" },
        status: { $ne: status.DELETE },
      });
      if (!userInfo) {
        throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
      }
      let deleteRes = await updateUser(
        { _id: userInfo._id },
        { status: status.DELETE }
      );
      return res.json(new response(deleteRes, responseMessage.DELETE_SUCCESS));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /admin/blockUnblockUser:
   *   put:
   *     tags:
   *       - ADMIN_USER_MANAGEMENT
   *     description: blockUnblockUser When ADMIN want to block User or Unblock USER on Plateform
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *       - name: _id
   *         description: _id
   *         in: formData
   *         required: true
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async blockUnblockUser(req, res, next) {
    const validationSchema = Joi.object({
      _id: Joi.string().required(),
    });
    try {
      const validatedBody = await validationSchema.validateAsync(req.body);
      let adminResult = await findUser({
        _id: req.userId,
        userType: { $in: "ADMIN" },
      });
      if (!adminResult) {
        throw apiError.notFound(responseMessage.ADMIN_NOT_FOUND);
      }
      var userInfo = await findUser({
        _id: validatedBody._id,
        userType: { $ne: "ADMIN" },
        status: { $ne: status.DELETE },
      });
      if (!userInfo) {
        throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
      }
      if (userInfo.status == status.ACTIVE) {
        let blockRes = await updateUser(
          { _id: userInfo._id },
          { status: status.BLOCK }
        );
        return res.json(new response(blockRes, responseMessage.BLOCK_BY_ADMIN));
      } else {
        let activeRes = await updateUser(
          { _id: userInfo._id },
          { status: status.ACTIVE }
        );
        return res.json(
          new response(activeRes, responseMessage.UNBLOCK_BY_ADMIN)
        );
      }
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /admin/listUser:
   *   get:
   *     tags:
   *       - ADMIN_USER_MANAGEMENT
   *     description: List of all USER
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *       - name: status
   *         description: status
   *         in: query
   *         required: false
   *       - name: search
   *         description: search
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
  async listUser(req, res, next) {
    const validationSchema = Joi.object({
      status: Joi.string().allow("").optional(),
      search: Joi.string().allow("").optional(),
      fromDate: Joi.string().allow("").optional(),
      toDate: Joi.string().allow("").optional(),
      page: Joi.number().allow("").optional(),
      limit: Joi.number().allow("").optional(),
    });
    try {
      const validatedBody = await validationSchema.validateAsync(req.query);
      let adminResult = await findUser({
        _id: req.userId,
        userType: { $in: "ADMIN" },
      });
      if (!adminResult) {
        throw apiError.notFound(responseMessage.ADMIN_NOT_FOUND);
      }

      let dataResults = await paginateSearch(validatedBody);
      if (dataResults.docs.length == 0) {
        throw apiError.notFound(responseMessage.ADMIN_NOT_FOUND);
      }
      return res.json(new response(dataResults, responseMessage.DATA_FOUND));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /admin/listCoin:
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

export default new adminController();
