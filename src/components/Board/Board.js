import React from 'react';
import './Board.css';
import DiceArea from '../DiceArea/DiceArea';
import getCheckers from '../getCheckers/getCheckers';
import Triangle from './Triangle/Triangle';
import GrayBar from '../GrayBar/Graybar';
import { t } from '../../locales';
import * as F from '../Helper';
import Timer from './Timer'
import play from '../Sound';
const size = F.vwTOpx(4);

class Board extends React.Component {
    constructor(props) {
        super(props);
        this.myTurn = false;
        this.mySit = 1;
        this.canUpdate = true;
        this.timer = null;
        this.connected = this.connected.bind(this)
        this.disconnected = this.disconnected.bind(this)
    }
    calculateScore() {

        let scoreP1 = 0;
        let scoreP2 = 0;

        this.props.points.map((point, index) => {
            if (point.player) {
                if (point.player === 1) {
                    scoreP1 += (24 - index) * point.checkers
                } else {
                    scoreP2 += (index + 1) * point.checkers
                }
            }
            return false;
        });


        if (this.props.grayBar.checkersP1) {
            scoreP1 += 25 * this.props.grayBar.checkersP1;
        }
        if (this.props.grayBar.checkersP2) {
            scoreP2 += 25 * this.props.grayBar.checkersP2;
        }

        return { 'P1': scoreP1, 'P2': scoreP2 };
    }
    componentDidMount() {
        this.props.Game.register('connected', this.connected);
        this.props.Game.register('disconnected', this.disconnected);
    }
    connected(name) {
        this.props.ToastsStore.success(name + t('returnToGame'), 8000);
    }
    disconnected(name) {
        this.props.ToastsStore.warning(name + t('lostConnection'), 8000);
    }
    shouldComponentUpdate(nextProps, nextState) {
        return this.canUpdate;
    }
    componentWillReceiveProps(nextProps, prevState) {
        if (!this.canUpdate)
            return;
        if (Object.keys(nextProps.players).length && '1' in nextProps.players)
            this.mySit = nextProps.players['1'].id == this.props.User.id ? 1 : 2;

        if (nextProps.gameStatus == 60 || nextProps.gameStatus == 70) {
            this.canUpdate = false;
            if ((this.mySit == 1 && nextProps.gameStatus == 60) || (this.mySit == 2 && nextProps.gameStatus == 70)) {
                this.props.ToastsStore.success(t('uWin'), 8000);
                play('win');
            }
            else {
                this.props.ToastsStore.error(t('uLose'), 8000);
                play('lose');
            }
        }
    }
    handler() {
        let send = this.mySit == 1 ? 'p1CanReceive' : 'p2CanReceive'
        let die = this.props.outSideBar[send];
        if (die != null && this.myTurn)
            this.props.receive(die);
    }

