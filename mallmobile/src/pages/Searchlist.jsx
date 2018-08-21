import React, { Component } from 'react'
// import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import {bindActionCreators} from 'redux'
import * as goodsAction from '@actions/goodsAction'
import * as loadAction from '@actions/loadAction'
import SearchHeader from '@components/Header/SearchHeader'
import '@common/styles/searchlist.scss'
import {Icon, List, PullToRefresh, Checkbox, Accordion} from 'antd-mobile'
import Loading from '@base/Loading'
import classnames from 'classnames'
import $ from 'jquery'
const Item = List.Item;

export class SearchList extends Component {
  //构造函数
  constructor(props){
    super(props)
    this.state={
      complexAlert:false,
      filterAlert:false,
      cateAlert:false,
      height: document.documentElement.clientHeight-86,
      loading:true,
      orderTip:false,
      refreshing:true,
      filterStatus:1,
      nodata:true,
      endPrice:'',
      startPrice:'',
      cateId:sessionStorage.getItem('__cateId__')?sessionStorage.getItem('__cateId__'):'',
      search:this.props.match.params.s==='null'?'':this.props.match.params.s,
      cate:{
        name:'全部分类'
      }
    }
  }
  //内容适应窗口
  resize(){
    let self =this;
    $(window).on('resize',()=>{
      self.setState({
        height:document.documentElement.clientHeight-86
      })
    })
  }
  //加载更多
  getRefresh(){
    if(this.props.pageNumber>this.props.totalPages){
      this.setState({ refreshing: false });
      return;
    }else{
        this.props.goodsPatch.getPushGoods(this.state.search,()=>{
          this.setState({ refreshing: false });
        })
    }
  }
  //改变筛选类型
  changeSort(sort){
    this.setState({
      nodata:true
    })
    this.props.goodsPatch.overload()
    this.props.goodsPatch.changeCateId(this.state.cateId)
    this.props.goodsPatch.changeSortType(sort)
    //获取商品列表
    this.props.goodsPatch.getGoodsList(this.state.search,()=>{
      this.setState({
        nodata:false
      })
    })
  }
  //获取分类

