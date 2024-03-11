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
