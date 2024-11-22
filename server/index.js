const {
    client,
    createTables,
    createCustomer,
    fetchCustomers,
    createRestaurant,
    fetchRestaurants,
    createReservation,
    fetchReservations,
    destroyReservation,
  } = require("./db");
  
  const express = require("express");
  const app = express();
  app.use(express.json());
  
  app.get("/api/customers", async (req, res, next) => {
    try {
      res.send(await fetchCustomers());
    } catch (ex) {
      next(ex);
    }
  });
  
  app.get("/api/restaurants", async (req, res, next) => {
    try {
      res.send(await fetchRestaurants());
    } catch (ex) {
      next(ex);
    }
  });
  
  app.get("/api/reservations", async (req, res, next) => {
    try {
      res.send(await fetchReservations());
    } catch (ex) {
        next(ex);
    }
  });
  
  app.post("/api/customers/:customer_id/reservations", async (req, res, next) => {
    try {
      res.status(201).send(
        await createReservation({
          customer_id: req.params.customer_id,
          ...req.body,
        })
      );
    } catch (ex) {
      next(ex);
    }
  });
  
  app.delete(
    "/api/customers/:customer_id/reservations/:id",
    async (req, res, next) => {
      try {
        await destroyReservation({
          customer_id: req.params.customer_id,
          id: req.params.id,
        });
        res.sendStatus(204);
      } catch (ex) {
        next(ex);
      }
    }
  );
  
  const init = async () => {
    console.log("connecting to database");
    await client.connect();
    console.log("connected to database");
  await createTables();
  console.log("tables created");
  const [moe, lucy, ethyl, curly, diner, fancy, seafood] = await Promise.all([
    createCustomer({ name: "moe" }),
    createCustomer({ name: "lucy" }),
    createCustomer({ name: "larry" }),
    createCustomer({ name: "ethyl" }),
    createRestaurant({ name: "The Diner" }),
    createRestaurant({ name: "Chez Fancy" }),
    createRestaurant({ name: "See Seafood Bar" }),
  ]);

  const customers = await fetchCustomers();
  console.log(customers);

  const restaurants = await fetchRestaurants();
  console.log(restaurants);

  const [res1, res2, res3] = await Promise.all([
    createReservation({
      restaurant_id: fancy.id,
      customer_id: lucy.id,
      party_count: 5,
      date: "12/25/2024",
    }),
    createReservation({
      restaurant_id: seafood.id,
      customer_id: lucy.id,
      party_count: 3,
      date: "10/24/2024",
    }),
    createReservation({
        restaurant_id: seafood.id,
      customer_id: moe.id,
      party_count: 3,
      date: "05/15/2024",
    }),
  ]);
  console.log(await fetchReservations);

  await destroyReservation(res1);

  console.log(await fetchReservations());

  console.log("data seeded");

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`listening on port ${port}`);
    console.log("curl commands");
    console.log(`curl localhost:${port}/api/customers`);
    console.log(`curl localhost:${port}/api/restaurants`);
    console.log(`curl localhost:${port}/api/reservations`);
    console.log(
      `curl localhost:${port}/api/customers/${res2.customer_id}/reservations/${res2.id} -X DELETE`
    );
    console.log(`curl localhost:${port}/api/reservations`);
    console.log(
      `curl localhost:${port}/api/customers/${moe.id}/reservations -X POST -d '{"restaurant_id": "${diner.id}", "party_count": 9, "date": "11/11/2024"}' -H "Content-Type:application/json"`
    );
  });
};

init();