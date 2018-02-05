import React,{ Component } from 'react';
import
{
    StyleSheet,
    View,
    ListView,
    ScrollView,
} from 'react-native';
import { Strings, ServerResponse } from '../modules';
import { SVG } from '../components/svg';
import { Card } from '../components/card';
import {  container, colors, body } from '../styles/common';
import { inject } from 'mobx-react';
import { AppService } from '../providers/app.service'
import { ConfigService } from '../providers/config.service';
import { Pages } from '.';
import { Button } from 'react-native-elements';
import { Messages } from '../handlers/index';
import { MessageHandler } from '../handlers/message.handler';
import { SwipeListView } from 'react-native-swipe-list-view';
import { scale, verticalScale } from '../utils/scale';
import { NavigationActions } from 'react-navigation';
import { HeaderComp } from '../components/header';

@inject("appService", "configService", "strings")
export class SwitchApp extends Component<any, any>
{
    static navigationOptions = { header: null };

    appService: AppService;
    strings: Strings;
    configService: ConfigService;
    messageHandler: MessageHandler;

    appsList = [];
    ds;

    constructor(props)
    {
        super(props);
        this.state = { flipper: 1 };

        this.appService = this.props.appService;
        this.strings = this.props.strings;
        this.configService = this.props.configService;

        this.appsList = this.appService.getAppList();

        this.ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
    }

    componentDidMount()
    {
        this.messageHandler = Messages;
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
    selectApp(app)
    {
        this.messageHandler.showLoading();
        if (app.jsonUrl.length > 0)
        {
            this.configService.initApp(app.jsonUrl).then(
                () =>
                {
                    this.configService.loginWithLocalData()
                        .then(() =>
                        {
                            this.messageHandler.hideLoading();
                            this.setRoot(Pages.Main.name);
                        })
                        .catch(error =>
                        {
                            this.messageHandler.hideLoading();
                            this.setRoot(Pages.Login.name);
                        });
                },
                (reason: ServerResponse) =>
                {
                    this.messageHandler.hideLoading();
                    this.messageHandler.showErrorOrWarning(true, reason.message);
                })
        }
        else
        {
            this.messageHandler.hideLoading();
            this.setRoot(Pages.Main.name);
        }
    }
    newApp()
    {
        if (this.strings.isRTL)
        {
            this.strings.setFirstRtlConstants();
        }
        else
        {
            this.strings.setFirstLtrConstants();
        }
        this.props.navigation.navigate(Pages.Start.name);
    }
    deleteApp = (app, secId, rowId, rowMap) =>
    {
        // Grab reference to this row
        const rowRef = rowMap[`${secId}${rowId}`];
        rowRef.closeRow();
        this.messageHandler.showErrorOrWarning(false, this.strings.isDelete, () => { this.delete(app, rowId, rowMap) }, () => { })

    }
    delete = (app, rowId, rowMap) =>
    {
        this.appService.deleteApp(app)
        this.setState({ flipper: !this.state.flipper })
    }
    render() 
    {
        return (
            <View style={[container]}>
                <HeaderComp centerComp={<SVG svg={SVG.headerLogo} height="30" />} />
                <ScrollView style={body}>
                    {this.renderSwipeListView()}
                    <Card key={"add app"}
                        title={this.strings.newApp}
                        cardContainerStyle={[styles.borderPoints, { margin: 9 }]}
                        cardTextStyle={styles.cardText}
                        onPress={() => this.newApp()} />
                </ScrollView>
            </View >
        )
    }
    renderSwipeListView = () =>
    {
        let isRTL = this.strings.isRTL
        if (this.appsList.length === 0)
        {
            return (null)
        }
        else
        {
            return (
                <View>
                    <SwipeListView
                        swipeRowStyle={{ flex: 0 }}
                        contentContainerStyle={{ padding: scale(9), paddingBottom: scale(10) }}
                        dataSource={this.ds.cloneWithRows(this.appsList)}
                        renderRow={this.renderCard}
                        renderHiddenRow={this.renderHiddenRow}
                        leftOpenValue={scale(85)}
                        rightOpenValue={scale(-85)}
                        disableRightSwipe={!isRTL}
                        disableLeftSwipe={isRTL}
                        closeOnRowPress={true}
                    />
                </View>
            )
        }
    }
    renderCard = (ent, name) =>
    {
        let isRTL = this.strings.isRTL;
        let borderStye = isRTL ? styles.borderRight : styles.borderLeft;
        return (
            <Card key={name}
                title={ent.title}
                cardContainerStyle={[styles.cardContainer, { marginTop: 9 }]}
                cardTextStyle={styles.cardText}
                cardStyle={borderStye}
                onPress={() => this.selectApp(ent)} />
        )
    }
    renderHiddenRow = (ent, secId, rowId, rowMap) =>
    {
        let isRTL = this.strings.isRTL;
        return (
            <View style={[styles.rowBack, isRTL ? styles.rtlFlex : styles.ltrFlex]} >

                <Button
                    title={this.strings.deleteBtnText}
                    onPress={() => { this.deleteApp(ent, secId, rowId, rowMap) }}
                    buttonStyle={styles.hiddenBtn}
                    backgroundColor={colors.red}
                    color='white'
                    icon={{ name: 'delete', style: styles.hiddenIcon }}
                />
            </View>
        );
    }

}

/*********** style ************* */
const styles = StyleSheet.create({
    container:
        {
            backgroundColor: colors.lightGray
        },
    borderRight:
        {
            borderRightWidth: 4,
            borderColor: colors.darkBlue,

        },
    borderLeft:
        {
            borderLeftWidth: 4,
            borderColor: colors.darkBlue
        },
    cardContainer:
        {
            marginTop: 0,
            marginBottom: 0,
            borderRadius: 2,
            borderWidth: 1,
            backgroundColor: 'white',
            borderColor: colors.gray

        },
    borderPoints: {
        borderStyle: 'dashed',
        marginTop: 0,
        marginBottom: 9,
        borderRadius: 2,
        borderWidth: 1,
        backgroundColor: 'transparent',
        borderColor: colors.dark,
    },
    cardText:
        {
            color: 'black',
            fontFamily: 'Arial'
        },
    // hidden buttons
    rowBack:
        {

            flexDirection: 'column',
            top: verticalScale(12),
            paddingBottom: verticalScale(13.4)
        },
    rtlFlex:
        {
            alignItems: 'flex-start'
        },
    ltrFlex:
        {
            alignItems: 'flex-end'
        },
    hiddenBtn:
        {
            flexDirection: 'column',
            flex: 1,
            paddingHorizontal: 15,
            minWidth: scale(80)
        },
    hiddenIcon:
        {
            marginRight: 0
        },
})