import React from 'react';

import shallowEqual from '../utils/shallowEqual';
import versionNumber from '../utils/versionNumber';

export default class DbComponent extends React.Component{
    static getDerivedStateFromProps(props){
        return {
            _version: versionNumber(props)
        };
    }
    shouldComponentUpdate(newProps, newState){
        return !shallowEqual(this.props, newProps) || !shallowEqual(this.state, newState);// || versionNumber(this.props) !== versionNumber(newProps);
    }
}