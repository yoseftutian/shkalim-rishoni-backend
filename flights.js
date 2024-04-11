import { Router } from "express";
import { flightsCollection } from "./database.mjs";
import { ObjectId } from "mongodb";
const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const flights = await flightsCollection.find().toArray();
    res.status(200).send(flights);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { insertedId } = await flightsCollection.insertOne(req.body);
    res.status(201).send({ ...req.body, _id: insertedId });
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    await flightsCollection.deleteOne({ _id: new ObjectId(req.params.id) });
    res.status(200).send("Deleted");
  } catch (error) {
    next(error);
  }
});

router.patch("/:id", async (req, res, next) => {
  try {
    await flightsCollection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: req.body }
    );
    res.status(200).send("Updated");
  } catch (error) {
    next(error);
  }
});

export default router;