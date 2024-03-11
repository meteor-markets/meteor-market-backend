
import Express from "express";
import controller from "./controller";
import auth from "../../../../helper/auth";
import upload from '../../../../helper/uploadHandler';


export default Express.Router()

    .use(auth.verifyToken)
    .get("/transactionList", controller.transactionList)
    .post("/supply", controller.supply)
    .post("/withdraw", controller.withdraw)


