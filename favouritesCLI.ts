import { question, keyInSelect } from "readline-sync";
import { Client } from "pg";

interface Movie {
  id: string;
  name: string;
  date: Date;
  runtime: number;
  budget: string;
  revenue: string;
  vote_average: string;
  votes_count: string;
}

async function mainMenu() {
  console.log("Welcome to search-movies-cli!");
  let quit = false;
  while (!quit) {
    const actions = ["Search", "See Favourites", "Quit"];
    let action = await keyInSelect(actions, "Choose an action! \n", {
      cancel: false,
    });
    if (action === 0) {
      let moviesAndIds = await searchMovies();
      await addFavourite(moviesAndIds);
    } else if (action === 1) {
      await seeFavourites();
    } else if (action === 2) {
      console.log("All done!");
      quit = true;
    } else {
      action = await keyInSelect(actions, "Choose an action! \n", {
        cancel: false,
      });
    }
  }
}

async function searchMovies(): Promise<string[][]> {
  const client = new Client({ database: "omdb" });
  await client.connect();
  let searchTerm = await question("Search term: ");
  let movies: string[];
  let moviesIds: string[];
  try {
    // try this
    const text =
      "SELECT id, name, date, runtime, budget, revenue, vote_average, votes_count FROM movies WHERE LOWER(name) LIKE LOWER($1) AND kind=$2 ORDER BY date DESC LIMIT 9;";
    const values = [`%${searchTerm}%`, "movie"];
    const res = await client.query(text, values);
    console.table(res.rows);
    movies = res.rows.map((field) => field.name);
    moviesIds = res.rows.map((field) => field.id);
  } catch (e) {
    // console error
    console.error(e.stack);
  } finally {
    await client.end();
  }
  return [movies, moviesIds];
}

async function addFavourite(moviesAndIds: string[][]): Promise<void> {
  const favourite = await keyInSelect(
    moviesAndIds[0],
    "Select a movie to favourite "
  );
  if (favourite !== -1) {
    const client = new Client({ database: "omdb" });
    await client.connect();
    try {
      const text = "INSERT INTO favourites (movie_id) VALUES ($1)";
      const values = [`${parseInt(moviesAndIds[1][favourite])}`];
      await client.query(text, values);
      console.log(`Saving favourite movie: ${moviesAndIds[0][favourite]}`);
    } catch (e) {
      // console error
      console.error(e.stack);
    } finally {
      await client.end();
    }
  } else {
    console.log("Cancelled");
  }
}

async function seeFavourites(): Promise<void> {
  const client = new Client({ database: "omdb" });
  await client.connect();
  try {
    const text =
      "SELECT m.id, m.name, m.date, m.runtime, m.budget, m.revenue, m.vote_average, m.votes_count FROM movies m JOIN favourites f ON m.id = f.movie_id;";
    const res = await client.query(text);
    console.table(res.rows);
  } catch (e) {
    // console error
    console.error(e.stack);
  } finally {
    await client.end();
  }
}

mainMenu();
