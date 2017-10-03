import { FormConfig } from "../modules/formConfig.class";
import { Entity } from "../modules/index";

export class FormService
{
    formsConfig: { [key: string]: FormConfig } = {};

     // // ********************************* Forms Config **************************************

    // /** Returns a formConfig object according to the supplied form (in json format) */
    // prepareForm(form: Entity): FormConfig
    // {
    //     let formConfig: FormConfig = {
    //         name: form.name,
    //         searchColumns: [],
    //         subforms: [],
    //         listColumnsOptions: {},
    //         detailsColumnsOptions: {},
    //         parentForm: form.fatname,
    //         pos: form.pos,
    //         activations: {}
    //     };

    //     for (var ind in form.columns)
    //     {
    //         let column = form.columns[ind];
    //         if (column.tabview == 1)
    //         {
    //             formConfig.listColumnsOptions[column.name] = {};
    //             formConfig.listColumnsOptions[column.name].isShow = true;
    //             formConfig.listColumnsOptions[column.name].isShowTitle = true;
    //             formConfig.listColumnsOptions[column.name].pos = column.pos;

    //         }
    //         if (column.lineview == 1)
    //         {
    //             formConfig.detailsColumnsOptions[column.name] = {};
    //             formConfig.detailsColumnsOptions[column.name].isShow = true;
    //             formConfig.detailsColumnsOptions[column.name].isShowTitle = true;
    //             formConfig.detailsColumnsOptions[column.name].pos = column.pos;
    //         }
    //         if (column.special == 'B' || column.barcode == 1)// backward compatibility for barcode
    //         {
    //             formConfig.detailsColumnsOptions[column.name].subtype = "barcode";
    //         }
    //         if (column.special == 'P')
    //         {
    //             formConfig.detailsColumnsOptions[column.name].subtype = "phone";
    //         }
    //         //Treatment searching by date currently not supported will be treated as part of the development of filters
    //         if (column.searchfield == 1 && column.type !== "DATE" && column.type !== "TIME")
    //         {
    //             formConfig.searchColumns.push(column.name);
    //         }
    //     }
    //     return formConfig;
    // }

  

    // /** Returns the formConfig object according to the form name and parent form name */
    // getFormConfig(form, parentForm)
    // {
    //     let key = form.name;
    //     if (parentForm)
    //     {
    //         key = key + parentForm.name;
    //     }
    //     return this.formsConfig[key];
    // }
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
               // let preparedForm = this.prepareForm(form);
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
             //   this.formsConfig[key] = preparedForm;
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
}