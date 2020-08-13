const emitter = require("socket.io-emitter");
const host = process.env.REDIS_HOST || "localhost";
const port = process.env.REDIS_PORT || 6379;

const io = emitter({ host, port });

const lambda = (event) => {
  const { channel, eventName, data } = event;

  io.to(channel).emit(eventName, data);

  const response = {
    statusCode: 200,
    body: JSON.stringify(event),
  };

  return response;
};

const event = {
  channel: "one",
  eventName: "event",
  data: "Hello from the local lambda!",
};

lambda(event);
