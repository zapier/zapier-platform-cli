var migrateCmd = (oldVersion, newVersion, optionalPercent) => {
  return Promise.resolve(`todo ${oldVersion} ${newVersion} ${optionalPercent}`);
};
migrateCmd.help = 'Migrate users from one version to another.';
migrateCmd.example = 'zapier migrate 1.0.0 1.0.1 [10%]';

module.exports = migrateCmd;
