const pool = require("../pool");
const router = require("express").Router();
const { verifyToken } = require("../middleware/auth");
const {
  getAllConversationsByUserId,
  isGroupConversation,
  isConversationHistoryEmpty,
} = require("../helper/helper");
const { compare } = require("bcrypt");

router.post("/add-friend", verifyToken, async (req, res) => {
  const { friendId } = req.query;
  const userId = req.user.id;
  try {
    await pool.query(
      `INSERT INTO friends (user_id, friend_id) VALUES (${userId}, ${friendId})`
    );
    return res.status(200).send("Friend request sent");
  } catch (error) {
    console.log(error);
    return res.status(409).send("Friend request allready submited");
  }
});

router.post("/accept-friend", verifyToken, async (req, res) => {
  const { friendId } = req.query;
  const userId = req.user.id;

  try {
    await pool.query(
      `UPDATE friends SET status = 'accepted' WHERE user_id = ${friendId} AND friend_id = ${userId}`
    );
    const chatId = await pool.query(
      `INSERT INTO chat_relations (user_id) VALUES (${userId}) RETURNING *`
    );
    await pool.query(
      `INSERT INTO chat_relations (chat_id, user_id) VALUES (${chatId.rows[0].chat_id}, ${friendId})`
    );
    await pool.query(
      `UPDATE friends SET chat_id = ${chatId.rows[0].chat_id} WHERE user_id = ${friendId} AND friend_id = ${userId}`
    );
    return res.status(200).send({
      message: "Friend request accepted",
      chatId: chatId.rows[0].chat_id,
    });
  } catch (error) {
    console.log(error);
    return res.status(409).send("Friend request allready accepted");
  }
});

router.post("/reject-friend", verifyToken, async (req, res) => {
  const { friendId } = req.query;
  const userId = req.user.id;
  try {
    await pool.query(
      `DELETE FROM friends
         WHERE user_id = ${friendId} AND friend_id = ${userId}`
    );
    return res.status(200).send("Friend request rejected");
  } catch (error) {
    console.log(error);
  }
});

router.get("/friends-list", verifyToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const response = await pool.query(`
        SELECT * FROM users
        LEFT JOIN friends
        ON users.id = friends.user_id
        WHERE friends.friend_id = ${userId}
        UNION
        SELECT * FROM users
        LEFT JOIN friends
        ON users.id = friends.friend_id
        WHERE friends.user_id = ${userId} AND friends.status = 'accepted'
      `);

    const data = response.rows.map((el) => {
      return {
        id: el.user_id,
        firstName: el.first_name,
        lastName: el.last_name,
        email: el.email,
        profilePictureUrl: el.profile_picture_url,
        status: el.status,
        chatId: el.chat_id,
      };
    });
    return res.status(200).send(data);
  } catch (error) {
    console.log(error);
  }
});

router.get("/get-toolbar-counts", verifyToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const response = await pool.query(`
        SELECT * FROM users
        LEFT JOIN friends
        ON users.id = friends.user_id
        WHERE friends.friend_id = ${userId} AND friends.status = 'padding'
        UNION
        SELECT * FROM users
        LEFT JOIN friends
        ON users.id = friends.friend_id
        WHERE friends.user_id = ${userId} AND friends.status = 'padding'
      `);
    return res.status(200).send(JSON.stringify(response.rowCount));
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "Server error" });
  }
});

router.get("/add-friend-list", verifyToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const { rows } = await pool.query(
      `SELECT u.id, u.first_name, u.last_name, u.email, u.profile_picture_url, f.user_id AS friend_user_id, f.friend_id AS friend_friend_id
         FROM users u
         LEFT JOIN friends f ON (u.id = f.user_id OR u.id = f.friend_id) AND (f.user_id = $1 OR f.friend_id = $1)
         WHERE u.id != $1;`,
      [userId]
    );

    const filteredRows = rows.filter(
      (row) =>
        row.friend_user_id === null ||
        row.friend_friend_id === null ||
        (row.friend_user_id !== userId && row.friend_friend_id !== userId)
    );

    const response = filteredRows.map((row) => ({
      id: row.id,
      firstName: row.first_name,
      lastName: row.last_name,
      email: row.email,
      profilePictureUrl: row.profile_picture_url,
    }));

    return res.status(200).send(response);
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "Server error" });
  }
});

