
import { createApp, Suspense } from 'vue';

const app = createApp({
    data(){
        return{
            cityValue: "",
            displayData: false,
            displayUmbrella: false,
            displayMask: false,

            cardMessages: ["", "", "", ""],
            imgs: ["","","",""],
        }
    },
    methods: {
        getWeatherData,
        handleWeatherData(res){
            if(res.empty) throw("Error in finding location");
            //console.log(res);
            if(res.packUmbrella) this.displayUmbrella = true;
            if(res.wearMask) this.displayMask = true;

            for (let i = 0; i < res.days; i++){
                if(res[i].weatherType == "Cold") this.imgs[i] = "cold.jpg";
                else if (res[i].weatherType == "Mild") this.imgs[i] = "cloudy.jpg";
                else this.imgs[i] = "sun.jpg";
                this.cardMessages[i] = `Weather: ${res[i].weatherType}<br>
                                     Average Temperature: ${res[i].avgItems.avgTemp} ℃<br>
                                     Average Wind Speed: ${res[i].avgItems.avgWind} m/s<br>`;
                if (res[i].isRaining){
                    this.cardMessages[i] += `Average Rainfall: ${res[i].avgItems.avgRain} mm/3hr<br>`;
                } 
            }
            

            this.displayData = true;
        }
    }
});
app.mount("#app");

const key = document.querySelector(".app-button");
key.addEventListener('transitionend', removeTransition);

function removeTransition(event){
    if(event.propertyName !== 'transform') return;
    this.classList.remove("button-playing");
}

function getWeatherData(event){
    if(this.cityValue.length == 0) return;
    this.displayUmbrella = false;
    this.displayMask = false;
    this.displayData = false;
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
