const DEBUG = (process.env.ZAPIER_DEBUG || 'false') === 'true';

const BASE_ENDPOINT = process.env.ZAPIER_BASE_ENDPOINT || 'http://localhost:8000';
const ENDPOINT = process.env.ZAPIER_ENDPOINT || BASE_ENDPOINT + '/api/platform/v3';
const STARTER_REPO = process.env.ZAPIER_STARTER_REPO || 'zapier/zapier-platform-example-app';
const AUTH_LOCATION = process.env.ZAPIER_AUTH_LOCATION || '~/.zapier-platform-auth';
const CURRENT_APP_FILE = process.env.ZAPIER_CURRENT_APP_FILE || '.zapier-platform-current-app';
// TODO: || is temp hack
const PLATFORM_VERSION = process.env.ZAPIER_PLATFORM_VERSION || '3.0.0';
const DEF_PATH = 'build/definition.json';
const BUILD_PATH = 'build/build.zip';

const ART = `\
                zzzzzzzz
      zzz       zzzzzzzz       zzz
    zzzzzzz     zzzzzzzz     zzzzzzz
   zzzzzzzzzz   zzzzzzzz   zzzzzzzzzz
      zzzzzzzzz zzzzzzzz zzzzzzzzz
        zzzzzzzzzzzzzzzzzzzzzzzz
          zzzzzzzzzzzzzzzzzzzz
zzzzzzzzzzzzzzz          zzzzzzzzzzzzzzz
zzzzzzzzzzzzzzz          zzzzzzzzzzzzzzz
zzzzzzzzzzzzzzz          zzzzzzzzzzzzzzz
zzzzzzzzzzzzzzz          zzzzzzzzzzzzzzz
          zzzzzzzzzzzzzzzzzzzz
        zzzzzzzzzzzzzzzzzzzzzzzz
      zzzzzzzzz zzzzzzzz zzzzzzzzz
   zzzzzzzzzz   zzzzzzzz   zzzzzzzzzz
    zzzzzzz     zzzzzzzz     zzzzzzz
      zzz       zzzzzzzz       zzz
                zzzzzzzz`;

module.exports = {
  DEBUG: DEBUG,
  ENDPOINT: ENDPOINT,
  STARTER_REPO: STARTER_REPO,
  AUTH_LOCATION: AUTH_LOCATION,
  CURRENT_APP_FILE: CURRENT_APP_FILE,
  PLATFORM_VERSION: PLATFORM_VERSION,
  DEF_PATH: DEF_PATH,
  BUILD_PATH: BUILD_PATH,
  ART: ART,
};
