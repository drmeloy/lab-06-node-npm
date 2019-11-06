require('dotenv').config();

const express = require('express');
const cors = require('cors');
const app = express();
const superagent = require('superagent');
const PORT = process.env.PORT || 3000;

app.use(cors());

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

const getWeatherResponse = async(lat, lng) => {
    const weatherData = await superagent.get(`https://api.darksky.net/forecast/${process.env.DARKSKY_API_KEY}/${lat},${lng}`);
    const actualWeatherData = JSON.parse(weatherData.text);
    const dailyArray = actualWeatherData.daily.data;

    let dayData = [];

    dailyArray.map(day => {
        let dayObject = {};

        dayObject.forecast = day.summary;
        dayObject.time = new Date(day.time * 1000).toDateString();

        dayData.push(dayObject);
    });
    
    return dayData;
};

const formatEventsData = (eventsData) => {
    
};

const formatYelpData = (yelpData) => {
    let yelpDataArray = [];

    for (let i = 0; i < 20; i++){
        let businessName = yelpData.businesses[i].name;
        let businessImageURL = yelpData.businesses[i].image_url;
        let businessPrice = yelpData.businesses[i].price;
        let businessRating = yelpData.businesses[i].rating;
        let businessURL = yelpData.businesses[i].url;

        let businessObject = {
            name: businessName,
            image_url: businessImageURL,
            price: businessPrice,
            rating: businessRating,
            url: businessURL
        };
        
        yelpDataArray.push(businessObject);
    }

    return yelpDataArray;
};

app.get('/location', async(req, res) => {
    const searchQuery = req.query.search;
    const GEOCODE_API_KEY = process.env.GEOCODE_API_KEY;
    const locationItem = await superagent.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${searchQuery}&key=${GEOCODE_API_KEY}`);
    const actualItem = JSON.parse(locationItem.text).results[0];
    const response = formatLocationResponse(actualItem);
    latLngs = response;
    res.json(response);
});

app.get('/weather', async(req, res) => {
    const weatherObject = await getWeatherResponse(latLngs.latitude, latLngs.longitude);
    res.json(weatherObject);
});

app.get('/events', async(req, res) => {
    const eventsData = await superagent.get(`https://www.eventbriteapi.com/v3/events/search?location.latitude=${latLngs.latitude}&location.longitude=${latLngs.longitude}`)
        .set('Authorization', `Bearer /v3/users/me/?token=${process.env.EVENTBRITE_API_KEY}`);

    const formattedEventsData = formatEventsData(eventsData);
});

app.get('/reviews', async(req, res) => {
    const yelpData = await superagent.get(`https://api.yelp.com/v3/businesses/search?latitude=${latLngs.latitude}&longitude=${latLngs.longitude}`)
        .set('Authorization', `Bearer ${process.env.YELP_API_KEY}`);
    const actualYelpData = JSON.parse(yelpData.text);
    const formattedYelpData = formatYelpData(actualYelpData);
    res.json(formattedYelpData);    
});

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});