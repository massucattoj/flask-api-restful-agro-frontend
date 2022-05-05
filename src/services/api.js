import axios from 'axios';

const api = axios.create({
    //baseURL: 'http://127.0.0.1:5000',
    //baseURL: 'https://flask-rest-api-agro.herokuapp.com/'
    baseURL: 'https://agro-flask.herokuapp.com/'
});

export default api;