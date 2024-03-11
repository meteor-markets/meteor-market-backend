import config from "../../config/index.js";
import jwt from 'jsonwebtoken';
import cloudinary from "cloudinary";


cloudinary.config({
  cloud_name: config.cloudinary.cloud_name,
  api_key: config.cloudinary.api_key,
  api_secret: config.cloudinary.api_secret,
});



module.exports = {

  getOTP() {
    var otp = Math.floor(100000 + Math.random() * 900000);
    return otp;
  },


  getToken: async (payload) => {
    var token = await jwt.sign(payload, config.jwtsecret, { expiresIn: "24h" })
    return token;
  },

  getImageUrl: async (files) => {
    var result = await cloudinary.v2.uploader.upload(files, {
      resource_type: "auto",
    });
    return result.secure_url;
  },

  generateReferralCode: async (length) => {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const codeLength = length || 8;
    let referralCode = "";
    for (let i = 0; i < codeLength; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      referralCode += characters.charAt(randomIndex);
    }
    return referralCode;
  },

}
