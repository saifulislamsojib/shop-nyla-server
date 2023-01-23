const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();

app.use(express.json());
app.use(cors());

const port = process.env.PORT || 4000;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ernz8.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

(async () => {
  const productsCollection = client
    .db(process.env.DB_NAME)
    .collection("products");

  app.get("/", (req, res) => {
    res.send("Hello Shop Nyla!");
  });

  productsCollection.countDocuments().then((count) => {
    app.get("/products", (req, res) => {
      productsCollection
        .aggregate([{ $sample: { size: count } }])
        .toArray((_error, products) => {
          res.send(products);
        });
    });
  });

  app.get("/product/:id", (req, res) => {
    productsCollection
      .find({ _id: ObjectId(req.params.id) })
      .toArray((error, products) => {
        res.send(products);
      });
  });

  //client.close();
})().catch((err) => console.log(err));

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
