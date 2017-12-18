import React from 'react';
import { View, Image, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import { StackNavigator } from 'react-navigation';
import { LocalStorageUserData } from './modules/index';
import providers from './providers';
import { Pages } from './pages';
import SplashScreen from "rn-splash-screen";
import { Provider } from "mobx-react";
import { navigationTransition } from "./utils/navigation";

export class App extends React.Component<any, any>
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
                <Provider { ...providers }>
                    <this.navigator />
                </Provider>
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
        this.navigator = StackNavigator(Pages,
            {
                initialRouteName: root,
                transitionConfig: navigationTransition(providers.strings.isRTL)
            });
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