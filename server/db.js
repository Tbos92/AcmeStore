require("dotenv").config();

const pg = require("pg");
const client = new pg.Client(process.env.DATABASE_URL);

const uuid = require("uuid");
const bcrypt = require("bcrypt");

const createTables = async () => {
  const SQL = /*sql */ `
    DROP TABLE IF EXISTS favorites;
    DROP TABLE IF EXISTS users;
    DROP TABLE IF EXISTS products;
    CREATE TABLE users(
        id UUID PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        password VARCHAR(255)
    );
    CREATE TABLE products(
        id UUID PRIMARY KEY,
        name VARCHAR(50) NOT NULL
    );
    CREATE TABLE favorites(
        id UUID PRIMARY KEY,
        user_id UUID REFERENCES users(id) NOT NULL,
        product_id UUID REFERENCES products(id) NOT NULL,
        UNIQUE(user_id, product_id)
    );
    `;

  try {
    await client.query(SQL);
    console.log("Tables created successfully.");
  } catch (error) {
    console.error("Error creating tables:", error);
  }
};

const createUser = async ({ username, password }) => {
  const SQL = /*sql */ `
  INSERT INTO users (id, username, password) VALUES($1, $2, $3) RETURNING *
  `;
  const response = await client.query(SQL, [
    uuid.v4(),
    username,
    await bcrypt.hash(password, 5),
  ]);
  return response.rows[0];
};

const createProduct = async ({ name }) => {
  const SQL = /*sql */ `
    INSERT INTO products(id, name) VALUES($1, $2) RETURNING *
    `;
  const response = await client.query(SQL, [uuid.v4(), name]);
  return response.rows[0];
};

const fetchUsers = async () => {
  const SQL = /*sql */ `
  SELECT * FROM users
  `;
  const response = await client.query(SQL);
  return response.rows;
};

const fetchProducts = async () => {
  const SQL = /*sql */ `
    SELECT * FROM products
    `;
  const response = await client.query(SQL);
  return response.rows;
};

const createFavorite = async ({ product_id, user_id }) => {
  const SQL = /*sql */ `
    INSERT INTO favorites(id, product_id, user_id) VALUES($1, $2, $3) RETURNING *
    `;
  const response = await client.query(SQL, [uuid.v4(), product_id, user_id]);
  return response.rows[0];
};

const fetchFavorites = async () => {
  const SQL = /*sql */ `
      SELECT * FROM favorites
      `;
  const response = await client.query(SQL);
  return response.rows;
};

const destroyFavorite = async ({ id, user_id }) => {
  console.log(id, user_id);
  const SQL = /*sql */ `
  DELETE FROM favorites
  WHERE id = $1 AND user_id = $2
  `;
  await client.query(SQL, [id, user_id]);
};

module.exports = {
  client,
  createTables,
  createUser,
  createProduct,
  fetchUsers,
  fetchProducts,
  createFavorite,
  fetchFavorites,
  destroyFavorite,
};
