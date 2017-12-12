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
import { Strings, Form } from '../modules';
import { ConfigService } from '../providers/config.service';
import { colors, container, alignSelf } from '../styles/common';
import { FormService } from '../providers/form.service';
import { SwipeListView } from 'react-native-swipe-list-view';
import { scale, verticalScale } from '../utils/scale';
import { Button } from 'react-native-elements';
import InfiniteScrollView from 'react-native-infinite-scroll-view';
import { MessageHandler } from '../components/message.handler';
import Spinner from 'react-native-loading-spinner-overlay';
const SpinnerIndicator = require('react-native-spinkit');
import ActionButton from 'react-native-action-button';
import { HeaderComp } from '../components/header';
import { Pages } from './index';
import { observer, inject } from 'mobx-react';
import { ObservableMap, observable } from 'mobx';
import { Row } from '../components/Row';

@inject("formService", "configService", "messageHandler", "strings")
@observer
export class ListPage extends React.Component<any, any>
{
    static navigationOptions = { header: null };

    messageHandler: MessageHandler;
    configService: ConfigService;
    formService: FormService;
    strings: Strings;

    form: Form;
    formName: string;
    formTitle: string;
    parentPath: string;

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
        this.formName = this.props.navigation.state.params.formName;
        this.formTitle = this.props.navigation.state.params.formTitle;
        this.parentPath = this.props.navigation.state.params.parentPath;

        // state
        this.state =
            {
                canLoadMoreContent: true,
                isLoading: false,
                isDeletingRow: false
            };

        // get form rows
        this.startForm();
        this.ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
    }
    componentWillUnmount()
    {
        if (this.form && this.form.endCurrentForm)
        {
            this.formService.deleLocalForm(this.form.path);
            this.formService.endForm(this.form);
        }
    }
    startForm()
    {
        if (this.parentPath)
            this.startSubForm();
        else
            this.startParentForm();
    }
    startParentForm()
    {
        this.formService.startFormAndGetRows(this.formName, this.configService.config.profileConfig, 1).then(
            form =>
            {
                this.form = form;
                this.rows = this.form.rows;
            },
            reason => { });
    }
    startSubForm()
    {

    }
    loadMoreData = () =>
    {
        if (this.state.isLoading)
            return;
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
    editRow = (rowTitle: string, rowIndex: number) =>
    {
        this.formService.setActiveRow(this.form, rowIndex).catch(() => { });

        let parentName = this.parentPath;
        let parentFormName = parentName ? this.formService.getForm(parentName).name : '';

        this.props.navigation.navigate(Pages.Details.name,
            {
                title: rowTitle,
                itemIndex: rowIndex,
                formPath: this.form.path,
                parentName: parentFormName
            });
    }
    deleteRow(rowInd)
    {
        let delFunc = () =>
        {
            this.setState({ isDeletingRow: true });
            this.formService.deleteListRow(this.form, rowInd)
                .then(() => 
                {
                    this.setState({ isDeletingRow: false });
                })
                .catch(() => this.setState({ isDeletingRow: false }));
        };
        this.messageHandler.showErrorOrWarning(false, this.strings.isDelete, delFunc);
    }
    /********* rendering functions *********/
    render()
    {
        return (
            <View style={container}>
                <HeaderComp title={this.formTitle} goBack={() => this.goBack()} />
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
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                <Text>{text}</Text>
                <ActivityIndicator style={{ marginTop: 10 }} color="black" ></ActivityIndicator>
            </View>
        );
    }
    renderList()
    {
        let isRTL = this.strings.isRTL;

        // in case there are no rows
        if (this.rows.size === 0)
            return this.renderEmptyState();
        return (
            <View style={styles.listContainer}>
                <SwipeListView
                    contentContainerStyle={{ paddingBottom: scale(10) }}
                    dataSource={this.ds.cloneWithRows(this.rows.values())}
                    renderRow={this.renderRow}
                    renderHiddenRow={this.renderHiddenRow}
                    leftOpenValue={scale(85)}
                    rightOpenValue={scale(-85)}
                    disableRightSwipe={!isRTL}
                    disableLeftSwipe={isRTL}
                    renderScrollComponent={props => <InfiniteScrollView {...props} />}
                    canLoadMore={this.state.canLoadMoreContent}
                    onLoadMoreAsync={this.loadMoreData}
                    distanceToLoadMore={500}
                    renderFooter={this.renderFooter}
                />
                {this.renderAddBtn()}
                {/* Loading indicator for row deletion  */}
                {<Spinner visible={this.state.isDeletingRow} color={colors.primaryColor} overlayColor={colors.overlay} size="small"></Spinner>}
            </View>
        );
    }
    renderFooter = () => 
    {
        {/* Loading indicator for loading more rows */ }
        return (
            < View style={[styles.rowsIndicator, { display: this.state.isLoading ? 'flex' : 'none' }]} >
                <Text style={{ color: colors.darkGray }}>{this.strings.loadingSearchResults}</Text>
                <SpinnerIndicator style={{ marginBottom: 5 }} type='ThreeBounce' color={colors.darkGray}></SpinnerIndicator>
            </View >
        );
    }
    renderEmptyState()
    {
        let scaleX = this.strings.isRTL ? -1 : 1;
        return (
            <View style={styles.emptyState}>
                <Text style={{ fontSize: scale(20) }}>{this.strings.noRecords}</Text>
                <Text style={{ fontSize: scale(16) }}>{this.strings.clickAddButton}</Text>
                <Image source={require('../../assets/img/EmptyStateArrow.png')}
                    style={[styles.emptyStateArrow, alignSelf(this.strings.isRTL), { transform: [{ scaleX: scaleX }] }]} />
                {this.renderAddBtn()}
            </View>
        );
    }

    renderRow = (row, secId, rowId, rowsMap) =>
    {
        rowId++;
        return (
            <Row
                formPath={this.form.path}
                rowId={rowId}
                editRow={this.editRow}
            />
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
        rowId++;
        let isRTL = this.strings.isRTL;
        return (
            <View style={[styles.rowBack, isRTL ? styles.rtlFlex : styles.ltrFlex]} >

                <Button
                    title={this.strings.editBtnText}
                    onPress={() => { this.editRow(row.title, rowId) }}
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
            offsetX = this.strings.isRTL ? -25 : 20;
            offsetY = 20;
        }
        let position = this.strings.isRTL ? 'left' : 'right';
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
        alignItems: 'center',
        paddingTop: scale(10)
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