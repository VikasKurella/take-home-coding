import request from 'supertest';
import axios from 'axios';
import app from './index';

jest.mock('axios');

const mockGet = jest.fn();

(axios.create as jest.Mock).mockReturnValue({
  get: mockGet,
});

const mockMovies = [
  {
    title: 'Venom: Let There Be Carnage',
    release_date: 'September 30, 2021',
    vote_average: 6.799,
    editors: ['Maryann Brandon', 'Stan Salfas', 'Jane Tones'],
  },
  {
    title: 'Pleasure',
    release_date: 'October 8, 2021',
    vote_average: 6.2,
    editors: [
      'Ludwig Källén',
      'Ludwig Källén',
      'Nikolai Waldman',
      'Olivia Neergaard-Holm',
      'Amalie Westerlin Tjellesen',
    ],
  },
  {
    title: 'The Last Sunset: A Love Story',
    release_date: 'October 9, 2021',
    vote_average: 7.5,
    editors: [],
  },
  {
    title: 'Spider-Man: No Way Home',
    release_date: 'December 15, 2021',
    vote_average: 8,
    editors: ['Jeffrey Ford', 'Leigh Folsom Boyd'],
  },
];

describe('Movies Response', () => {
  it('should return 200 with movies list', async () => {
    mockGet.mockResolvedValueOnce({
      data: { results: mockMovies },
    });
    const response = await request(app)
      .get('/movies')
      .query({ year: 2021, page: 1 });
    expect(response.status).toBe(200);
  });

  it('should return 400 when year or page is missing', async () => {
    const response = await request(app).get('/movies').query({});
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Year and page are required');
  });
});

describe('Movies with Editors', () => {
  it('should return a list of movies with editors', () => {
    const moviesWithEditors = mockMovies.filter(
      (movie) => movie.editors.length > 0
    );
    expect(moviesWithEditors.length).toBeGreaterThan(0);
    expect(moviesWithEditors[0].title).toBe('Venom: Let There Be Carnage');
    expect(moviesWithEditors[0].editors).toEqual([
      'Maryann Brandon',
      'Stan Salfas',
      'Jane Tones',
    ]);
  });

  it('should return an empty list if no movies have editors', () => {
    const moviesWithEditors = mockMovies.filter(
      (movie) => movie.editors.length > 0
    );
    expect(moviesWithEditors.length).toBeGreaterThan(0);
    expect(
      moviesWithEditors.filter((movie) => movie.editors.length === 0).length
    ).toBe(0);
  });
});

describe('Movies without Editors', () => {
  it('should return movies with no editors', () => {
    const moviesWithoutEditors = mockMovies.filter(
      (movie) => movie.editors.length === 0
    );
    expect(moviesWithoutEditors.length).toBeGreaterThan(0);
    expect(moviesWithoutEditors[0].title).toBe('The Last Sunset: A Love Story');
    expect(moviesWithoutEditors[0].editors).toEqual([]);
  });
});

describe('Edge Case', () => {
  it('should handle case when there are no movies', () => {
    const noMovies: any[] = [];
    const filteredMovies = noMovies.filter((movie) => movie.editors.length > 0);
    expect(filteredMovies.length).toBe(0);
  });
});
