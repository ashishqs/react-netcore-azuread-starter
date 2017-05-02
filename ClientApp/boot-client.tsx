import './css/site.css';
import 'bootstrap';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { browserHistory, Router } from 'react-router';
import { Provider } from 'react-redux';
import { syncHistoryWithStore } from 'react-router-redux';
import routes from './routes';
import configureStore from './configureStore';
import { ApplicationState }  from './store';
import AuthenticationContext from 'adal-angular';
import adalConfig from './adal/adalConfig';


import AuthContext from 'adal-angular';
import axios from "axios";

const resourceId = 'https://ashishpslalom.onmicrosoft.com/InvoiceApi';
// Get the application-wide store instance, prepopulating with state from the server where available.
const initialState = (window as any).initialReduxState as ApplicationState;
const store = configureStore(initialState);
const history = syncHistoryWithStore(browserHistory, store);

//This is needed because adal.js does a window.parent.AuthenticationContext() in getRequestInfo
(window as any).AuthenticationContext = AuthContext;

//ClientID is the AzureAD app registration Application ID. This is the one that lists approved reply URLs and keys.
//It has no connection to the backend app, except that the backend app lists the Application ID as the intended audience for the JWT (token) we send.
//Tenant is the AzureAD instance.
//You will need to enable Implicit Grant Flow for the AzureAd Application (The one where you get the ClientId)
//You will also need to add return URLs there, remember to add the auth path

let authContext = new AuthContext(adalConfig);


axios.interceptors.response.use(undefined, err => {
    if(err.response.status === 401 && err.response.config && !err.response.config.__isRetryRequest) {
        err.response.config.__isRetryRequest = true;
        
        return new Promise( (resolve, reject) => {
            authContext.acquireToken(resourceId, (message, token, msg) => {
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                err.config.headers.Authorization = `Bearer ${token}`;                
                axios(err.config).then(resolve, reject);
            });
        });
    }
    throw err;
});

//This can safely be called whenever, as it doesn't crash if it isn't a callback.
//I am not sure why I need this here, but without it, nothing works.
authContext.handleWindowCallback();


if(!authContext.isCallback(window.location.hash)) {
    //Having both of these checks is to prevent having a token in localstorage, but no user. Relates to issue #471
    if(!authContext.getCachedToken(adalConfig.clientId) || !authContext.getCachedUser()) {
        authContext.login();
    } else {
            ReactDOM.render(
                <Provider store={store}>
                    <Router history={browserHistory} children={routes}>
                       
                    </Router>
                </Provider>,
                document.getElementById('react-app'));
    
        
        
    }
}