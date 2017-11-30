import { FormConfig } from "../modules/formConfig.class";
import { Entity } from "../modules/index";
import { MessageHandler } from "../components/message.handler";
import { Strings } from "../modules/strings";
import { ProfileConfig } from "../modules/profileConfig.class";
import { ServerResponse } from "../modules/srvResponse.class";
import { Form } from "../modules/form.class";
import { ServerResponseCode } from "../modules/srvResponseCode.class";
import { MessageOptions } from "../modules/messageOptions.class";
import { ServerResponseType } from "../modules/srvResponseType.class";
import { Filter } from "../modules/filter.class";
import { observable } from 'mobx';
import { ObservableMap } from "mobx/lib/types/observablemap";
import { SearchAction } from "../modules/searchAction.class";
import { Search } from "../modules/search.class";

export class FormService
{
    formsConfig: { [key: string]: FormConfig } = {};
    onFatalError;
    private forms: { [key: string]: Form };
    RowsBatchSize: number = 115;

    constructor(private messageHandler: MessageHandler, private priorityService, private strings: Strings)
    {
        this.forms = {};
    }

    // ****** Forms Config ******

    /** Returns a formConfig object according to the supplied form (in json format) */
    prepareForm(form: Entity): FormConfig
    {
        let formConfig: FormConfig = {
            name: form.name,
            searchColumns: [],
            subforms: [],
            listColumnsOptions: {},
            detailsColumnsOptions: {},
            parentForm: form.fatname,
            pos: form.pos,
            activations: {}
        };
        for (let colInd in form.columns)
        {
            if (form.columns.hasOwnProperty(colInd))
            {
                let column = form.columns[colInd];
                if (column.tabview === 1)
                {
                    formConfig.listColumnsOptions[column.name] = {};
                    formConfig.listColumnsOptions[column.name].isShow = true;
                    formConfig.listColumnsOptions[column.name].isShowTitle = true;
                    formConfig.listColumnsOptions[column.name].pos = column.pos;

                }
                if (column.lineview === 1)
                {
                    formConfig.detailsColumnsOptions[column.name] = {};
                    formConfig.detailsColumnsOptions[column.name].isShow = true;
                    formConfig.detailsColumnsOptions[column.name].isShowTitle = true;
                    formConfig.detailsColumnsOptions[column.name].pos = column.pos;
                    if (column.special === 'B' || column.barcode === 1)// backward compatibility for barcode
                    {
                        formConfig.detailsColumnsOptions[column.name].subtype = "barcode";
                    }
                    if (column.special === 'P')
                    {
                        formConfig.detailsColumnsOptions[column.name].subtype = "phone";
                    }
                }

                // Treatment searching by date currently not supported will be treated as part of the development of filters
                if (column.searchfield === 1 && column.type !== "DATE" && column.type !== "TIME")
                {
                    formConfig.searchColumns.push(column.name);
                }
            }
        }
        return formConfig;
    }

    /** Returns the formConfig object according to the form name and parent form name */
    getFormConfig(form, parentForm)
    {
        let key = form.name;
        if (parentForm)
        {
            key = key + parentForm.name;
        }
        return this.formsConfig[key];
    }
    /** Iterates on the form entities in json and initializes the formsConfig object. */
    initFormsConfig(entities)
    {
        let procedures = [];
        let parentForms = {};
        this.formsConfig = {};
        // loop on entities and add the parent forms to the parentForms object
        for (let entity of entities)
        {
            if (entity.type === 'F')
            {
                let form = entity;
                let preparedForm = this.prepareForm(form);
                let key = form.name;
                if (!parentForms[form.name])
                    parentForms[form.name] = [];
                if (form.name !== form.fatname && form.fatname)
                {
                    key = key + form.fatname;
                    parentForms[form.name].push(form.fatname);
                }
                else
                {
                    parentForms[form.name].push("");
                }
                this.formsConfig[key] = preparedForm;
            }
            else
            {
                procedures.push(entity);
            }
        }
        this.initSubformsConfig(parentForms);
        this.initProcConfig(parentForms, procedures);
    }

