import React from 'react';
import
{
    StyleSheet,
    View,
    ActivityIndicator,
    ListView,
    Text,
    Image
} from 'react-native';
import { PageProps, Strings, Form } from '../modules';
import { ConfigService } from '../providers/config.service';
import { center, header, colors } from '../styles/common';
import { FormService } from '../providers/form.service';
import { SwipeListView } from 'react-native-swipe-list-view';
import { Card } from '../components/card';
import { scale, verticalScale } from '../utils/scale';
import { Header, Button } from 'react-native-elements';
import InfiniteScrollView from 'react-native-infinite-scroll-view';
import { MessageHandler } from '../components/message.handler';
import Spinner from 'react-native-loading-spinner-overlay';
const SpinnerIndicator = require('react-native-spinkit');

export class ListPage extends React.Component<PageProps, any>
{
    static navigationOptions = { header: null };

    messageHandler: MessageHandler;
    configService: ConfigService;
    formService: FormService;
    strings: Strings;
    form: Form;
    ds;

    constructor(props)
    {
        super(props);
        this.configService = this.props.screenProps.configService;
        this.formService = this.props.screenProps.formService;
        this.strings = this.props.screenProps.strings;
        this.messageHandler = this.props.screenProps.messageHandler;

        this.form = this.props.navigation.state.params.form;
        this.state =
            {
                rows: null,
                canLoadMoreContent: true,
                isLoading: false,
                isDeletingRow: false
            };

        this.formService.startFormAndGetRows(this.form.name, this.configService.config.profileConfig).then(
            form =>
            {
                this.form = form;
                this.setState({ rows: form.rows });

            },
            reason => { });
        this.ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
    }
    loadMoreData = () =>
    {
        this.setState({ isLoading: true });
        let recordsCount = Object.keys(this.state.rows).length;
        this.formService.getRows(this.form, recordsCount + 1, true)
            .then(rows =>
            {
                // enables infinite scroll when there are no more rows
                if (Object.keys(rows).length < 100)
                {
                    this.state.canLoadMoreContent = false;
                }
                this.setState({ rows: this.formService.getLocalRows(this.form), isLoading: false });
            })
            .catch(() => { });
    }
    goBack()
    {
        this.props.navigation.goBack()
        this.formService.endForm(this.form);
    }
    editRow(row)
    {

    }
    deleteRow(rowInd)
    {
        let delFunc = () =>
        {
            this.setState({ isDeletingRow: true });
            this.formService.deleteListRow(this.form, rowInd)
                .then(() => 
                {
                    // updating state with new rows after delete.
                    this.setState({
                        rows: this.formService.getLocalRows(this.form),
                        isDeletingRow: false
                    });
                })
                .catch(() => this.setState({ isDeletingRow: false }));
        }
        this.messageHandler.showErrorOrWarning(false, this.strings.isDelete, delFunc);
    }
    /********* rendering functions *********/
    render()
    {
        return (
            <View style={{ flex: 1 }}>
                {this.rennderHeader()}
                {this.state.rows ? this.renderList() : this.renderActivityIndicator(this.strings.scrollLoadingText)}
            </View>
        );
    }
    rennderHeader()
    {
        let iconName;
        let leftComp = {};
        let rightComp = {};
        if (this.strings.dirByLang === 'rtl')
        {
            iconName = this.strings.platform === 'ios' ? 'ios-arrow-forward' : 'md-arrow-forward';
            rightComp = this.renderBackIcon(iconName);
        }
        else
        {
            iconName = this.strings.platform === 'ios' ? 'ios-arrow-back' : 'md-arrow-back';
            leftComp = this.renderBackIcon(iconName);
        }
        return (
            <View style={styles.headerContainer}>
                <Header
                    centerComponent={{ text: this.form.title, style: styles.headerTitleStyle }}
                    rightComponent={rightComp}
                    leftComponent={leftComp}
                    outerContainerStyles={[header, { flexDirection: 'row-reverse' }]}
                    innerContainerStyles={[center, this.strings.platform === 'ios' ? { marginTop: 10 } : {}]}
                />
            </View>
        );
    }
    renderBackIcon(iconName: string)
    {
        let style = this.strings.platform === 'ios' ? { paddingTop: 5 } : {};
        return ({
            type: 'ionicon',
            icon: iconName,
            onPress: () => { this.goBack() },
            color: 'white',
            underlayColor: 'transparent',
            style: style
        });
    }

