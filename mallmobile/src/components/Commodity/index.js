import React, {Component} from 'react'
import PropTypes from 'proptypes'
import {connect} from 'react-redux'

class Commodity extends Component {
    static propTypes = {
        data:PropTypes.array.isRequired
    };
    componentDidMount(){

    }
    render() {
        return (
            <div className="good-box">
                {
                    this.props.data.map((item,i)=>{
                        return (
                            <div key={i} className="good-item">
                                <div className="head">
                                    <img className="item-img" src={item.img} alt=""/>
                                </div>
                                <div className="body">
                                    <p>{item.title}</p>
                                    <div>
                                        <span>￥{item.price}</span>
                                    </div>
                                </div>
                            </div>
                        )
                    })
                }
            </div>
        )
    }
}

export default connect()(Commodity)