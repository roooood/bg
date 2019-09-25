
import React, { Component } from 'react';
import './Loading.css';

const Loading = props => {
    if (props.show == false) {
        return null
    }
    return (
        <div className='overly'>
            <div className="loader">
                <span>... در حال بارگذاری </span>
            </div>
        </div>
    )
};
export default Loading;


