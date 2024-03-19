const pg = require("pg");
const express = require("express");
const client = new pg.Client(
  process.env.DATABASE_URL || "postgres://localhost/acme_ice_cream_shop"
);
const app = express();
//parses incoming requests into JSON
app.use(express.json());
//logs requests as they com in
app.use(require("morgan")("dev"));

//CREATE
app.post("/api/flavors", async (req, res, next) => {
  try {
    const SQL = `
      INSERT INTO flavors(name)
      VALUES($1)
      RETURNING *
      `;
    const response = await client.query(SQL, [req.body.txt]);
    res.send(response.rows[0]);
  } catch (error) {
    next(error);
  }
});

//READ
app.get("/api/flavors", async (req, res, next) => {
  try {
    const SQL = `
      SELECT * from flavors;
    `;
    const response = await client.query(SQL);
    res.send(response.rows);
  } catch (error) {
    next(error);
  }
});

//UPDATE
app.put("/api/flavors/:id", async (req, res, next) => {
  try {
    const SQL = `
    UPDATE flavors
    SET name=$1, is_favorite=$2, updated_at=now()
    WHERE id=$3 RETURNING *
    `;
    const response = await client.query(SQL);
    res.send(response.rows);
  } catch (error) {
    next(error);
  }
});

//DELETE
app.delete("/api/flavors/:id", async (req, res, next) => {
  try {
    SQL = `
    DELETE from flavors
    WHERE id = $1
    `;
    const response = await client.query(SQL, [req.params.id]);
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
});

//create init
const init = async () => {
  await client.connect();
  console.log("Connected to database!");
  let SQL = `
    DROP TABLE IF EXISTS notes;
    CREATE TABLE flavors(
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    is_favorite BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
    )
  `;
  await client.query(SQL);
  console.log("Tables Created!");
  SQL = `
    INSERT INTO notes(name, is_favorite) VALUES('strawberry-cheesecake',true);
    `;
  await client.query(SQL);
  console.log("Data seated!");

  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`Listening on port ${port}`));
};
init();
