import { Router } from "express";
import { usersCollection } from "./database.mjs";
import { ObjectId } from "mongodb";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const users = await usersCollection
      .find()
      .project({ password: 0 })
      .toArray();
    res.json({
      data: users,
      status: "OK",
    });
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    // const auth = req.headers.authorization;
    // if (auth === null) res.send("No Token Found");
    // const token = auth.split(" ")[1];
    // console.log(jwt.verify(token, "Netef Makes Argazim Amen"));
    res.json({
      data: await usersCollection.findOne(
        { _id: new ObjectId(req.params.id) },
        { projection: { password: 0 } }
      ),
      status: "OK",
    });
  } catch (error) {
    next(error);
  }
});

router.post("/register", async (req, res, next) => {
  try {
    const { password } = req.body;
    const saltRounds = 10;
    req.body["password"] = await bcrypt.hash(password, saltRounds);
    await usersCollection.insertOne(req.body);
    res.status(201).send("User Created");
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await usersCollection.findOne({ username });
    if (await bcrypt.compare(password, user["password"])) {
      delete user["password"];
      const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
        algorithm: "HS256",
      });
      res.status(200).send(token);
    } else {
      throw new Error("Password does not match");
    }
  } catch (error) {
    next(error);
  }
});

export default router;
