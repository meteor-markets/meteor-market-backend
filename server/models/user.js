import Mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate";
import userType from "../enums/userType";
import status from "../enums/status";
import logger from "../helper/logger";
import { DEFAULT_BORROW, DEFAULT_SUPPLY } from "../helper/constants";

const options = {
  collection: "user",
  timestamps: true,
};

const userModel = new Schema(
  {
    walletAddress: { type: String },
    userType: {
      type: String,
      enum: [userType.ADMIN, userType.USER],
      default: userType.USER,
    },
    status: {
      type: String,
      enum: [status.ACTIVE, status.BLOCK, status.DELETE],
      default: status.ACTIVE,
      supply: { type: Number, default: DEFAULT_SUPPLY },
      borrow: { type: Number, default: DEFAULT_BORROW },
    },
    options
  });
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
      // create default user/admin if required!
    }
  } catch (error) {
    logger.error("Admin error===>>", error);
  }
}).call();
