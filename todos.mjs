import { Router } from "express";
import { client, todosCollection, usersCollection } from "./database.mjs";
import { ObjectId } from "mongodb";
const router = Router();

router.post("/:id", async (req, res, next) => {
  const session = client.startSession();
  try {
    const data = {
      ...req.body,
      finished: false,
      date: new Date(),
    };
    session.startTransaction();
    const createdTodo = await todosCollection.insertOne(data, { session });
    await usersCollection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $push: { todos: createdTodo.insertedId } },
      { session }
    );
    await session.commitTransaction();
    data["_id"] = createdTodo.insertedId;
    res.status(201).send(data);
  } catch (error) {
    session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
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

router.delete("/:id/:user_id", async (req, res, next) => {
  const session = client.startSession();
  try {
    session.startTransaction();
    await todosCollection.deleteOne(
      { _id: new ObjectId(req.params.id) },
      { session }
    );
    await usersCollection.updateOne(
      { _id: new ObjectId(req.params.user_id) },
      { $pull: { todos: { _id: req.params.id } } },
      { session }
    );
    await session.commitTransaction();
    res.status(200).send("Deleted successfully");
  } catch (error) {
    session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
});

export default router;
