require('dotenv').config();

const express = require('express');
const cors = require('cors');
const app = express();

const PORT = process.env.PORT || 3000;

app.use(cors());

const geoData = require('./data/geo.json');
const darkSky = require('./data/darksky.json');

const getLatLng = (location) => {
    if (location === 'bad location'){
        throw new Error();
    }

    return toLocation(geoData);
};

const getLatLngWeather = (location) => {
    if (location === 'bad location'){
        throw new Error();
    }

    return toLocationWeather(darkSky);
};

const toLocation = (geoData) => {
    const firstResult = geoData.results[0];
    const geometry = firstResult.geometry;

    return {
        formatted_query: firstResult.formatted_address,
        latitude: geometry.location.lat,
        longitude: geometry.location.lng
    };
};

const toLocationWeather = (darkSky) => {
    return {
        forecast: darkSky.hourly.summary,
        time: Date(darkSky.hourly.data[0]),
    };
};

// app.use(express.static('./public'));

app.get('/location', (request, response) => {
    try {
        const location = request.query.location;
        const result = getLatLng(location);
        response.status(200).json(result);
    }
    catch (err){
        response.status(500).send('Sorry, something in da location dun fked');
    }
});

app.get('/weather', (request, response) => {
    try {
        const location = request.query.location;
        const result = getLatLngWeather(location);
        response.status(200).json(result);
    }
    catch (err){
        response.status(500).send('Sorry, something in da weather dun fked');
    }
});

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});