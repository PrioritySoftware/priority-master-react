import React from 'react';
import
{
    StyleSheet,
    View,
    ScrollView,
} from 'react-native';
import { PageProps, Strings, Entity } from '../modules';
import { ConfigService } from '../providers/config.service';
import { Header } from 'react-native-elements'
import { SVG } from '../components/svg';
import { center, header, container, colors } from '../styles/common';
import { Card } from '../components/card';

export class MainPage extends React.Component<PageProps, any>
{
    //   messageHandler: MessageHandler;
    static navigationOptions = { header: null }

    configService: ConfigService;
    strings: Strings;

    constructor(props)
    {
        super(props);
        this.configService = this.props.screenProps.configService;
        this.strings = this.props.screenProps.strings;
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
            let borderStye = this.strings.dirByLang === "rtl" ? styles.borderRight : styles.borderLeft;
            let newCard =
                <Card title={ent.title}
                    cardContainerStyle={[styles.cardContainer, marginTopStyle]}
                    cardStyle={borderStye}
                    cardTextStyle={styles.cardText} />
            cards.push(newCard);

        }
        return (
            <View style={[container, styles.container]}>
                <View style={styles.headerContainer}>
                    <Header
                        centerComponent={<SVG svg={SVG.headerLogo} height="30" />}
                        outerContainerStyles={header}
                        innerContainerStyles={center}
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
        //     if (ent.type === 'P' || ent.type === 'R')
        //     {
        //         // this.messageHandler.showTransLoading();
        //         this.procService.startProcedure(ent.name, ent.type, this.configService.configuration.profileConfig)
        //             .then(() =>
        //             {
        //                 this.messageHandler.hideLoading();
        //             })
        //             .catch(() =>
        //             {
        //                 this.messageHandler.hideLoading();
        //             });

        //     }
        //     else if (ent.type == 'F')
        //     {

        //         this.messageHandler.showLoading(this.strings.wait);
        //         this.formService.startFormAndGetRows(ent.name, this.configService.configuration.profileConfig).then(
        //             form =>
        //             {
        //                 this.messageHandler.hideLoading();
        //                 this.nav.push(ListPage,
        //                     {
        //                         form: form
        //                     },
        //                     { animate: true });
        //             },
        //             reason => { this.messageHandler.hideLoading(); });
        //     }
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
        flex: 0.1,
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