router.post("/send-message", verifyToken, async (req, res) => {
  const message = req.body.lineText;
  const { chatId } = req.query;
  const userId = req.user.id;
  try {
    const response = await pool.query(
      `INSERT INTO messages (chat_id, line_text, user_id) VALUES (${chatId}, '${message}', ${userId})`
    );
  } catch (error) {
    console.log(error);
  }
  return res.status(200).send("Successfully");
});

router.get("/get-all-conversations", verifyToken, async (req, res) => {
  const userId = req.user.id;
  const chatHistoryList = [];
  try {
    const listOfConversationsByUserId = await getAllConversationsByUserId(
      userId
    );
    if (!!listOfConversationsByUserId) {
      for (let i = 0; i < listOfConversationsByUserId.length; ++i) {
        const doesUserHaveChatHistory = await isConversationHistoryEmpty(
          listOfConversationsByUserId[i].chat_id
        );

        if (!!doesUserHaveChatHistory) {
          const isGroupChat = await isGroupConversation(
            listOfConversationsByUserId[i].chat_id,
            userId
          );
          const lastSentMessage =
            doesUserHaveChatHistory[doesUserHaveChatHistory.length - 1]
              .create_at;
          const lastLineText =
            doesUserHaveChatHistory[doesUserHaveChatHistory.length - 1]
              .line_text;
          if (isGroupChat.length > 1) {
            const group = await pool.query(
              `SELECT * FROM group_information WHERE chat_id = ${isGroupChat[0].chat_id}`
            );
            group.rows[0].lastSentMessage = lastSentMessage;
            group.rows[0].lastLineText = lastLineText;
            chatHistoryList.push(group.rows[0]);
          } else {
            const friend = await pool.query(
              `SELECT first_name, last_name, profile_picture_url FROM users WHERE id = ${isGroupChat[0].user_id}`
            );
            friend.rows[0].chat_id = isGroupChat[0].chat_id;
            friend.rows[0].lastSentMessage = lastSentMessage;
            friend.rows[0].lastLineText = lastLineText;
            chatHistoryList.push(friend.rows[0]);
          }
        }
      }
    }
    const response = chatHistoryList.map((el) => {
      if ("group_name" in el) {
        return {
          id: el.id,
          chatId: el.chat_id,
          groupName: el.group_name,
          profilePictureUrl: el.group_picture,
          lastSentMessage: el.lastSentMessage,
          lastLineText: el.lastLineText,
        };
      } else {
        return {
          firstName: el.first_name,
          lastName: el.last_name,
          chatId: el.chat_id,
          lastSentMessage: el.lastSentMessage,
          lastLineText: el.lastLineText,
          profilePictureUrl: el.profile_picture_url,
        };
      }
    });
    return res.status(200).send(
      response.sort((a, b) => {
        return b.lastSentMessage - a.lastSentMessage;
      })
    );
  } catch (error) {
    console.log(error);
  }
});

router.get("/get-messages", verifyToken, async (req, res) => {
  const { chatId } = req.query;
  try {
    const messages = await isConversationHistoryEmpty(chatId);
    const response =
      messages && messages.length > 0
        ? messages.map((el) => {
            return {
              id: el.id,
              userId: el.user_id,
              chatId: el.chat_id,
              lineText: el.line_text,
              createAt: el.create_at,
            };
          })
        : [];
    return res.status(200).send(response);
  } catch (error) {
    console.log(error);
  }
});

router.post("/send-message", verifyToken, async (req, res) => {
  const userId = req.user.id;
  const { chatId } = req.query;
  const { lineText } = req.body;
  try {
    const response = await pool.query(
      `INSERT INTO messages (user_id, chat_id, line_text) VALUES ${userId}, ${chatId}, ${lineText}`
    );
    return res.status(200).send("Successfully");
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
