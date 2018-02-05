import React, { Component } from 'react';
import { Strings } from '../modules';
import { inject, observer, } from 'mobx-react';
import { observable } from 'mobx';
import { View, StyleSheet, Platform, BackHandler } from 'react-native';
import { colors, modal, center} from '../styles/common';
import Modal from 'react-native-modalbox'
import { Text, Button } from 'react-native-elements';

@inject("strings")
@observer
export class ProgressBarHandler extends Component<any, any>
{
    strings: Strings;
    private progressText: string;
    private cancelFunc;

    @observable progressVal: number;

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

    androidBackButton = () =>
    {
        return this.progressVal != null;
    }
    isPresented()
    {
        return this.progressVal != null;
    }
    showProgress(text: string = '', cancelFunc = () => { })
    {
        this.cancelFunc = cancelFunc;
        this.progressText = text;
        this.progressVal = 1;
    }
    hideProgress()
    {
        this.progressVal = null;
    }
    updateProgressVal(value: number)
    {
        this.progressVal = value;
    }
    render()
    {
        let isShowModal = this.progressVal != null;
        if (!isShowModal)
        {
            BackHandler.removeEventListener('hardwareBackPress', this.androidBackButton);
            return (null);
        }
        BackHandler.addEventListener('hardwareBackPress', this.androidBackButton);
        let progressPercent = this.progressVal + "%";
        return (
            <Modal
                entry='top'
                style={modal}
                backdrop={false}
                swipeToClose={false}
                isOpen={true}
                startOpen={true}
            >
                {this.renderBackdrop()}
                <View style={styles.progressContainer}>
                    <Text style={[center, { color: 'black' }]}>{this.progressText}</Text>
                    {/* progress bar */}
                    <View style={styles.progress}>
                        <View style={[styles.progressBackground, { width: progressPercent }]} ></View>
                        <Text style={styles.progressValText}>{progressPercent}</Text>
                    </View>
                    {/* cancel button */}
                    <Button title={this.strings.cancel}
                        onPress={() => this.cancelFunc()}
                        color={colors.primaryColor}
                        backgroundColor={'transparent'}
                        containerViewStyle={{ width: '100%' }}
                        activeOpacity={0.7} />

                </View>
            </Modal>
        );
    }
    renderBackdrop()
    {
        return (
            <View style={[styles.absolute, { backgroundColor: 'black', opacity: 0.22 }]} />
        );
    }
}
const styles = StyleSheet.create({
    progressContainer:
        {
            width: 240,
            height: 150,
            padding: 21,
            elevation: 1,
            shadowColor: colors.gray,
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.08,
            shadowRadius: 2,
            backgroundColor: 'white',
            alignItems: 'center',
            ...Platform.select({
                ios: {
                    borderRadius: 20,
                    paddingHorizontal: 0
                }
            })
        },
    progress:
        {
            height: 23,
            borderWidth: 1,
            borderColor: colors.disabledGray,
            marginTop: 20,
            marginBottom: 10,
            alignSelf: 'flex-start',
            width: '100%',
            ...Platform.select({
                ios: {
                    width: '90%',
                    marginLeft : '5%',
                    marginRight : '5%',
                }
            })
        },
    progressBackground:
        {
            backgroundColor: '#59ea81',
            height: '100%'
        },
    progressValText:
        {
            color: 'black',
            alignSelf: 'center',
            position: 'absolute',
            borderColor: 'transparent',
            backgroundColor:'transparent',
            
        },
    absolute: {
        position: "absolute",
        top: 0,
        bottom: 0,
        left: 0,
        right: 0
    },

});