"use strict";
const { json } = require('express');
const fs = require('fs');
const { resolve } = require('path');
// const { json } = require("express");

// // let c = new Date(1666040400 * 1000);
// // var d = new Date(1666040400 * 1000);
 
// // d.setDate(d.getDate() - 5)
// // console.log(d);

// // if (d > c){
// //     console.log("True");
// // } else {
// //     console.log("False");
// // }

// // While Forecast Date > current object Date
// // Check if object pm25 is > 10
// // Set a bool if so.

// const num = 7 + 10;
// console.log(num);

// let jsonFile = {
//     "list1" : ['mary', 'mike'],
//     "list2" : []
// }

// let myOtherJsonFile = {
//     "list3" : jsonFile.list1
// }

// jsonFile.list2 = myOtherJsonFile.list3;

// console.log(myOtherJsonFile.list3);
const nDayForecast = 4;
const MAX_DAYS = 8 * nDayForecast ; // We multiply by 8 since we are doing 3 hr forecast. 
let dayList;

const prom = new Promise((resolve) => {
    fs.readFile('weatherList.txt', "utf-8",  (err,data) =>{
        if(err) console.error(err);
        let jsonData = JSON.parse(data);
        resolve(jsonData);
    });
});

prom.then((val) => {
    

    dayList = createDays(nDayForecast);
    resolve(dayList);
    
    //let jdayobject = JSON.stringify(dayObject);
    //console.log(Object.keys(dayObject.day[0].avgItems).length);
    //console.log(dayObject.day[0]);
    
})

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
    while(numDays){
        dayList.push(day);
        numDays--;
    }

    return dayList;
}

// let dayIndex = 0;
//     let dayCounter = 0;
//     for (let i = 0; i < MAX_DAYS; i++){
//         // Increase by 1 day for every 7 loops // Reset all variables
//         if(dayCounter === 7){
//             dayIndex++;
//             dayCounter = 0;
//         } 
//         dayList[dayIndex].avgItems.avgWind +=  val[i].wind.speed;


//         dayCounter++;
//     }
//     console.log(dayList[0].avgItems.avgWind);




