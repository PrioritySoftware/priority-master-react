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
import { colors } from '../styles/common';
import { FormService } from '../providers/form.service';
import { SwipeListView } from 'react-native-swipe-list-view';
import { Card } from '../components/card';
import { scale, verticalScale } from '../utils/scale';
import { Button } from 'react-native-elements';
import InfiniteScrollView from 'react-native-infinite-scroll-view';
import { MessageHandler } from '../components/message.handler';
import Spinner from 'react-native-loading-spinner-overlay';
const SpinnerIndicator = require('react-native-spinkit');
import ActionButton from 'react-native-action-button';
import * as moment from 'moment';
import { HeaderComp } from '../components/header';
import { Pages } from './index';
import { observer, inject } from 'mobx-react';
import { ObservableMap, observable } from 'mobx';

@inject("formService", "configService", "messageHandler", "strings")
@observer
export class ListPage extends React.Component<PageProps, any>
{
    static navigationOptions = { header: null };

    messageHandler: MessageHandler;
    configService: ConfigService;
    formService: FormService;
    strings: Strings;

    // Props
    form: Form;
    parentForm: Form;

    ds;
    @observable rows: ObservableMap<any>;

    constructor(props)
    {
        super(props);
        this.configService = this.props.configService;
        this.formService = this.props.formService;
        this.strings = this.props.strings;
        this.messageHandler = this.props.messageHandler;

        // props
        this.form = this.props.navigation.state.params.form;
        this.parentForm = this.props.navigation.state.params.parentForm;

        // state
        this.state =
            {
                canLoadMoreContent: true,
                isLoading: false,
                isDeletingRow: false
            };

        // get form rows
        this.formService.startFormAndGetRows(this.form.name, this.configService.config.profileConfig, 1).then(
            form =>
            {
                this.form = form;
                this.rows = this.form.rows;
            },
            reason => { });
        this.ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
    }
    componentWillUnmount()
    {
        if (this.form.endCurrentForm)
            this.formService.endForm(this.form);
    }
    loadMoreData = () =>
    {
        this.setState({ isLoading: true });
        let recordsCount = this.rows.size;
        this.formService.getRows(this.form, recordsCount + 1, true)
            .then(rows =>
            {
                let canLoadMoreContent = this.state.canLoadMoreContent;

                // disables infinite scroll when there are no more rows
                if (Object.keys(rows).length < 100)
                    canLoadMoreContent = false;

                this.setState({ isLoading: false, canLoadMoreContent: canLoadMoreContent });
            })
            .catch(() => { });
    }
    goBack()
    {
        this.props.navigation.goBack();
    }
    editRow(rowTitle: string, rowIndex: number)
    {
        rowIndex++;
        this.formService.setActiveRow(this.form, rowIndex);
        this.props.navigation.navigate(Pages.Details.name,
            {
                title: rowTitle,
                itemIndex: rowIndex,
                form: this.form,
                parentForm: this.parentForm
            });
    }
    deleteRow(rowInd)
    {
        rowInd++;
        let delFunc = () =>
        {
            this.setState({ isDeletingRow: true });
            this.formService.deleteListRow(this.form, rowInd)
                .then(() => 
                {
                    this.setState({ isDeletingRow: false });
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
                <HeaderComp title={this.form.title} goBack={() => this.goBack()} />
                {this.rows ? this.renderList() : this.renderActivityIndicator(this.strings.scrollLoadingText)}
            </View>
        );
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
        if (this.rows.size===0)
            return this.renderEmptyState();

        return (
            <View style={styles.listContainer}>
                <SwipeListView
                    contentContainerStyle={{ paddingBottom: padding }}
                    renderScrollComponent={props => <InfiniteScrollView {...props} />}
                    canLoadMore={this.state.canLoadMoreContent}
                    onLoadMoreAsync={this.loadMoreData}
                    dataSource={this.ds.cloneWithRows(this.rows.values())}
                    renderRow={this.renderRow}
                    renderHiddenRow={this.renderHiddenRow}
                    distanceToLoadMore={30}
                    leftOpenValue={scale(85)}
                    rightOpenValue={scale(-85)}
                    disableRightSwipe={!isRTL}
                    disableLeftSwipe={isRTL}
                />
                {this.renderAddBtn()}
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
        let scaleX = this.strings.dirByLang === "rtl" ? -1 : 1;
        let flex = this.strings.dirByLang === "rtl" ? 'flex-start' : 'flex-end';
        return (
            <View style={styles.emptyState}>
                <Text style={{ fontSize: scale(20) }}>{this.strings.noRecords}</Text>
                <Text style={{ fontSize: scale(16) }}>{this.strings.clickAddButton}</Text>
                <Image source={require('../../assets/img/EmptyStateArrow.png')}
                    style={[styles.emptyStateArrow, { alignSelf: flex, transform: [{ scaleX: scaleX }] }]} />
                {this.renderAddBtn()}
            </View>
        );
    }

    renderRow = (row, secId, rowId, rowsMap) =>
    {
        let form: Form = this.formService.getForm(this.form.name);
        let formName = form.name;
        let formColumns = this.formService.formsConfig[formName].listColumnsOptions;

        let columns = [];
        row.title = '';
        for (let colName in formColumns)
        {
            if (formColumns.hasOwnProperty(colName) && row[colName] !== undefined && row[colName] !== '')
            {
                let column = form.columns[colName];
                let colTitle = column.title;
                let colValue = row[colName];
                // Date values are displayed according to the column's 'format' property.
                if (column.type === 'date')
                    colValue = moment.utc(colValue).format(column.format);
                let titleStyle = this.strings.dirByLang === "rtl" ? { right: 0 } : { left: 0 };
                let valueStyle = this.strings.dirByLang === "rtl" ? { left: 0 } : { right: 0 };
                let columnComp;
                if (columns.length !== 0)
                {
                    columnComp =
                        <View style={styles.textContainer} key={column.name}>
                            <Text style={[styles.text, titleStyle]}>
                                {colTitle + ":"}
                            </Text>
                            <Text style={[styles.text, valueStyle, styles.bold, styles.valueText]} ellipsizeMode='tail' numberOfLines={1}>
                                {colValue}
                            </Text>
                        </View>;
                }
                else 
                {
                    // The first column is shown without title.
                    row.title  = row[colName];
                    columnComp =
                        <View style={styles.textContainer} key={column.name}>
                            <Text style={[styles.text, titleStyle, styles.bold]}>{row.title }</Text>
                        </View>;
                }
                columns.push(columnComp);
            }
        }
        return (
            <Card key={rowId}
                content={columns}
                onPress={() => { this.editRow(row.title , rowId) }}
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
                    onPress={() => { this.editRow(row.title , rowId) }}
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
    renderAddBtn()
    {
        let offsetX = 30;
        let offsetY = 30;
        if (this.strings.platform === 'android')
        {
            offsetX = this.strings.dirByLang === "rtl" ? -25 : 20;
            offsetY = 20;
        }
        let position = this.strings.dirByLang === "rtl" ? 'left' : 'right';
        return (

            <ActionButton
                position={position}
                offsetY={offsetY}
                offsetX={offsetX}
                buttonColor={colors.primaryColor}
                buttonTextStyle={{ fontSize: scale(27) }}
                fixNativeFeedbackRadius={true}
                onPress={() => { console.log("hi") }}
            />

        );
    }
}

/*********** style ************* */
const styles = StyleSheet.create({
    container:
        {
            backgroundColor: colors.lightGray
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
    valueText:
        {
            maxWidth: '60%'
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
            flex: 2,
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
    hiddenBtnContainer:
        {
            flex: 2,

        },
    hiddenBtn:
        {
            flexDirection: 'column',
            flex: 2,
            paddingHorizontal: 15,
            minWidth: scale(80)
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
        marginTop: verticalScale(22),
        height: verticalScale(370),
        width: verticalScale(222),
        marginHorizontal: scale(20)
    },
});