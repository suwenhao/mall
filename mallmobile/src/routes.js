import React, { Component } from 'react'
import {Route,Switch} from 'react-router-dom'

import Login from '@/pages/Login.jsx'
import Register from '@/pages/Register.jsx'
import NotFount from '@/pages/NotFount.jsx'
import Index from '@/pages/Index.jsx'
import VConsole from 'vconsole'

class Routes extends Component {
    componentDidMount(){
        // let vc = new VConsole();
    }
    render(){
        return (
            <div style={{height:"100%",overflow: 'hidden'}}>
                <Switch>
                    <Route path='/login' component={Login}></Route>
                    <Route path='/register' component={Register}></Route>
                    <Route path='/404' component={NotFount}></Route>
                    <Route component={Index}></Route>
                </Switch>
            </div>
        )
    }
}

export default Routes