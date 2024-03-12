import config from "../../config/index.js";
import jwt from 'jsonwebtoken';
import cloudinary from "cloudinary";


cloudinary.config({
  cloud_name: config.cloudinary.cloud_name,
  api_key: config.cloudinary.api_key,
  api_secret: config.cloudinary.api_secret,
});



module.exports = {

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


}
