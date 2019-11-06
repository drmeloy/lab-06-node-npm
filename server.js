require('dotenv').config();

const express = require('express');
const cors = require('cors');
const app = express();
const superagent = require('superagent');


const PORT = process.env.PORT || 3000;

app.use(cors());

// const geoData = require('./data/geo.json');
// const darkSky = require('./data/darksky.json');
let latLngs;

const formatLocationResponse = (locationItem) => {
    const {
        geometry: {
            location: {
                lat,
                lng,
            },
        },
        formatted_address,
    } = locationItem;

    return {
        formatted_query: formatted_address,
        latitude: lat,
        longitude: lng
    };
};

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



const toLocationWeather = (darkSky) => {
    const data = darkSky.daily.data;
    let dayData = [];

    data.map(day => {
        let dayObject = {};

        dayObject.forecast = day.summary;
        dayObject.time = Date(day.time);

        dayData.push(dayObject);
    });
    
    return dayData;
};

// app.use(express.static('./public'));

app.get('/location', async(req, res) => {
    const searchQuery = req.query.search;
    const GEOCODE_API_KEY = process.env.GEOCODE_API_KEY;
    const locationItem = await superagent.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${searchQuery}&key=${GEOCODE_API_KEY}`);
    const actualItem = JSON.parse(locationItem.text).results[0];
    const response = formatLocationResponse(actualItem);
    latLngs = response;
    res.json(response);
});

app.get('/weather', (request, response) => {
    try {
        const location = request.query.search;
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