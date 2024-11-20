require("dotenv").config();

const {
  client,
  createTables,
  createUser,
  createProduct,
  fetchUsers,
  fetchProducts,
  createFavorite,
  fetchFavorites,
  destroyFavorite,
} = require("./db");

const express = require("express");
const app = express();

app.use(require("morgan")("dev"));
app.use(express.json());

// READ users using GET /api/users
app.get("/api/users", async (req, res, next) => {
  try {
    res.send(await fetchUsers());
  } catch (error) {
    next(error);
  }
});

// READ products using GET /api/products
app.get("/api/products", async (req, res, next) => {
  try {
    res.send(await fetchProducts());
  } catch (error) {
    next(error);
  }
});

// READ favorites using GET /api/favoritesa
app.get("/api/favorites", async (req, res, next) => {
  try {
    res.send(await fetchFavorites());
  } catch (error) {
    next(error);
  }
});

// REMOVE specific favorite using DELETE /api/users/:user_id/favorites/:id
app.delete("/api/users/:user_id/favorites/:id", async (req, res, next) => {
  try {
    await destroyFavorite({
      user_id: req.params.user_id,
      id: req.params.id,
    });
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
});

// POST /api/users/:user_id/favorites - Returns a created favorite with a user and product
app.post("/api/users/:user_id/favorites", async (req, res, next) => {
  try {
    res.status(201).send(
      await createFavorite({
        user_id: req.params.user_id,
        product_id: req.body.product_id,
      })
    );
  } catch (error) {
    next(error);
  }
});

const init = async () => {
  await client.connect();
  await createTables();

  const [
    alice,
    brian,
    catherine,
    david,
    evelyn,
    earbuds,
    officeChair,
    phoneStand,
  ] = await Promise.all([
    createUser({ username: "AJohnson", password: "securepassword" }),
    createUser({ username: "BSmith", password: "1234" }),
    createUser({ username: "CLee", password: "superdupersafe" }),
    createUser({ username: "DKim", password: "dfsdfgdgg" }),
    createUser({ username: "EMartinez", password: "unicorn-purple-potato" }),
    createProduct({ name: "Wireless Earbuds" }),
    createProduct({ name: "Ergonomic Office Chair" }),
    createProduct({ name: "Smartphone Stand" }),
  ]);
  console.log(await fetchUsers());
  console.log(await fetchProducts());

  const [favorite, favorite2] = await Promise.all([
    createFavorite({
      user_id: alice.id,
      product_id: earbuds.id,
    }),
    createFavorite({
      user_id: david.id,
      product_id: phoneStand.id,
    }),
  ]);
  console.log(await fetchFavorites());

//   await destroyFavorite({
//     id: favorite.id,
//     user_id: favorite.user_id,
//   });
//   console.log(await fetchFavorites());

  const port = process.env.PORT;
  app.listen(port, () => {
    console.log(`listening on port ${port}`);

    console.log(`curl localhost:${port}/api/users`);
    console.log(`curl localhost:${port}/api/products`);
    console.log(`curl localhost:${port}/api/favorites`);
    console.log(
      `curl -X DELETE localhost:${port}/api/users/${alice.id}/favorites/${favorite2.id}`
    );
    console.log(
      `curl -X POST localhost:${port}/api/users/${evelyn.id}/favorites -d '{"user_id":"${evelyn.id}", "product_id":"${officeChair.id}"}' -H "Content-Type:application/json"`
    );
  });
};
init();
