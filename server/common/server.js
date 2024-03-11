import express from 'express';
import mongoose from 'mongoose';
import http from 'http';
import path from 'path';
import cors from 'cors';
import morgan from 'morgan';
import { successHandler, errorHandler } from '../helper/morgon';
import logger from '../helper/logger';
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';
import apiErrorHandler from '../helper/apiErrorHandler';

class ExpressServer {
  constructor() {
    this.app = express();
    this.server = http.createServer(this.app);
    this.root = path.normalize(`${__dirname}/../..`);

    this.app.use(express.json({ limit: '1000mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '1000mb' }));
    // this.app.use(morgan('dev'));
    this.app.use(successHandler);
    this.app.use(errorHandler);
    this.app.use(
      cors({
        allowedHeaders: ['Content-Type', 'token', 'authorization'],
        exposedHeaders: ['token', 'authorization'],
        origin: '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        preflightContinue: false,
      })
    );
    
  }

  router(routes) {
    routes(this.app);
    return this;
  }

  configureSwagger(swaggerDefinition) {
    const options = {
      swaggerDefinition,
      apis: [
        path.resolve(`${this.root}/server/api/v1/controllers/**/*.js`),
        path.resolve(`${this.root}/api.yaml`),
      ],
    };

    this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerJSDoc(options)));
    return this;
  }

  handleError() {
    this.app.use(apiErrorHandler);
    return this;
  }

  async configureDb(dbUrl) {
    try {
      await mongoose.connect(dbUrl, {
        // useNewUrlParser: true,
        // useUnifiedTopology: true,
      });
      logger.info('MongoDB connection established');
      return this;
    } catch (err) {
      logger.error(`Error in MongoDB connection ${err.message}`);
      throw err;
    }
  }

  listen(port) {
    this.server.listen(port, () => {
      logger.info(`Secure app is listening @port ${port}`, new Date().toLocaleString());
    });
    return this.app;
  }
}

export default ExpressServer;
