import React,{ Component } from 'react';
import
{
    StyleSheet,
    View,
} from 'react-native';
import { Strings, Form } from '../modules';
import { colors, container, } from '../styles/common';
import { FormService } from '../providers/form.service';
import { HeaderComp } from '../components/header';
import { Pages } from './index';
import {  inject } from 'mobx-react';
import { FormList } from '../components/formList.comp';

@inject("formService", "strings")
export class ListPage extends Component<any, any>
{
    static navigationOptions = { header: null };

    formService: FormService;
    strings: Strings;

    formName: string;
    formTitle: string;

    constructor(props)
    {
        super(props);
        this.formService = this.props.formService;
        this.strings = this.props.strings;

        // props
        this.formName = this.props.navigation.state.params.formName;
        this.formTitle = this.props.navigation.state.params.formTitle;
    }

    goBack()
    {
        this.props.navigation.goBack();
    }
    editRow = (form: Form, rowTitle: string, rowIndex: number) =>
    {
        this.formService.setActiveRow(form, rowIndex).catch(() => { });

        this.props.navigation.navigate(Pages.Details.name,
            {
                title: rowTitle,
                itemIndex: rowIndex,
                formPath: form.path,
            });
    }
    /********* rendering functions *********/
    render()
    {
        return (
            <View style={container}>
                <HeaderComp title={this.formTitle} goBack={() => this.goBack()} />
                <FormList
                    formName={this.formName}
                    editRow={this.editRow}
                />
            </View >
        );
    }
}