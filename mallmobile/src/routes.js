import React, { Component } from 'react'
import AuthRoute from '@/components/AuthRoute'
import {Route,Switch} from 'react-router-dom'

import Login from '@/pages/Login.jsx'
import Register from '@/pages/Register.jsx'
import NotFount from '@/pages/NotFount.jsx'
import Index from '@/pages/Index.jsx'

class Routes extends Component {
    render(){
        return (
            <div style={{height:"100%",overflow: 'hidden'}}>
                <AuthRoute></AuthRoute>
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