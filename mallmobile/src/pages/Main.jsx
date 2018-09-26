import React, {Component} from 'react'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import * as routerAction from '@actions/routerAction'
import * as goodsAction from '@actions/goodsAction'
//组件
//轮播图
import Autoplay from '@/components/Main/Autoplay'
//广告
import Advertising from '@/components/Advertising'
//商品
import Bdr from '@/components/Main/Bdr'
import Bdrb from '@/components/Main/Bdrb'
import Commodity from '@/components/Commodity'
//UI
import {SearchBar,WingBlank} from 'antd-mobile'
import $ from 'jquery'
import {baseUrl} from '@common/js/util.js'

class Main extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            adverArr:[],
            goods:[],
            goods1:[]
        }
    }
    //初始化
    init(){
        this.getAutoPlay()
        this.props.goodsPatch.overload()
        this.props.goodsPatch.changeIsTop(true)
        this.props.goodsPatch.getGoodsList(this.props.match.params.s)
    }
    getAutoPlay(){
        let that = this
        let params = {};
        $.ajax({
            type:'get',
            url:baseUrl+'/home/carousel',
            data:params,
            dataType:'json',
            success(res){
                that.setState({
                    data:res.data
                })
            },
            error(err){
                
            }
        })
    }
    componentDidMount() {
        this.init()
        this.fixCarousel()
    }
    //处理九宫格bug
    fixCarousel(){
        setTimeout(()=>{
            window.dispatchEvent(new Event('resize'))
        },0)
    }
    render() {
        return (
            <div className="main-box" style={{height:'100%'}}>
                <div className="header">
                    <span className="search-box">
                        <SearchBar placeholder="搜索" onFocus={()=>{
                            sessionStorage.setItem('__search_prev_path__',this.props.location.pathname)
                            this.props.history.push('/search')
                            this.props.router.changePath('/search')
                        }}/>
                    </span>
                    <span className="msg">
                        <img src={require(`@common/images/index-msg.png`)} alt=""/>
                    </span>
                </div>
                <div className="body">
                    {/*轮播图*/}
                    <Autoplay data={this.state.data}/>
                    {/*九宫格*/}
                    {/* <Grid data={data} isCarousel onClick={_el => console.log(_el)} /> */}
                    {/*广告*/}
                    {/* <div className="advertising">
                        <Advertising data={this.state.adverArr}></Advertising>
                    </div> */}
                    {/*商品*/}
                    {/* <Bdr data={this.state.goods}></Bdr> */}
                    {/*商品*/}
                    {/* <Bdr cls="bdr1-item" data={this.state.goods}></Bdr> */}
                    {/*商品*/}
                    {/* <Bdrb data={this.state.goods}></Bdrb> */}
                    {/*商品*/}
                    <Commodity data={this.props.goods}></Commodity>
                </div>
            </div>
        )
    }
}

export default connect(
    (state) => ({
        goods:state.goodsReducer.goods
    }),
    (dispatch)=>{
        return {
            router:bindActionCreators(routerAction,dispatch),
            goodsPatch:bindActionCreators(goodsAction,dispatch)
        }
    }
)(Main)