import React from 'react';
import
{
    StyleSheet,
    View,
    ScrollView,
    Platform,
    Text,
    Linking
} from 'react-native';
import { Strings, Entity } from '../modules';
import { ConfigService } from '../providers/config.service';
import { Header, Icon, List, ListItem } from 'react-native-elements'
import { SVG } from '../components/svg';
import { center, header, container, colors, margin, iconNames, textAlign } from '../styles/common';
import { Card } from '../components/card';
import { FormService } from '../providers/form.service';
import { AppService } from '../providers/app.service';
import { NavigationActions } from 'react-navigation';
import { Pages } from '.';
import { inject } from "mobx-react";
import { ProcService } from '../providers/proc.service';
import { MessageHandler } from '../handlers/message.handler';
import { Messages } from '../handlers/index';
import { scale } from '../utils/scale';
import Drawer from 'react-native-drawer';

@inject("appService", "formService", "procService", "configService", "strings", "appService")
export class MainPage extends React.Component<any, any>
{
    static navigationOptions = { header: null }
    appService: AppService;
    configService: ConfigService;
    formService: FormService;
    strings: Strings;
    messageHandler: MessageHandler;
    procService: ProcService;
    _drawer;

    constructor(props)
    {
        super(props);

        this.appService = this.props.appService;
        this.configService = this.props.configService;
        this.formService = this.props.formService;
        this.strings = this.props.strings;
        this.procService = this.props.procService;


        this.formService.initFormsConfig(this.configService.entitiesData);
        // When a fatal error occurs, navigate to main page. 
        this.formService.onFatalError = () =>
        {
            let resetAction = NavigationActions.reset({
                index: 0,
                actions: [
                    NavigationActions.navigate({ routeName: Pages.Main.name })
                ]
            });
            this.props.navigation.dispatch(resetAction);
        };
    }
    componentDidMount()
    {
        this.messageHandler = Messages;
    }
    closeControlPanel = () =>
    {
        this._drawer.close()
    };
    openControlPanel = () =>
    {
        this._drawer.open()
    }
    entityChosen(ent: Entity)
    {
        if (ent.type === 'P' || ent.type === 'R')
        {
            this.messageHandler.showLoading();
            this.procService.startProcedure(ent.name, ent.type, this.configService.config.profileConfig)
                .then(() =>
                {
                    this.messageHandler.hideLoading();
                })
                .catch(() =>
                {
                    this.messageHandler.hideLoading();
                });
        }
        else if (ent.type === 'F')
        {
            this.props.navigation.navigate(Pages.List.name,
                {
                    formName: ent.name,
                    formTitle: ent.title
                });
        }
    }
    subMenuClick = (item) =>
    {

        if (item.page)
        {
            if (item.page === Pages.SwitchApp.name)
            {
                this._drawer.close();
                this.appService.clearCurrentApp();
                this.setRoot(Pages.SwitchApp.name);
            }
            else
            {
                this._drawer.close();
                this.props.navigation.navigate(item.page);
            }
        }
        else if (item.url)
        {
            Linking.canOpenURL(item.url).then(supported =>
            {
                if (supported)
                {
                    Linking.openURL(item.url);
                } else
                {
                    console.log("Don't know how to open URI: " + item.url);
                }
            })
        }
        else if (item.action)
        {
            if (item.action === this.strings.logoutAction)
                this.logout();
        }

        else
        {
            this._drawer.close()
        }
    }
    setRoot(rootName: string)
    {
        let resetAction = NavigationActions.reset({
            index: 0,
            actions: [
                NavigationActions.navigate({ routeName: rootName })
            ]
        });
        this.props.navigation.dispatch(resetAction);
    }
    getCurrentCompany()
    {
        let text = this.configService.getCurrentCompany()
        if (this.configService.getCurrentCompanyProfile() && this.configService.getCurrentCompanyProfile().length > 0)
        {
            text += "(" + this.configService.getCurrentCompanyProfile() + ")"
        }
        return (text)
    }
    logout = () =>
    {
        this.configService.clearLogin();
        this.setRoot(Pages.Login.name)
    }
    render() 
    {

        let cards = [];

        let leftComp = this.props.specialComponent;
        let rightComp = this.props.specialComponent;
        let companyOption = null;

        for (let ent of this.configService.entitiesData)
        {
            // Shows only procs that are not direct activations and forms that are parent forms 
            if (ent.fatname !== ent.name && ent.fatname !== undefined)
                continue;
            let marginTopStyle = cards.length ? {} : { marginTop: 9 };
            let borderStye = this.strings.isRTL ? styles.borderRight : styles.borderLeft;
            let newCard =
                <Card key={ent.name}
                    title={ent.title}
                    cardContainerStyle={[styles.cardContainer, marginTopStyle]}
                    cardStyle={borderStye}
                    cardTextStyle={styles.cardText}
                    onPress={() => this.entityChosen(ent)} />
            cards.push(newCard);

        }

        if (this.strings.isRTL)
            rightComp = this.renderIcon(iconNames.mainMenu);
        else
            leftComp = this.renderIcon(iconNames.mainMenu);

        if (this.configService.supportCompanySelection)
        {
            companyOption =
                {
                    title: this.strings.switchCompany,
                    icon: 'repeat',
                    page: Pages.SwitchCompany.name
                };
        }
        const list = [
            {
                title: this.strings.switchApp,
                icon: 'apps',
                page: Pages.SwitchApp.name
            },
            companyOption,
            {
                title: this.strings.terms,
                icon: 'accessibility',
                url: this.strings.termsURL

            },
            {
                title: this.strings.policy,
                icon: 'pan-tool',
                url: this.strings.policyURL
            },
            {
                title: this.strings.logout,
                icon: 'exit-to-app',
                action: this.strings.logoutAction
            },
        ]
        let drawerContent = (
            <View style={styles.drawerContent}>
                <View style={styles.menuTitle}>
                    <Text style={[styles.appNameTitle, textAlign(this.strings.isRTL)]}  ellipsizeMode='tail' numberOfLines={1}>{this.appService.currentApp.title}</Text>
                    <Text style={[styles.companyNameTitle, textAlign(this.strings.isRTL)]} ellipsizeMode='tail' numberOfLines={1}> {this.getCurrentCompany()} </Text>
                    <Text style={[styles.userNameTitle, textAlign(this.strings.isRTL)]} ellipsizeMode='tail' numberOfLines={1}> {this.appService.getUserName()} </Text>
                </View>
                <View style={styles.drawerContentMenu}>
                    <ScrollView >
                        <List style={styles.drawerContentMenuList}>
                            {
                                list.map((item, i) => (
                                    item && <ListItem
                                        key={i}
                                        title={item.title}
                                        leftIcon={this.strings.isRTL ? { display: 'none', color: 'transparent' } : { name: item.icon, color: colors.blue }}
                                        rightIcon={this.strings.isRTL ? { name: item.icon, color: colors.blue } : { display: 'none', color: 'transparent' }}
                                        onPress={() => { this.subMenuClick(item) }}
                                        titleStyle={[textAlign(this.strings.isRTL), styles.menuItem]}
                                    />
                                ))
                            }
                        </List>
                    </ScrollView>
                </View>
            </View>
        );
        return (
            <Drawer
                ref={(ref) => this._drawer = ref}
                type="displace"
                content={drawerContent}
                tapToClose={true}
                openDrawerOffset={0.2} // 20% gap on the right side of drawer
                panCloseMask={0.2}
                closedDrawerOffset={-3}
                tweenHandler={Drawer.tweenPresets.parallax}
                panOpenMask={0.6}
                side={this.strings.isRTL ? "right" : "left"}
            >
                <View style={[container, styles.container]}>
                    <View style={styles.headerContainer}>
                        <Header
                            centerComponent={<SVG svg={SVG.headerLogo} height="30" />}
                            outerContainerStyles={[header, { flexDirection: 'row-reverse' }]}
                            innerContainerStyles={[center, { marginTop: 10 }]}
                            rightComponent={rightComp}
                            leftComponent={leftComp}
                        />
                    </View>
                    <ScrollView style={{ paddingHorizontal: 10 }}>
                        {cards}
                    </ScrollView>
                </View >
            </Drawer>

        );
    }

