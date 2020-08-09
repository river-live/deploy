const emitter = require("socket.io-emitter");
const io = emitter({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
});

exports.handler = async (event) => {
  const { room, message } = JSON.parse(event.body);

  io.to(room).emit("event", message);

  const response = {
    statusCode: 200,
    body: JSON.stringify(event),
  };

  return response;
};
