import 'babel-polyfill'
import React from 'react';
import ReactDOM from 'react-dom';
import {createStore,applyMiddleware,compose} from 'redux'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import {logger} from 'redux-logger'
import "@/common/styles/antd-mobile.css"

import reducer from './reducers'

import App from './App';


var devTools=window.devToolsExtension?window.devToolsExtension():null
// var store = createStore(reducer,compose(
//     applyMiddleware(thunk,logger),
//     devTools
// ))
if(window.devToolsExtension){
    var store = createStore(reducer,compose(
        applyMiddleware(thunk,logger),
        devTools
    ))
}else{
    var store = createStore(reducer,compose(
        applyMiddleware(thunk,logger)
    ))
}


ReactDOM.render(
    <Provider store={store}>
        <App/>
    </Provider>, 
document.getElementById('root'));

