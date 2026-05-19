require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(cors());

const TMDB_TOKEN = `Bearer ${process.env.TMDB_TOKENN}`;

// trending movies
app.get('/api/trending', async (req, res) => {
    const region = req.query.region || 'RO'; // set landing to RO

    try {

        const url = region
            ? 'https://api.themoviedb.org/3/movie/popular?api_key=YOUR_KEY&region=${region}&language=en-US'
            : 'https://api.themoviedb.org/3/trending/movie/day?api_key=YOUR_KEY';

        const response = await axios.get(
            url,
            { headers: { Authorization: TMDB_TOKEN } }
        );

        const movies = response.data.results.slice(0, 20);

        const detailedMovies = await Promise.all(movies.map(async (movie) => {
            try {
                const providersResponse = await axios.get(
                    `https://api.themoviedb.org/3/movie/${movie.id}/watch/providers`,
                    { headers: { Authorization: TMDB_TOKEN } }
                );

                const regionData = providersResponse.data.results[region];
                const streamingOn = regionData && regionData.flatrate
                    ? regionData.flatrate.map(p => p.provider_name)
                    : [];

                const hubLink = regionData ? regionData.link : null;

                return {
                    id: movie.id,
                    title: movie.title,
                    overview: movie.overview,
                    rating: movie.vote_average,
                    release_date: movie.release_date,
                    poster: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
                    platforms: streamingOn,
                    watch_link: hubLink
                };
            } catch (err) {
                return null;
            }
        }));

        res.json(detailedMovies.filter(m => m !== null));
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch regional trending content" });
    }
});

app.get('/api/search', async (req, res) => {
    const movieName = req.query.q;
    const region = req.query.region || 'US';

    try {
        const searchResponse = await axios.get(
            `https://api.themoviedb.org/3/search/movie?query=${movieName}`,
            { headers: { Authorization: TMDB_TOKEN } }
        );

        const movies = searchResponse.data.results
            .filter(m => m.poster_path) // movies with poster
            .slice(0, 30);
        if (movies.length === 0) return res.json([]);

        //fetch each movie specific streaming providers
        const detailedMovies = await Promise.all(movies.map(async (movie) => {
            try {
                const providersResponse = await axios.get(
                    `https://api.themoviedb.org/3/movie/${movie.id}/watch/providers`,
                    { headers: { Authorization: TMDB_TOKEN } }
                );

                const regionData = providersResponse.data.results[region];
                const streamingOn = regionData && regionData.flatrate
                    ? regionData.flatrate.map(p => p.provider_name)
                    : [];

                const hubLink = regionData ? regionData.link : null;
                return {
                    id: movie.id,
                    title: movie.title,
                    overview: movie.overview,
                    rating: movie.vote_average,
                    release_date: movie.release_date,
                    poster: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 'https://via.placeholder.com/500x750?text=No+Poster',
                    platforms: streamingOn,
                    watch_link: hubLink
                };
            } catch (err) {
                return null;
            }
        }));

        res.json(detailedMovies.filter(m => m !== null));

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch from TMDB" });
    }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Backend alive on port ${PORT}`));