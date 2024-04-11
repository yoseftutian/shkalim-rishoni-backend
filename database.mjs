import { MongoClient, ServerApiVersion } from "mongodb";
const uri =
  "mongodb+srv://netefwork:Netef123@shkalimcluster.a5uqyzl.mongodb.net/?retryWrites=true&w=majority&appName=ShkalimCluster";

export const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

try {
  client = await client.connect();
} catch (e) {
  console.error(e);
}

const db = client.db("totahim");
export const productsCollection = db.collection("products");
export const usersCollection = db.collection("users");
export const todosCollection = db.collection("todos");
export const flightsCollection = db.collection("flights");

export default db;
