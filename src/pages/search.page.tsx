import React, { Component } from 'react';
import
{
    StyleSheet,
    View,
    Text,
    FlatList,
    BackHandler,
    Dimensions
} from 'react-native';
import { container, colors, flexDirection, textAlign, body, bodyHeight } from "../styles/common";
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
    form: Form;
    isSearch: boolean;
    chooseFirstTitle: string;
    chooseSecondTitle: string;
    onUpdate;
    isShowLoading: boolean;

    searchlist;
    searchbar;

    @observable isLoadingMore: boolean;
    canLoadMore: boolean;
    @observable searchResults;
    @observable searchVal: string;

    constructor(props)
    {
        super(props);
        this.formService = this.props.formService;
        this.strings = this.props.strings;

        this.isSearch = false;
        this.searchResults = [];
        this.isShowLoading = false;
        this.isLoadingMore = false;
        this.canLoadMore = true;

        this.form = this.formService.getForm(this.props.navigation.state.params.formPath);
        this.title = this.props.navigation.state.params.title;
        this.onUpdate = this.props.navigation.state.params.onUpdate;
        this.searchVal = this.props.navigation.state.params.searchVal || '';
        this.initSearchResults(this.props.navigation.state.params.searchObj);
    }
    componentDidMount()
    {
        BackHandler.addEventListener('hardwareBackPress', this.goBack);
    }
    componentWillUnmount()
    {
        BackHandler.removeEventListener('hardwareBackPress', this.goBack);
    }

    setIsLoadingMore(isLoading: boolean)
    {
        this.isLoadingMore = isLoading;
    }
    setCanLoadMore(search: Search)
    {
        if (search.next <= 0)
            this.canLoadMore = false;
        else
            this.canLoadMore = true;
    }
    goBack = () =>
    {
        this.props.navigation.goBack();
        return true;
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
    focusSearchBar()
    {
        if (this.searchbar)
            this.searchbar.focus();
    }
    // First time
    initSearchResults(searchObj: Search)
    {
        this.chooseFirstTitle = searchObj.title1;
        this.chooseSecondTitle = searchObj.title2;
        this.isSearch = searchObj.SearchLine != null;
        this.setCanLoadMore(searchObj);
        this.searchResults = searchObj.SearchLine || searchObj.ChooseLine;
        setTimeout(() => this.focusSearchBar(), 10);
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
                this.searchlist.scrollToIndex({ index: 0 });

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
                <View style={[ { flex:bodyHeight,display: this.searchResults ? 'flex' : 'none' }]}>
                    {this.isSearch && this.renderSearchHeader()}
                    {!this.isSearch && this.renderChooseHeader()}
                    <FlatList
                        ref={list => this.searchlist = list}
                        data={this.searchResults}
                        renderItem={({ item }) => this.renderItem(item)}
                        keyExtractor={item => this.getSearchResult(item)}
                        contentContainerStyle={styles.list}
                        ListFooterComponent={this.renderFooter}
                        renderScrollComponent={props => <InfiniteScrollView {...props} />}
                        canLoadMore={this.canLoadMore}
                        onLoadMoreAsync={this.doInfinite}
                        distanceToLoadMore={500}
                    />
                </View>
            </View >
        );
    }
    renderItem(item)
    {
        let retval = this.getSearchResult(item);
        let valueStyle = textAlign(this.strings.isRTL);
        if (!retval || retval.trim() === '')
            return (null);

        return (
            <ListItem
                onPress={() => this.selectItem(item)}
                hideChevron={true}
                title={
                    <View style={[styles.itemContainer, flexDirection(this.strings.isRTL)]}>
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

    /**
     * Indicator for loading more search results.
     */
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
    renderChooseHeader()
    {
        return (
            <View style={[styles.headerContainer, flexDirection(this.strings.isRTL)]}>
                <Text style={[styles.headerText, textAlign(this.strings.isRTL)]}>
                    {this.chooseFirstTitle}
                </Text>
                <Text style={[styles.headerText, textAlign(this.strings.isRTL)]} >
                    {this.chooseSecondTitle}
                </Text>
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