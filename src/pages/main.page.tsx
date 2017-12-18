import React from 'react';
import
{
    StyleSheet,
    View,
    ScrollView,
} from 'react-native';
import { Strings, Entity } from '../modules';
import { ConfigService } from '../providers/config.service';
import { Header } from 'react-native-elements'
import { SVG } from '../components/svg';
import { center, header, container, colors } from '../styles/common';
import { Card } from '../components/card';
import { MessageHandler } from '../components/message.handler';
import { FormService } from '../providers/form.service';
import { NavigationActions } from 'react-navigation';
import { Pages } from '.';
import { inject } from "mobx-react";
import { ProcService } from '../providers/proc.service';

@inject("formService", "procService", "configService", "messageHandler", "strings")
export class MainPage extends React.Component<any, any>
{
    static navigationOptions = { header: null }

    configService: ConfigService;
    formService: FormService;
    strings: Strings;
    messageHandler: MessageHandler;
    procService: ProcService;

    constructor(props)
    {
        super(props);

        this.configService = this.props.configService;
        this.formService = this.props.formService;
        this.messageHandler = this.props.messageHandler;
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
    render() 
    {
        let cards = [];
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
        return (
            <View style={[container, styles.container]}>
                <View style={styles.headerContainer}>
                    <Header
                        centerComponent={<SVG svg={SVG.headerLogo} height="30" />}
                        outerContainerStyles={header}
                        innerContainerStyles={[center, { marginTop: 10 }]}
                    />
                </View>
                <ScrollView style={{ paddingHorizontal: 10 }}>
                    {cards}
                </ScrollView>
            </View >

        );
    }
    entityChosen(ent: Entity)
    {
        if (ent.type === 'P' || ent.type === 'R')
        {
            // this.messageHandler.showTransLoading();
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
        }
});