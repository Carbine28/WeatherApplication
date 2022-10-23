import { createApp} from 'vue';

const app = createApp({
    data(){
        return{
            cityValue: "",
            displayData: false,
            displayUmbrella: false,
            displayMask: false,
            displayError: false,
            
            cityName: "None",
            cardMessages: ["", "", "", ""],
            imgs: ["","","",""],

            displayFunkySelection: false,
            funkyCityNames: ["","","","",""] ,
            citysData: [],
        }
    },
    methods: {
        funkyWeatherData,
        getWeatherData,
        handleWeatherData(res){
            // Sort data to display if not empty
            if(res.empty){
                this.displayError = true;
                return;
            } 
            //console.log(res);
            if(res.packUmbrella) this.displayUmbrella = true;
            if(res.wearMask) this.displayMask = true;
            if(res.cityName) this.cityName = res.cityName;

            for (let i = 0; i < res.days; i++){
                if(res[i].weatherType == "Cold") this.imgs[i] = "cold.jpg";
                else if (res[i].weatherType == "Mild") this.imgs[i] = "cloudy.jpg";
                else this.imgs[i] = "sun.jpg";
                this.cardMessages[i] = `Weather: ${res[i].weatherType}<br>
                                     Average Temperature: ${res[i].avgItems.avgTemp} ℃<br>
                                     Average Wind Speed: ${res[i].avgItems.avgWind} m/s<br>`;
                if (res[i].isRaining){
                    this.cardMessages[i] += `Average Rainfall: ${res[i].avgItems.avgRain} mm<br>`;
                } 
            }
            
            this.displayData = true;
        },
        loadFunkyData(res){
            // Load response data into vue variables
            for(let i = 0; i < res.length; i++){
                this.citysData[i] = res[i];
                this.funkyCityNames[i] = res[i].cityName;
            } 
            this.displayFunkySelection = true; // Then display div with selection
        },
        handleFunkyData(index){
            this.displayFunkySelection = false;
            this.handleWeatherData(this.citysData[index]);
            
        }
    }
});
app.mount("#app");

//  Add event for button transition
const keys = document.querySelectorAll(".app-button");
keys.forEach(key => key.addEventListener('transitionend', removeTransition));
function removeTransition(event){
    if(event.propertyName !== 'transform') return;
    this.classList.remove("button-playing");
}
// Event handler for when user presses the search button to look for weather data.
function getWeatherData(event){
    if(this.cityValue.length == 0) return;
    this.displayUmbrella = false;
    this.displayMask = false;
    this.displayData = false;
    this.displayError = false;
    const key = document.querySelector("#searchButton");
    key.classList.add("button-playing");

    let prom = fetch("fetchWeather/"+ this.cityValue);
    
    prom.then( response => response.json() ) 
        .then( response => {
            this.handleWeatherData(response);
        })
        .catch((err) => {
            console.error(err);
        });

    this.cityValue = "";
}       
// Event handler for when user presses the funky button to look for weather data from a random location
function funkyWeatherData(){
    this.displayUmbrella = false;
    this.displayMask = false;
    this.displayData = false;
    this.displayError = false;
    const key = document.querySelector("#randomButton");
    key.classList.add("button-playing");

    let prom = fetch("fetchFunkyWeather/");
    prom.then(response => response.json() )
        .then(response => {
            //this.loadFunkyData(response);
            console.log(response);
        })
        .catch((err) => {
            console.error(err);
        });
    this.cityValue = "";
}
