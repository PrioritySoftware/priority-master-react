import React, { Component } from 'react';
import { View, Image, StyleSheet, Dimensions, ActivityIndicator, Animated, Easing } from 'react-native';
import { StackNavigator } from 'react-navigation';
import { LocalStorageUserData } from './modules/index';
import providers from './providers';
import { Pages } from './pages';
import SplashScreen from "rn-splash-screen";
import { Provider } from "mobx-react";
import { navigationTransition } from "./utils/navigation";
import { Handlers } from './handlers/index';
import { MenuProvider } from 'react-native-popup-menu';

export class App extends Component<any, any>
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
                    <MenuProvider>
                        <View style={{ flex: 1 }}>
                            <this.navigator />
                            {...Handlers}
                        </View>
                    </MenuProvider>
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
                transitionConfig: navigationTransition(providers.strings.isRTL),
                cardStyle: { opacity: 1 },
            });
        this.setState({ isFinishedloading: true });

    }
    init(): Promise<any>
    {
        return providers.configService.loadConfigData()
            .then(() =>
            {
                providers.configService.loginWithLocalData()
                    .then(() => this.setNavigationStack(Pages.Main.name))
                    .catch(error => this.setNavigationStack(Pages.Login.name));
            })
            .catch(reason => 
            {
                if (providers.appService && providers.appService.getAppList().length > 0)
                {
                    this.setNavigationStack(Pages.SwitchApp.name)
                }
                else
                {
                    this.setNavigationStack(Pages.Start.name)
                }
            });

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