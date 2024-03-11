
import Express from "express";
import controller from "./controller";
import auth from "../../../../helper/auth";
import upload from '../../../../helper/uploadHandler';


export default Express.Router()

    .post('/uploadFile', upload.uploadFile, controller.uploadFile)


    .post('/connectWallet', controller.connectWallet)
    .get("/listCoin", controller.listCoin)
    .get("/overview", controller.overview)
    
    .use(auth.verifyToken)
    .get('/getPortfolio', controller.getPortfolio)
    .get("/transactionList", controller.transactionList)
    .post("/supply", controller.supply)
    .post("/withdraw", controller.withdraw)


