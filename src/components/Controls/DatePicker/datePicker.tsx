// inspired by https://github.com/xgfe/react-native-datepicker

import React, { Component } from 'react';
import
{
    Platform,
    Modal,
    View,
    DatePickerIOS,
    TouchableOpacity,
    TouchableHighlight,
    TouchableWithoutFeedback,
    Text,
    Animated,
    StyleSheet,
    DatePickerAndroid,
    TimePickerAndroid
} from 'react-native';
// import { DatePickerAndroid } from './datePickerAndroid';
import PropTypes from 'prop-types';
import { colors } from '../../../styles/common'

const ANIM_DURATION = 300;

export default class DatePicker extends Component<any, any>
{
    static propTypes =
        {
            onDone: PropTypes.func.isRequired,
            onCancel: PropTypes.func,
            initialDate: PropTypes.oneOfType([
                PropTypes.instanceOf(Date),
                PropTypes.string
            ]),
            minDate: PropTypes.instanceOf(Date),
            maxDate: PropTypes.instanceOf(Date),
            cancelText: PropTypes.string,
            doneText: PropTypes.string,
            containerStyle: PropTypes.oneOfType([
                PropTypes.array,
                PropTypes.number,
                PropTypes.shape({}),
            ]),
            allowFontScaling: PropTypes.bool,
            disabled: PropTypes.bool,
            mode: PropTypes.string
        };

    static defaultProps =
        {
            cancelText: 'Cancel',
            doneText: 'Done',
            clearText: 'Clear',
            containerStyle: {},
            allowFontScaling: true,
            disabled: true,
            mode: 'date'
        };

    isReady: boolean;

    constructor(props)
    {
        super(props);

        this.isReady = false;

        this.state = {
            selectedDate: null,
            minDate: null,
            maxDate: null,
            showModal: false,
            anim: new Animated.Value(0)
        };

        this.initComponent = this.initComponent.bind(this);
        this.setModalVisible = this.setModalVisible.bind(this);
        this.openDatePicker = this.openDatePicker.bind(this);
        this.openIOSDatePicker = this.openIOSDatePicker.bind(this);
        this.openAndroidDatePicker = this.openAndroidDatePicker.bind(this);
        this.handleDateChange = this.handleDateChange.bind(this);
        this.renderModalIOS = this.renderModalIOS.bind(this);
        this.handlePressDone = this.handlePressDone.bind(this);
        this.handlePressCancel = this.handlePressCancel.bind(this);
        this.handlePressClear = this.handlePressClear.bind(this);
    }

    componentDidMount()
    {
        this.initComponent();
    }

    componentWillReceiveProps(nextProps)
    {
        if (this.props.initialDate !== nextProps.initialDate)
        {
            let initialDate = nextProps.mode === 'date' ? new Date() : '';
            const selectedDate = nextProps.initialDate ? nextProps.initialDate : initialDate;
            this.setState({ selectedDate });
        }
    }

    initComponent()
    {
        let initialDate = this.props.mode === 'date' ? new Date() : '';
        const selectedDate = this.props.initialDate ? this.props.initialDate : initialDate;
        const minDate = this.props.minDate ? this.props.minDate : new Date(1900, 1, 1);
        let date = new Date();
        date.setDate(date.getDate() + 1095);
        const maxDate = this.props.maxDate ? this.props.maxDate : date;

        this.setState({
            selectedDate,
            minDate,
            maxDate
        });

        this.isReady = true;
    }

    setModalVisible(visible)
    {
        if (visible)
        {
            this.setState({ showModal: visible });
            return Animated.timing(
                this.state.anim,
                {
                    toValue: 1,
                    duration: ANIM_DURATION
                }
            ).start();
        }
        else
        {
            return Animated.timing(
                this.state.anim,
                {
                    toValue: 0,
                    duration: ANIM_DURATION
                }
            ).start(() =>
            {
                this.setState({ showModal: visible });
            });
        }
    }

    openIOSDatePicker()
    {
        this.setModalVisible(true);
    }

    openAndroidDatePicker()
    {
        // check if dismiss updates the value - if not remove
        // Keyboard.dismiss();

        if (this.props.mode === 'time')
        {
            this.openAndroidTimePicker();
            return;
        }
        DatePickerAndroid.open({
            date: this.state.selectedDate,
            minDate: this.state.minDate,
            maxDate: this.state.maxDate
        })
            .then(({ action, year, month, day }) =>
            {
                if (action === DatePickerAndroid.dateSetAction)
                {
                    let selectedDate, updateDate;
                    if (year === 0 && month === 0 && day === 0)
                    {
                        selectedDate = new Date();
                        updateDate = null;
                    }
                    else
                    {
                        selectedDate = updateDate = new Date(year, month, day);
                    }
                    this.setState({ selectedDate });
                    this.props.onDone(updateDate);
                } else if (action === DatePickerAndroid.dismissedAction)
                {
                    this.props.onCancel ? this.props.onCancel() : null;
                }
            });
    }

