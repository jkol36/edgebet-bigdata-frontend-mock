import React, { Component } from 'react';
import request from 'superagent'
import numeral from 'numeral'
import ReactHighcharts from 'react-highcharts'
import { Modal } from 'react-bootstrap'
import Select from 'react-select'
import classnames from 'classnames'
import bookmakerOptions from './bookmakerOptions'
import { OddsChart } from './OddsChart'
import './main.less'

const sportOptions = [{
  label: 'Soccer',
  value: 1,
}, {
  label: 'Basket',
  value: 3,
}, {
  label: 'Rugby',
  value: 4,
}, {
  label: 'Tennis',
  value: 5
}, {
  label: 'American football',
  value: 6,
}, {
  label: 'Baseball',
  value: 7,
}, {
  label: 'Handball',
  value: 8
}]

const oddsTypeOptions = [{
  label: '1x2',
  value: 0
}, {
  label: 'Moneyline',
  value: 1
}, {
  label: 'Spread',
  value: 3
}, {
  label: 'Totals',
  value: 4
}, {
  label: 'Asian handicap',
  value: 5
}]

class AnalyticsMetrics extends Component {
  componentWillMount() {
    console.log('component mounting')
    console.log(this.props)
  }
  render() {
    const { roi, averageEdge, averageClosingEdge, length } = this.props
    return (
      <div className='row widgets'>
        <Widget icon='rocket'
          color='blue'
          number={numeral(roi).format('0.0%')}
          description={'ROI'}
        />
        <Widget icon='line-chart'
          color='white'
          number={numeral(length).format('0')}
          description={'Number of trades'}
        />
        <Widget icon='circle-o-notch'
          color='orange'
          number={averageEdge}
          description={`Average edge placed`}
        />
        <Widget icon='slack'
          color='red'
          number={ averageClosingEdge }
          description={'Average closing Edge'}
        />
      </div>
    )
  }
}

export class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      preset: {
        bookmakers: [],
        odds: {
          lte: 3,
          gte: 1
        },
        edge: {
          gte: 1,
          lte: 10
        },
        hoursBefore: {
          lte: 50,
          gte: 0
        },
        oddsTypes: [],
        sports: [],
        recommendedLeagues: false,
        uniqueMatchesSelected:false
      },
      loading: true,
      data: null
    }
    this.fetchData = this.fetchData.bind(this)
  }

  fetchData() {
    this.setState({ loading: true })
    request.post('http://localhost:4000/preset')
      .send({preset: this.state.preset})
      .end((err, res) => {
        this.setState({
          data: res.body,
          loading: false
        })
      })
  }

  componentDidMount() {
    this.fetchData()
  }

  onChangePreset(preset) {
    this.state.preset = preset
    this.setState({
      preset,
      modalOpen: false
    })
    this.fetchData()
  }

  render() {
    if (this.state.loading)
      return <p className='lead'>Loading</p>
    return (
      <div className='container-fluid' style={{marginTop: '25px' }}>
        <AnalyticsMetrics
          roi={this.state.data.flatROI }
          averageEdge={this.state.data.averageEdge}
          averageClosingEdge={this.state.data.averageClosingEdge}
          length={this.state.data.numTrades}
        />
        <div className='row'>
          <div className='col-xs-12'>
            <AnalyticsChart profits={this.state.data.flatProfitArray}
              EVarray={this.state.data.evArray}
              closingArray={this.state.data.closingEvArray}
            />
          </div>
        </div>
        <div className={classnames({
          'bottom-left-static-button': true,
          hidden: this.state.modalOpen
        })}
          onClick={() => this.setState({ modalOpen: true })}>
          <i className='ionicons ion-ios-gear'></i>
        </div>
        <AnalyticsModal
          open={ this.state.modalOpen }
          close={() => this.setState({ modalOpen: false })}
          preset={ this.state.preset }
          onChangePreset={ this.onChangePreset.bind(this) }
          />
      </div>
    );
  }
}

const Widget = (props) => (
  <div className='col-lg-3 col-sm-6 col-xs-12'>
    <div className={ 'panel ' + props.color }>
      <div className='symbol'>
        <i className={'fa fa-fw fa-' + props.icon }></i>
      </div>
      <div className='value'>
        <h1>{ props.number }</h1>
        <p>{ props.description }</p>
      </div>
    </div>
  </div>
)

class AnalyticsModal extends Component {

  componentWillReceiveProps(nextProps) {
    if (!this.props.open && nextProps.open) {
      this.setState({
        ...nextProps.preset
      })
    }
  }

  onSubmit(e) {
    e.preventDefault()
    this.props.onChangePreset(this.state)
  }

