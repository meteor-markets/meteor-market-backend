//v7 imports
import admin from './api/v1/controllers/admin/routes';
import landing from './api/v1/controllers/landing/routes';
import market from './api/v1/controllers/market/routes';
import stake from './api/v1/controllers/stake/routes';
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
  app.use('/api/v1/landing', landing)
  app.use('/api/v1/market', market)
  app.use('/api/v1/stake', stake)
  app.use('/api/v1/static', staticContent)
  app.use('/api/v1/transaction', transaction)
  app.use('/api/v1/user', user)

  return app;
}
