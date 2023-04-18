const pool = require("../pool");
const bcrypt = require("bcrypt");

async function isEmailValid(email) {
  try {
    const emailUniqueness = await pool.query(
      `SELECT  users.id, users.email, roles.role
      FROM users
      INNER JOIN users_roles
      ON users.id = users_roles.user_id
      
      INNER JOIN roles
      ON users_roles.role_id = roles.id
      WHERE users.email='${email}'`
    );
    if (emailUniqueness.rowCount == 0) {
      return undefined;
    }
    return emailUniqueness;
  } catch (error) {
    console.log(error);
  }
}

async function isPasswordValid(password, email) {
  try {
    const emailPassword = await pool.query(
      "SELECT password FROM users WHERE email = $1",
      [email]
    );
    return bcrypt.compareSync(password, emailPassword.rows[0].password);
  } catch (error) {
    console.log(error);
  }
}

async function getAllConversationsByUserId(userId) {
  try {
    const usersChatRelations = await pool.query(
      `SELECT * FROM chat_relations WHERE user_id = ${userId}`
    );
    if (usersChatRelations.rowCount == 0) {
      return undefined;
    }
    return usersChatRelations.rows;
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "Server error" });
  }
}

async function isGroupConversation(myChatId, userId) {
  try {
    const isGroup = await pool.query(
      `SELECT * FROM chat_relations WHERE chat_id = ${myChatId} AND user_id != ${userId}`
    );
    return isGroup.rows;
  } catch (error) {
    console.log(error);
  }
}

async function friendRequestAlreadyExisting(friendId, userId) {
  try {
    const getFriendRequestByFriendIdAndUserId =
      await pool.query(`SELECT * FROM friends
    WHERE friend_id = ${userId} AND user_id = ${friendId}`);
    if (getFriendRequestByFriendIdAndUserId.rowCount === 0) {
      return undefined;
    }
    return getFriendRequestByFriendIdAndUserId.rows;
  } catch (error) {
    console.log(error);
  }
}

async function isConversationHistoryEmpty(myChatId) {
  try {
    const getAllConversationsByChatId = await pool.query(
      `SELECT * FROM messages WHERE chat_id = ${myChatId} ORDER BY create_at ASC`
    );
    if (getAllConversationsByChatId.rowCount == 0) {
      return undefined;
    }

    return getAllConversationsByChatId.rows;
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  isEmailValid,
  isPasswordValid,
  getAllConversationsByUserId,
  isGroupConversation,
  isConversationHistoryEmpty,
  friendRequestAlreadyExisting,
};
