import React,{ Component } from 'react';
import
{
    StyleSheet,
    View,
    ScrollView,
    ListView,
    Text
} from 'react-native';
import { Strings, Company } from '../modules';
import { container, colors, textAlign } from '../styles/common';
import { HeaderComp } from '../components/header';
import { inject } from 'mobx-react';
import { AppService } from '../providers/app.service'
import { ConfigService } from '../providers/config.service';
import { NavigationActions } from 'react-navigation';
import { Messages } from '../handlers/index';
import { MessageHandler } from '../handlers/message.handler';
import { scale } from '../utils/scale';

@inject("appService", "configService", "strings")
export class SwitchCompany extends Component<any, any>
{
    static navigationOptions = { header: null };

    appService: AppService;
    strings: Strings;
    configService: ConfigService;
    messageHandler: MessageHandler;
    companiesList;
    companiesProfileList;

    ds;
    ds1;

    constructor(props)
    {
        super(props);
        this.state = { flipper: 1, companiesDataSource: [], profileDataSource: [], showProfile: 0 };
        this.appService = this.props.appService;
        this.strings = this.props.strings;
        this.configService = this.props.configService;

        this.getProfiles()

        this.ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
        this.ds1 = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });

    }

    componentDidMount()
    {
        this.messageHandler = Messages;
    }

    goBack = () =>
    {
        this.props.navigation.goBack();
    }

    getProfiles = () =>
    {
        this.configService.getCompanies().then(
            (companies) =>
            {
                this.setState({ companiesDataSource: companies })
                this.companiesList = companies;
                this.configService.getCompanyProfile(companies).then(
                    (CompanyProfile) =>
                    {

                        this.companiesProfileList = CompanyProfile
                        this.setState({ profileDataSource: CompanyProfile })
                    },
                    (reason) =>
                    {
                        this.messageHandler.showToast(reason.message)
                        this.goBack()
                    })
            },
            (reason) =>
            {
                this.messageHandler.showToast(reason.message)
                this.goBack()
            }
        )
    }

    selectCompany(company: Company[])
    {
        this.messageHandler.showLoading()
        this.configService.setCompany(company).then(
            () =>
            {
                this.configService.getCompanyProfile({ Company: [company] }).then(
                    (companyProfile) =>
                    {
                        this.messageHandler.hideLoading()
                        if (companyProfile && companyProfile.length > 1)
                        {
                            this.companiesProfileList = companyProfile
                            this.setState({ profileDataSource: companyProfile, showProfile: 1 })
                        }
                        else
                        {
                            this.setRoot('Main');
                        }
                    },
                    (reason) =>
                    {
                        this.messageHandler.hideLoading()
                        this.messageHandler.showToast(reason.message)
                    })
            },
            (ree) =>
            {
                this.messageHandler.hideLoading()
                this.messageHandler.showToast(ree.message)
            });

    }
    selectCompanyProfile(Profile)
    {
        this.messageHandler.showLoading()
        this.configService.setCompanyProfile(Profile).then(
            () =>
            {
                this.setState({ showProfile: 0 })
                this.messageHandler.hideLoading()
                this.setRoot('Main');
            },
            (ree) =>
            {
                this.messageHandler.hideLoading()
                this.messageHandler.showToast(ree.message)
            });

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

    render() 
    {
        return (
            <View style={container}>
                <HeaderComp title={this.strings.switchCompany} goBack={() => this.goBack()} />
                <ScrollView style={{ backgroundColor: "#fff" }}>
                    {this.renderCompaniesList()}
                    {this.renderCompaniesProfileList()}

                </ScrollView>

            </View >
        )
    }

    renderCompaniesList()
    {
        let isRTL = this.strings.isRTL;
        let borderStye = isRTL ? styles.onPaddingLeft : styles.onPaddingRight
        if (this.companiesList && !this.state.showProfile)
        {
            return (
                <ListView
                    style={[styles.listView, borderStye]}
                    dataSource={this.ds.cloneWithRows(this.companiesList.Company)}
                    renderRow={(rowData) => (
                        <Text
                            style={[styles.listViewItem, textAlign(this.strings.isRTL)]}
                            onPress={() => this.selectCompany(rowData)}
                        >
                            {rowData.title}
                        </Text>
                    )}
                />
            )
        }
        else
        {
            return (null)
        }
    }
    renderCompaniesProfileList()
    {
        let isRTL = this.strings.isRTL;
        let borderStye = isRTL ? styles.onPaddingLeft : styles.onPaddingRight
        if (this.companiesProfileList && this.state.showProfile)
        {
            return (
                <ListView
                    style={[styles.listView, borderStye]}
                    dataSource={this.ds1.cloneWithRows(this.companiesProfileList)}
                    renderRow={(rowData) => <Text
                        style={[styles.listViewItem, textAlign(this.strings.isRTL)]}
                        onPress={() => this.selectCompanyProfile(rowData)}
                    >
                        {rowData.profilename}
                    </Text>
                    }
                />
            )
        }
        else
        {
            return (null)
        }
    }
}

/*********** style ************* */
const styles = StyleSheet.create({
    container:
        {
            backgroundColor: 'white',
        },
    headerContainer:
        {
            flex: 0.14,
        },
    listViewItem: 
    {
        paddingVertical: scale(10),
        borderBottomColor: colors.middleGrayLight,
        borderBottomWidth: scale(1),
        backgroundColor: "transparent"
    },
    listView: 
    {
        paddingHorizontal: scale(10),
    },
    onPaddingRight: 
    {
        paddingRight: 0
    },
    onPaddingLeft: 
    {
        paddingLeft: 0
    }
})