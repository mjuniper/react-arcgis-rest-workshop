import React from 'react';
import ReactDOM from 'react-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import { BrowserRouter, HashRouter } from 'react-router-dom';
import App from './App';
import * as serviceWorker from './serviceWorker';

let Router = HashRouter;
let basename;
if (process.env.NODE_ENV === 'development') {
  Router = BrowserRouter;
  basename = '/react-arcgis-rest-workshop';
}

ReactDOM.render(<Router basename={basename}><App /></Router>, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
