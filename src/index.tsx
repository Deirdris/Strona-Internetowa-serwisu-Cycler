import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import MainApp from './pages/MainApp';
import reportWebVitals from './reportWebVitals';
import {BrowserRouter as Router} from "react-router-dom";

import {initializeApp} from "firebase/app";
import {Provider} from "react-redux";
import {store} from "./store";
import moment from "moment";
import 'moment/locale/pl';
import {config} from "./firebaseConfig";

moment.locale('pl');

console.log(moment().startOf('week').format('D'));

initializeApp(config);

ReactDOM.render(
    <React.StrictMode>
        <Router>
            <Provider store={store}>
                <MainApp/>
            </Provider>
        </Router>
    </React.StrictMode>,
    document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();