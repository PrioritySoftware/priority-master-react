import React from 'react';
import { View, Image, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import { StackNavigator } from 'react-navigation';
import { LocalStorageUserData } from './modules/index';
import providers from './providers';
import { Pages } from './pages';
import SplashScreen from "rn-splash-screen";
import { Provider } from "mobx-react";
import { navigationTransition } from "./utils/navigation";
import { Handlers } from './handlers/index';

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
                    <View style={{ flex: 1 }}>
                        <this.navigator />
                        {...Handlers}
                    </View>
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
            .catch((error) => 
            {
                if (providers.appService && providers.appService.getAppList().length > 0)
                {
                    this.setNavigationStack('SwitchApp')
                }
                else
                {
                    this.setNavigationStack('Start')
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