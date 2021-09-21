import Vue from "vue";
import Vuetify from "vuetify";
import 'vuetify/dist/vuetify.min.css'

Vue.use(Vuetify);

const opts = {
    theme: {
        themes: {
            light: {
                primary: "#00bcd4",
                secondary: "#ff4081",
                accent: "#ff4081",
                error: "#ff4081",
                info: "#2196f3",
                success: "#4caf50",
                warning: "#ff4081",
                black: "#000000",
                white: "#ffffff",
            },
        },
    },
};

export default new Vuetify(opts);
