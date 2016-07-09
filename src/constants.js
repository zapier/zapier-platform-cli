var DEBUG = false;
var ENDPOINT = 'http://localhost:8000/api/platform/v3';

var STARTER_REPO = process.env.ZAPIER_STARTER_REPO || 'zapier/zapier-platform-example-app';
var CONFIG_LOCATION = process.env.ZAPIER_CONFIG_LOCATION || '~/.zapier-platform';
var CURRENT_APP_FILE = process.env.ZAPIER_CURRENT_APP_FILE || '.zapier-current-app';
// TODO: || is temp hack
var PLATFORM_VERSION = process.env.ZAPIER_PLATFORM_VERSION || '3.0.0';
var DEF_PATH = 'build/definition.json';
var BUILD_PATH = 'build/build.zip';

var ART = `\
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
  CONFIG_LOCATION: CONFIG_LOCATION,
  CURRENT_APP_FILE: CURRENT_APP_FILE,
  PLATFORM_VERSION: PLATFORM_VERSION,
  DEF_PATH: DEF_PATH,
  BUILD_PATH: BUILD_PATH,
  ART: ART
};