    // const score = calculateScore();
    render() {
        let leftDiceArea = null, rigthDiceArea = null, Center = null, rollDice = null;
        if (this.props.started) {
            let turn = this.props.p1IsNext ? 1 : 2;
            this.myTurn = (this.mySit == turn);
            rollDice = this.myTurn ? this.props.rollDice : null;
        }
        if (this.props.gameStatus > 10 && this.props.gameStatus <= 50) {
            if (this.props.dice.length == 1 && this.props.dice[0] == 0) {
                Center = this.myTurn ? <DiceArea dice={this.props.dice} clicked={rollDice} gameStatus={this.props.gameStatus} /> : null;
            } else {
                leftDiceArea = this.props.p1IsNext ? <DiceArea dice={this.props.dice} clicked={rollDice} gameStatus={this.props.gameStatus} /> : '';
                rigthDiceArea = this.props.p1IsNext ? '' : <DiceArea dice={this.props.dice} clicked={rollDice} gameStatus={this.props.gameStatus} />;
            }
        }
        else if (this.props.gameStatus == 80) {
            Center = <div>{t('waitingForOpponent')}</div>;
        }
        if (this.props.gameStatus == 50) {
            this.props.ToastsStore.warning(t('noMove'), 5000);
        }

        let p1 = this.props.players['1'] || {};
        let p2 = this.props.players['2'] || {};

        let checkersP1 = getCheckers(1, this.props.outSideBar.checkersP1, "out", false, 15)
        let checkersP2 = getCheckers(2, this.props.outSideBar.checkersP2, "out", false, 15)

        let canReceive = (this.props.outSideBar.p1CanReceive || this.props.outSideBar.p2CanReceive) ? ' receivable' : null;

        if (this.props.started) {
            let ref = this.props.p1IsNext ? 1 : 2;
            let prev = this.props.p1IsNext ? 2 : 1;
            if (this.timer != ref) {
                if (this.refs['timer' + prev] != null)
                    this.refs['timer' + prev].hide();
                if (this.refs['timer' + ref] != null)
                    this.refs['timer' + ref].show();
            }
            this.timer = ref;
        }
        return (
            <div id="game" >
                <div className="menu">
                    <nav role="navigation">
                        <div id="menuToggle">
                            <input type="checkbox" name='xx' />
                            <span></span>
                            <span></span>
                            <span></span>
                            <ul id="menu">
                                <a href="#"><li>{t('mute')}</li></a>
                                <a href="#"><li>{t('help')}</li></a>
                            </ul>
                        </div>
                    </nav>
                </div>
                <div className="back" onClick={() => this.props.backHandler()}>
                    <svg width={size + "px"} height={size + "px"} viewBox="0 0 24 24" fill="none" style={{ strokeWidth: 3, strokeLinecap: "round", strokeLsinejoin: "round" }} stroke="#cdcdcd" ><path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path><line y1="2" x2="12" y2="12" x1="12"></line></svg>
                </div>
                {p1.name ?
                    <div className="player-xinfo" >
                        <div style={{ width: '100%' }}>
                            <div className="player-xname">{p1.name}</div>
                            <div className="player-xlevel">{t('level')}<b></b>{p1.level}</div>
                        </div>
                        <Timer time={this.props.players[1].timing} ref='timer1' color="#d5354d" />
                    </div>
                    : <div className="player-xinfo" />
                }
                <div id="board" className={'container-fluid ' + this.props.className}>
                    <div id="leftOutSide" >
                        {this.mySit == 1 ? checkersP2 : checkersP1}
                    </div>
                    <div id="leftSide" className="row">

                        {leftDiceArea}

                        <div className={this.mySit == 1 ? "blocksDown" : "blocksUp"}>

                            <Triangle color="1" position={this.mySit == 1 ? "bottom" : "top"}
                                canMove={this.props.points[12].canMove}
                                move={this.props.move} myTurn={this.myTurn} receive={this.props.receive}
                                canReceive={this.props.points[12].canReceive}
                            >
                                {getCheckers(this.props.points[12].player, this.props.points[12].checkers, "board", this.props.points[12].canMove)}
                            </Triangle>

                            <Triangle color="2" position={this.mySit == 1 ? "bottom" : "top"}
                                canMove={this.props.points[13].canMove}
                                move={this.props.move} myTurn={this.myTurn} receive={this.props.receive}
                                canReceive={this.props.points[13].canReceive}
                            >
                                {getCheckers(this.props.points[13].player, this.props.points[13].checkers, "board", this.props.points[13].canMove)}
                            </Triangle>

                            <Triangle color="1" position={this.mySit == 1 ? "bottom" : "top"}
                                canMove={this.props.points[14].canMove}
                                move={this.props.move} myTurn={this.myTurn} receive={this.props.receive}
                                canReceive={this.props.points[14].canReceive}
                            >
                                {getCheckers(this.props.points[14].player, this.props.points[14].checkers, "board", this.props.points[14].canMove)}
                            </Triangle>

                            <Triangle color="2" position={this.mySit == 1 ? "bottom" : "top"}
                                canMove={this.props.points[15].canMove}
                                move={this.props.move} myTurn={this.myTurn} receive={this.props.receive}
                                canReceive={this.props.points[15].canReceive}
                            >
                                {getCheckers(this.props.points[15].player, this.props.points[15].checkers, "board", this.props.points[15].canMove)}
                            </Triangle>

                            <Triangle color="1" position={this.mySit == 1 ? "bottom" : "top"}
                                canMove={this.props.points[16].canMove}
                                move={this.props.move} myTurn={this.myTurn} receive={this.props.receive}
                                canReceive={this.props.points[16].canReceive}
                            >
                                {getCheckers(this.props.points[16].player, this.props.points[16].checkers, "board", this.props.points[16].canMove)}
                            </Triangle>

                            <Triangle color="2" position={this.mySit == 1 ? "bottom" : "top"}
                                canMove={this.props.points[17].canMove}
                                move={this.props.move} myTurn={this.myTurn} receive={this.props.receive}
                                canReceive={this.props.points[17].canReceive}
                            >
                                {getCheckers(this.props.points[17].player, this.props.points[17].checkers, "board", this.props.points[17].canMove)}
                            </Triangle>

                        </div>

                        <div className={this.mySit == 1 ? "blocksUp" : "blocksDown"}>

                            <Triangle color="1" position={this.mySit == 1 ? "top" : "bottom"}

                                canMove={this.props.points[11].canMove}
                                move={this.props.move} myTurn={this.myTurn} receive={this.props.receive}
                                canReceive={this.props.points[11].canReceive}
                            >
                                {getCheckers(this.props.points[11].player, this.props.points[11].checkers, "board", this.props.points[11].canMove)}
                            </Triangle>

                            <Triangle color="2" position={this.mySit == 1 ? "top" : "bottom"}

                                canMove={this.props.points[10].canMove}
                                move={this.props.move} myTurn={this.myTurn} receive={this.props.receive}
                                canReceive={this.props.points[10].canReceive}
                            >
                                {getCheckers(this.props.points[10].player, this.props.points[10].checkers, "board", this.props.points[10].canMove)}
                            </Triangle>

                            <Triangle color="1" position={this.mySit == 1 ? "top" : "bottom"}

                                canMove={this.props.points[9].canMove}
                                move={this.props.move} myTurn={this.myTurn} receive={this.props.receive}
                                canReceive={this.props.points[9].canReceive}
                            >
                                {getCheckers(this.props.points[9].player, this.props.points[9].checkers, "board", this.props.points[9].canMove)}
                            </Triangle>

                            <Triangle color="2" position={this.mySit == 1 ? "top" : "bottom"}

                                canMove={this.props.points[8].canMove}
                                move={this.props.move} myTurn={this.myTurn} receive={this.props.receive}
                                canReceive={this.props.points[8].canReceive}
                            >
                                {getCheckers(this.props.points[8].player, this.props.points[8].checkers, "board", this.props.points[8].canMove)}
                            </Triangle>

                            <Triangle color="1" position={this.mySit == 1 ? "top" : "bottom"}

                                canMove={this.props.points[7].canMove}
                                move={this.props.move} myTurn={this.myTurn} receive={this.props.receive}
                                canReceive={this.props.points[7].canReceive}
                            >
                                {getCheckers(this.props.points[7].player, this.props.points[7].checkers, "board", this.props.points[7].canMove)}
                            </Triangle>

                            <Triangle color="2" position={this.mySit == 1 ? "top" : "bottom"}

                                canMove={this.props.points[6].canMove}
                                move={this.props.move} myTurn={this.myTurn} receive={this.props.receive}
                                canReceive={this.props.points[6].canReceive}
                            >
                                {getCheckers(this.props.points[6].player, this.props.points[6].checkers, "board", this.props.points[6].canMove)}
                            </Triangle>
                        </div>


                    </div>
                    <GrayBar
                        checkers={this.props.grayBar}
                        myTurn={this.myTurn}
                        first={Center == null && this.props.currentPosition > 0}
                        undoHandler={this.props.undoHandler}
                    >
                        {Center != null && Center}
                    </GrayBar>
                    <div id="rightSide" className=" row">

                        {rigthDiceArea}

                        <div className={this.mySit == 1 ? "blocksDown" : "blocksUp"}>

                            <Triangle color="1" position={this.mySit == 1 ? "bottom" : "top"}
                                canMove={this.props.points[18].canMove}
                                move={this.props.move} myTurn={this.myTurn} receive={this.props.receive}
                                canReceive={this.props.points[18].canReceive}
                            >
                                {getCheckers(this.props.points[18].player, this.props.points[18].checkers, "board", this.props.points[18].canMove)}
                            </Triangle>

                            <Triangle color="2" position={this.mySit == 1 ? "bottom" : "top"}
                                canMove={this.props.points[19].canMove}
                                move={this.props.move} myTurn={this.myTurn} receive={this.props.receive}
                                canReceive={this.props.points[19].canReceive}
                            >
                                {getCheckers(this.props.points[19].player, this.props.points[19].checkers, "board", this.props.points[19].canMove)}
                            </Triangle>

                            <Triangle color="1" position={this.mySit == 1 ? "bottom" : "top"}
                                canMove={this.props.points[20].canMove}
                                move={this.props.move} myTurn={this.myTurn} receive={this.props.receive}
                                canReceive={this.props.points[20].canReceive}
                            >
                                {getCheckers(this.props.points[20].player, this.props.points[20].checkers, "board", this.props.points[20].canMove)}
                            </Triangle>

                            <Triangle color="2" position={this.mySit == 1 ? "bottom" : "top"}
                                canMove={this.props.points[21].canMove}
                                move={this.props.move} myTurn={this.myTurn} receive={this.props.receive}
                                canReceive={this.props.points[21].canReceive}
                            >
                                {getCheckers(this.props.points[21].player, this.props.points[21].checkers, "board", this.props.points[21].canMove)}
                            </Triangle>

                            <Triangle color="1" position={this.mySit == 1 ? "bottom" : "top"}
                                canMove={this.props.points[22].canMove}
                                move={this.props.move} myTurn={this.myTurn} receive={this.props.receive}
                                canReceive={this.props.points[22].canReceive}
                            >
                                {getCheckers(this.props.points[22].player, this.props.points[22].checkers, "board", this.props.points[22].canMove)}
                            </Triangle>

                            <Triangle color="2" position={this.mySit == 1 ? "bottom" : "top"}
                                canMove={this.props.points[23].canMove}
                                move={this.props.move} myTurn={this.myTurn} receive={this.props.receive}
                                canReceive={this.props.points[23].canReceive}
                            >
                                {getCheckers(this.props.points[23].player, this.props.points[23].checkers, "board", this.props.points[23].canMove)}
                            </Triangle>
                        </div>

                        <div className={this.mySit == 1 ? "blocksUp" : "blocksDown"}>

                            <Triangle color="1" position={this.mySit == 1 ? "top" : "bottom"}
                                canMove={this.props.points[5].canMove}
                                move={this.props.move} myTurn={this.myTurn} receive={this.props.receive}
                                canReceive={this.props.points[5].canReceive}
                            >
                                {getCheckers(this.props.points[5].player, this.props.points[5].checkers, "board", this.props.points[5].canMove)}
                            </Triangle>

                            <Triangle color="2" position={this.mySit == 1 ? "top" : "bottom"}
                                canMove={this.props.points[4].canMove}
                                move={this.props.move} myTurn={this.myTurn} receive={this.props.receive}
                                canReceive={this.props.points[4].canReceive}
                            >
                                {getCheckers(this.props.points[4].player, this.props.points[4].checkers, "board", this.props.points[4].canMove)}
                            </Triangle>

                            <Triangle color="1" position={this.mySit == 1 ? "top" : "bottom"}
                                canMove={this.props.points[3].canMove}
                                move={this.props.move} myTurn={this.myTurn} receive={this.props.receive}
                                canReceive={this.props.points[3].canReceive}
                            >
                                {getCheckers(this.props.points[3].player, this.props.points[3].checkers, "board", this.props.points[3].canMove)}
                            </Triangle>

                            <Triangle color="2" position={this.mySit == 1 ? "top" : "bottom"}
                                canMove={this.props.points[2].canMove}
                                move={this.props.move} myTurn={this.myTurn} receive={this.props.receive}
                                canReceive={this.props.points[2].canReceive}
                            >
                                {getCheckers(this.props.points[2].player, this.props.points[2].checkers, "board", this.props.points[2].canMove)}
                            </Triangle>

                            <Triangle color="1" position={this.mySit == 1 ? "top" : "bottom"}
                                canMove={this.props.points[1].canMove}
                                move={this.props.move} myTurn={this.myTurn} receive={this.props.receive}
                                canReceive={this.props.points[1].canReceive}
                            >
                                {getCheckers(this.props.points[1].player, this.props.points[1].checkers, "board", this.props.points[1].canMove)}
                            </Triangle>

                            <Triangle color="2" position={this.mySit == 1 ? "top" : "bottom"}
                                canMove={this.props.points[0].canMove}
                                move={this.props.move} myTurn={this.myTurn} receive={this.props.receive}
                                canReceive={this.props.points[0].canReceive}
                            >
                                {getCheckers(this.props.points[0].player, this.props.points[0].checkers, "board", this.props.points[0].canMove)}
                            </Triangle>

                        </div>

                    </div>
                    <div id="rightOutSide" className={canReceive} onClick={() => this.handler()}>
                        {this.mySit == 1 ? checkersP1 : checkersP2}
                    </div>
                    {this.props.children}
                </div>
                <div className="player-xinfo" >
                    {p2.name ?
                        <div className="player-xinfo" >
                            <div style={{ width: '100%' }}>
                                <div className="player-xname">{p2.name}</div>
                                <div className="player-xlevel">{t('level')}<b></b>{p2.level}</div>
                            </div>
                            <Timer time={this.props.players[2].timing} ref='timer2' color="rgb(26, 111, 240)" />
                        </div>
                        : <div className="player-xinfo" />
                    }
                </div>
            </div>
        );
    }
}

export default Board;