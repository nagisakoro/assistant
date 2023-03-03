const prod = {
  IS_MOCK: false,
  SERVER_PORT: 8039,
  SD_SUBJECT_STR: `Заявка от сотрудника ОРК (Mango Assistant), ЛС `,
  REFRESH_ANALYZER_COUNT_TIME: 3600000,

  db_host: "192.168.20.129",
  db_port: "5432",
  db_password: "Qwe12345",
  db_user: "postgres",
  db_dbname: "postgres",

  wa_auth_login: "ma_prod",
  wa_auth_password: "Qwe123456",
};

const test = {
  IS_MOCK: false,
  SERVER_PORT: 8038,
  SD_SUBJECT_STR: `(Тестовая заявка, не трогать!) Заявка от сотрудника ОРК (Mango Assistant), ЛС `,
  REFRESH_ANALYZER_COUNT_TIME: 3600000,

  db_host: "192.168.20.129",
  db_port: "5432",
  db_password: "Qwe12345",
  db_user: "postgres",
  db_dbname: "test",

  wa_auth_login: "ma_dev",
  wa_auth_password: "Qwe123456",
};

const dev = {
  IS_MOCK: false,
  SERVER_PORT: 8037,
  SD_SUBJECT_STR: `(Тестовая заявка, не трогать!) Заявка от сотрудника ОРК (Mango Assistant), ЛС `,
  REFRESH_ANALYZER_COUNT_TIME: 3600000,

  db_host: "192.168.20.129",
  db_port: "5432",
  db_password: "Qwe12345",
  db_user: "postgres",
  db_dbname: "test",

  wa_auth_login: "ma_dev",
  wa_auth_password: "Qwe123456",

  /*   db_host: "localhost",
  db_port: "5432",
  db_password: "ewq54321",
  db_user: "postgres",
  db_dbname: "postgres", */
};

const mock = {
  IS_MOCK: true,
  SERVER_PORT: 8037,
  SD_SUBJECT_STR: `(Тестовая заявка, не трогать!) Заявка от сотрудника ОРК (Mango Assistant), ЛС `,
  REFRESH_ANALYZER_COUNT_TIME: 3600000,

  db_host: "192.168.20.129",
  db_port: "5432",
  db_password: "Qwe12345",
  db_user: "postgres",
  db_dbname: "test",

  wa_auth_login: "ma_dev",
  wa_auth_password: "Qwe123456",

  /*   db_host: "localhost",
  db_port: "5432",
  db_password: "ewq54321",
  db_user: "postgres",
  db_dbname: "postgres", */
};

const environment = process.env.NODE_ENV === "production" ? prod : process.env.NODE_ENV === "testing" ? test : process.env.NODE_ENV === "mocking" ? mock : dev;

// Установка свойств с идентичными значениями для всех версий
environment.SD_API_KEY = "1C0A7F30-0F75-4F0C-858F-263DD5BD884C";
environment.SEVICE_DESK_URL = "http://192.168.0.128/sdpapi/request/";
environment.MAX_NUMBER_OF_ANALYZE_REQUEST = 500;
environment.MAX_NUMBER_OF_ACTIVE_LOG_REQUEST = 1000;

module.exports = environment;
