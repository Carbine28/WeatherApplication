const express = require('express');
const path = require('path');
const app = express();
const http = require('http');

const port = 8080;
const apiKey = "8fd481d84b99229254d57833341a80cb";
const searchLimit = 1;
const nDayForecast = 4;
const numForecast = nDayForecast * 8; // 5 day 3 hour forecast. 8 Forecast per day. Weather API Max is 5 days. 

const publicPath = path.resolve(__dirname, "public"); // Return absolute path to public dir 

// MinMax values used to generate random location weather data
const lonMin = -180;
const lonMax = 180;
const latMin = - 40;
const latMax = 80;
const maximumRetrys = 10; // Limit the amount of times getFunkyWeather attempts to get location
const maximumCitiesAllowed = 5;
// Middleware to serve static pages (html,css,images)
app.use(express.static(publicPath));

app.get('/fetchWeather/:cityName', getWeather); 
app.get('/fetchFunkyWeather', getFunkyWeather)

app.listen(port,() => console.log(`Server running at http://localhost:${port}/`));

// handler for weather search request of a specified location
async function getWeather(req,res){
    let city = req.params.cityName;

    let url = `http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=${searchLimit}&appid=${apiKey}`;
    
    let geoLocationObject = await getLocationData(url); // First fetch latitude and longitiude values using geoLocationAPI
    if (!geoLocationObject.length){
        res.json({empty: 1});
        console.log("Error in finding geolocation, returning empty string to client");
        return;
    }
    // Set Geo Lat and Lon variables into url
    let latitude = geoLocationObject[0].lat;
    let longitude = geoLocationObject[0].lon;
    
    // Fetch weather and pollution 5 day 3h forecast
    url = `http://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&cnt=${numForecast}&appid=${apiKey}&units=metric`;
    let weatherObject = await getLocationData(url); 
    url = `http://api.openweathermap.org/data/2.5/air_pollution/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}`;
    let pollutionObject = await getAirPollution(url);
    
    // Extract needed data from openWeather json object
    let jsonData = {
        "weatherData"   : weatherObject.list,
        "pollutionData" : pollutionObject.list,
        "cityData"      : weatherObject.city
    }
    // Sort the data
    let sortedData = sortWeatherData(jsonData); 
    res.json(sortedData); // Send data pre sorted to client browser to display.
}

// handler for getting a random location's weather data
async function getFunkyWeather(req,res){
    let cityCounter = 0;
    let citysWeatherArray = [];
    let pollutionArray = [];
    let cityNameArray = [];
    let latitude;
    let longitude; 
    let url;
    
    // Finds 5 random cities and fetches their data into weather arrays
    for(let i = 0; i < maximumCitiesAllowed; i++){
        latitude = getRandomLatLonValue(latMin,latMax);
        longitude = getRandomLatLonValue(lonMin,lonMax);
        url = `http://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&cnt=${numForecast}&appid=${apiKey}&units=metric`;
        let weatherObject = await getLocationData(url);
        if (!weatherObject.city.name){
            let retryAttempts = 0;
            while(!weatherObject.city.name){
                latitude = getRandomLatLonValue(latMin,latMax);
                longitude = getRandomLatLonValue(lonMin,lonMax);
                url = `http://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&cnt=${numForecast}&appid=${apiKey}&units=metric`;
                weatherObject = await getLocationData(url);
                if (retryAttempts === maximumRetrys) break;
                retryAttempts++;
            }
        }
        url = `http://api.openweathermap.org/data/2.5/air_pollution/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}`;
        let pollutionObject = await getAirPollution(url);
        citysWeatherArray.push(weatherObject);
        pollutionArray.push(pollutionObject);
        cityNameArray.push(weatherObject.city);
        cityCounter++;
    }
     
    let cityData = {
        "weatherData"   : citysWeatherArray,
        "pollutionData" : pollutionArray,
        "cityNameData"      : cityNameArray,
    }

    // Sorts each random cities weather data 
    let sortedCityArray = [];
    for (let i = 0; i <  cityCounter; i++){
        // Seperate into one json object to reuse sortWeatherData
        let jsonData = {
            "weatherData"   : cityData.weatherData[i].list,
            "pollutionData" : cityData.pollutionData[i].list,
            "cityData"      : cityData.cityNameData[i]
        }
        //console.log(jsonData.pollutionData);
        sortedData = sortWeatherData(jsonData);
        sortedCityArray.push(sortedData);    // Push sorted object into array
    }
    res.json(sortedCityArray); // Send array of sorted objects to client to display
}

