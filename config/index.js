import developmentConfig from './development.json';
import stagingConfig from './staging.json';


// const NODE_ENV = 'development';
const NODE_ENV =  'staging';


let config;
switch (NODE_ENV) {
    case 'staging':
        config = stagingConfig;
        break;
    default:
        config = developmentConfig;
}

export default config;
