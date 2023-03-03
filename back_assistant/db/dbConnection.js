const environment = require("../environment");
const pgp = require("pg-promise")();
const db = pgp(`postgres://${environment.db_user}:${environment.db_password}@${environment.db_host}:${environment.db_port}/${environment.db_dbname}`);

module.exports = {
  db,
};
