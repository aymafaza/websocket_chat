const moment = require("moment");

const formatMessage = (username, text) => {
  return {
    username,
    text,
    time: moment().format("MMMM Do YYYY, h:mm:ss a")
  };
};

module.exports = formatMessage;