  render() {
    if (!this.props.open)
      return <Modal show={false} />
    return (
      <Modal show={this.props.open} onHide={this.props.close}>
        <form onSubmit={this.onSubmit.bind(this)}>
        <Modal.Header closeButton>
          <Modal.Title>Change preset</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className='form-group'>
            <label>Bookmakers</label>
            <Select name='bookmakers'
              options={bookmakerOptions}
              placeholder='Includes all bookmakers if none are selected'
              onChange={books => this.setState({ bookmakers: books ? books.map(b => b.value) : [] }) }
              multi
              value={this.state.bookmakers}
            />
          </div>
          <div className='form-group'>
            <label>Sports</label>
            <Select name='sports'
              options={sportOptions}
              onChange={ sports => this.setState({ sports: sports ? sports.map(s => s.value) : [] }) }
              multi
              placeholder='Includes all sports if none are selected'
              value={this.state.sports}
            />
          </div>
          <div className='form-group'>
            <label> Select one random trade per match </label> 
            <input type='checkbox' className='form-control' onChange={() => {
              this.setState({uniqueMatchesSelected: !this.state.uniqueMatchesSelected})

            }} checked={this.state.uniqueMatchesSelected}/>
          </div>
          <div className='form-group'>
            <label>Odds types</label>
            <Select name='oddstypes'
              options={oddsTypeOptions}
              onChange={ ots => this.setState({ oddsTypes: ots ? ots.map(ot => ot.value) : [] }) }
              multi
              placeholder='Includes all odds types if none are selected'
              value={this.state.oddsTypes}
            />
          </div>
          <div className='form-group'>
            <label>Odds</label>
            <div className='row'>
              <div className='col-xs-12 col-md-6'>
                <div className='input-group'>
                  <span className='input-group-addon' data-tip='Greater than or equal to'>FROM</span>
                  <input type='number' step='any'
                    className='form-control'
                    value={this.state.odds.gte}
                    onChange={(e) => this.setState({ odds: {
                        gte: +e.target.value,
                        lte: this.state.odds.lte
                      }
                    })}
                  />
                </div>
              </div>
              <div className='col-xs-12 col-md-6'>
                <div className='input-group'>
                  <span className='input-group-addon' data-tip='Lesser than or equal to'>TO</span>
                  <input type='number' step='any'
                    className='form-control'
                    value={this.state.odds.lte}
                    onChange={(e) => this.setState({
                      odds: {
                        lte: +e.target.value,
                        gte: this.state.odds.gte
                      }
                    })}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className='form-group'>
            <label>Edge</label>
            <div className='row'>
              <div className='col-xs-12 col-md-6'>
                <div className='input-group'>
                  <span className='input-group-addon' data-tip='Greater than or equal to'>FROM</span>
                  <input type='number' step='any'
                    className='form-control'
                    value={this.state.edge.gte}
                    onChange={(e) => this.setState({
                      edge: {
                        gte: +e.target.value,
                        lte: this.state.edge.lte
                      }
                    })}
                  />
                  <span className='input-group-addon'>%</span>
                </div>
              </div>
              <div className='col-xs-12 col-md-6'>
                <div className='input-group'>
                  <span className='input-group-addon' data-tip='Lesser than or equal to'>TO</span>
                  <input type='number' step='any'
                    className='form-control'
                    value={this.state.edge.lte}
                    onChange={(e) => this.setState({
                      edge: {
                        lte: +e.target.value,
                        gte: this.state.edge.gte
                      }
                    })}
                  />
                  <span className='input-group-addon'>%</span>
                </div>
              </div>

            </div>
          </div>
          <div className='form-group'>
            <label>Hours before game time</label>
            <div className='row'>
              <div className='col-xs-12 col-md-6'>
                <div className='input-group'>
                  <span className='input-group-addon' data-tip='Greater than or equal to'>FROM</span>
                  <input type='number' step='any'
                    className='form-control'
                    value={this.state.hoursBefore.gte}
                    onChange={(e) => this.setState({
                      hoursBefore: {
                        gte: +e.target.value,
                        lte: this.state.hoursBefore.lte
                      }
                    })}
                  />
                </div>
              </div>
              <div className='col-xs-12 col-md-6'>
                <div className='input-group'>
                  <span className='input-group-addon' data-tip='Lesser than or equal to'>TO</span>
                  <input type='number' step='any'
                    className='form-control'
                    value={this.state.hoursBefore.lte}
                    onChange={(e) => this.setState({
                      hoursBefore: {
                        lte: +e.target.value,
                        gte: this.state.hoursBefore.gte
                      }
                    })}
                  />
                </div>
              </div>
            </div>
          </div>

        </Modal.Body>
        <Modal.Footer>
          <button className='btn btn-success' type='submit'>Save preset</button>
        </Modal.Footer>
        </form>
      </Modal>
    )
  }
}

class AnalyticsChart extends Component {
  shouldComponentUpdate(nextProps, nextState) {
    if(!this.props.EVarray) {
      return false
    }
    return this.props.EVarray.length !== nextProps.EVarray.length
  }

  render() {
    if(!this.props.EVarray ||
      !this.props.closingArray ||
      !this.props.profits
      )
      return <p className='lead'> </p>
    return (
      <div className='panel'>
        <header className='panel-heading'>Net results vs number of trades</header>
        <div className='panel-body'>
          <ReactHighcharts config={{
            chart: {
              type: 'line',
            },
            title: {
              text: 'Community stats'
            },
            xAxis: {
              categories: this.props.EVarray.map((_, i) => i),
              title: {
                text: 'Trades'
              }
            },
            yAxis: {
              title: {
                text: 'Unit profit/loss'
              }
            },
            series: [{
              name: 'EV',
              data: this.props.EVarray,
            }, {
              name: 'Closing EV',
              data: this.props.closingArray
            }, {
              name: 'Profits',
              data: this.props.profits
            }]
          }} />
        </div>
      </div>
    )
  }
}
