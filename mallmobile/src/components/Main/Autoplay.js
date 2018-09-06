import React, {Component} from 'react'
import PropTypes from 'proptypes'
import {withRouter} from 'react-router-dom'
import {Carousel} from 'antd-mobile'
import {imgUrl} from '@common/js/util.js'

class Autoplay extends Component {
    static propTypes = {
        data:PropTypes.array.isRequired
    };
    constructor(props) {
        super(props);
        this.state={
            imgHeight:150
        }
    }
    componentDidMount(){
        this.setState({
            imgHeight:'auto'
        })
    }
    render() {
        return (
            <Carousel
                autoplay={true}
                infinite
                beforeChange={(from, to) => console.log(`slide from ${from} to ${to}`)}
                afterChange={index => console.log('slide to', index)}
            >
                {this.props.data.map((item,i) =>{
                    return (
                        <a
                            key={i}
                            onClick={()=>{
                                if(item.productId){
                                    this.props.history.push('/goods/'+item.productId)
                                    sessionStorage.setItem('__search_prev_path__',this.props.location.pathname)
                                    sessionStorage.setItem('__goods_prev_path__',this.props.location.pathname)
                                }
                            }}
                            style={{ display: 'inline-block', width: '100%', height: this.state.imgHeight }}
                        >
                            <img
                                src={`${imgUrl}${item.img}`}
                                alt=""
                                style={{touchAction:'none', width: '100%', verticalAlign: 'top' }}
                                onLoad={(e) => {
                                    e.preventDefault()
                                    window.dispatchEvent(new Event('resize'));
                                }}
                            />
                        </a>
                    )
                })}
            </Carousel>
        )
    }
}

export default withRouter(Autoplay)