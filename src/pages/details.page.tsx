import React from 'react';
import
{
    StyleSheet,
    View,
} from 'react-native';
import { Strings, Form } from '../modules';
import { ConfigService } from '../providers/config.service';
import { container } from '../styles/common';
import { MessageHandler } from '../components/message.handler';
import { FormService } from '../providers/form.service';
import { HeaderComp } from '../components/header';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { ColumnOptions } from '../modules/columnOptions.class';
import { ItemInput } from '../components/itemInput';
import { observer, inject } from 'mobx-react';

@inject("formService", "configService", "messageHandler", "strings")
@observer
export class DetailsPage extends React.Component<any, any>
{
    static navigationOptions = { header: null }

    configService: ConfigService;
    formService: FormService;
    strings: Strings;
    messageHandler: MessageHandler;

    // Props
    title: string;
    form: Form;
    parentForm;

    itemIndex: number;
    item:Object;

    constructor(props)
    {
        super(props);
        this.configService = this.props.configService;
        this.formService = this.props.formService;
        this.messageHandler = this.props.messageHandler;
        this.strings = this.props.strings;

        this.title = this.props.navigation.state.params.title;
        this.form = this.formService.getForm(this.props.navigation.state.params.formPath);
        this.itemIndex = this.props.navigation.state.params.itemIndex;
        this.item = this.formService.getFormRow(this.form, this.itemIndex);
        this.parentForm = { name: this.props.navigation.state.params.parentName };
    }
    goBack()
    {
        this.props.navigation.goBack();
    }
    updateField(colName: string, newValue: string)
    {
        let oldValue = this.item[colName];
        this.formService.updateField(this.form, this.itemIndex, colName, newValue)
            .then(result => { })
            .catch(error =>
            {
                this.formService.updateField(this.form, this.itemIndex, colName, oldValue).catch(() => { });
            });
    }
    render() 
    {
        let columns: ColumnOptions = this.formService.getFormConfig(this.form, this.parentForm).detailsColumnsOptions;
        return (
            <View style={[container, styles.container]}>
                <HeaderComp title={this.title} goBack={() => this.goBack()} />
                <KeyboardAwareScrollView style={styles.inputContainer} keyboardOpeningTime={0}>
                    {
                        Object.keys(columns).map(fieldName =>
                            <ItemInput key={fieldName}
                                value={this.item[fieldName]}
                                onUpdate={newVal => this.updateField(fieldName, newVal)}
                                form={this.form}
                                colName={fieldName}
                                direction={this.strings.sideByLang}
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
            backgroundColor: 'white'
        },
    inputContainer:
        {

        },
});