    /**
     * 
     * Loading Indicator. Shown while rows are loaded.
     * @returns 
     * @memberof ListPage
     */
    renderActivityIndicator(text: string)
    {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>{text}</Text>
                <ActivityIndicator style={{ marginTop: 10 }} ></ActivityIndicator>
            </View>
        );
    }
    renderList()
    {
        let isRTL = this.strings.dirByLang === "rtl";
        let padding = this.state.isLoading ? 70 : 10;

        // in case there are no rows
        if (Object.keys(this.state.rows).length === 0)
            return this.renderEmptyState();

        return (
            <View style={styles.listContainer}>
                <SwipeListView
                    contentContainerStyle={{ paddingBottom: padding }}
                    renderScrollComponent={props => <InfiniteScrollView {...props} />}
                    canLoadMore={this.state.canLoadMoreContent}
                    onLoadMoreAsync={this.loadMoreData}
                    dataSource={this.ds.cloneWithRows(this.state.rows)}
                    renderRow={this.renderRow}
                    renderHiddenRow={this.renderHiddenRow}
                    distanceToLoadMore={20}
                    leftOpenValue={scale(80)}
                    rightOpenValue={scale(-80)}
                    disableRightSwipe={!isRTL}
                    disableLeftSwipe={isRTL}
                />
                {/* Loading indicator for loading more rows */}
                <View style={[styles.rowsIndicator, { display: this.state.isLoading ? 'flex' : 'none' }]}>
                    <Text style={{ color: colors.darkGray }}>{this.strings.loadingSearchResults}</Text>
                    <SpinnerIndicator style={{ marginBottom: 5 }} type='ThreeBounce' color={colors.darkGray}></SpinnerIndicator>
                </View>
                {/* Loading indicator for row deletion  */}
                {<Spinner visible={this.state.isDeletingRow} color={colors.primaryColor} overlayColor={colors.overlay} size="small"></Spinner>}
            </View>
        );
    }
    renderEmptyState()
    {
        let scaleX = this.strings.dirByLang === "rtl" ? -1 : 0;
        let flex = this.strings.dirByLang === "rtl" ? 'flex-start' : 'flex-end';
        return (
            <View style={styles.emptyState}>
                <Text style={{ fontSize: scale(20) }}>{this.strings.noRecords}</Text>
                <Text style={{ fontSize: scale(16) }}>{this.strings.clickAddButton}</Text>
                <Image source={require('../../assets/img/EmptyStateArrow.png')}
                    style={[styles.emptyStateArrow, { alignSelf: flex, transform: [{ scaleX: scaleX }] }]} />
            </View>
        );
    }

    renderRow = (row, secId, rowId, rowsMap) =>
    {
        let form: Form = this.formService.getForm(this.form.name);
        let formName = form.name;
        let formColumns = this.formService.formsConfig[formName].listColumnsOptions;

        let columns = [];
        for (let colName in formColumns)
        {
            if (formColumns.hasOwnProperty(colName) && row[colName] !== undefined && row[colName] !== '')
            {
                let colTitle = form.columns[colName].title;
                let titleStyle = this.strings.dirByLang === "rtl" ? { right: 0 } : { left: 0 };
                let valueStyle = this.strings.dirByLang === "rtl" ? { left: 0 } : { right: 0 };
                let column;
                if (columns.length !== 0)
                {
                    column =
                        <View style={styles.textContainer}>
                            <Text style={[styles.text, titleStyle]}>{colTitle + ":"}</Text>
                            <Text style={[styles.text, valueStyle, styles.bold]}>{row[colName]}</Text>
                        </View>;
                }
                else 
                {
                    // The first column is shown without title.
                    column =
                        <View style={styles.textContainer}>
                            <Text style={[styles.text, titleStyle, styles.bold]}>{row[colName]}</Text>
                        </View>;
                }
                columns.push(column);
            }
        }
        return (
            <Card content={columns}
                onPress={() => { this.editRow(row) }}
                cardContainerStyle={[styles.cardContainer]}>
            </Card>
        );
    }

    /**
     * Hidden buttons. Shown when the user swipes a row.
     * 
     * @param {any} row 
     * @param {any} secId 
     * @param {any} rowId 
     * @param {any} rowsMap 
     * @returns 
     * @memberof ListPage
     */
    renderHiddenRow = (row, secId, rowId, rowsMap) =>
    {
        let isRTL = this.strings.dirByLang === "rtl";
        return (
            <View style={[styles.rowBack, isRTL ? styles.rtlFlex : styles.ltrFlex]} >

                <Button
                    title={this.strings.editBtnText}
                    onPress={() => { this.editRow(row) }}
                    containerViewStyle={[styles.hiddenBtnContainer]}
                    buttonStyle={styles.hiddenBtn}
                    backgroundColor={colors.darkBlue}
                    color='white'
                    icon={{ name: 'edit', style: styles.hiddenIcon }}
                />

                <Button
                    title={this.strings.deleteBtnText}
                    onPress={() => { this.deleteRow(rowId) }}
                    containerViewStyle={[styles.hiddenBtnContainer]}
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
    headerTitleStyle:
    {
        alignSelf: 'center',
        color: 'white',
        fontSize: 19
    },
    headerContainer:
    {
        flex: 0.12,
    },
    listContainer:
    {
        flex: 0.88
    },
    cardContainer:
    {
        marginTop: 10,
        borderRadius: 2,
        borderWidth: 1,
        backgroundColor: 'white',
        borderColor: colors.gray,
        padding: 15,
        marginHorizontal: 10

    },
    text:
    {
        position: 'absolute',
    },
    textContainer:
    {
        paddingVertical: 15,
    },
    bold:
    {
        fontWeight: 'bold'
    },
    // hidden buttons
    rowBack:
    {
        flex: verticalScale(1.015),
        flexDirection: 'column',
        top: 11,
    },
    rtlFlex:
    {
        alignItems: 'flex-start'
    },
    ltrFlex:
    {
        alignItems: 'flex-end'
    },
    hiddenBtnContainer:
    {
        flex: 2,

    },
    hiddenBtn:
    {
        flexDirection: 'column',
        flex: 2,
        paddingHorizontal: 15,
        minWidth: 80
    },
    hiddenIcon:
    {
        marginRight: 0
    },
    // indicator for loading more rows
    rowsIndicator:
    {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center'
    },
    // empty state
    emptyState: {
        flex: 1,
        alignItems: 'center',
        marginTop: verticalScale(10)
    },
    emptyStateArrow: {
        resizeMode: 'contain',
        marginTop: verticalScale(20),
        height: verticalScale(370),
        width: verticalScale(222),
        marginHorizontal: scale(20)
    },
});