import React, {Component} from 'react'
import PropTypes from 'proptypes'
import {withRouter} from 'react-router-dom'
import {connect} from 'react-redux'
import {imgUrl} from '@common/js/util'

class Commodity extends Component {
    static propTypes = {
        data:PropTypes.array.isRequired
    };
    gotoList(id){
        this.props.history.push('/goods/'+id)
        sessionStorage.setItem('__search_prev_path__',this.props.location.pathname)
        sessionStorage.setItem('__goods_prev_path__',this.props.location.pathname)
    }
    componentDidMount(){

    }
    
    render() {
        return (
            <div className="good-box">
                {
                    this.props.data.map((item,i)=>{
                        return (
                            <div key={i} className="good-item" onClick={()=>{
                                this.gotoList(item.id)
                            }}>
                                <div className="head">
                                    <img className="item-img" src={item.thumbnail} alt="" onLoad={(e)=>{
                                        let dom=e.currentTarget;
                                        dom.height=dom.width;
                                    }}/>
                                </div>
                                <div className="body">
                                    <p>{item.name}</p>
                                    <div>
                                        <span>￥{item.salesPrice.toFixed(2)}</span>
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

export default connect()(withRouter(Commodity))