import React from 'react';
import
{
    StyleSheet,
    ScrollView,
    View,
    Linking
} from 'react-native';
import { PageProps, Strings } from '../modules';
import { SVG } from '../components/svg';
import { Header, Text } from 'react-native-elements';
import {  AppService } from '../providers/app.service';
import TextField from 'react-native-md-textinput';
import { colors, center,header } from '../styles/common';
import { NavigationActions } from 'react-navigation';
import { MessageHandler } from '../components/message.handler';
import { ConfigService } from '../providers/config.service';

export class LoginPage extends React.Component<PageProps, any>
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
        this.appService = this.props.screenProps.appService;
        this.configService = this.props.screenProps.configService;
        this.strings = this.props.screenProps.strings;
        this.messageHandler = this.props.screenProps.messageHandler;
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
                    this.messageHandler.showToast(reason.message, 3000);
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
            .catch(reason => this.messageHandler.showToast(reason.message, 3000));
    }
    goToMainPage()
    {
        let resetAction = NavigationActions.reset({
            index: 0,
            actions: [
                NavigationActions.navigate({ routeName: 'Main' })
            ]
        });
        this.props.navigation.dispatch(resetAction);
    }
    openForgotPasswordUrl()
    {
        Linking.openURL(this.configService.getForgotPasswordURL());
    }
    renderLogin()
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
                <ScrollView style={styles.inputContainer}>
                    <Text h4 style={[styles.appname, center]}>{this.appService.currentApp.title}</Text>
                    <TextField
                        label={this.strings.usrTitle}
                        onChangeText={(text) => this.username = text}
                        highlightColor={'#1f9bd1'}
                        labelStyle={this.strings.dirByLang === 'rtl' ? { right: 0 } : { left: 0 }}
                        inputStyle={{ textAlign: this.strings.sideByLang }}
                        height={38}
                    />
                    <TextField
                        label={this.strings.pswTitle}
                        onChangeText={(text) => this.password = text}
                        highlightColor={'#1f9bd1'}
                        labelStyle={this.strings.dirByLang === 'rtl' ? { right: 0 } : { left: 0 }}
                        inputStyle={{ textAlign: this.strings.sideByLang }}
                        secureTextEntry={true}
                        height={38}
                    />
                    <Text style={[styles.login, center]} onPress={() => this.login()}>{this.strings.loginBtn}</Text>
                    <Text style={[styles.forgotPassword, center]} onPress={() => this.openForgotPasswordUrl()}>{this.strings.forgotPassword}</Text>
                </ScrollView>
            </View>
        );
    }
    renderForgotpassword()
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

                <ScrollView >
                    <Text h5 style={[styles.changePassTitle, styles.changePassFirstTitle, center]}>{this.strings.changePswHeader1}</Text>
                    <Text h5 style={[styles.changePassTitle, center]}>{this.strings.changePswHeader2}</Text>
                    <View style={styles.inputContainer}>
                        <TextField
                            label={this.strings.oldPsw}
                            onChangeText={(text) => this.oldPassword = text}
                            highlightColor={'#1f9bd1'}
                            labelStyle={this.strings.dirByLang === 'rtl' ? { right: 0 } : { left: 0 }}
                            inputStyle={{ textAlign: this.strings.sideByLang }}
                            height={38}
                        />
                        <TextField
                            label={this.strings.newPsw}
                            onChangeText={(text) => this.newPassword = text}
                            highlightColor={'#1f9bd1'}
                            labelStyle={this.strings.dirByLang === 'rtl' ? { right: 0 } : { left: 0 }}
                            inputStyle={{ textAlign: this.strings.sideByLang }}
                            secureTextEntry={true}
                            height={38}
                        />
                        <TextField
                            label={this.strings.confirmNewPsw}
                            onChangeText={(text) => this.confirmNewPassword = text}
                            highlightColor={'#1f9bd1'}
                            labelStyle={this.strings.dirByLang === 'rtl' ? { right: 0 } : { left: 0 }}
                            inputStyle={{ textAlign: this.strings.sideByLang }}
                            height={38}
                        />
                        <Text style={[styles.login, styles.changePass, center]} onPress={() => this.changePasword()}>{this.strings.changePswBtn}</Text>
                        <Text style={[styles.forgotPassword, center]} onPress={() => this.openForgotPasswordUrl()}>{this.strings.forgotPassword}</Text>
                    </View>
                </ScrollView>
            </View>
        );
    }
    render() 
    {
        if (this.state.isPasswordExpired)
            return this.renderForgotpassword();
        return this.renderLogin();
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
        marginRight: 45,
        marginLeft: 45,

    },
    login:
    {
        padding: 10,
        paddingRight: 40,
        paddingLeft: 40,
        borderColor: colors.primaryColor,
        borderWidth: 1,
        borderRadius: 2,
        marginTop: 45,
        fontWeight: 'bold',
        color: colors.primaryColor
    },
    forgotPassword:
    {
        marginTop: 15,
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