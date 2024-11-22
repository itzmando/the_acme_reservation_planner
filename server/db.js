const pg = require("pg");
const client = new pg.Client(
  process.env.DATABASE_URL || "postgres://localhost/acme_dining_db"
);
const uuid = require("uuid");

const createTables = async () => {
  const SQL = `
    DROP TABLE IF EXISTS reservations;
    DROP TABLE IF EXISTS customers;
    DROP TABLE IF EXISTS restaurants;
    CREATE TABLE customers(
      id UUID PRIMARY KEY,
      name VARCHAR(100) NOT NULL UNIQUE
    );
    CREATE TABLE restaurants(
      id UUID PRIMARY KEY,
      name VARCHAR(100) NOT NULL UNIQUE
    );
    CREATE TABLE reservations(
      id UUID PRIMARY KEY,
      party_count INTEGER NOT NULL,
      date DATE NOT NULL,
      restaurant_id UUID REFERENCES restaurants(id),
      customer_id UUID REFERENCES customers(id)
    );
  `;
  await client.query(SQL);
};

const createCustomer = async (customer) => {
  const SQL = `
    INSERT INTO customers(id, name)
    VALUES ($1, $2)
    RETURNING *
  `;
  const response = await client.query(SQL, [uuid.v4(), customer.name]);
  return response.rows[0];
};

const fetchCustomers = async () => {
  const SQL = `
    SELECT *
    FROM customers
  `;
  const response = await client.query(SQL);
  return response.rows;
};

const fetchReservations = async () => {
  const SQL = `
    SELECT *
    FROM reservations
  `;
  const response = await client.query(SQL);
  return response.rows;
};

const createRestaurant = async (restaurant) => {
  const SQL = `
    INSERT INTO restaurants(id, name)
    VALUES ($1, $2)
    RETURNING *
  `;
  const response = await client.query(SQL, [uuid.v4(), restaurant.name]);
  return response.rows[0];
};

const createReservation = async (reservation) => {
  const SQL = `
    INSERT INTO reservations(id, restaurant_id, customer_id, party_count, date)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;
  const response = await client.query(SQL, [
    uuid.v4(),
    reservation.restaurant_id,
    reservation.customer_id,
    reservation.party_count,
    reservation.date,
  ]);
  return response.rows[0];
};

const destroyReservation = async ({ id, customer_id }) => {
  const SQL = `
    DELETE FROM reservations
    WHERE id = $1 AND customer_id=$2
  `;
  const response = await client.query(SQL, [id, customer_id]);
};

const fetchRestaurants = async () => {
  const SQL = `
    SELECT *
    FROM restaurants
  `;
  const response = await client.query(SQL);
  return response.rows;
};

module.exports = {
  client,
  createTables,
  createCustomer,
  fetchCustomers,
  createRestaurant,
  fetchRestaurants,
  fetchReservations,
  createReservation,
  destroyReservation,
};