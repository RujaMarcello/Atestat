const pool = require("../pool");
const router = require("express").Router();
const { verifyToken, authRole } = require("../middleware/auth");
const { isEmailValid } = require("../helper/helper");
const { ROLE } = require("../helper/roles");

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
    return res.status(200).send("Friend request accepted");
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
      };
    });
    return res.status(200).send(data);
  } catch (error) {
    console.log(error);
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

module.exports = router;