    initSubformsConfig(parentForms)
    {
        // loop on forms config and assign subforms to parents
        for (let key in this.formsConfig)
        {
            if (this.formsConfig.hasOwnProperty(key))
            {
                let formConfig = this.formsConfig[key];
                if (formConfig.parentForm !== formConfig.name && formConfig.parentForm !== undefined)
                {
                    if (!parentForms[formConfig.parentForm])
                        continue;
                    for (let grandParentName of parentForms[formConfig.parentForm])
                    {
                        let parentName = formConfig.parentForm + grandParentName;
                        let parentForm = this.formsConfig[parentName];
                        if (parentForm !== undefined)
                        {
                            parentForm.subforms.push(formConfig.name);
                        }
                    }
                }
            }
        }
    }

    initProcConfig(parentForms, procedures: Entity[])
    {
        // sorts the procedures array so that procedures that have lower position will be first.
        procedures = procedures.sort((ent1, ent2) => ent1.pos - ent2.pos);

        // loops over all procedures to determine which of them is a direct activation of one of the forms in formsConfig.
        for (let proc of procedures)
        {
            if (!parentForms[proc.fatname])
                continue;
            for (let grandParentName of parentForms[proc.fatname])
            {
                let parentName = proc.fatname + grandParentName;
                let parentForm = this.formsConfig[parentName];
                if (parentForm !== undefined)
                {
                    parentForm.activations[proc.name] =
                        {
                            title: proc.title,
                            type: proc.type,
                            name: proc.name
                        };
                }
            }
        }
    }

    // ****** General ******

    /** Handles API rejections. If the rejection reason is a fatal error, calls 'onFatalError' else calls 'reject'. */
    rejectionHandler(reason: ServerResponse, reject)
    {
        if (reason.fatal && this.onFatalError !== undefined)
        {
            this.onFatalError();
            reject(reason);
            return;
        }
        reject(reason);
    }
    cancelWarn = (form: Form) =>
    {
        form.warningConfirm(0);
    }
    approveWarn = (form: Form) =>
    {
        form.warningConfirm(1);
    }
    /** Global error and warning handler passed to api with formStart. */
    errorAndWarningMsgHandler = (serverMsg: ServerResponse) =>
    {
        if (serverMsg.code === ServerResponseCode.FailedPreviousRequest)
        {
            return;
        }
        let isError;
        let options: MessageOptions = {};
        if (serverMsg.fatal)
        {
            // If the error is a fatal error adds strings.fatalErrorMsg to the message.
            this.messageHandler.showErrorOrWarning(true, this.strings.fatalErrorMsg + "\n" + serverMsg.message);
            return;
        }
        if (serverMsg.code === ServerResponseCode.ReadWrite)
        {
            // Sets buttons text for a text-form message.
            options.buttonsText = new Array();
            options.buttonsText.push(this.strings.approveReadOnly);
            options.buttonsText.push(this.strings.approveEditText);
        }

        // Sets is'Error' and message title.
        if (serverMsg.type === ServerResponseType.Error || serverMsg.type === ServerResponseType.APIError || serverMsg.code === ServerResponseCode.Stop)
        {
            isError = true;
            options.title = serverMsg.code === ServerResponseCode.Information ? this.strings.defaultMsgTitle : this.strings.errorTitle;
        }
        else
        {
            isError = false;
            options.title = this.strings.warningTitle;
        }
        if (serverMsg.code === ServerResponseCode.Stop)
        {
            this.messageHandler.showErrorOrWarning(isError, serverMsg.message)
            return;
        }
        this.messageHandler.showErrorOrWarning(isError, serverMsg.message,
            () =>
            {
                this.approveWarn(serverMsg.form);
            },
            () =>
            {
                this.cancelWarn(serverMsg.form);
            },
            options);
    }

    /** Global callback for all forms,rows,fileds updates returned from api - passed to api with formStart */
    updateFormsData = (result, parentForm: Form) =>
    {
        // loop on all formname in the result object
        for (let formName in result)
        {
            if (result.hasOwnProperty(formName))
            {
                // retrieve the current form 
                let parentFormPath = parentForm ? parentForm.path : '';
                let formToSearch = formName;
                // when the form is a parent form 'parentFormPath' is equal to 'formName'.
                if (parentFormPath !== formName)
                    formToSearch = formName + parentFormPath;
                let form = this.getForm(formToSearch);

                if (parentFormPath !== undefined && form !== undefined && form.rows !== undefined)
                {
                    // loop on rows for form in result object
                    for (let rowInd in result[formName])
                    {
                        if (result[formName].hasOwnProperty(rowInd))
                        {
                            let row = this.getFormRow(form, rowInd);
                            let newRow = result[formName][rowInd];
                            if (row !== undefined)
                                row.merge(newRow);
                        }
                    }
                }
            }
        }
    }

