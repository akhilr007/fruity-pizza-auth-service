import fs from 'fs';
import rsaPemToJwk from 'rsa-pem-to-jwk';

import logger from '../src/configs/logger';

const privateKey = fs.readFileSync('./certs/private.pem');

const jwk = rsaPemToJwk(privateKey, { use: 'sig' }, 'public');

logger.info(jwk);
