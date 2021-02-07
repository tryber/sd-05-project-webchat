const { run, users } = require('./chat.controller');
const view = require('./view.controllers');

module.exports = {
  users,
  run,
  view,
};
