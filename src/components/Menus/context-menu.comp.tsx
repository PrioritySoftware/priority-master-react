import React, { Component } from 'react';
import { Text } from 'react-native';
import
{
    Menu,
    MenuOptions,
    MenuOption,
    MenuTrigger,
    renderers
} from 'react-native-popup-menu';
import { Strings } from '../../modules/strings';
import { inject } from 'mobx-react';
import { padding,  alignSelf, textAlign } from '../../styles/common';
import { PropTypes } from 'prop-types';

@inject("strings")
export class ContextMenu extends Component<any, any>
{
    static propTypes =
        {
            items: PropTypes.array,
        };
    static defaultProps =
        {
            items: []
        };
    menu;
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
        this.menu.open();
    }
    close()
    {
        this.menu.close();
        return true;
    }
    render()
    {
        let { SlideInMenu } = renderers;
        return (
            <Menu ref={el => this.menu = el} >
                <MenuTrigger customStyles={{ triggerOuterWrapper: alignSelf(this.strings.isRTL) }} />
                <MenuOptions customStyles={{ optionsContainer: { width: 120 } }}>
                    {
                        this.props.items.map(
                            (item, index, arr) =>
                            {
                                return (
                                    <MenuOption key={index} onSelect={item.onPress} >
                                        <Text style={[padding(this.strings.isRTL, 5), textAlign(this.strings.isRTL)]}>
                                            {item.text}
                                        </Text>
                                    </MenuOption>
                                );
                            }
                        )
                    }
                </MenuOptions>
            </Menu>
        );
    }

}