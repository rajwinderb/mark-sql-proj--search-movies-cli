import { question } from "readline-sync";
import { Client } from "pg";

//As your database is on your local machine, with default port,
//and default username and password,
//we only need to specify the (non-default) database name.

async function userInterface() {
  console.log("Welcome to search-movies-cli!");
  const client = new Client({ database: "omdb" });
  await client.connect();
  let quit = false;
  while (quit === false) {
    let searchTerm = await question(
      "Search for what movie? (or 'q' to quit): "
    );
    if (searchTerm !== "q") {
      try {
        // try this
        const text =
          "SELECT id, name, date, runtime, budget, revenue, vote_average, votes_count FROM movies WHERE LOWER(name) LIKE LOWER($1) ORDER BY date DESC LIMIT 10;";
        const values = [`%${searchTerm}%`];
        const res = await client.query(text, values);
        console.table(res.rows);
      } catch (e) {
        // console error
        console.error(e.stack);
      }
    } else {
      quit = true;
    }
  }
  await client.end();
}

userInterface();
