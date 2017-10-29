import React from 'react';
import { View, Image, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import { StartPage, LoginPage, MainPage } from './pages';
import { StackNavigator } from 'react-navigation';
import { PageProps, LocalStorageUserData } from './modules/index';
import { QRCodeScanner } from './components/qrscanner';
import providers from './providers';
import SplashScreen from "rn-splash-screen";

// https://stackoverflow.com/questions/45670065/mobx-react-native-way-to-inject-stores
export class App extends React.Component<PageProps, any>
{
    navigator;
    constructor(props)
    {
        super(props);
        this.state = { isFinishedloading: false };
        this.init();
    }

    public render()
    {
        if (providers.strings.platform === 'ios')
            SplashScreen.hide();
        if (this.state.isFinishedloading)
        {
            return (
                <this.navigator screenProps={{ ...providers }} />
            );
        }
        return (
            <View style={{ flex: 1 }}>
                <Image style={styles.image} source={require('../assets/img/splash.png')} >
                    <ActivityIndicator style={styles.indicator} color="#fff"></ActivityIndicator>
                </Image>
            </View>
        );

    }
    setNavigationStack(root: string)
    {
        this.navigator = StackNavigator({
            Start: { screen: StartPage },
            QRCodeScanner: { screen: QRCodeScanner },
            Login: { screen: LoginPage },
            Main: { screen: MainPage }
        },
            { initialRouteName: root });
        this.setState({ isFinishedloading: true });

    }
    init(): Promise<any>
    {
        return providers.configService.loadConfigData()
            .then((userData: LocalStorageUserData) =>
            {
                providers.configService.login(userData.userName, userData.password)
                    .then(() => this.setNavigationStack('Main'))
                    .catch(error => this.setNavigationStack('Login'));
            })
            .catch(error => this.setNavigationStack('Start'));

        // this.appService.jsonUrl().then(
        //     url =>
        //     {
        //         this.appService.initApp(url).then(
        //             //init app also logs in when username and password exist in localstorage
        //             (isLoggedIn) =>
        //             {
        //                 if (isLoggedIn)
        //                 {
        //                     // this.nav.setRoot(MainPage,{},{animation: false}).then(() =>
        //                     // {
        //                     //   this.splashScreen.hide();
        //                     // });
        //                     // Using the setRoot function caused bugs with change detection in details page
        //                     // We need to check if they still appear in later version of ionic
        //                     this.rootPage = MainPage;
        //                 }
        //                 else
        //                 {
        //                     // this.nav.setRoot(LoginPage,{},{animation: false}).then(() =>
        //                     // {
        //                     //   this.splashScreen.hide();
        //                     // });
        //                     this.rootPage = LoginPage;
        //                 }
        //                 this.messageHandler.hideLoading();
        //                 this.splashScreen.hide();
        //             },
        //             (reason: ServerResponse) =>
        //             {
        //                 //show start page to re-scan barcode if the json file is not valid.
        //                 // this.nav.setRoot(StartPage,{},{animation: false}).then(() =>
        //                 // {
        //                 //   this.splashScreen.hide();
        //                 //   this.messageHandler.showErrorOrWarning(true, reason + this.strings.scanNewConfigurationFile);
        //                 // });
        //                 if (this.appService.userData.applist.length > 1)
        //                 {
        //                     this.rootPage = AppsPage;
        //                     this.messageHandler.hideLoading();
        //                     this.splashScreen.hide();
        //                 }
        //                 else
        //                 {
        //                     this.rootPage = StartPage;
        //                     this.messageHandler.hideLoading();
        //                     this.splashScreen.hide();
        //                     this.messageHandler.showErrorOrWarning(true, reason.message + this.strings.scanNewConfigurationFile);
        //                 }
        //             });
        //     },
        //     // show start page to scan barcode if url not found
        //     // or apps page, if user has already scanned apps
        //     (reason: ServerResponse) =>
        //     {
        //         if (this.appService.userData.applist.length)
        //         {
        //             this.rootPage = AppsPage;
        //         }
        //         else
        //         {
        //             this.rootPage = StartPage;
        //         }
        //         this.messageHandler.hideLoading();
        //         this.splashScreen.hide();
        //         // this.nav.setRoot(StartPage,{},{animation: false}).then(() =>
        //         // {
        //         //   this.splashScreen.hide();
        //         // });
        //     });
    }
}

/*********** style ************* */
let ScreenWidth = Dimensions.get("window").width;
let ScreenHeight = Dimensions.get("window").height;
const styles = StyleSheet.create({
    image:
    {
        height: ScreenHeight,
        width: ScreenWidth,
        justifyContent: 'center'
    },
    indicator:
    {
        marginTop: 100
    }
});