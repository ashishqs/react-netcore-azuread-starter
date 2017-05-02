import * as React from 'react';
import AuthContext from 'adal-angular';

export default class Auth extends React.Component<any, void> {
     componentDidMount() {
         
        (window as any).authContext.handleWindowCallback();
    }
    render() {
        return ( <div></div> );
    }
}