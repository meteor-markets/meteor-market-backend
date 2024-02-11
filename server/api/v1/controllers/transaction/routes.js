
import Express from "express";
import controller from "./controller";
import auth from "../../../../helper/auth";
import upload from '../../../../helper/uploadHandler';


export default Express.Router()

    //  NOTE: use for notes
    //  FIX: use for bug
    //  [x]: use for fixed problem
    //  [ ]: use for problem
    //  CLASS: use for need read docs
    //  HTTP: use for http request
    //  ROUTE: use for route
    //  TODO: for task list


    .use(auth.verifyToken)
    .get("/transactionList", controller.transactionList)