    renderIcon(iconName: string)
    {
        return (<Icon
            type='ionicon'
            name={iconName}
            onPress={() => { this._drawer.open() }}
            color='white'
            underlayColor='transparent'
            size={scale(25)}
            containerStyle={[styles.mainMenuButton, margin(this.strings.isRTL, scale(-20))]} />
        );
    }

}

/*********** style ************* */
const styles = StyleSheet.create({
    container:
        {
            backgroundColor: colors.lightGray
        },
    headerContainer:
        {
            flex: 0.14,
        },
    cardContainer:
        {
            marginTop: 0,
            marginBottom: 9,
            borderRadius: 2,
            borderWidth: 1,
            backgroundColor: 'white',
            borderColor: colors.gray

        },
    cardText:
        {
            color: 'black',
            fontFamily: 'Arial'
        },
    borderRight:
        {
            borderRightWidth: 4,
            borderColor: colors.darkBlue
        },
    borderLeft:
        {
            borderLeftWidth: 4,
            borderColor: colors.darkBlue
        },
    mainMenuButton:
        {
            paddingVertical: scale(30),
            paddingHorizontal: scale(25),
            paddingTop: scale(25),
            ...Platform.select({
                ios:
                    {
                        paddingTop: scale(27)
                    }
            })

        },
    drawerContent:
        {
            flex: 1,
            backgroundColor: colors.darkGray
        },
    menuTitle:
        {
            flex: 0.2,
            backgroundColor: colors.darkGray,
            paddingHorizontal: scale(15),
            justifyContent:'center'
        },
    appNameTitle:
        {
            color: "#fff",
            fontSize: 18,
            ...Platform.select({
                ios:
                    {
                        paddingTop: scale(18)
                    }
            })
        },
    userNameTitle:
        {
            color: "#fff",
            marginTop:scale(4),
        },
    companyNameTitle:
        {
            color: "#fff",
           marginTop:scale(4),
        },

    drawerContentMenu:
        {
            flex: 0.8,
            backgroundColor: '#ffffff'
        },
    drawerContentMenuList:
        {
            padding: 0
        },

    menuItem:
        {
            paddingLeft: 3,
            paddingVertical: scale(10)
        },

});