import React, { Component } from 'react';
import Game from './Game'
import './App.css';
import { ToastsContainer, ToastsStore } from 'react-toasts';

import Lobby from '../components/Lobby/Lobby';
import Loading from '../components/Loading';
import Board from '../components/Board/Board';
import { t } from '../locales';
import * as F from '../components/Helper';
import play from '../components/Sound'
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';

const api = 'http://localhost:2657/';

const inf = 'rotatePullTop animated';
const outf = 'rotatePushTop animated';

const state = {
    started: false,
    gameStatus: 80, //not started
    history: [],
    currentPosition: 0,
    p1IsNext: true,
    loading: false,
    dice: [0],
    points: Array(24).fill({ player: false, checkers: 0 }),
    grayBar: { checkersP1: 0, checkersP2: 0 },
    outSideBar: { checkersP1: 15, checkersP2: 15 },
    movingChecker: false,
    Sit: {},
    levels: []
}
class App extends Component {

    //Initial state
    state = {
        ...state,
        data: {},
        route: 'loading',
        className: '',
    }

    componentDidMount() {
        this.user = F.getQuery('token');
        if (this.user == '') {
            this.setState({ route: 'error', msg: t('userError') })
        }
        else {
            this.getData();
        }
    }
    getData() {
        fetch(api + 'info/' + this.user, { method: 'GET' })
            .then(response => response.json())
            .then(res => {
                if ('result' in res) {
                    if (res.result == 'ok') {
                        this.setState({ route: 'lobby', user: res.data, levels: res.setting.levels.split(',') });
                    }
                    else {
                        this.setState({ route: 'error', msg: t('userError') })
                    }
                }
                else {
                    this.setState({ route: 'error', msg: t('networkError') })
                }
            });
    }
    JoinedToTable(data) {
        this.setState({ data: data })
        Game.onState((state) => {
            this.setState(state);
        });
        Game.register("leave", this.goToLobby.bind(this));
        this.setState({ className: outf });
        setTimeout(() => {
            this.setState({
                route: 'game',
                className: inf
            })
        }, 300)

    }

    backToLobby() {
        if (this.state.started) {
            confirmAlert({
                title: t('ruSure'),
                message: t('uWillLose'),
                buttons: [
                    {
                        label: t('accept'),
                        onClick: () => {
                            Game.leave();
                            ToastsStore.error(t('uLose'), 8000);
                            this.goToLobby();
                        }
                    },
                    {
                        label: t('denay'),
                        onClick: () => null
                    }
                ]
            });
        }
        else {
            Game.leave();
            this.goToLobby();
        }



    }
    goToLobby() {
        this.state.user.balance = '-';
        this.setState({ className: outf });
        setTimeout(() => {
            this.getData();
            this.setState({
                ...state,
                route: 'lobby',
                className: inf
            })
        }, 400)
    }
    rollDiceHandler = () => {
        play('roll');
        Game.send({ rollDice: 1 })
    }

    moveHandler = (move) => {
        play('click');
        Game.send({ move: move })
    }

    receiveHandler = (receive) => {
        play('click');
        Game.send({ receive: receive })
    }

    undoHandler = () => {
        play('click');
        Game.send({ undo: 1 })
    }

    loading(type) {
        this.setState({ loading: type == 'show' ? true : false })
    }

    render() {
        if (this.state.route == 'lobby')
            return (
                <div id="App">
                    <Loading show={this.state.loading} />
                    <ToastsContainer store={ToastsStore} />
                    <Lobby
                        className={this.state.className}
                        Game={Game}
                        Loading={this.loading.bind(this)}
                        User={{ ...this.state.user, session: this.user }}
                        levels={this.state.levels}
                        JoinedToTable={this.JoinedToTable.bind(this)}
                        ToastsStore={ToastsStore}
                    />
                </div>

            );
        else if (this.state.route == 'game')
            return (
                <div id="App" >
                    <Loading show={this.state.loading} />
                    <ToastsContainer store={ToastsStore} />
                    <Board
                        Loading={this.loading.bind(this)}
                        Game={Game}
                        backHandler={this.backToLobby.bind(this)}
                        className={this.state.className}
                        grayBar={this.state.grayBar}
                        currentPosition={this.state.currentPosition}
                        outSideBar={this.state.outSideBar}
                        players={this.state.Sit}
                        rollDice={this.rollDiceHandler}
                        move={this.moveHandler}
                        receive={this.receiveHandler}
                        dice={this.state.dice}
                        started={this.state.started}
                        points={this.state.points}
                        p1IsNext={this.state.p1IsNext}
                        gameStatus={this.state.gameStatus}
                        User={{ ...this.state.user, session: this.user }}
                        undoHandler={this.undoHandler}
                        data={this.state.data}
                        ToastsStore={ToastsStore}
                    >
                    </Board>
                </div>
            );
        else if (this.state.route == 'error')
            return (
                <div className='error'>
                    <div className='error-handler'>
                        <b>{this.state.msg}</b>
                    </div>
                </div>
            )
        else if (this.state.route == 'loading')
            return <Loading />
    }
}

export default App;
