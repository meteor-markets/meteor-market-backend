import Mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate";
import userType from "../enums/userType";
import status from "../enums/status";
import bcrypt from "bcryptjs";
import config from "config";
import logger from "../helper/logger";

const options = {
  collection: "user",
  timestamps: true,
};

const userModel = new Schema(
  {
    walletAddress: { type: String },
    email: { type: String },
    password: { type: String },
    firstName: { type: String },
    lastName: { type: String },
    userType: {
      type: String,
      enum: [userType.ADMIN, userType.USER],
      default: userType.USER,
    },
    status: {
      type: String,
      enum: [status.ACTIVE, status.BLOCK, status.DELETE],
      default: status.ACTIVE,
    },
    balance: { type: Number, default: 0 },
    supplyAmount: { type: Number, default: 0 },
    borrowAmount: { type: Number, default: 0 }
  },
  options
);
userModel.plugin(mongoosePaginate);
userModel.plugin(mongooseAggregatePaginate);
module.exports = Mongoose.model("user", userModel);

(async () => {
  try {
    const result = await Mongoose.model("user", userModel).find({
      userType: userType.ADMIN,
    });
    if (result.length != 0) {
      logger.info("Default Admin .");
    } else {
      const createdRes = await Mongoose.model("user", userModel).create({
        walletAddress: "",
        userType: "ADMIN",
        firstName: "Suraj",
        lastName: "Kumar",
        email: "suraj@mailinator.com",
        password: bcrypt.hashSync("Suraj@1234"),
      });
      if (createdRes) {
        console.log("DEFAULT ADMIN Created ", createdRes);
      }
    }
  } catch (error) {
    logger.error("Admin error===>>", error);
  }
}).call();
