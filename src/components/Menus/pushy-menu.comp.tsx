import React, { Component } from 'react';
import { Strings } from '../../modules/strings';
import { inject } from 'mobx-react';
import {PropTypes} from 'prop-types';

@inject("strings")
export class PushyMenu extends Component<any, any>
{
    static propTypes =
    {
       items:PropTypes.array,
    };
static defaultProps =
    {
        items: []
    };
    popup;
    private strings: Strings;

    constructor(props)
    {
        super(props);
        this.strings = this.props.strings;
    }
    componentWillMount()
    {
        this.props.onRef(this);
    }
    componentWillUnmount()
    {
        this.props.onRef(undefined)
    }
    open()
    {
        this.popup.open();
    }
    close()
    {
        this.popup.close();
        return true;
    }
    render()
    {
        return (null);
    }

}