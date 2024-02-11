//v7 imports
import admin from './api/v1/controllers/admin/routes';
import lending from './api/v1/controllers/lending/routes';
import staticContent from './api/v1/controllers/static/routes';
import transaction from './api/v1/controllers/transaction/routes';
import user from './api/v1/controllers/user/routes';



/**
 *
 *
 * @export
 * @param {any} app
 */

export default function routes(app) {

  app.use('/api/v1/admin', admin)
  app.use('/api/v1/lending',lending)
  app.use('/api/v1/static', staticContent)
  app.use('/api/v1/transaction', transaction)
  app.use('/api/v1/user', user)

  return app;
}
