import Express from "express";
import controller from "./controller";
import upload from '../../../../helper/uploadHandler';
import auth from '../../../../helper/auth';

export default Express.Router()

    .get('/getCointList', controller.getCoinList)
    .get('/viewStaticContent', controller.viewStaticContent)
    .get('/staticContentList', controller.staticContentList)
    
    .get('/viewStaticlinkContent', controller.viewStaticlinkContent)
    .get('/staticLinkContentList', controller.staticLinkContentList)
    .use(auth.verifyToken)
    .put('/editStaticContent', controller.editStaticContent)
    .put('/editStaticlinkContent', controller.editStaticlinkContent)
    .use(upload.uploadFile)
  