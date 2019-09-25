import React from 'react';
import ReactCountdownClock from 'react-countdown-clock';
import * as F from '../Helper';
const size = F.vwTOpx(7);

export default class Timer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            show: false
        }
        this.show = this.show.bind(this);
        this.hide = this.hide.bind(this);
    }
    show() {
        this.setState({ show: true })
    }
    hide() {
        this.setState({ show: false })
    }
    render() {
        if (!this.state.show)
            return (
                <div style={{ width: size, height: size }}>

                </div>
            )
        return (
            <div style={{ width: size, height: size, borderRadius: size / 2, background: '#333' }}>
                <ReactCountdownClock 
                    seconds={this.props.time/1000}
                    color={this.props.color}
                    weight={F.vwTOpx(.5)}
                    alpha={0.9}
                    size={size}
                    onComplete={this.hide}
                />
            </div>
        );
    }
}