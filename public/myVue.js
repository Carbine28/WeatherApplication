import { createApp } from 'vue'

const app = createApp({
    data(){
        return{
            cityValue: "",
            searching:  false,
            displayData: false
        }
    },
    methods: {
        getWeatherData
    }
});

app.mount("#app")

function getWeatherData(){
    if(this.cityValue.length == 0){
        return;
    } else{
        let prom = fetch("fetchWeather/"+ this.cityValue);
        this.cityValue = ""
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

        
    }
    

    
}       
