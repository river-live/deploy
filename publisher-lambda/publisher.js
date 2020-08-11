const emitter = require("socket.io-emitter");
const io = emitter({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
});

exports.handler = async (event) => {
  const { channel, eventName, data } = JSON.parse(event.body);

  io.to(channel).emit(eventName, data);

  const response = {
    statusCode: 200,
    body: JSON.stringify(event),
  };

  return response;
};