    // ****** Form start and end ******

    public getForm(formName: string): Form
    {
        return this.forms[formName];
    }
    deleLocalForm(formPath: string)
    {
        delete this.forms[formPath];
    }
    /** Sets a form returned from formStart in the forms object by it's name */
    private mergeForm(form: Form, parentForm: Form = null)
    {
        let localform;
        let parentPath = parentForm ? parentForm.path : '';
        let formName = form.name + parentPath;

        localform = this.forms[formName];
        // set form in forms - first time no need to merge
        if (localform === undefined)
        {
            form.path = formName;
            form.rows = observable.map();
            this.forms[formName] = form;
        }
        // merge local form and form and set in forms
        else
        {
            // merge form with local form
            this.forms[formName] = Object.assign(localform, form);
        }
    }
    /** Starts parent form. */
    startParentForm(formName: string, profileConfig: ProfileConfig, autoRetriveFirstRows?: number, errorAndWarningHandler = null, updateFormsDataHandler = null): Promise<any>
    {
        return new Promise((resolve, reject) =>
        {
            errorAndWarningHandler = errorAndWarningHandler ? errorAndWarningHandler : this.errorAndWarningMsgHandler;
            updateFormsDataHandler = updateFormsDataHandler ? updateFormsDataHandler : this.updateFormsData;
            this.priorityService.formStart(formName, errorAndWarningHandler, updateFormsDataHandler, profileConfig, autoRetriveFirstRows).then(
                (form: Form) =>
                {
                    this.mergeForm(form);
                    resolve(this.getForm(form.name));
                },
                (reason: ServerResponse) =>
                {
                    this.rejectionHandler(reason, reject);

                });
        });
    }
    /** Starts parent form and retrieves its rows. */
    startFormAndGetRows(formName: string, profileConfig, autoRetriveFirstRows?: number): Promise<any>
    {
        return new Promise((resolve, reject) =>
        {
            this.startParentForm(formName, profileConfig, autoRetriveFirstRows).then(
                form =>
                {
                    this.getRows(form, 1).then(
                        rows =>
                        {
                            resolve(form);
                        },
                        (reason: ServerResponse) =>
                        {
                            this.rejectionHandler(reason, reject);
                        });

                },
                (reason: ServerResponse) =>
                {
                    reject(reason);
                });
        });
    }
    /** Starts parent form and retrieves its rows according to the given filter if there is one. */
    startFormAndGetRowsWithFilter(formName: string, profileConfig, filter: Filter = null, autoRetriveFirstRows?: number): Promise<any>
    {
        return new Promise((resolve, reject) =>
        {
            this.startParentForm(formName, profileConfig, autoRetriveFirstRows).then(
                form =>
                {
                    this.setSearchFilter(form, filter).then(
                        res =>
                        {
                            this.getRowsAndReplace(form).then(
                                rows =>
                                {
                                    resolve(form);
                                },
                                (reason: ServerResponse) =>
                                {
                                    this.rejectionHandler(reason, reject);
                                });
                        },
                        (reason: ServerResponse) =>
                        {
                            this.rejectionHandler(reason, reject);
                        });
                },
                (reason: ServerResponse) =>
                {
                    this.rejectionHandler(reason, reject);
                });
        });
    }
    /** Ends from. */
    endForm(form: Form): Promise<any>
    {
        return new Promise((resolve, reject) =>
        {
            form.endCurrentForm().then(
                () =>
                {
                    resolve();
                },
                (reason: ServerResponse) =>
                {
                    this.rejectionHandler(reason, reject);
                });
        });
    }

