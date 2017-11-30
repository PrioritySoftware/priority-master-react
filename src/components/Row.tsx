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
import { colors } from '../styles/common';
import * as React from 'react';

@inject("formService", "strings")
@observer
export class Row extends React.Component<any, any>
{
    render()
    {
        let { formPath, rowId, editRow } = this.props;
        let form: Form = this.props.formService.getForm(formPath);
        let formName = form.name;
        let formColumns = this.props.formService.formsConfig[formName].listColumnsOptions;

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
                if (colValue === undefined || colValue === '')
                    continue;
                // Date values are displayed according to the column's 'format' property.
                if (column.type === 'date')
                    colValue = moment.utc(colValue).format(column.format);
                let titleStyle = this.props.strings.dirByLang === "rtl" ? { right: 0 } : { left: 0 };
                let valueStyle = this.props.strings.dirByLang === "rtl" ? { left: 0 } : { right: 0 };
                let columnComp;
                if (columns.length !== 0)
                {
                    columnComp =
                        <View style={styles.textContainer} key={rowId + colName}>
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
   
});