// import Config from "config";
import Config from "../config/staging.json";
import Routes from "./routes";
import Server from "./common/server";
// const dbUrl = `mongodb://${Config.get('databaseHost')}:${Config.get("databasePort")}/${Config.get("databaseName")}`;
const dbUrl = Config.mongodbString;
const server = new Server()
  .router(Routes)
  .configureSwagger(Config.swaggerDefinition)
  .handleError()
  .configureDb(dbUrl)
  .then((_server) => _server.listen(Config.port));

export default server;