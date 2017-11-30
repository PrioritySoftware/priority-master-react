import React, { Component, PropTypes } from 'react';
import
{
    StyleSheet,
    View,
    Text,
    TouchableHighlight,
    TouchableNativeFeedback,
    Platform,
    FlatList
} from 'react-native';
import { container, colors, iconName } from "../styles/common";
import { inject, observer } from 'mobx-react';
import { FormService } from '../providers/form.service';
import { SearchResult } from '../modules/searchResult.class';
import { Form } from '../modules/form.class';
import { observable } from 'mobx';
import { Strings } from '../modules/strings';
import { Search } from '../modules/search.class';
import { HeaderComp } from '../components/header';
import { scale, verticalScale } from '../utils/scale';
import { SearchBar, ListItem } from 'react-native-elements';
import SpinnerIndicator from 'react-native-spinkit';
import { SearchAction } from '../modules/searchAction.class';
import InfiniteScrollView from 'react-native-infinite-scroll-view';

@inject("formService", 'strings')
@observer
export class SearchPage extends Component<any, any>
{
    static navigationOptions = { header: null }

    formService: FormService;
    strings: Strings;

    title: string;
    colName: string;
    form: Form;
    isSearch: boolean;
    chooseFirstTitle: string;
    chooseSecondTitle: string;
    onUpdate;
    searchbar;
    isShowLoading: boolean;

    @observable isLoadingMore: boolean;
    canLoadMore: boolean;
    @observable searchResults;
    @observable searchVal: string;

    constructor(props)
    {
        super(props);
        this.formService = this.props.formService;
        this.strings = this.props.strings;

        this.colName = this.props.navigation.state.params.colName;
        this.form = this.formService.getForm(this.props.navigation.state.params.formPath);
        this.searchVal = this.props.navigation.state.params.searchVal || '';
        this.colName = this.props.navigation.state.params.colName;
        this.title = this.form.columns[this.colName].title;
        this.onUpdate = this.props.navigation.state.params.onUpdate;

        this.isSearch = false;
        this.searchResults = [];
        this.isShowLoading = false;
        this.isLoadingMore = false;
        this.canLoadMore = true;

        this.initSearchResults();
    }

    setIsLoadingMore(isLoading: boolean)
    {
        this.isLoadingMore = isLoading;
    }
    setCanLoadMore(search: Search)
    {
        if (search.next <= 0)
        {
            this.canLoadMore = false;
        }

    }
    goBack()
    {
        this.props.navigation.goBack();
    }
    getSearchResult(item: SearchResult)
    {
        return item.retval || item.string1;
    }
    getSecondSearchResult(item: SearchResult)
    {
        if (!item.retval || item.retval === item.string1)
        {
            return item.string2;
        }
        else
        {
            return item.string1;
        }
    }
    // First time
    initSearchResults()
    {
        this.formService.openSearchOrChoose(this.form, this.colName, this.searchVal).then(
            (res: Search) =>
            {
                this.chooseFirstTitle = res.title1;
                this.chooseSecondTitle = res.title2;
                this.isSearch = res.SearchLine != null;
                this.setCanLoadMore(res);
                this.searchResults = res.SearchLine == null ? res.ChooseLine : res.SearchLine;
            },
            reason => { });
    }
    // Get results by value
    getItemsBySearchText(searchVal) 
    {
        this.isShowLoading = true;
        this.searchVal = searchVal;
        this.formService.search(this.form, searchVal).then(
            (res: Search) =>
            {
                this.setCanLoadMore(res);
                this.isShowLoading = false;
                this.searchResults = res.SearchLine;
            }, reason =>
            {
                this.isShowLoading = false;
            });
    }
    // Get next page
    doInfinite = () =>
    {
        if (!this.isSearch || !this.canLoadMore || this.isLoadingMore)
            return;
        this.setIsLoadingMore(true);
        this.formService.search(this.form, this.searchVal, SearchAction.Next)
            .then((result: Search) =>
            {
                let results = result.SearchLine;
                if (results != null && results.length > 0)
                {
                    let slice = this.searchResults.slice(0, this.searchResults.length - 1);
                    this.searchResults = slice.concat(results);
                }
                this.setCanLoadMore(result);
                this.setIsLoadingMore(false);
            })
            .catch(reason =>
            {
                this.setIsLoadingMore(false);
            });
    }
    selectItem(item)
    {
        if (this.searchVal !== this.getSearchResult(item))
        {
            this.onUpdate(this.getSearchResult(item));
            this.goBack();
        }
        else
            this.goBack();

    }

