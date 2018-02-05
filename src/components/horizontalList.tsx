import React, { Component } from 'react';
import
{
    StyleSheet,
    View,
    Text,
    FlatList,
    Platform,
    TouchableHighlight,
} from 'react-native';
import { colors } from "../styles/common";
import { scale } from '../utils/scale';
import PropTypes from 'prop-types';

export class HorizontalList extends Component<any, any>
{

    static propTypes =
        {
            list: PropTypes.array.isRequired,
            selected: PropTypes.string.isRequired,
            onPress: PropTypes.func.isRequired,
            inverted: PropTypes.bool.isRequired,
        };

    onPress = (item) =>
    {
        this.props.onPress(item)
    }

    getstyle(item): any
    {
        if (this.props.selected === item.name)
        {
            return styles.selectItem
        }
        return ""
    }

    render()
    {
        if (this.props.list.length > 1)
        {
            return (
                <View style={styles.listContainer}>
                    <FlatList contentContainerStyle={[styles.list]}
                        horizontal={true}
                        data={this.props.list}
                        inverted={this.props.inverted}
                        renderItem={this.renderListItem}
                        keyExtractor={item => item.name}
                        {...this.props}
                    />
                </View>
            )
        }
        else
        {
            return (null)
        }
    }
    renderListItem = ({ item }) => (
        <TouchableHighlight
            onPress={() => { this.onPress(item) }}
            style={styles.itemBox}
            activeOpacity={1}
            underlayColor={colors.menuBackground}>
            <Text style={[styles.item, this.getstyle(item)]}>
                {item.title}
            </Text>
        </TouchableHighlight>
    )
}
/*********** style ************* */
const styles = StyleSheet.create({
    listContainer:
        {
            flex: 0,
            backgroundColor: colors.menuBackground
        },
    list:
        {
            flex: 0,
            flexDirection: 'row',
        },
    itemBox: {
        flex: 0,
        justifyContent: 'center',
        alignItems: 'center'
    },
    item: {
        padding: 5,
        margin: 10,
        marginTop: 5,
        lineHeight: 15,
        fontSize: 15,
        ...Platform.select({
            ios:
                {
                    marginTop: 10,
                    marginBottom: 7
                }
        })
    },
    selectItem:
        {
            borderBottomColor: colors.darkGray,
            borderBottomWidth: 0.5,
            ...Platform.select({
                ios:
                    {
                        borderBottomWidth: 0,
                        textDecorationLine: 'underline'
                    }
            })
        },
});