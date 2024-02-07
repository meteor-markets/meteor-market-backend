import Joi from "joi";
import _ from "lodash";
import config from "config";
import apiError from '../../../../helper/apiError';
import userType from '../../../../enums/userType';
import response from '../../../../../assets/response';
import responseMessage from '../../../../../assets/responseMessage';
import commonFunction from '../../../../helper/util';

import status from '../../../../enums/status';

import { staticServices } from '../../services/static';
const { createStaticContent, findStaticContent, updateStaticContent, staticContentList, findStaticLinkContent } = staticServices;
import { userServices } from '../../services/user';
const { findUser } = userServices;
import { coinServices } from '../../services/coin';
const { coinList } = coinServices;

export class staticController {


  /**
   * @swagger
   * /static/viewStaticContent:
   *   get:
   *     tags:
   *       - STATIC
   *     description: viewStaticContent
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: type
   *         description: type
   *         in: query
   *         required: true
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async viewStaticContent(req, res, next) {
    const validationSchema = Joi.object({
      type: Joi.string().required(),
    });
    try {
      const validatedBody = await validationSchema.validateAsync(req.query);
      var result = await findStaticContent({ type: validatedBody.type });
      return res.json(new response(result, responseMessage.DATA_FOUND));
    } catch (error) {
      return next(error);
    }
  }

  async getCoinList(req, res, next) {
    const validationSchema = Joi.object({
      type: Joi.string().optional(),
    });
    try {
      const validatedBody = await validationSchema.validateAsync(req.query);
      var result = await coinList();
      return res.json(new response(result, responseMessage.DATA_FOUND));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /static/editStaticContent:
   *   put:
   *     tags:
   *       - STATIC
   *     description: editStaticContent
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: _id
   *         description: _id
   *         in: formData
   *         required: true
   *       - name: title
   *         description: title
   *         in: formData
   *         required: true
   *       - name: description
   *         description: description
   *         in: formData
   *         required: true
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async editStaticContent(req, res, next) {
    const validationSchema = Joi.object({
      _id: Joi.string().required(),
      title: Joi.string().optional(),
      description: Joi.string().optional()
    });
    try {

      const validatedBody = await validationSchema.validateAsync(req.body);

      let adminResult = await findUser({ _id: req.userId, userType: userType.ADMIN, status: { $ne: status.DELETE }, });
      if (!adminResult) {
        throw apiError.notFound(responseMessage.ADMIN_NOT_FOUND);
      }
      var result = await updateStaticContent({ _id: validatedBody._id }, validatedBody)
      return res.json(new response(result, responseMessage.UPDATE_SUCCESS));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /static/staticContentList:
   *   get:
   *     tags:
   *       - STATIC
   *     description: staticContentList
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async staticContentList(req, res, next) {
    try {
      var result = await staticContentList()
      return res.json(new response(result, responseMessage.DATA_FOUND));
    } catch (error) {
      return next(error);
    }
  }


  //**************************  StaticLink management End *************************************************/


  /**
   * @swagger
   * /staticLink/staticLink:
   *   get:
   *     tags:
   *       - STATIC_LINK
   *     description: viewStaticLinkContent
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: _id
   *         description: _id
   *         in: query
   *         required: true
   *     responses:
   *       200:
   *         description: Returns success message
   */

  async viewStaticlinkContent(req, res, next) {
    const validationSchema = Joi.object({
      _id: Joi.string().required(),
    });
    try {
      const validatedBody = await validationSchema.validateAsync(req.query);
      var result = await findStaticLinkContent({ _id: validatedBody._id });
      if (!result) {
        throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
      }
      return res.json(new response(result, responseMessage.DATA_FOUND));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /staticLink/staticLink:
   *   put:
   *     tags:
   *       - STATIC_LINK
   *     description: editStaticLinkContent
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
   *       - name: url
   *         description: url
   *         in: formData
   *         required: true
   *     responses:
   *       200:
   *         description: Returns success message
   */

  async editStaticlinkContent(req, res, next) {
    const validationSchema = Joi.object({
      _id: Joi.string().required(),
      title: Joi.string().optional(),
      description: Joi.string().optional()
    });
    try {

      const validatedBody = await validationSchema.validateAsync(req.body);

      let adminResult = await findUser({ _id: req.userId, userType: userType.ADMIN, status: { $ne: status.DELETE }, });
      if (!adminResult) {
        throw apiError.notFound(responseMessage.ADMIN_NOT_FOUND);
      }

      var staticRes = await findStaticLinkContent({ _id: validatedBody._id });
      if (!staticRes) throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
      var result = await updateStaticLinkContent(
        { _id: staticRes._id },
        { $set: validatedBody }
      );
      return res.json(new response(result, responseMessage.UPDATE_SUCCESS));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /staticLink/staticLink:
   *   get:
   *     tags:
   *       - STATIC_LINK
   *     description: staticLinkContentList
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: Returns success message
   */

  async staticLinkContentList(req, res, next) {
    try {
      var result = await staticLinkContentList();
      return res.json(new response(result, responseMessage.DATA_FOUND));
    } catch (error) {
      return next(error);
    }
  }


  //**************************  StaticLink management End *************************************************/

}

export default new staticController()
