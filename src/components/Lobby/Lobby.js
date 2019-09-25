import React, { Component } from 'react';
import * as F from '../Helper'
import CSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';
import 'rodal/lib/rodal.css';
import './Lobby.css';
import { t } from '../../locales';

const size = F.vwTOpx(4);
class Lobby extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            items: [
                require('./../../assets/lobby/1000.jpg'),
                require('./../../assets/lobby/5000.jpg'),
                require('./../../assets/lobby/20000.jpg'),
                require('./../../assets/lobby/100000.jpg'),
                require('./../../assets/lobby/50000.jpg'),
                require('./../../assets/lobby/10000.jpg'),
                require('./../../assets/lobby/2000.jpg'),
                require('./../../assets/lobby/100000.jpg'),
            ],
            width: window.innerWidth,
            active: 3,
            direction: ''
        }
        this.canMove = true;
        this.rightClick = this.moveRight.bind(this)
        this.leftClick = this.moveLeft.bind(this)
        this.onResize = this.onResize.bind(this);
        this.gotoTable = this.gotoTable.bind(this)
        this.joinTable = this.joinTable.bind(this)
        this.startGame = this.startGame.bind(this)
    }
    onResize() {
        this.setState({ width: window.innerWidth })
    }
    startGame(bet) {
        if (this.props.User.balance < bet) {
            this.props.ToastsStore.warning(t('lessBalance'), 5000);
            return;
        }
        this.props.Loading('show');
        let item, found = false;;
        this.props.Game.getAvailableRooms((rooms) => {
            for (item of rooms) {
                if (!('metadata' in item))
                    continue;

                if (item.metadata.bet == bet && item.metadata.ready < 2) {
                    found = true;
                    this.joinTable(item.roomId);
                    break;
                }
            }
            if (!found) {
                this.createTable(bet);
            }
        });
    }
    gotoTable(data) {
        this.props.Loading('hide');
        this.props.JoinedToTable(data);
    }

    createTable(bet) {
        this.props.Game.join('Backgammon', { create: true, bet: bet, key: this.props.User.session });
    }
    joinTable(id) {
        this.props.Game.join(id, { key: this.props.User.session });
    }
    componentWilUnmount() {
        window.removeEventListener('resize', this.onResize);
    }
    componentDidMount() {
        window.addEventListener("resize", this.onResize);
        this.props.Game.reset();
        this.props.Game.register('welcome', this.gotoTable);
        if (!this.props.Game.isConnect) {
            this.props.Game.connect(
                () => {
                    let roomid = localStorage.getItem('roomId');
                    if (roomid != null) {
                        let item;
                        this.props.Game.getAvailableRooms((rooms) => {
                            for (item of rooms) {
                                if (!('metadata' in item))
                                    continue;
                                if (item.roomId == roomid) {
                                    this.joinTable(item.roomId);
                                    break;
                                }
                            }
                        });
                    }
                } ,
            );
        }
    }
    generateItems() {
        var items = []
        var level;
        for (var i = this.state.active - 3; i < this.state.active + 4; i++) {
            var index = i
            if (i < 0) {
                index = this.state.items.length + i
            } else if (i >= this.state.items.length) {
                index = i % this.state.items.length
            }
            level = this.state.active - i
            items.push(<Item key={index} img={this.state.items[index]} title={this.props.levels[index]} level={level} startGame={this.startGame} />)
        }
        return items
    }

    moveLeft() {
        if (!this.canMove) return;
        this.canMove = false;
        setTimeout(() => {
            this.canMove = true;
        }, 450);
        var newActive = this.state.active
        newActive--
        this.setState({
            active: newActive < 0 ? this.state.items.length - 1 : newActive,
            direction: 'left'
        })
    }

    moveRight() {
        if (!this.canMove) return;
        this.canMove = false;
        setTimeout(() => {
            this.canMove = true;
        }, 450);
        var newActive = this.state.active
        this.setState({
            active: (newActive + 1) % this.state.items.length,
            direction: 'right'
        })
    }

    render() {
        return (
            <div>
                <div className="player-info">
                    <div className="player-item">
                        <div className="player-level">{t('level')} <b>{this.props.User.level}</b></div>
                        <div className="player-infoname">{this.props.User.name}</div>
                    </div>
                    <div className="player-item" >
                        <div className="player-balance-text">{F.toMoney(this.props.User.balance)}</div>
                        <div className="player-balance">{t('balance')}</div>
                    </div>
                </div>
                <div id="carousel" className="noselect">
                    <div className="arrow arrow-left" onClick={this.leftClick}>
                        <svg width={size + "px"} height={size + "px"} viewBox="0 0 24 24" fill="none" stroke="#454545" ><path d="M2.117 12l7.527 6.235-.644.765-9-7.521 9-7.479.645.764-7.529 6.236h21.884v1h-21.883z"></path></svg>
                    </div>
                    <CSSTransitionGroup
                        transitionAppearTimeout={400}
                        transitionEnterTimeout={200}
                        transitionLeaveTimeout={200}
                        transitionName={this.state.direction}>
                        {this.generateItems()}
                    </CSSTransitionGroup>
                    <div className="arrow arrow-right" onClick={this.rightClick}>
                        <svg width={size + "px"} height={size + "px"} viewBox="0 0 24 24" fill="none" stroke="#454545" ><path d="M21.883 12l-7.527 6.235.644.765 9-7.521-9-7.479-.645.764 7.529 6.236h-21.884v1h21.883z"></path></svg>
                    </div>
                </div>
            </div>
        )
    }
}

class Item extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            level: this.props.level
        }
    }

    render() {
        const className = 'item level' + this.props.level
        return (
            <div className={className}
                style={{ zIndex: 4 - Math.abs(this.props.level) }}
                onClick={() => this.props.startGame(this.props.title)}>
                <img src={this.props.img} />
                <div>{F.toMoney(this.props.title)}</div>
            </div>
        )
    }
}

export default Lobby;