    // ****** Form Rows ******
    public getLocalRows(form: Form): ObservableMap<any>
    {
        return form.rows;
    }
    public setLocalRows(form: Form, rows: any, isMerge: boolean)
    {
        if (!isMerge)
            form.rows.clear();
        let newRows = observable.map();
        Object.keys(rows).map((rowNum, index, arr) =>
        {
            let row = observable.map(rows[rowNum]);
            newRows.set(rowNum, row);
        });
        form.rows.merge(newRows);
    }
    public clearLocalRows(form)
    {
        form.rows.clear();
    }
    /** Returns items of selected entity, starting from a wanted row according to a filter */
    getRows(form: Form, fromRow: number, isMerge: boolean = true): Promise<any>
    {
        return new Promise((resolve, reject) =>
        {
            form.getRows(fromRow).then(
                result =>
                {
                    this.setLocalRows(form, result[form.name], isMerge);
                    resolve(result[form.name]);
                },
                (reason: ServerResponse) =>
                {
                    this.rejectionHandler(reason, reject);
                });
        });
    }
    /** Clears rows of a given form and then retrieves new ones. */
    getRowsAndReplace(form: Form): Promise<any>
    {
        return new Promise((resolve, reject) =>
        {
            this.clearRows(form).then(
                result =>
                {
                    this.getRows(form, 1).then(
                        rows => { resolve(); },
                        (reason: ServerResponse) =>
                        {
                            this.rejectionHandler(reason, reject);
                        });
                },
                (reason: ServerResponse) =>
                {
                    this.rejectionHandler(reason, reject);
                });
        });
    }
    /** Clears rows of a given form. */
    clearRows(form: Form): Promise<any>
    {
        return new Promise((resolve, reject) =>
        {
            form.clearRows().then(
                result =>
                {

                    this.clearLocalRows(form);
                    resolve();
                },
                (reason: ServerResponse) =>
                {
                    this.rejectionHandler(reason, reject);
                });
        });
    }
    /** Delets a list row with the given index. */
    deleteListRow(form: Form, rowInd): Promise<any>
    {
        return new Promise((resolve, reject) =>
        {
            this.setActiveRow(form, rowInd).then(
                res =>
                {
                    this.deleteRow(form).then(
                        delres =>
                        {
                            resolve(delres);
                        },
                        (reason: ServerResponse) => { this.rejectionHandler(reason, reject); });
                },
                (reason: ServerResponse) => { this.rejectionHandler(reason, reject); });
        });
    }

    // ***** Filter ******

    /** Clears search filter for the current form */
    clearSearchFilter(form: Form): Promise<any>
    {
        return new Promise((resolve, reject) =>
        {
            form.clearSearchFilter().then(
                () =>
                {

                    resolve();
                },
                (reason: ServerResponse) =>
                {
                    this.rejectionHandler(reason, reject);

                });
        });
    }

    /** Sets search filter for rows retrievel */
    setSearchFilter(form: Form, filter: Filter)
    {
        return new Promise((resolve, reject) =>
        {
            form.setSearchFilter(filter).then(
                () =>
                {

                    resolve();
                },
                (reason: ServerResponse) =>
                {
                    this.rejectionHandler(reason, reject);

                });
        });
    }

