"use strict";

const { json } = require("express");

// let c = new Date(1666040400 * 1000);
// var d = new Date(1666040400 * 1000);
 
// d.setDate(d.getDate() - 5)
// console.log(d);

// if (d > c){
//     console.log("True");
// } else {
//     console.log("False");
// }

// While Forecast Date > current object Date
// Check if object pm25 is > 10
// Set a bool if so.

const num = 7 + 10;
console.log(num);

let jsonFile = {
    "list1" : ['mary', 'mike'],
    "list2" : []
}

let myOtherJsonFile = {
    "list3" : jsonFile.list1
}

jsonFile.list2 = myOtherJsonFile.list3;

console.log(myOtherJsonFile.list3);