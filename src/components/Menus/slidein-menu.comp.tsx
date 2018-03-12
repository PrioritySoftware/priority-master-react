import React, { Component } from 'react';
import { Text,StyleSheet, Platform } from 'react-native';
import
{
    MenuProvider,
    Menu,
    MenuOptions,
    MenuOption,
    MenuTrigger,
    renderers
} from 'react-native-popup-menu';
import { Icon } from 'react-native-elements'
import Modal from 'react-native-modalbox';
import { Strings } from '../../modules/strings';
import { inject } from 'mobx-react';
import { padding, colors, flexDirection, alignSelf, textAlign, fullHeight, fullWidth, modal } from '../../styles/common';
import { PropTypes } from 'prop-types';

@inject("strings")
export class SlideinMenu extends Component<any, any>
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
            <Modal
                ref={modalRef => this.menu = modalRef}
                style={modal}
                swipeToClose={false}
                backdropOpacity={0.22}
                animationDuration={0}
                backButtonClose>
                <MenuProvider style={{ width: fullWidth, height: fullHeight }}>
                    <Menu
                        opened
                        onBackdropPress={() => this.close()}
                        renderer={SlideInMenu}>
                        <MenuTrigger customStyles={{ triggerOuterWrapper: alignSelf(this.strings.isRTL) }} />
                        <MenuOptions >
                            {
                                this.props.items.map(
                                    (item, index, arr) =>
                                    {
                                        return (
                                            <MenuOption key={index}
                                                onSelect={item.onPress}
                                                customStyles={{ optionWrapper: [flexDirection(this.strings.isRTL), { paddingVertical: 10 }] }}>
                                                <Icon type='ionicon'
                                                    name={item.icon}
                                                    size={23}
                                                    color={colors.darkGray}
                                                    underlayColor='transparent'
                                                    style={padding(this.strings.isRTL, 10)} />
                                                <Text style={[styles.optionText,padding(this.strings.isRTL, 10), textAlign(this.strings.isRTL)]}>
                                                    {item.text}
                                                </Text>
                                            </MenuOption>
                                        );
                                    }
                                )
                            }
                        </MenuOptions>
                    </Menu>
                </MenuProvider>
            </Modal>
        );
    }
}
const styles = StyleSheet.create({
    optionText:
    {
        ...Platform.select({
            ios:
                {
                    paddingTop:3
                }
        })
    }
});