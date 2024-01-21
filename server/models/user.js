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
    countryCode: { type: String },
    mobileNumber: { type: String },
    address: { type: String },
    profilePic: { type: String, default: "" },
    gender: { type: String },
    state: { type: String },
    city: { type: String },
    zipCode: { type: String },
    dateOfBirth: { type: String },
    country: { type: String },
    otpVerification: { type: Boolean, default: false },
    otp: { type: Number },
    otpTime: { type: Number },
    speakeasy: { type: Boolean, default: false },
    speakeasyQRcode: { type: String },
    speakeasyBase32: { type: String },
    notificationEnable: { type: Boolean, default: false },
    mobileNumberAuthentication: { type: Boolean, default: false },
    mobileNumberAuthenticationTime: { type: Number },
    mobileNumberAuthenticationOTP: { type: Number },
    emailAuthentication: { type: Boolean, default: false },
    emailAuthenticationTime: { type: Number },
    emailAuthenticationOTP: { type: Number },
    referralCode: { type: String },
    referredBy: { type: Mongoose.Types.ObjectId, ref: 'user' },
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
    contactUs: {
      countryCode: { type: String },
      mobileNumber: { type: String },
      instagram: { type: String },
      twitter: { type: String },
      facebook: { type: String },
      website: { type: String },
    },
    balance: { type: Number, default: 0 }
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
        countryCode: "+91",
        mobileNumber: "8340434976",
        email: "suraj@mailinator.com",
        dateOfBirth: "27/11/2002",
        gender: "Male",
        password: bcrypt.hashSync("Suraj@1234"),
        address: "Delhi, India",
        contactUs: {
          countryCode: "+91",
          mobileNumber: "8340434976",
          instagram: "https://www.instagram.com",
          twitter: "https://www.twitter.com",
          facebook: "https://www.facebook.com",
          website: "https://www.website.com",
        },
      });
      if (createdRes) {
        console.log("DEFAULT ADMIN Created ", createdRes);
      }
    }
  } catch (error) {
    logger.error("Admin error===>>", error);
  }
}).call();
