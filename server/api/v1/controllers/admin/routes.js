import Express from "express";
import controller from "./controller";
import auth from "../../../../helper/auth";
import upload from "../../../../helper/uploadHandler";

export default Express.Router()

  .post("/login", controller.login)
  .get("/listCoin", controller.listCoin)
  .get("/overview", controller.overview)

  .use(auth.verifyToken)

  // **********************ADMIN************************/
  // .patch("/changePassword", controller.changePassword)
  // .get("/adminProfile", controller.adminProfile)

  // ************ADMIN USER NAMAGEMENT***********************/
  // .get("/viewUser", controller.viewUser)
  // .delete("/deleteUser", controller.deleteUser)
  // .put("/blockUnblockUser", controller.blockUnblockUser)
  // .get("/listUser", controller.listUser)
  // .put("/updateAdminProfile", controller.updateAdminProfile)

  .use(upload.uploadFile);
