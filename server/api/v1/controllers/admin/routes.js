import Express from "express";
import controller from "./controller";
import auth from "../../../../helper/auth";
import upload from "../../../../helper/uploadHandler";

export default Express.Router()

  .post("/login", controller.login)
  .get("/listCoin", controller.listCoin)
  .get("/overview", controller.overview)

  .use(auth.verifyToken)

  
  .use(upload.uploadFile);
