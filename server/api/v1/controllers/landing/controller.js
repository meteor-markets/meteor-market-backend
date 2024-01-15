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


}




export default new userController();