  //挂载组件
  componentDidMount(){
    //初始化筛选
    this.changeSort(1);
    //获取分类
    this.props.load.loadCate((cates)=>{
      if(this.state.cateId){
        cates.forEach(v=>{
          v.childs.forEach(j=>{
            j.childs.forEach(k=>{
              if(k.id==this.state.cateId){
                this.setState({
                  cate:k
                })
                return;
              }
            })
          })
        })
      }
    })
    this.resize()
  }
  render() {
    return (
      <div className="searchlist-page">
        <SearchHeader value={this.state.search} returnbtn={true} pathname={'/search'}></SearchHeader>
        <div className={classnames({
          'complex-alert':true,
          show:this.state.complexAlert
        })}
          onClick={(e)=>{
            this.setState({
              complexAlert:!this.state.complexAlert,
            })
          }}
        >
          <ul className="alert">
            <li className={classnames({
              'selected':this.state.filterStatus===1?true:false
            })} onClick={(e)=>{
              e.stopPropagation();
              this.setState({
                filterStatus:1,
                complexAlert:false
              },()=>{
                this.changeSort(1)
              })
            }}>最新上架</li>
            <li className={classnames({
              'selected':this.state.filterStatus===4?true:false
            })} onClick={(e)=>{
              e.stopPropagation();
              this.setState({
                filterStatus:4,
                complexAlert:false
              },()=>{
                this.changeSort(4)
              })
            }}>评价最多</li>
          </ul>
        </div>
        {/* 筛选抽屉 */}
        <div className="filter-alert">
          <div className={classnames({
            'filter-alert-bg':true,
            show:this.state.filterAlert
          })}
            onClick={()=>{
              this.setState({
                filterAlert:false
              })
            }}
          ></div>
          <div className={classnames({
            'filter-box':true,
            show:this.state.filterAlert
          })}>
            <div className={classnames({
              main:true,
              show:this.state.filterAlert
            })}>
              <div className="mod-list">
                <List className="my-list">
                  <Item extra={this.state.cate.name} arrow="horizontal" onClick={() => {
                    this.setState({
                      cateAlert:true
                    })
                  }}>分类</Item>
                </List>
              </div>
              <ul className="mod-list">
                <li className="left-line">价格</li>
                <li>
                  <div className="filterlayer-price">
                    <input value={this.state.startPrice} onChange={(e)=>{
                      this.setState({
                        startPrice:e.currentTarget.value
                      })
                    }} type="text" placeholder="最低价"/>
                    <span></span>
                    <input value={this.state.endPrice} onChange={(e)=>{
                      this.setState({
                        endPrice:e.currentTarget.value
                      })
                    }}  type="text" placeholder="最高价"/>
                  </div>
                </li>
              </ul>
              <div className="filter-clear" onClick={()=>{
                sessionStorage.removeItem('__cateId__')
                this.setState({
                  cateId:'',
                  cate:{
                    name:'全部分类'
                  },
                  endPrice:'',
                  startPrice:''
                })
              }}>
                清除选项
              </div>
            </div>
            <div className={classnames({
              footer:true,
              show:this.state.filterAlert
            })}>
              <button onClick={()=>{
                this.setState({
                  filterAlert:false
                })
              }}>取消</button>
              <button onClick={()=>{
                this.props.goodsPatch.changeCateId(this.state.cateId)
                this.props.goodsPatch.changePrice(this.state.startPrice,this.state.endPrice)
                //获取商品列表
                this.props.goodsPatch.getGoodsList(this.state.search)
                this.setState({
                  filterAlert:false
                })
              }}>确认</button>
            </div>
          </div>
          <div className={classnames({
            'filter-alert-bg':true,
            show:this.state.cateAlert
          })}
            onClick={()=>{
              this.setState({
                cateAlert:false
              })
            }}
          ></div>
          <div className={classnames({
            'filter-box':true,
            show:this.state.cateAlert
          })}>
            <div className={classnames({
              main:true,
              show:this.state.cateAlert,
            })}>
              <List className="my-list">
                <Item onClick={() => {}}>
                  已选择:{this.state.cate.name}
                </Item>
              </List>
               <List className="my-list">
                  <Item onClick={() => {}}>
                    <Checkbox checked={
                      this.state.cateId===''?true:false
                    } onChange={()=>{
                      this.setState({
                        cateId:'',
                        cateAlert:false,
                        cate:{name:'全部分类'}
                      })
                    }}/>
                    全部分类
                  </Item>
                </List>
                <div style={{
                  height:this.state.height-44,
                  overflowY:'auto'
                }}>
                  <Accordion defaultActiveKey="0" className="my-accordion" onChange={()=>{}}>
                    {
                      this.props.cates&&this.props.cates.map((v,i)=>{
                        return (
                          <Accordion.Panel key={i} header={v.name}>
                            <List className="my-list">
                              {
                                v.childs.map((jtem,j)=>{
                                  return (
                                      jtem.childs.map((ktem,k)=>{
                                      return (
                                        <List.Item key={k}>
                                          <Checkbox checked={
                                            this.state.cateId==ktem.id?true:false
                                          } onChange={()=>{
                                            this.setState({
                                              cateId:ktem.id,
                                              cateAlert:false,
                                              cate:ktem
                                            })
                                          }}/>
                                          {ktem.name}
                                        </List.Item>
                                      )
                                    })
                                  )
                                })
                              }
                            </List>
                          </Accordion.Panel>
                        )
                      })
                    }
                  </Accordion>
                </div>
                <div className={classnames({
                  footer:true,
                  show:this.state.cateAlert
                })}>
                  <button onClick={()=>{
                    this.setState({
                    cateAlert:false
                    })
                  }}>取消</button>
                </div>
            </div>
          </div>
        </div>
        {/* 筛选抽屉 */}
        {/* 选择条件 */}
        <div className="searchlist-main">
          <div className="filter">
            {/* 筛选item */}
            <div  className={classnames({
              'filter-item':true,
              'selected':this.state.filterStatus===1||this.state.filterStatus===4
            })} onClick={()=>{
              this.setState({
                complexAlert:!this.state.complexAlert,
                filterAlert:false
              })
            }}>
              <span>
                {
                  this.state.filterStatus===1?
                  '最新上架'
                  :
                  this.state.filterStatus===4?
                  '评价最多'
                  :'综合'
                }
              </span>
              <Icon type={this.state.complexAlert?'up':'down'} size="xxs"/>
            </div>
            {/* 筛选item */}
            <div className={classnames({
              'filter-item':true,
              'selected':this.state.filterStatus===2
            })}>
              <span onClick={()=>{
                this.setState({
                  filterStatus:2,
                  complexAlert:false
                },()=>{
                  this.changeSort(2)
                })
              }}>销量</span>
            </div>
            {/* 筛选item */}
            <div className={classnames({
              'filter-item':true,
              'selected':this.state.filterStatus===3
            })} onClick={()=>{
              this.setState({
                  filterStatus:3,
                  complexAlert:false
                },()=>{
                  this.changeSort(3)
                })
            }}>
              <span>价格</span>
            </div>
            {/* 筛选item */}
            <div className={classnames({
              'filter-item':true
            })} onClick={()=>{
              this.setState({
                complexAlert:false,
                filterAlert:!this.state.filterAlert
              })
            }}>
              <span>筛选</span>
              <img className="icon" src={require(`@common/images/filter.png`)} alt=""/>
            </div>
          </div>
          {/* 选择条件 */}
          {/* 商品列表 */}
          <PullToRefresh
              damping={60}
              ref={el => this.ptr = el}
              style={{
                height: this.state.height,
                overflow: 'auto',
                backgroundColor:'#fff'
              }}
              indicator={this.state.down ? {} : { deactivate: '上拉加载' }}
              direction={this.state.down ? 'down' : 'up'}
              refreshing={this.state.refreshing}
              onRefresh={() => {
                this.setState({ refreshing: true });
                //上拉加载
                this.getRefresh()
              }}
          >
          <div className="search-list">
            {
              this.props.goods.length>0?
              this.props.goods.map((item,i)=>{
                return (
                  <div key={i} className="search-item" onClick={()=>{
                    this.props.history.push('/goods/'+item.id)
                    sessionStorage.setItem('__search_prev_path__',this.props.location.pathname)
                    sessionStorage.setItem('__goods_prev_path__',this.props.location.pathname)
                  }}>
                    <div className="search-inner">
                      <div className="cover">
                        <img src={item.thumbnail} alt={item.name}/>
                      </div>
                      <div className="info">
                        <div className="info-title">
                        {item.name}
                        </div>
                        <div className="info-desc">
                        {item.desc}
                        </div>
                        <div className="info-price">
                          <span>价格：</span>
                          <span>￥</span>
                          <span>{item.salesPrice.toFixed(2)}</span>
                        </div>
                        <div className="info-volume">
                          <span>销量：</span>
                          <span>{item.sales}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
              :
              this.state.nodata?
              <Loading></Loading>
              :
              <div className="nodata">暂无数据</div>
            }
          </div>
          </PullToRefresh>
          {/* 商品列表 */}
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  goods:state.goodsReducer.goods,
  pageNumber:state.goodsReducer.pageNumber,
  totalPages:state.goodsReducer.totalPages,
  cates:state.loadReducer.cates
})

const mapDispatchToProps = (dispatch)=>{
  return {
    goodsPatch:bindActionCreators(goodsAction,dispatch),
    load:bindActionCreators(loadAction,dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SearchList)
