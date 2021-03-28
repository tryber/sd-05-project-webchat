require('dotenv').config();

module.exports = {
  development: {
    host: process.env.HOSTNAME,
  },
  test: {
    host: process.env.HOSTNAME,
  },
  production: {
    host: process.env.HOSTNAME,
  },
};
