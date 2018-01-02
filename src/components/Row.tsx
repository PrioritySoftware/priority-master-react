import
{
    View,
    Text,
    StyleSheet
} from 'react-native';
import { Form } from "../modules/form.class";
import { inject, observer } from "mobx-react";
import * as moment from 'moment';
import { Card } from './card';
import { colors, position } from '../styles/common';
import * as React from 'react';
import { ColumnType } from '../modules/columnType.class';
import { Icon } from 'react-native-elements';
import { scale } from '../utils/scale';

@inject("formService", "strings")
@observer
export class Row extends React.Component<any, any>
{
    render()
    {
        let { formPath, rowId, editRow } = this.props;
        let form: Form = this.props.formService.getForm(formPath);
        let formName = form.name;
        let parentName = form.parentName;
        let formsConfigID = parentName ? formName + parentName : formName;
        let formColumns = this.props.formService.formsConfig[formsConfigID].listColumnsOptions;

        let columns = [];
        let row = this.props.formService.getFormRow(form, rowId);
        row.title = '';
        for (let colName in formColumns)
        {
            if (formColumns.hasOwnProperty(colName))
            {
                let column = form.columns[colName];
                let colTitle = column.title;
                let colValue = row.get(colName);
                if (column.type != ColumnType.Bool && (colValue === undefined || colValue === ''))
                    continue;
                // Date values are displayed according to the column's 'format' property.
                if (column.type === ColumnType.Date)
                    colValue = moment.utc(colValue).format(column.format);
                let titleStyle = position(this.props.strings.isRTL, 0);
                let valueStyle = position(!this.props.strings.isRTL, 0);
                let columnComp;
                if (columns.length !== 0)
                {
                    if (column.type !== ColumnType.Bool)
                        columnComp = this.renderColumn(rowId, colName, colTitle, colValue, titleStyle, valueStyle);
                    else
                        columnComp = this.renderBoolColumn(rowId, colName, colTitle, colValue, titleStyle, valueStyle);
                }
                else 
                {
                    // The first column is shown without title.
                    row.title = colValue;
                    columnComp =
                        <View style={styles.textContainer} key={rowId + colName}>
                            <Text style={[styles.text, titleStyle, styles.bold]}>{row.title}</Text>
                        </View>;
                }
                columns.push(columnComp);
            }
        }
        return (
            <Card
                content={columns}
                onPress={() => { editRow(row.title, rowId) }}
                cardContainerStyle={[styles.cardContainer]}>
            </Card>
        );
    }
    renderColumn(rowId, colName, colTitle, colValue, titleStyle, valueStyle)
    {
        return (
            <View style={styles.textContainer} key={rowId + colName}>
                <Text style={[styles.text, titleStyle]}>
                    {colTitle + ":"}
                </Text>
                <Text style={[styles.text, valueStyle, styles.bold, styles.valueText]} ellipsizeMode='tail' numberOfLines={1}>
                    {colValue}
                </Text>
            </View>
        );
    }
    renderBoolColumn(rowId, colName, colTitle, colValue, titleStyle, valueStyle)
    {
        let isFalse = colValue === undefined || colValue === '';
        return (
            <View style={styles.textContainer} key={rowId + colName}>
                <Text style={[styles.text, titleStyle]}>
                    {colTitle + ":"}
                </Text>
                {
                    !isFalse && <Icon type={'ionicon'}
                        name={'ios-checkmark-circle-outline'}
                        size={scale(19)}
                        style={[styles.boolIcon, valueStyle]} />
                }
                {
                    isFalse && <Icon type={'ionicon'}
                        name={'ios-remove-circle-outline'}
                        size={scale(19)}
                        style={[styles.boolIcon, valueStyle]} />
                }
            </View>
        );
    }
}
/*********** style ************* */
const styles = StyleSheet.create({
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
    boolIcon:
        {
            marginTop: scale(-18)
        }

});