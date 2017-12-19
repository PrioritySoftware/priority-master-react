import React, { Component, PropTypes } from 'react';
import
{
    StyleSheet,
    View,
    Text,
    FlatList,
} from 'react-native';
import { colors } from "../styles/common";

export class HorizontalList extends Component<any, any>
{

    static propTypes = {
        list: PropTypes.array.isRequired,
        selected: PropTypes.string.isRequired,
        onPress: PropTypes.func.isRequired,
        inverted: PropTypes.bool.isRequired,
    };

    onPress=(item)=>
    {
        this.props.onPress(item)
    }

    getstyle(item)
    {
        if (this.props.selected === item.name)
        {
            return styles.selectItem
        }
        return ""
    }

    render()
    {
        if (this.props.list.length >= 1)
        {
            return (
                <View style={{ flex: 0, backgroundColor: 'rgba(242, 242, 242, 1)' }}>
                    <FlatList contentContainerStyle={[styles.subFormList]}
                        horizontal={true}
                        data={this.props.list}
                        inverted={this.props.inverted}    
                        renderItem={this.renderSubFormListItem}
                        keyExtractor={item => item.name}
                    />
                </View>
            )
        }
        else
        {
            return (null)
        }
    }
    renderSubFormListItem = ({ item }) => (
        <View style={[styles.subFormItem, this.getstyle(item)]}>
            <Text style={[styles.subFormItemText]}
                onPress={() => { this.onPress(item) }}>
                {item.title}
            </Text>
        </View>
    )
}
/*********** style ************* */
const styles = StyleSheet.create({
    subFormList: {
        flex: 0,
        flexDirection: 'row',
        backgroundColor: colors.menuBackground,
    },
    subFormItem: {
        padding: 5,
        margin: 10,
        marginTop: 3,
        borderBottomWidth: 0.5,
        borderBottomColor: 'transparent',
        backgroundColor:'transparent',
    },
    subFormItemText:
    {
        color:colors.darkGray
    },
    selectItem: {
        borderBottomColor: colors.darkGray,

    },
});