    render()
    {
        return (
            <View style={[container, styles.container]}>
                <HeaderComp title={this.title} goBack={() => this.goBack()} />
                <View style={[styles.listContainer, { display: this.searchResults ? 'flex' : 'none' }]}>
                    {this.renderSearchBar()}
                    {this.renderSearchIndicator()}
                    {this.renderHeader()}
                    <FlatList
                        data={this.searchResults}
                        renderItem={({ item }) => this.renderItem(item)}
                        keyExtractor={item => this.getSearchResult(item)}
                        contentContainerStyle={styles.list}
                        ListFooterComponent={this.renderFooter}
                        renderScrollComponent={props => <InfiniteScrollView {...props} />}
                        canLoadMore={this.canLoadMore}
                        onLoadMoreAsync={this.doInfinite}
                        distanceToLoadMore={300}
                    />
                </View>
            </View >
        );
    }
    renderItem(item)
    {
        let retval = this.getSearchResult(item);
        let valueStyle = { textAlign: this.strings.sideByLang }
        if (!retval || retval.trim() === '')
            return (null);

        return (
            <ListItem
                onPress={() => this.selectItem(item)}
                hideChevron={true}
                title={
                    <View style={[styles.itemContainer, { flexDirection: this.strings.flexDir }]}>
                        <Text style={[styles.text, valueStyle]}>
                            {retval}
                        </Text>
                        <Text style={[styles.text, styles.valueText, valueStyle]} ellipsizeMode='tail' numberOfLines={1}>
                            {this.getSecondSearchResult(item)}
                        </Text>
                    </View>
                } />
        );
    }
    renderHeader()
    {
        if (this.isSearch)
            return (null);
        // let valueStyle = this.strings.dirByLang === "rtl" ? { left: 0 } : { right: 0 };
        return (
            <View style={[styles.headerContainer, { flexDirection: this.strings.flexDir }]}>
                <Text style={styles.headerText}>
                    {this.chooseFirstTitle}
                </Text>
                <Text style={styles.headerText} >
                    {this.chooseSecondTitle}
                </Text>
            </View>
        );
    }
    renderFooter = () =>
    {
        if (!this.isSearch || !this.canLoadMore || !this.isLoadingMore)
            return (null);

        /* Loading indicator for loading more rows */
        return (
            <View style={[styles.rowsIndicator]}>
                <Text style={{ color: colors.darkGray }}>{this.strings.loadingSearchResults}</Text>
                <SpinnerIndicator style={{ marginBottom: 5 }} type='ThreeBounce' color={colors.darkGray}></SpinnerIndicator>
            </View>
        );
    }
    renderSearchBar()
    {
        if (!this.isSearch)
            return (null);
        let inputStyle = { textAlign: this.strings.sideByLang };
        return (
            <SearchBar
                ref={search => this.searchbar = search}
                lightTheme
                clearIcon={{ color: '#86939e', name: "close" }}
                onChangeText={searchVal => this.getItemsBySearchText(searchVal)}
                onClearText={searchVal => this.getItemsBySearchText(searchVal)}
                value={this.searchVal}
                inputStyle={[styles.searchInput, inputStyle]}
            />
        );
    }
    renderSearchIndicator()
    {
        if (!this.isShowLoading)
            return (null);
        return (
            <View style={[styles.searchIndicator]}>
                <SpinnerIndicator style={{ marginBottom: 5 }} type='ThreeBounce' color={colors.disabledGray}></SpinnerIndicator>
            </View>
        );
    }
}
/*********** style ************* */
const styles = StyleSheet.create({
    container:
        {
            backgroundColor: 'white'
        },
    listContainer:
        {
            flex: 0.88
        },
    list:
        {
            paddingHorizontal: scale(15),

        },
    itemContainer:
        {
            paddingVertical: scale(5)
        },
    text:
        {
            flex: 0.5,
            color: 'black'
        },
    valueText:
        {
            maxWidth: '60%'
        },
    headerContainer:
        {
            paddingHorizontal: scale(24),
            paddingVertical: scale(10),
            backgroundColor: colors.lightGray
        },
    headerText:
        {
            flex: 0.5,
            fontSize: scale(12)
        },
    searchInput:
        {
            backgroundColor: 'white'
        },
    searchIndicator:
        {
            height: verticalScale(20),
            padding: 0,
            alignItems: 'center'
        },
    // indicator for loading more results
    rowsIndicator:
        {
            flex: 1,
            justifyContent: 'flex-end',
            alignItems: 'center',
            paddingTop: scale(10)
        },
});