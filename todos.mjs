import { Router } from "express";
import { todosCollection, usersCollection } from "./database.mjs";
import { ObjectId } from "mongodb";
const router = Router();

router.post("/:id", async (req, res, next) => {
  try {
    const data = {
      ...req.body,
      finished: false,
      date: new Date(),
    };
    const createdTodo = await todosCollection.insertOne(data);
    await usersCollection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $push: { todos: createdTodo.insertedId } }
    );
    data["_id"] = createdTodo.insertedId;
    res.status(201).send(data);
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const todosIds = await usersCollection.findOne(
      { _id: new ObjectId(req.params.id) },
      { projection: { todos: 1 } }
    );
    const todos = await todosCollection
      .find({ _id: { $in: todosIds.todos } })
      .toArray();
    res.status(200).send(todos);
  } catch (error) {
    next(error);
  }
});

router.patch("/:id", async (req, res, next) => {
  try {
    await todosCollection.updateOne({ _id: new ObjectId(req.params.id) }, [
      { $set: { finished: { $not: "$finished" } } },
    ]);
    res.status(200).send("Updated successfully");
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    await todosCollection.deleteOne({ _id: new ObjectId(req.params.id) });
    res.status(200).send("Deleted successfully");
  } catch (error) {
    next(error);
  }
});

export default router;