    openAndroidTimePicker()
    {
        let hour;
        let minute;
        if (typeof this.state.selectedDate === 'string')
        {
            let date = this.state.selectedDate.split(":");
            if (date.length === 2)
            {
                hour = Number(date[0]);
                minute = Number(date[1]);
            }
        }
        TimePickerAndroid.open({
            hour: hour,
            minute: minute
        })
            .then(({ action, hour, minute }) =>
            {
                if (action === TimePickerAndroid.timeSetAction)
                {
                    let selectedDate, updateDate;
                    let hourStr = hour < 10 ? '0' + hour : hour;
                    let minuteStr = hour < 10 ? '0' + minute : minute;
                    selectedDate = updateDate = hourStr + ":" + minuteStr;
                    this.setState({ selectedDate });
                    this.props.onDone(updateDate);
                } else if (action === TimePickerAndroid.dismissedAction)
                {
                    this.props.onCancel ? this.props.onCancel() : null;
                }
            });
    }

    openDatePicker()
    {
        if (!this.isReady)
        {
            return;
        }

        if (Platform.OS === 'ios')
        {
            this.openIOSDatePicker();
        }
        else if (Platform.OS === 'android')
        {
            this.openAndroidDatePicker();
        }
    }

    handlePressDone()
    {
        this.setModalVisible(false);
        this.props.onDone(this.state.selectedDate);
    }

    handlePressCancel()
    {
        this.setModalVisible(false);
        this.props.onCancel ? this.props.onCancel() : null;
    }

    handlePressClear()
    {
        this.setModalVisible(false);
        this.setState({ selectedDate: new Date() });
        this.props.onDone(null);
    }

    handleDateChange(selectedDate)
    {
        this.setState({ selectedDate });
    }

    renderModalIOS()
    {
        if (Platform.OS === 'ios')
        {
            return (
                <Modal
                    animationType="none"
                    transparent
                    visible={this.state.showModal}
                    onRequestClose={() => { this.setModalVisible(false); }}
                >
                    <Animated.View
                        style={{
                            flex: 1, backgroundColor: this.state.anim.interpolate({
                                inputRange: [0, 1],
                                outputRange: ['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 0.5)']
                            })
                        }}
                    >
                        <TouchableWithoutFeedback
                            style={{ flex: 1 }}
                            onPress={this.handlePressCancel}
                        >
                            <View style={styles.datePickerMask}>
                                <TouchableHighlight
                                    underlayColor={'#fff'}
                                    style={{ flex: 1 }}
                                >
                                    <Animated.View
                                        style={[styles.datePickerCon, {
                                            height: this.state.anim.interpolate({
                                                inputRange: [0, 1],
                                                outputRange: [0, 250]
                                            })
                                        }]}
                                    >
                                        <View style={styles.btnContainer}>
                                            <TouchableOpacity
                                                onPress={this.handlePressCancel}
                                                style={styles.btnText}
                                            >
                                                <Text style={styles.text} >{this.props.cancelText.toUpperCase()}</Text>
                                            </TouchableOpacity>
                                            <View style={{ flexDirection: 'row' }}>
                                                <TouchableOpacity
                                                    onPress={this.handlePressClear}
                                                >
                                                    <Text style={styles.text} >{this.props.clearText.toUpperCase()}</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity
                                                    onPress={this.handlePressDone}
                                                    style={styles.btnText}
                                                >
                                                    <Text style={styles.text}>{this.props.doneText.toUpperCase()}</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                        <View>
                                            <DatePickerIOS
                                                mode={this.props.mode}
                                                date={this.state.selectedDate ? this.state.selectedDate : new Date()}
                                                minimumDate={this.state.minDate}
                                                maximumDate={this.state.maxDate}
                                                onDateChange={this.handleDateChange}
                                            />
                                        </View>
                                    </Animated.View>
                                </TouchableHighlight>
                            </View>
                        </TouchableWithoutFeedback>
                    </Animated.View>
                </Modal>

            )
        }
        return null;
    }

    render()
    {
        return (
            <View>
                {this.renderModalIOS()}
                <TouchableOpacity activeOpacity={0.5} onPress={this.openDatePicker} disabled={this.props.disabled}>
                    <View style={this.props.containerStyle}>
                        {this.props.children}
                    </View>
                </TouchableOpacity>
            </View>
        );
    }
}

let styles = StyleSheet.create({
    datePickerMask: {
        flex: 1,
        alignItems: 'flex-end',
        flexDirection: 'row',
        backgroundColor: 'transparent'
    },
    datePickerCon: {
        backgroundColor: '#fff',
        height: 0,
        overflow: 'hidden'
    },
    btnText: {
        paddingHorizontal: 18,
    },
    btnContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        height: 45,
        borderColor: colors.middleGrayLight,
        borderBottomWidth: 1,
        alignItems: 'center'
    },
    text:
        {
            color: colors.blue
        }
});