import express, { Request, Response } from 'express';
import moment from 'moment';
import axios from 'axios';

const app = express();
app.use(express.json());

require('dotenv').config();

type Movie = {
  id: number;
  title: string;
  release_date: string;
  vote_average: number;
  editors?: string[];
};

type Editor = {
  name: string;
};

const client = axios.create({
  baseURL: process.env.API_URL,
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${process.env.API_READ_ACCESS_TOKEN}`,
  },
});

app.get('/movies', async (req: Request, res: Response) => {
  const year = parseInt(req.query.year as string);
  const page = parseInt(req.query.page as string);

  if (!year || !page) {
    res.status(400).send({ error: 'Year and page are required' });
    return;
  }

  try {
    const movies = await getMovies(year, page);

    if (movies.length === 0) {
      res.status(200).json([]);
      return;
    }

    res.status(200).json(movies);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'Internal Server Error' });
  }
});

export async function getMovies(year: number, page: number): Promise<Movie[]> {
  try {
    const response = await client.get(`/discover/movie`, {
      params: {
        language: 'en-US',
        page,
        primary_release_year: year,
        sort_by: 'popularity.desc',
      },
    });

    const movies = response.data.results;
    const movieDetails: Movie[] = await Promise.all(
      movies.map(async (movie: Movie) => ({
        title: movie.title,
        release_date: moment(movie.release_date).format('MMMM D, YYYY'),
        vote_average: movie.vote_average,
        editors: await getEditorsFromCredits(movie.id),
      }))
    );

    return movieDetails;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getEditorsFromCredits(
  movieId: number
): Promise<Editor[]> {
  try {
    const response = await client.get(`movie/${movieId}/credits`);

    const editors = response.data.crew.filter(
      (member: { known_for_department: string }) =>
        member.known_for_department === 'Editing'
    );

    return editors.map((editor: Editor) => editor.name);
  } catch (error) {
    console.error(error);
    return [];
  }
}

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

export default app;
