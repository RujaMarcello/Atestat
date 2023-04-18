const pool = require("./pool");
const http = require("http");
const express = require("express");
const cors = require("cors");
const router = express.Router();

const app = express();
const server = http.createServer(app);

router.get("/", (req, res) => {
  res.send({ response: "Server is up and running." }).status(200);
});

app.use(cors());
app.use(router);

const io = require("socket.io")(server, {
  cors: {
    origin: [
      process.env.REACT_APP_FRONTEND_BASE_URL,
      "https://admin.socket.io",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});
server.listen(3002, () => {
  console.log(`Websockets server run on port 3002`);
});

io.on("connection", (socket) => {
  socket.on("join-room", (chatId) => {
    socket.join(chatId);
  });

  socket.on("send-message", async (message) => {
    const query = {
      text: "INSERT INTO messages(user_id, chat_id, line_text) VALUES ($1, $2, $3)",
      values: [message.userId, message.chatId, message.lineText],
    };
    try {
      const response = await pool.query(query);
      socket.to(message.chatId).emit("send-message", message);
    } catch (error) {
      console.log(error);
    }
  });
});
