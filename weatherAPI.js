const express = require('express');
const path = require('path');
const app = express();
const http = require('http');
const { response, json } = require('express');

const port = 8080;
const apiKey = "8fd481d84b99229254d57833341a80cb";
const searchLimit = 1;
const nDayForecast = 4;
const numForecast = nDayForecast * 8; // 5 day 3 hour forecast. 8 Forecast per day. Weather API Max is 5 days. 

const publicPath = path.resolve(__dirname, "public"); // Return absolute path to public dir 

// Middlewares
app.use(express.static(publicPath));

app.get('/fetchWeather/:cityName', getWeather);

app.listen(port,() => console.log(`Server running at http://localhost:${port}/`));

async function getWeather(req,res){
    let city = req.params.cityName;
    let url = `http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=${searchLimit}&appid=${apiKey}`;
    
    let geoLocationObject = await getLocationData(url);
    if (!geoLocationObject.length){
        res.json({empty: 1});
        console.log("Error in finding geolocation, returning empty string to client");
        return;
    }
    // Set Geo Lat and Lon variables into url
    let latitude = geoLocationObject[0].lat;
    let longitude = geoLocationObject[0].lon;
    
    url = `http://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&cnt=${numForecast}&appid=${apiKey}`;
    let weatherObject = await getLocationData(url); 
    url = `http://api.openweathermap.org/data/2.5/air_pollution/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}`;
    let pollutionObject = await getAirPollution(url);
    
    let jsonData = {
        "city"          : weatherObject.city,
        "weatherData"   : weatherObject.list,
        "pollutionData" : pollutionObject.list   
    }

    let sortedData = sortWeatherData(jsonData);
    //res.json(sortedData);
}

function sortWeatherData(jsonObj){
    // Sort Data based on requirements.
    // Sort weatherData into 4 days.
    // bool for packing rain
    // 
    let dayList = createDays(nDayForecast);
    //console.log(dayList);
    let sortedList = setDayData(dayList,jsonObj)

    // Should return a json string object.
}

function setDayData(myList,jsonObj){
    
    let dayIndex = 0;
    let dayCounter = 0;

    //console.log(myList[0].avgItems);
    for (let i = 0; i < numForecast; i++){
        
        // Increase by 1 day for every 7 loops // Reset all variables
        if(dayCounter === 8){
            dayCounter = 0;
            // windSpeed = (windSpeed / 7).toFixed(2);
            // //windSpeed = parseInt(windSpeed);
            // console.log(windSpeed);
            //myList[dayIndex].avgItems.avgWind = windSpeed;
            //console.log(tempList[dayIndex].avgItems.avgWind)
            dayIndex++;
            
        }
        if('rain' in jsonObj.weatherData[i]){
            if(!myList[dayIndex].isRaining) myList[dayIndex].isRaining = true;
            myList[dayIndex].avgItems.avgRain +=  jsonObj.weatherData[i].rain;
            console.log(jsonObj.weatherData[i].rain)
        }
        
        myList[dayIndex].avgItems.avgWind +=  jsonObj.weatherData[i].wind.speed;
        

        dayCounter++;
    }   
    console.log(myList);
    return myList;   
}

function createDays(numDays){
    
    let dayList = [];
    let day = {
        "avgItems" : {
            "avgWind" :  0,
            "avgTemp" :  0,
            "avgRain" :  0,
            "avgPol"  :  0
        },
        "weatherType"  : "Null",
        "packUmbrella" : false,
        "isRaining"    : false
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

//Remove async word here cause no use.
function getAirPollution(url){
    return new Promise((resolve) => {
        resolve(getLocationData(url));
    });
}

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
