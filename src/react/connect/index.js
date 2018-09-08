import {Component, createElement } from 'react';
import shallowEqual from '../utils/shallowEqual';
import versionNumber from '../utils/versionNumber';

function makeSelector(mapStateToProps, stateEqual = shallowEqual, getVersion = versionNumber){
    return (props, store, db) => {
        let newProps = mapStateToProps(db, store);
        let version = getVersion(newProps);
        if(stateEqual(newProps, props.props) && version === props.version){
            return {version, props: props };
        }
        return {version, props: newProps};
    }
}

function makeUpdater(sourceSelector, store, db) {
  return function updater(props, prevState) {
    try {
      const nextProps = sourceSelector(prevState, store, db);
      if (nextProps.props !== prevState.props || prevState.error) {
        return {
          shouldComponentUpdate: true,
          props: nextProps.props,
          version: nextProps.version,
          error: null,
        }
      }
      return {
        shouldComponentUpdate: false,
      }
    } catch (error) {
      return {
        shouldComponentUpdate: true,
        error,
      }
    }
  }
}

function mergeWith(obj1, obj2){
    for(let k in obj2)
        obj1[k] = obj2[k];
    return obj1;
}


export default function connect(WrappedComponent, mapStateToProps, db){
    const store = db.datastruct;
    const async = {};

    const renderCountProp = undefined;
    const withRef = undefined;
    const storeKey = "__jsTransObjStore";


    class Connector extends Component{
        constructor(props, context){
            super(props, context);

            const sourceSelector = makeSelector(mapStateToProps);

            this.db = db;
            this.store = store || props[storeKey] || context[storeKey];

            this.state = {
                shouldComponentUpdate: true,
                updater: makeUpdater(sourceSelector, this.store, this.db),
            }
            this.state = mergeWith(this.state, this.state.updater(this.props, this.state));

            this.unsubscribe = this.store.subscribe(this.runUpdater.bind(this));
            this.renderCount = 0;
        }
        runUpdater() {
            if (this.isUnmounted) {
              return;
            }

            this.setState(prevState => prevState.updater(this.props, prevState))
        }

        shouldComponentUpdate(_, nextState){
            return nextState.shouldComponentUpdate;
        }

        onStateChange() {
            this.runUpdater(this.notifyNestedSubs);
        }        

        componentDidMount() {
            // componentWillMount fires during server side rendering, but componentDidMount and
            // componentWillUnmount do not. Because of this, trySubscribe happens during ...didMount.
            // Otherwise, unsubscription would never take place during SSR, causing a memory leak.
            // To handle the case where a child component may have triggered a state change by
            // dispatching an action in its componentWillMount, we have to re-run the select and maybe
            // re-render.
//            this.subscription.trySubscribe()
            this.runUpdater()
        }
        addExtraProps(props) {
            if (!withRef && !renderCountProp && !(this.propsMode && this.subscription)) return props;
            // make a shallow copy so that fields added don't leak to the original selector.
            // this is especially important for 'ref' since that's a reference back to the component
            // instance. a singleton memoized selector would then be holding a reference to the
            // instance, preventing the instance from being garbage collected, and that would be bad
            const withExtras = mergeWith({}, props);

//            const withExtras = { ...props }
            if (withRef) withExtras.ref = this.setWrappedInstance
            if (renderCountProp) withExtras[renderCountProp] = this.renderCount++
//            if (this.propsMode && this.subscription) withExtras[subscriptionKey] = this.subscription
            return withExtras;
        }
        componentWillUnmount() {
            if (this.unsubscribe) {
                this.subscription();
            }
            this.unsubscribe = null;
            this.isUnmounted = true;
            this.store = null;
        }
        render() {
            if (this.state.error) {
              throw this.state.error;
            } else {
              return createElement(WrappedComponent, this.addExtraProps(this.state.props));
            }
        }
    };

    // for the wrapped component
    // check for displayName for something more descriptive, 
    // else fall back to name
    const wrappedComponentName = 
        WrappedComponent.displayName ||
        WrappedComponent.name


    Connector.displayName = "DSConnected("+wrappedComponentName+")";

    return Connector;
}