function getRandomLatLonValue(min, max){
    return Math.random() * ( max - min ) + min;
}

// Sorts and calculates required data to send to client
function sortWeatherData(jsonObj){
    let dayList = createDays(nDayForecast);
    dayList = {...dayList, "wearMask" : false, "packUmbrella" : false, "days" : nDayForecast, "cityName" : jsonObj.cityData.name + ", " + jsonObj.cityData.country};
    let sortedList = setDayData(dayList,jsonObj)
    return sortedList;
}
// Calculates and finds the average data values for wind, rain and temp. also checks for air pollution
function setDayData(myList,jsonObj){
    let dayIndex = 0;
    let dayCounter = 0;
    for (let i = 0; i < numForecast; i++){
        // Checks for rain, sets a bool flag if true. 
        if('rain' in jsonObj.weatherData[i]){
            if(!myList[dayIndex].isRaining){
                myList[dayIndex].isRaining = true;
                myList["packUmbrella"] = true;
            } 
            myList[dayIndex].avgItems.avgRain +=  jsonObj.weatherData[i].rain['3h'];
        }

        myList[dayIndex].avgItems.avgWind +=  jsonObj.weatherData[i].wind.speed;
        myList[dayIndex].avgItems.avgTemp += jsonObj.weatherData[i].main.temp;
        dayCounter++;
        if(dayCounter === 8){ // Increase by 1 day for every 8 loops // Reset all variables
            myList[dayIndex].avgItems.avgWind =  ((myList[dayIndex].avgItems.avgWind)/8).toFixed(2); // Calclates average value within a day and rounds it to 2 decimals
            myList[dayIndex].avgItems.avgTemp =  (((myList[dayIndex].avgItems.avgTemp)/8)).toFixed(2);
            // Set weather type
            if(myList[dayIndex].avgItems.avgTemp > 12 && myList[dayIndex].avgItems.avgTemp <= 24) myList[dayIndex].weatherType = "Mild";
            else if (myList[dayIndex].avgItems.avgTemp < 12) myList[dayIndex].weatherType = "Cold";
            else myList[dayIndex].weatherType = "Hot";

            if (myList[dayIndex].isRaining) myList[dayIndex].avgItems.avgRain =  ((myList[dayIndex].avgItems.avgRain)/8).toFixed(2);
            dayCounter = 0;
            dayIndex++;
        }
    }
    let sortedList;
    sortedList = checkAirPollution(myList,jsonObj.pollutionData);
    
    //console.log(myList);
    return sortedList;   
}

// creates a day object and places it inside an array. Array with N amount of days is returned.
function createDays(numDays){
    
    let dayList = [];
    let day = {
        "avgItems" : {
            "avgWind" :  0,
            "avgTemp" :  0,
            "avgRain" :  0,
        },
        "weatherType"  : "Null",
        "isRaining"    : false,
    }
    
    let clone;
    while(numDays){
        clone = JSON.parse(JSON.stringify(day));
        dayList.push(clone);
        numDays--;
    }
    //console.log(JSON.stringify(dayList));
    clone = JSON.parse(JSON.stringify(dayList))
    return(clone);
}

// Detects for air pollution given a sorted list. Sets a boolean flag if air pol > 10
function checkAirPollution(myList,jsonObject){

    for(let i = 0; i < jsonObject.length; i++){
        //console.log(jsonObject[i].components.pm2_5);
        if(jsonObject[i].components["pm2_5"] > 10){
            myList["wearMask"] = true;
            return myList;
        }
    }
    myList["wearMask"] = false;
    return myList;
}

// Fetch air pollution using openweather pollution API
function getAirPollution(url){
    return new Promise((resolve) => {
        resolve(getLocationData(url));
    });
}
// Function takes in a url link and fetchs JSON data from it. Used for all openweather API calls
function getLocationData(url) 
{
    return new Promise((resolve,reject) => {
        http.request(url,function(res){
            let data = '';
    
            res.on('data', function(chunk){ 
                data += chunk;
            });
    
            res.on('end', function(){
                if(res.statusCode === 200) {
                    let jsonData = JSON.parse(data);
                    resolve(jsonData);
                } else{
                    reject(`Error getting location with status code ${res.statusCode}`)
                }
            });
        }).end();
    });
    
}
