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
    const data = darkSky.daily.data;
    let dayData = [];

    data.forEach(day => {
        let dayObject = {};

        dayObject.forecast = day.summary;
        dayObject.time = Date(day.time);

        dayData.push(dayObject);
    });
    
    return dayData;
};

// app.use(express.static('./public'));

app.get('/location', (request, response) => {
    try {
        const location = request.query.location;
        const result = getLatLng(location);
        response.status(200).json(result);
    }
    catch (err){
        response.status(500).send('Sorry, we were unable to find that location. Please try again with another location.');
    }
});

app.get('/weather', (request, response) => {
    try {
        const location = request.query.location;
        const result = getLatLngWeather(location);
        response.status(200).json(result);
    }
    catch (err){
        response.status(500).send('Sorry, we were unable to collect weather information for that location. Please try again with another location.');
    }
});

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});