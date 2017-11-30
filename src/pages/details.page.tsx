import React from 'react';
import
{
    StyleSheet,
    View,
} from 'react-native';
import { container } from '../styles/common';
import { FormService } from '../providers/form.service';
import { HeaderComp } from '../components/header';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { ColumnsOptions } from '../modules/columnOptions.class';
import { ItemInput } from '../components/itemInput';
import { observer, inject } from 'mobx-react';
import { Column } from '../modules/column.class';
import { Form } from '../modules/form.class';

@inject("formService", )
@observer
export class DetailsPage extends React.Component<any, any>
{
    static navigationOptions = { header: null }

    formService: FormService;

    // Props
    title: string;
    form: Form;
    parentName: string;
    columns: ColumnsOptions;

    itemIndex: number;

    constructor(props)
    {
        super(props);
        this.formService = this.props.formService;

        this.title = this.props.navigation.state.params.title;
        this.form = this.formService.getForm(this.props.navigation.state.params.formPath);
        this.itemIndex = this.props.navigation.state.params.itemIndex;
        this.parentName = this.props.navigation.state.params.parentName;
        let parentForm = { name: this.parentName };
        this.columns = this.formService.getFormConfig(this.form, parentForm).detailsColumnsOptions;
    }
    goBack()
    {
        this.props.navigation.goBack();
    }
    isSearch(formCol: Column)
    {
        return formCol.zoom === "Search" || formCol.zoom === "Choose";
    }
    getNavigation(colName: string)
    {
        let colConfig = this.columns[colName];
        let col = this.form.columns[colName];
        if (colConfig.subtype === 'barcode' || this.isSearch(col))
            return this.props.navigation;
        return null;
    }
    render() 
    {
        return (
            < View style={[container, styles.container]} >
                <HeaderComp title={this.title} goBack={() => this.goBack()} />
                <KeyboardAwareScrollView keyboardOpeningTime={0} style={{ flex: 0.88 }}>
                    {
                        Object.keys(this.columns).map(
                            (fieldName, index, arr) =>
                                <ItemInput key={fieldName}
                                    formPath={this.form.path}
                                    parentName={this.parentName}
                                    itemIndex={this.itemIndex}
                                    colName={fieldName}
                                    itemOptions={{
                                        navigation: this.getNavigation(fieldName),
                                        isFirst: index === 0,
                                        isLast: index === arr.length - 1
                                    }}

                                />
                        )
                    }
                </KeyboardAwareScrollView>
            </View >
        );
    }
}

/*********** style ************* */
const styles = StyleSheet.create({
    container:
        {
            backgroundColor: 'white',

        }
});