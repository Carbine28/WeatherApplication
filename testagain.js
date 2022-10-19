const express = require('express');
const app = express();
let MAX_DAYS = 32;

function testFunc() {
    let dayList = createDays(4);
    let tempList = setDayData(dayList);
    //console.log(tempList[0]);
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
    return(dayList);
}

function setDayData(myList){
    let dayIndex = 0;
    let dayCounter = 0;
    let windCount = 2;
    let windSpeed = 0;
    let tempSpeed = 0;
    let rainSpeed = 0;
  
    // console.log(myList[0].avgItems.avgWind );
    for (let i = 0; i < MAX_DAYS; i++){
        dayCounter++;
        // Increase by 1 day for every 7 loops // Reset all variables
        if(dayCounter === 7){
            dayCounter = 0;
            windSpeed = (windSpeed / 7).toFixed(2);
            //windSpeed = parseInt(windSpeed);
            console.log(windSpeed);
            myList[dayIndex].avgItems.avgWind = windSpeed;

            
            //console.log(tempList[dayIndex].avgItems.avgWind)
            
            windSpeed = 0;
            tempSpeed = 0;
            rainSpeed = 0;
            windCount += 2;
            dayIndex++;
            
        } 
        // console.log(dayCounter);
        //console.log(dayIndex);
        windSpeed +=  windCount;;
        
    }

    
    console.log(myList)
    
}

testFunc();