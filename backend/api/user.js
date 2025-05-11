const router = require("express").Router();
const { verifyToken, authRole } = require("../middleware/auth");
const { isEmailValid } = require("../helper/firebase-helper");
const { db } = require('../firebase');
const {
  collection, doc, getDoc, getDocs, updateDoc, query,
  where, limit, startAfter, orderBy
} = require('firebase/firestore');
const ROLE = {
  SUPERADMIN: 'SUPERADMIN',
  ADMIN: 'ADMIN',
  USER: 'USER'
};

router.get("/user/current", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Obținem documentul utilizatorului din colecția users
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return res.status(404).json("User not found");
    }

    const userData = userDoc.data();

    const response = {
      id: userId,
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      city: userData.city || null,
      state: userData.state || null,
      country: userData.country || null,
      profilePictureUrl: userData.profilePictureUrl || null,
      userRole: {
        id: userData.role === ROLE.SUPERADMIN ? 1 : userData.role === ROLE.ADMIN ? 2 : 3,
        name: userData.role || ROLE.USER,
      },
    };

    return res.status(200).send(response);
  } catch (error) {
    console.error(error);
    return res.status(500).json("Server error");
  }
});

router.get(
  "/user",
  verifyToken,
  authRole([ROLE.SUPERADMIN, ROLE.ADMIN]),
  async (req, res) => {
    try {
      const { email } = req.query;

      // Căutăm utilizatorul după email
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return res.status(404).json("User not found");
      }

      const userData = querySnapshot.docs[0].data();

      const user = {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        city: userData.city || null,
        state: userData.state || null,
        country: userData.country || null,
        profilePictureUrl: userData.profilePictureUrl || null,
        userRole: {
          id: userData.role === ROLE.SUPERADMIN ? 1 : userData.role === ROLE.ADMIN ? 2 : 3,
          name: userData.role || ROLE.USER,
        },
      };

      return res.status(200).send(user);
    } catch (error) {
      console.error(error);
      return res.status(500).json("Server error");
    }
  }
);

router.put(
  "/role/update",
  verifyToken,
  authRole([ROLE.SUPERADMIN]),
  async (req, res) => {
    try {
      const { id, email } = req.query;
      let newRole = ROLE.USER;

      // Convertim id-ul numeric în rolul corespunzător
      if (id === '1') newRole = ROLE.SUPERADMIN;
      else if (id === '2') newRole = ROLE.ADMIN;

      // Căutăm utilizatorul după email
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return res.status(404).json("User not found");
      }

      // Actualizăm rolul utilizatorului
      const userDoc = querySnapshot.docs[0];
      await updateDoc(doc(db, "users", userDoc.id), { role: newRole });

      return res.status(200).json("Role has been updated");
    } catch (error) {
      console.error(error);
      return res.status(500).json("Server error");
    }
  }
);

router.put("/user/current", verifyToken, async (req, res) => {
  try {
    const data = await req.body;
    const id = req.user.id;
    const emailIsValid = await isEmailValid(data.email);

    if (!!emailIsValid) {
      if (emailIsValid.rows[0].id !== id) {
        return res.status(409).send("Email already existing");
      }
    }

    // Actualizăm datele utilizatorului
    const userRef = doc(db, "users", id);
    await updateDoc(userRef, {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      city: data.city || null,
      state: data.state || null,
      country: data.country || null,
      profilePictureUrl: data.profilePictureUrl || null
    });

    req.user.email = data.email;
    return res.status(200).json("Data has been updated");
  } catch (error) {
    console.error(error);
    return res.status(500).json("Server error");
  }
});

router.get(
  "/users",
  verifyToken,
  authRole([ROLE.SUPERADMIN, ROLE.ADMIN]),
  async (req, res) => {
    try {
      const page = req.query.page || 1;
      const perPage = 10;

      // Obținem toți utilizatorii
      const usersRef = collection(db, "users");
      const q = query(usersRef, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return res.status(200).send({ page: 0, data: [] });
      }

      const usersResponse = querySnapshot.docs.map(doc => {
        const userData = doc.data();
        return {
          id: doc.id,
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          created_at: userData.createdAt ? userData.createdAt.toDate() : new Date(),
          profilePictureUrl: userData.profilePictureUrl || null,
          userRole: {
            id: userData.role === ROLE.SUPERADMIN ? 1 : userData.role === ROLE.ADMIN ? 2 : 3,
            name: userData.role || ROLE.USER,
          },
        };
      });

      // Paginarea
      const startIndex = (page - 1) * perPage;
      const endIndex = page * perPage;
      const data = usersResponse.slice(startIndex, endIndex);

      const dataResponse = {
        page: usersResponse.length,
        data: data,
      };

      return res.status(200).send(dataResponse);
    } catch (error) {
      console.error(error);
      return res.status(500).json("Server error");
    }
  }
);

module.exports = router;
