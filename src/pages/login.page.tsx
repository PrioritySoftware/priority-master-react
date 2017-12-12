import React from 'react';
import
{
    StyleSheet,
    View,
    Linking
} from 'react-native';
import { Strings } from '../modules';
import { SVG } from '../components/svg';
import { Header, Text, Button } from 'react-native-elements';
import { AppService } from '../providers/app.service';
import TextField from 'react-native-md-textinput';
import { colors, center, header, textAlign } from '../styles/common';
import { NavigationActions } from 'react-navigation';
import { MessageHandler } from '../components/message.handler';
import { ConfigService } from '../providers/config.service';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Pages } from '.';
import { inject } from 'mobx-react';

@inject("appService", "configService", "messageHandler", "strings")
export class LoginPage extends React.Component<any, any>
{
    static navigationOptions = { header: null }

    configService: ConfigService;
    strings: Strings;
    messageHandler: MessageHandler;
    appService: AppService;

    // login
    username: string;
    password: string;

    // forgotPassword
    oldPassword: string;
    newPassword: string;
    confirmNewPassword: string;

    constructor(props)
    {
        super(props);
        this.appService = this.props.appService;
        this.configService = this.props.configService;
        this.strings = this.props.strings;
        this.messageHandler = this.props.messageHandler;
        this.state = { isPasswordExpired: false };
    }
    login()
    {
        this.configService.login(this.username, this.password)
            .then(() => this.goToMainPage())
            .catch(reason =>
            {
                if (!this.configService.getCurrentCompany())
                    this.messageHandler.showErrorOrWarning(true, reason.message);
                else if (!this.configService.passwordExpired)
                    this.messageHandler.showToast(reason.message, true);
                else
                    this.setState({ isPasswordExpired: true });
            });
    }
    changePasword()
    {
        this.configService.changePassword(this.newPassword, this.confirmNewPassword, this.oldPassword)
            .then((res: string) =>
            {
                this.messageHandler.showToast(this.strings.changePswMessageOk);
                this.password = this.newPassword;
                this.login();
            })
            .catch(reason => this.messageHandler.showToast(reason.message, true));
    }
    goToMainPage()
    {
        let resetAction = NavigationActions.reset({
            index: 0,
            actions: [
                NavigationActions.navigate({ routeName: Pages.Main.name })
            ]
        });
        this.props.navigation.dispatch(resetAction);
    }
    openForgotPasswordUrl()
    {
        Linking.openURL(this.configService.getForgotPasswordURL());
    }
    render() 
    {
        let labelStyle = this.strings.isRTL ? { right: 0, left: 'auto' } : { left: 0, right: 'auto' };
        if (this.state.isPasswordExpired)
            return this.renderForgotpassword(labelStyle);
        return this.renderLogin(labelStyle);
    }
    renderLogin(labelStyle)
    {
        return (
            <View style={styles.container}>
                <View style={styles.headerContainer}>
                    <Header
                        centerComponent={<SVG svg={SVG.headerLogo} />}
                        outerContainerStyles={header}
                        innerContainerStyles={center}
                    />
                </View>
                <KeyboardAwareScrollView style={styles.inputContainer} keyboardOpeningTime={0}>
                    <Text h4 style={[styles.appname, center]}>{this.appService.currentApp.title}</Text>
                    <TextField
                        label={this.strings.usrTitle}
                        onChangeText={(text) => this.username = text}
                        highlightColor={'#1f9bd1'}
                        labelStyle={labelStyle}
                        inputStyle={textAlign(this.strings.isRTL)}
                        height={38}
                    />
                    <TextField
                        label={this.strings.pswTitle}
                        onChangeText={(text) => this.password = text}
                        onEndEditing={() => this.login()}
                        highlightColor={'#1f9bd1'}
                        labelStyle={labelStyle}
                        inputStyle={textAlign(this.strings.isRTL)}
                        secureTextEntry={true}
                        height={38}
                    />
                    <Button title={this.strings.loginBtn}
                        onPress={() => this.login()}
                        buttonStyle={[styles.login, center]}
                        backgroundColor="#fff"
                        textStyle={{ color: colors.primaryColor }}
                        fontWeight="bold"
                        activeOpacity={0.7} />
                    <Text style={[styles.forgotPassword, center]} onPress={() => this.openForgotPasswordUrl()}>{this.strings.forgotPassword}</Text>
                </KeyboardAwareScrollView>
            </View>
        );
    }
    renderForgotpassword(labelStyle)
    {
        return (
            <View style={styles.container}>
                <View style={styles.headerContainer}>
                    <Header
                        centerComponent={<SVG svg={SVG.headerLogo} />}
                        outerContainerStyles={header}
                        innerContainerStyles={center}
                    />
                </View>
                <KeyboardAwareScrollView keyboardOpeningTime={0}>
                    <Text h5 style={[styles.changePassTitle, styles.changePassFirstTitle, center]}>{this.strings.changePswHeader1}</Text>
                    <Text h5 style={[styles.changePassTitle, center]}>{this.strings.changePswHeader2}</Text>
                    <View style={styles.inputContainer}>
                        <TextField
                            label={this.strings.oldPsw}
                            onChangeText={(text) => this.oldPassword = text}
                            highlightColor={'#1f9bd1'}
                            labelStyle={labelStyle}
                            inputStyle={textAlign(this.strings.isRTL)}
                            secureTextEntry={true}
                            height={38}
                        />
                        <TextField
                            label={this.strings.newPsw}
                            onChangeText={(text) => this.newPassword = text}
                            highlightColor={'#1f9bd1'}
                            labelStyle={labelStyle}
                            inputStyle={textAlign(this.strings.isRTL)}
                            secureTextEntry={true}
                            height={38}
                        />
                        <TextField
                            label={this.strings.confirmNewPsw}
                            onChangeText={(text) => this.confirmNewPassword = text}
                            highlightColor={'#1f9bd1'}
                            labelStyle={labelStyle}
                            inputStyle={textAlign(this.strings.isRTL)}
                            secureTextEntry={true}
                            height={38}
                        />
                        <Button title={this.strings.changePswBtn}
                            onPress={() => this.changePasword()}
                            buttonStyle={[styles.login, styles.changePass, center]}
                            backgroundColor="#fff"
                            textStyle={{ color: colors.primaryColor }}
                            fontWeight="bold"
                            activeOpacity={0.7} />
                        <Text style={[styles.forgotPassword, center]} onPress={() => this.openForgotPasswordUrl()}>{this.strings.forgotPassword}</Text>
                    </View>
                </KeyboardAwareScrollView>
            </View>
        );
    }
}
/*********** style ************* */
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white'
    },
    appname:
    {
        marginTop: 40,

    },
    headerContainer:
    {
        flex: 0.4,
    },
    inputContainer:
    {
        paddingHorizontal: 45

    },
    login:
    {
        paddingTop: 15,
        paddingRight: 40,
        paddingLeft: 40,
        borderColor: colors.primaryColor,
        borderWidth: 1,
        borderRadius: 2,
        marginTop: 45,
    },
    forgotPassword:
    {
        marginTop: 15,
        marginBottom: 20,
        textDecorationLine: 'underline',
        color: colors.primaryColor
    },
    changePassTitle:
    {
        fontSize: 20
    },
    changePassFirstTitle:
    {
        marginTop: 30,
    },
    changePass:
    {
        marginTop: 35
    }
});