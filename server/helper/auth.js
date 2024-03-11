import config from "../../config/staging.json";
import jwt from "jsonwebtoken";
import userModel from "../models/user";
import apiError from './apiError';
import responseMessage from '../../assets/responseMessage';

module.exports = {
  verifyToken(req, res, next) {
    try {
      if (req.headers.token) {
        jwt.verify(req.headers.token, config.jwtsecret, async (err, result) => {
          if (err) {
            if (err.name == "TokenExpiredError") {
              return res.status(440).send({
                responseCode: 440,
                responseMessage: "Session Expired, Please login again.",
              });
            } else {
              // throw apiError.unauthorized(responseMessage.UNAUTHORIZED);
              return res.status(401).json({
                responseCode: 401,
                responseMessage: "User not authorized ."
              });
            }
          } else {
            try {
              const result2 = await userModel.findOne({ _id: result._id });
  
              if (!result2) {
                // throw apiError.notFound(responseMessage.USER_NOT_FOUND);
                return res.status(404).json({
                  responseCode: 404,
                  responseMessage: "USER NOT FOUND"
                });
              } else {
                if (result2.status == "BLOCKED") {
                  return res.status(403).json({
                    responseCode: 403,
                    responseMessage: "You have been blocked by admin ."
                  });
                } else if (result2.status == "DELETE") {
                  return res.status(402).json({
                    responseCode: 402,
                    responseMessage: "Your account has been deleted by admin ."
                  });
                } else {
                  req.userId = result._id;
                  req.userDetails = result;
                  next();
                }
              }
            } catch (error) {
              return next(error);
            }
          }
        });
      } else {
        throw apiError.invalid(responseMessage.NO_TOKEN);
      }
    } catch (error) {
      console.log("error=>>", error);
    }
  }
  


}