const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 5000;

// miedlewere
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}E37RXt2BqCk4UVlB@cluster0.e40en03.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

const data = require("./db.json");
app.get("/db", (req, res) => {
  res.send(data);
});

async function run() {
  try {
    const serviceCollection = client.db("services").collection("service");
    app.get("/", (req, res) => {
      res.send("query server is running");
    });
    app.get("/services", async (req, res) => {
      const page = req.query.page;
      const size = parseInt(req.query.size);
      const query = {};
      const cursor = serviceCollection.find(query);
      const services = await cursor
        .skip(page * size)
        .limit(size)
        .toArray();
      res.send(services);
    });
    app.get("/allservices", async (req, res) => {
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

    app.post("/services", async (req, res) => {
      const service = req.body;
      const result = await serviceCollection.insertOne(service);
      res.send(result);
      console.log(result);
    });
    app.put("/services/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const service = req.body;
      const ser = service[0].review;
      const updateService = {
        $set: {
          name: service.review.title,
        },
      };
      const option = { upsert: true };
      const result = await serviceCollection.updateOne(
        query,
        updateService,
        option
      );
      console.log(service);
      res.send(result);
      console.log(ser);
    });
  } finally {
  }
}
run().catch((err) => console.log(err));

app.listen(port, () => {
  console.log("listen on port " + port);
});
