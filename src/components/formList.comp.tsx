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
import { colors, container, alignSelf, textAlign } from '../styles/common';
import { FormService } from '../providers/form.service';
import { SwipeListView } from 'react-native-swipe-list-view';
import { scale, verticalScale } from '../utils/scale';
import { Button } from 'react-native-elements';
import InfiniteScrollView from 'react-native-infinite-scroll-view';
import { MessageHandler } from '../components/message.handler';
import Spinner from 'react-native-loading-spinner-overlay';
const SpinnerIndicator = require('react-native-spinkit');
import ActionButton from 'react-native-action-button';
import { observer, inject } from 'mobx-react';
import { ObservableMap, observable } from 'mobx';
import { Row } from './Row';
import { SearchBar } from 'react-native-elements'
import debounce from 'lodash.debounce'

@inject("formService", "configService", "messageHandler", "strings")
@observer
export class FormList extends React.Component<any, any>
{

    messageHandler: MessageHandler;
    configService: ConfigService;
    formService: FormService;
    strings: Strings;

    form: Form;
    formName: string;
    formTitle: string;
    parentForm: Form;

    editRow;
    ds;

    // search
    searchText: string;
    lastSearch: string;
    debounceSearch;

    @observable rows: ObservableMap<any>;
    @observable isShowSearchLoading: boolean;