    // ****** Form Row ******
    public getFormRow(form: Form, rowInd)
    {
        return form.rows.get(rowInd);
    }
    public setIsRowChangesSaved(form: Form, rowInd, isSaved: boolean)
    {
        form.rows.get(rowInd).set(this.strings.isChangesSaved, isSaved);
    }
    public getIsRowChangesSaved(form: Form, rowInd)
    {
        if (form.rows.get(rowInd) === undefined)
        {
            return true;
        }
        return form.rows.get(rowInd).get(this.strings.isChangesSaved);
    }
    private addFormRow(form: Form, newRowInd)
    {
        form.rows.set(newRowInd, observable.map({ isNewRow: true }));
    }
    public getIsNewRow(form: Form, rowInd)
    {
        return form.rows.get(rowInd)[this.strings.isNewRow];
    }
    private setNotNewRow(form: Form, rowInd)
    {
        form.rows.get(rowInd).delete(this.strings.isNewRow);
    }
    public deleteLastFormRow(form: Form)
    {
        let lastInd = form.rows.size;
        this.deleteLocalRow(form, lastInd);
    }
    private deleteLocalRow(form: Form, rowInd)
    {
        form.rows.delete(rowInd);
    }
    /** Sets the selected items row */
    setActiveRow(form: Form, rowInd): Promise<any>
    {
        return new Promise((resolve, reject) =>
        {
            if (!rowInd)
            {
                reject({
                    form: form,
                    message: "rowInd is undefined!",
                    type: "apiError"
                });
                return;
            }
            form.setActiveRow(rowInd).then(
                result =>
                {

                    resolve(this.getFormRow(form, rowInd));
                },
                (reason: ServerResponse) =>
                {
                    this.rejectionHandler(reason, reject);
                });
        });
    }
    /** Updates fields values after the current field lost focus, according to data returned from the server */
    updateField(form: Form, rowInd: number, columnName: string, newValue): Promise<any>
    {
        return new Promise((resolve, reject) =>
        {
            if (newValue == null || columnName == null)
            {
                resolve();
                return;
            }
            if (!rowInd)
            {
                reject({

                    form: form,
                    message: "No rowIndex.",
                    fatal: true
                });
                return;
            }
            this.setIsRowChangesSaved(form, rowInd, false);
            form.fieldUpdate(columnName, newValue).then(
                result =>
                {
                    resolve();
                },
                (reason: ServerResponse) =>
                {
                    this.rejectionHandler(reason, reject);
                });
        });
    }
    /** Saves changes made in the current row */
    saveRow(form: Form, rowInd, isBackToPrevForm: number = 0): Promise<any>
    {
        return new Promise((resolve, reject) =>
        {
            form.saveRow(isBackToPrevForm).then(
                result =>
                {
                    this.setIsRowChangesSaved(form, rowInd, true);
                    this.setNotNewRow(form, rowInd);

                    resolve();
                },
                (reason: ServerResponse) =>
                {
                    this.rejectionHandler(reason, reject);
                });
        });
    }
    /** Undoes changes made in the current row */
    undoRow(form: Form): Promise<any>
    {
        return new Promise((resolve, reject) =>
        {
            form.undo().then(
                result =>
                {
                    resolve();
                },
                (reason: ServerResponse) =>
                {
                    this.rejectionHandler(reason, reject);
                });
        });
    }
    /** Creats a new row and adds it to the given form. */
    newRow(form: Form): Promise<any>
    {
        return new Promise((resolve, reject) =>
        {
            form.newRow().then(
                (newRow) =>
                {
                    // maybe format should be changed in api
                    let newRowInd = newRow.rowindex;
                    this.addFormRow(form, newRowInd);
                    resolve(newRowInd);
                },
                (reason: ServerResponse) =>
                {
                    this.rejectionHandler(reason, reject);
                });
        });
    }
    /** Delets the current row from the given form. */
    deleteRow(form: Form): Promise<any>
    {
        return new Promise((resolve, reject) =>
        {
            form.delRow().then(
                result =>
                {
                    // 'rowIndex' is the index of the last row which was already deleted in 'updateFormsData'.
                    //  Here we just need to update the local rows object.
                    if (result && result.rowindex)
                    {
                        let rowInd = result.rowindex;
                        this.deleteLocalRow(form, rowInd.toString());
                    }
                    resolve();
                },
                (reason: ServerResponse) =>
                {
                    this.rejectionHandler(reason, reject);
                });
        });
    }

    // ******  Search and Choose ******

    /* Opens a Search or a Choose list according to the current field.
    * If there was a value in the fileld the returned list will contain results matching this value.
    * Active row must be set before opening Search or Choose!!!
    */
    openSearchOrChoose(form: Form, colName, fieldVal): Promise<any>
    {

        return new Promise((resolve, reject) =>
        {
            form.choose(colName, fieldVal).then(
                (result: Search) =>
                {
                    resolve(result);
                },
                (reason: ServerResponse) =>
                {
                    this.rejectionHandler(reason, reject);
                });
        });

    }
    /* Returns search result for the given value. Default action is SearchAction.TextChange = 4.*/
    search(form: Form, val, action: number = SearchAction.TextChange): Promise<Search>
    {
        return new Promise((resolve, reject) =>
        {
            form.searchAction(action, val).then(
                result =>
                {
                    resolve(result);
                },
                (reason: ServerResponse) =>
                {
                    this.rejectionHandler(reason, reject);
                });
        });
    }
}