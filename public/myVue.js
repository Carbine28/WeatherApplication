import { createApp } from 'vue'

const app = createApp({
    data(){
        return{
            cityValue: "",
            searching:  false,
            
        }
    },
    methods: {
        getWeatherData
    }
});
app.mount("#app");

const display = createApp ({
    data(){
        return{
            displayData: true,
        }
    },
    methods: {

    }
});
display.mount('#appDisplay');

const key = document.querySelector(".app-button");
key.addEventListener('transitionend', removeTransition);

function removeTransition(event){
    if(event.propertyName !== 'transform') return;
    this.classList.remove("button-playing");
}

function getWeatherData(event){
    if(this.cityValue.length == 0) return;
    key.classList.add("button-playing");

    let prom = fetch("fetchWeather/"+ this.cityValue);
    
    prom.then( response => response.json() ) 
        .then( response => {
            if(response.empty){
                // Fetch display for error
                throw("Error in finding location");
            }else {
                console.log(response);
            }

        })
        .catch((err) => {
            console.error(err);
        });

    this.cityValue = "";
}       
