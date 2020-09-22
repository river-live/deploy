const emitter = require("socket.io-emitter");
const io = emitter({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
});

const key = process.env.API_KEY;

exports.handler = async (event) => {
  const requestKey = event.headers["x-api-key"];

  if (requestKey !== key) {
    return {
      statusCode: 401,
      body: "Unauthorized request",
    };
  }

  const { channel, eventName, data } = JSON.parse(event.body);
  const payload = { channel, data };

  io.to(channel).emit(eventName, payload);

  const response = {
    statusCode: 204,
  };

  return response;
};
