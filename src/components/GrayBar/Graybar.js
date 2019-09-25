import React, { Component } from 'react';
import './Graybar.css';
import * as F from '../Helper';
import getCheckers from '../getCheckers/getCheckers';
const size = F.vwTOpx(3);

class GrayBar extends Component {

    // shouldComponentUpdate(nextProps, nextState) {

    //     let propsChanged = false;

    //     if (nextProps.checkers.checkersP1 !== this.props.checkers.checkersP1
    //         || nextProps.checkers.checkersP2 !== this.props.checkers.checkersP2) {
    //         propsChanged = true;
    //     }

    //     return propsChanged;
    // }

    render() {

        let isUndo = false;
        let undoButtonFunction;
        if (this.props.first && this.props.myTurn) {
            isUndo = true;
            undoButtonFunction = this.props.undoHandler;
        }

        const checkersP1 = getCheckers(1, this.props.checkers.checkersP1, "Graybar", false);
        const checkersP2 = getCheckers(2, this.props.checkers.checkersP2, "Graybar", false);

        return (
            <div id="grayBar" className="row">
                <div className="blocksUp">
                    <div className="pointContainer ">
                        {checkersP1}
                    </div>
                </div>
                <div className="blocksCenter" >
                    {isUndo &&
                        <div className="undo" onClick={undoButtonFunction}>
                            <svg width={size + "px"} height={size + "px"} viewBox="0 0 24 24" fill="none" stroke="#fff" style={{ marginBottom: -6, strokeWidth: 3, strokeLinecap: "square", strokeLsinejoin: "arcs" }} ><path d="M2.5 2v6h6M2.66 15.57a10 10 0 1 0 .57-8.38" /></svg>
                        </div>
                    }
                    {this.props.children}
                </div>
                <div className="blocksDown">
                    <div className="pointContainer pointContainerDown">
                        {checkersP2}
                    </div>

                </div>
            </div>
        )
    }
}

export default GrayBar;