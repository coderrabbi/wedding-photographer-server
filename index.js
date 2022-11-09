const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 5000;

// miedlewere
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri =
  "mongodb+srv://photographer:E37RXt2BqCk4UVlB@cluster0.e40en03.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

// const data = require("./db.json");
// app.get("/db", (req, res) => {
//   res.send(data);
// });

async function run() {
  try {
    const serviceCollection = client.db("services").collection("service");
    app.get("/services", async (req, res) => {
      const query = {};
      const cursor = serviceCollection.find(query);
      const services = await cursor.toArray();
      res.send(services);
    });
    app.get("/services/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const service = await serviceCollection.findOne(query);
      res.send(service);
    });

    app.post("/services/:id", async (req, res) => {
      const review = req.body;
      const result = await serviceCollection.insertOne(review);
      console.log(result);
      res.send(result);
    });
  } finally {
  }
}
run().catch((err) => console.log(err));

app.get("/db/:id", (req, res) => {
  const id = req.params.id;

  const selectedCourses = db.find((c) => c.id === id);
  res.send(selectedCourses);
});
app.get("/", (req, res) => {
  res.send("app is running");
});

app.listen(port, () => {
  console.log("listen on port " + port);
});