    constructor(props)
    {
        super(props);
        this.configService = this.props.configService;
        this.formService = this.props.formService;
        this.strings = this.props.strings;
        this.messageHandler = this.props.messageHandler;

        // props
        this.formName = this.props.formName;
        let parentPath = this.props.parentPath;
        this.parentForm = this.formService.getForm(parentPath);
        this.editRow = this.props.editRow;

        // state
        this.state =
            {
                canLoadMoreContent: true,
                isLoadingMore: false,
                isDeletingRow: false,
            };

        // get form rows
        this.startForm();
        this.ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });

        //search
        this.debounceSearch = debounce(this.search, 1500);
        this.isShowSearchLoading = false;
    }
    componentWillUnmount()
    {
        this.endForm()
    }
    componentWillReceiveProps(newProps)
    {
        // When props are received for the second time,
        // which means there is a formList component present,
        // we must end the previous form in order to start a new one.
        // Happens when moving from one subform to another.
        this.rows = null;
        this.endForm().then(
            () =>
            {
                this.formName = newProps.formName;
                let parentPath = newProps.parentPath;
                this.parentForm = this.formService.getForm(parentPath);
                this.editRow = newProps.editRow;
                this.startForm();
            })
            .catch(() => { });
    }
    isQueryForm()
    {
        return this.form && this.form.isquery == 1;
    }
    endForm()
    {
        if (this.form && this.form.endCurrentForm)
        {
            this.formService.deleLocalForm(this.form.path);
            return this.formService.endForm(this.form).catch(() => { });
        }
        return new Promise((resolve, reject) => resolve());
    }

    startForm()
    {
        if (this.parentForm)
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
        this.formService.startSubFormAndGetRows(this.parentForm, this.formName).then(
            subForm =>
            {
                this.form = subForm;
                this.rows = this.form.rows;
            },
            reason => { })

    }
    loadMoreData = () =>
    {
        if (this.state.isLoadingMore)
            return;
        this.setState({ isLoadingMore: true });
        let recordsCount = this.rows.size;
        this.formService.getRows(this.form, recordsCount + 1, true)
            .then(rows =>
            {
                let canLoadMoreContent = this.state.canLoadMoreContent;

                // disables infinite scroll when there are no more rows
                if (Object.keys(rows).length < 100)
                    canLoadMoreContent = false;

                this.setState({ isLoadingMore: false, canLoadMoreContent: canLoadMoreContent });
            })
            .catch(() => { });
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
    newRow = () =>
    {
        this.formService.newRow(this.form)
            .then(newRowIndex => this.editRow(this.form, this.form.title, newRowIndex))
            .catch(() => { });
    }

    // search
    search(val)
    {
        let formConfig = this.formService.getFormConfig(this.form, this.parentForm);
        this.formService.setFilter(this.form, formConfig.searchColumns, val).then(
            result => this.isShowSearchLoading = false,
            reason => this.isShowSearchLoading = false);
    }
    startSearch = (searchVal: string) =>
    {
        let formConfig = this.formService.getFormConfig(this.form, this.parentForm);
        if (formConfig.searchColumns.length == 0)
        {
            this.messageHandler.showErrorOrWarning(true, this.strings.searchError, () => { }, () => { }, { title: this.strings.errorTitle });
            return;
        }
        if (this.lastSearch != searchVal && (this.lastSearch !== undefined || searchVal !== ''))
        {
            this.lastSearch = searchVal;
            this.isShowSearchLoading = true;
            this.debounceSearch(searchVal);
        }
    }

    /********* rendering functions *********/
    render()
    {
        return (
            <View style={[container, styles.container]}>
                {this.renderSearchHeader()}
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
                <ActivityIndicator style={{ marginTop: 10 }} ></ActivityIndicator>
            </View>

        );
    }
    renderList()
    {
        let isRTL = this.strings.isRTL;

        // render emptyState in case there are no rows and there is no search in action
        if (this.rows.size === 0 && this.lastSearch === undefined)
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
            < View style={[styles.rowsIndicator, { display: this.state.isLoadingMore ? 'flex' : 'none' }]} >
                <Text style={{ color: colors.darkGray }}>{this.strings.loadingSearchResults}</Text>
                <SpinnerIndicator style={{ marginBottom: 5 }} type='ThreeBounce' color={colors.darkGray}></SpinnerIndicator>
            </View >
        );
    }
    renderEmptyState()
    {
        let scaleX = this.strings.isRTL ? -1 : 1;
        let arrowHeight = this.parentForm ? { height: verticalScale(275) } : { height: verticalScale(310) };
        return (
            <View style={styles.emptyState}>
                <Text style={{ fontSize: scale(20) }}>{this.strings.noRecords}</Text>
                <Text style={{ fontSize: scale(16) }}>{this.strings.clickAddButton}</Text>
                <Image source={require('../../assets/img/EmptyStateArrow.png')}
                    style={[
                        styles.emptyStateArrow,
                        arrowHeight,
                        alignSelf(this.strings.isRTL),
                        { transform: [{ scaleX: scaleX }] }
                    ]} />
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
                editRow={(rowTitle, rowIndex) => this.editRow(this.form, rowTitle, rowIndex)}
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
                    onPress={() => { this.editRow(this.form, row.title, rowId) }}
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
        // Don't show the add button for query forms.
        if (this.isQueryForm())
            return (null);
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
                onPress={this.newRow}
            />

        );
    }

    // search

    renderSearchHeader()
    {
        return (
            <View>
                {this.renderSearchBar()}
                {this.renderSearchIndicator()}
            </View>
        );
    }
    renderSearchBar()
    {
        let inputStyle = textAlign(this.strings.isRTL);
        return (
            <SearchBar
                clearIcon={{ color: '#86939e', name: "close" }}
                onChangeText={this.startSearch}
                onClearText={this.startSearch}
                inputStyle={[styles.searchInput, inputStyle]}
                containerStyle={styles.searchContainer}
            />
        );
    }
    renderSearchIndicator()
    {
        if (!this.isShowSearchLoading)
            return (null);
        return (
            <View style={[styles.searchIndicator]}>
                <SpinnerIndicator style={{ marginTop: -5 }} type='ThreeBounce' color={colors.disabledGray}></SpinnerIndicator>
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
    listContainer:
        {
            flex: 1
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
        width: verticalScale(192),
        marginHorizontal: scale(20)
    },

    subFormItem: {
        padding: 5,
        margin: 10,
        marginTop: 3,
        borderBottomWidth: 0.5,
        borderBottomColor: 'rgba(242, 242, 242, 1)',
    },

    selectItem: {
        borderBottomColor: 'rgba(0,0, 0, 1)',
    },

    // search
    searchContainer:
        {
            backgroundColor: colors.background,
            borderBottomWidth: 0,
            borderTopWidth: 0,
            marginBottom: -2
        },
    searchInput:
        {
            backgroundColor: 'white'
        },
    searchIndicator:
        {
            height: verticalScale(25),
            padding: 0,
            alignItems: 'center'
        },
});