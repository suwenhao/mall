import React, { Component } from 'react'

import './logo.less'

export default class Logo extends Component {
  render() {
    return (
      <div className="logo-container">
        <img src={require('./logo.svg')} alt="logo"/>
      </div>
    )
  }
}
