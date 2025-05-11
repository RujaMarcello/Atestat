const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const router = require("express").Router();
const { db, auth } = require('../firebase');
const { collection, addDoc, query, where, getDocs } = require('firebase/firestore');
const { createUserWithEmailAndPassword } = require('firebase/auth');
const { isEmailValid, isPasswordValid } = require("../helper/firebase-helper.js");
const { verifyToken } = require("../middleware/auth");

router.post("/login", async (req, res) => {
  try {
    const data = req.body;

    const emailExist = await isEmailValid(data.email);
    if (!!emailExist) {
      const isPasswordCorrect = await isPasswordValid(
        data.password,
        data.email
      );
      if (isPasswordCorrect == true) {
        const token = jwt.sign(emailExist.rows[0], process.env.TOKEN_KEY, {
          expiresIn: "2h",
        });
        return res
          .status(200)
          .json({ message: "You are logged", token: token });
      } else {
        return res.status(406).json("Wrong email or password");
      }
    } else {
      return res.status(406).json("Wrong email or password");
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json("Server error");
  }
});

router.post("/register", async (req, res) => {
  try {
    const data = req.body;
    const emailIsValid = await isEmailValid(data.email);

    if (!!emailIsValid) {
      return res.status(409).json("Email is already used");
    }

    // Creăm token-ul JWT
    const token = jwt.sign(
      { email: data.email, firstName: data.firstName, lastName: data.lastName },
      process.env.TOKEN_KEY,
      { expiresIn: "2h" }
    );

    // Criptăm parola
    const saltRounds = bcrypt.genSaltSync(10);
    const cryptedPassword = bcrypt.hashSync(data.password, saltRounds);

    // Adăugăm utilizatorul în colecția users din Firestore
    const usersCollection = collection(db, "users");
    const userDoc = await addDoc(usersCollection, {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: cryptedPassword,
      role: "USER",  // Default role
      createdAt: new Date()
    });

    return res.status(200).json({ message: "Successfully registered", token });
  } catch (error) {
    console.log(error);
    return res.status(500).json("Server error");
  }
});

module.exports = router;
