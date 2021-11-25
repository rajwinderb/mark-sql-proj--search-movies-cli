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
  console.log("Welcome to search-movies-cli! \n");
  let quit = false;
  while (!quit) {
    const actions = ["Search", "See Favourites", "Quit"];
    // console.log(
    //   "\n",
    //   "[1] Search \n",
    //   "[2] See Favourites \n",
    //   "[3] Quit \n",
    //   "\n"
    // );
    let action = await keyInSelect(actions, "Choose an action! \n");
    if (action === 1) {
      let movies = await searchMovies();
      await addFavourite(movies);
    } else if (action === 2) {
      await seeFavourites();
    } else if (action === 3) {
      console.log("All done!");
      quit = true;
    } else {
      action = await keyInSelect(actions, "Choose an action! \n");
    }
  }
}

async function searchMovies(): Promise<Movie[]> {
  console.log("search");
  const client = new Client({ database: "omdb" });
  await client.connect();
  let searchTerm = await question("Search term: ");
  let movies: Movie[];
  try {
    // try this
    const text =
      "SELECT id, name, date, runtime, budget, revenue, vote_average, votes_count FROM movies WHERE LOWER(name) LIKE LOWER($1) ORDER BY date DESC LIMIT 10;";
    const values = [`%${searchTerm}%`];
    const res = await client.query(text, values);
    console.table(res.rows);
    movies = res.rows;
  } catch (e) {
    // console error
    console.error(e.stack);
  } finally {
    await client.end();
  }
  return movies;
}

async function addFavourite(movies: Movie[]): Promise<void> {
  console.log("movies \n", movies);
  console.log("add fav");
}

async function seeFavourites(): Promise<void> {
  console.log("see favs");
}

mainMenu();
