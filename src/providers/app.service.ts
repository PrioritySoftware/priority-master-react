// import { FormConfig } from "../entities/form.class";
import { ServerResponse, ServerResponseCode } from '../modules';
import { RootService } from './root.service';



// const AppVersion: string = "app_master_2";
const MasterMessagesEname: string = "MASTERMESSAGES";
const MasterMessagesType: string = "C";


export class AppService
{
    // currentApp: any = {};
    // entitiesData: Entity[];
    // formsConfig: { [key: string]: FormConfig } = {};
    // RowsBatchSize: number = 115;
    // loginExpired: boolean = false;
    // supportCompanySelection: boolean = true;
    // userData: LocalStorageUserData = null;
    // private jsonCompanyDname: string = "";
    // private jsonUrlString: string = "";
    // private reason: ServerResponse = {
    //     message: '',
    //     form: null,
    //     fatal: false,
    //     code: '',
    //     type: ''
    // };
    constructor(private rootService: RootService)
    {

    }
    // *************************************** JSON ********************************************

    /** Initialization */
    initApp(data: string): Promise<any>
    {
       return  new Promise((resolve, reject) =>
        {
            this.rootService.configService.initApp(data)
                .then(userData =>
                {
                    if (userData.userName !== null && userData.password !== null)
                    {
                        // this.logIn(userData.userName, userData.password).then(
                        //     () =>
                        //     {
                        //         resolve(true);
                        //     },
                        //     (reason: ServerResponse) =>
                        //     {
                        //         resolve(false);
                        //     })
                        //     .catch(
                        //     () => resolve(false));
                    }
                    else
                    {
                        resolve(false);
                    }
                })
                .catch(error => { });
        });
    }

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

    // /** Iterates on the form entities in json and initializes the formsConfig object. */
    // initFormsConfig(entities)
    // {
    //     let procedures = [];
    //     let parentForms = {};
    //     this.formsConfig = {};
    //     //loop on entities and add the parent forms to the parentForms object
    //     for (let ind in entities)
    //     {
    //         let entity = entities[ind];
    //         if (entity.type == 'F')
    //         {
    //             let form = entities[ind];
    //             let preparedForm = this.prepareForm(form);
    //             let key = form.name;
    //             if (!parentForms[form.name])
    //                 parentForms[form.name] = [];
    //             if (form.name != form.fatname && form.fatname)
    //             {
    //                 key = key + form.fatname;
    //                 parentForms[form.name].push(form.fatname);
    //             }
    //             else
    //             {
    //                 parentForms[form.name].push("");
    //             }
    //             this.formsConfig[key] = preparedForm;
    //         }
    //         else
    //         {
    //             procedures.push(entity);
    //         }
    //     }
    //     this.initSubformsConfig(parentForms);
    //     this.initProcConfig(parentForms, procedures);
    // }

    // initSubformsConfig(parentForms)
    // {
    //     //loop on forms config and assign subforms to parents
    //     for (let key in this.formsConfig)
    //     {
    //         let formConfig = this.formsConfig[key];
    //         if (formConfig.parentForm !== formConfig.name && formConfig.parentForm !== undefined)
    //         {
    //             if (!parentForms[formConfig.parentForm])
    //                 continue;
    //             for (let grandParentName of parentForms[formConfig.parentForm])
    //             {
    //                 let parentName = formConfig.parentForm + grandParentName;
    //                 let parentForm = this.formsConfig[parentName];
    //                 if (parentForm !== undefined)
    //                 {
    //                     parentForm.subforms.push(formConfig.name);
    //                 }
    //             }
    //         }
    //     }
    // }

    // initProcConfig(parentForms, procedures: Entity[])
    // {
    //     //sorts the procedures array so that procedures that have lower position will be first.
    //     procedures = procedures.sort((ent1, ent2) => ent1.pos - ent2.pos);

    //     //loops over all procedures to determine which of them is a direct activation of one of the forms in formsConfig.
    //     for (let proc of procedures)
    //     {
    //         if (!parentForms[proc.fatname])
    //             continue;
    //         for (let grandParentName of parentForms[proc.fatname])
    //         {
    //             let parentName = proc.fatname + grandParentName;
    //             let parentForm = this.formsConfig[parentName];
    //             if (parentForm !== undefined)
    //             {
    //                 parentForm.activations[proc.name] =
    //                     {
    //                         title: proc.title,
    //                         type: proc.type,
    //                         name: proc.name
    //                     };
    //             }
    //         }
    //     }
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


    // // ********************************* Apps **************************************

    // setApp(appTitle: string, jsonUrl: string)
    // {
    //     let app;
    //     for (var ind in this.userData.applist)
    //     {
    //         if (this.userData.applist[ind].jsonUrl == jsonUrl)
    //         {
    //             app = this.userData.applist[ind];
    //             this.userData.applist[ind].title = appTitle;
    //         }
    //     }
    //     if (app === undefined)//if this app does not exist in apps list add it to the list
    //     {
    //         app = {
    //             title: appTitle,
    //             jsonUrl: jsonUrl
    //         }
    //         this.userData.applist.push(app);
    //     }
    //     this.currentApp = app;
    // }

    // clearCurrentApp()
    // {
    //     this.userData.jsonUrl = null;
    //     this.setLocalUserData();
    // }

    // deleteApp(app)
    // {
    //     var index = this.userData.applist.indexOf(app);
    //     this.userData.applist.splice(index, 1);
    //     this.setLocalUserData();
    // }

    // // ********************************* Login **************************************

    // // /** Clear the values of username and password saved in local storage */
    // clearLogin()
    // {
    //     this.loginExpired = false;
    //     this.userData.userName = null;
    //     this.userData.password = null;
    //     this.setLocalUserData();
    // }

  

    // changePassword(newPwd, confirmNewPwd, oldPwd): Promise<any>
    // {
    //     return new Promise((resolve, reject) =>
    //     {
    //         this.configService.changePassword(newPwd, confirmNewPwd, oldPwd).then(
    //             (res: string) =>
    //             {
    //                 resolve(res);
    //             },
    //             (reason: ServerResponse) =>
    //             {
    //                 reject(reason);
    //             });
    //     });
    // }


    // /********* Profiles  **********************/
    // setProfileConfig(profile: ProfileConfig, companyName: string, groupName: string)
    // {
    //     this.configService.setProfileConfiguration(profile);
    //     this.userData.profile = profile;
    //     this.userData.companyName = companyName;
    //     this.userData.groupName = groupName;
    //     this.setLocalUserData();
    // }

    // getCompanies(): Promise<any>
    // {
    //     return new Promise((resolve, reject) =>
    //     {
    //         this.configService.getCompanies()
    //             .then(
    //             (companies: Company[]) =>
    //             {
    //                 resolve(companies);
    //             },
    //             (reason: ServerResponse) =>
    //             {
    //                 if (reason.code === ServerResponseCode.NotSupport)
    //                 {
    //                     this.supportCompanySelection = false;
    //                 }
    //                 reject(reason);
    //             }
    //             ).catch((reason) => { reject(reason) });
    //     });
    // }

    // setProfile(companies: Company[])
    // {
    //     let storageCompany: string = this.userData.profile.company;
    //     let storageGroup: number = this.userData.profile.group;
    //     this.userData.companyName = null;
    //     this.userData.groupName = null;
    //     this.userData.profile.company = this.jsonCompanyDname;
    //     this.userData.profile.group = 0;
    //     let company: Company = null;
    //     let companyFilter: Company[] = companies.filter(comp => comp.dname === storageCompany);
    //     if (companyFilter.length)
    //     {
    //         company = companyFilter[0];
    //     }
    //     else //company in storage isn't in companues list 
    //     {
    //         companyFilter = companies.filter(comp => comp.dname === this.jsonCompanyDname);
    //         if (companyFilter.length)
    //         {
    //             company = companyFilter[0];
    //         }
    //     }
    //     if (company) 
    //     {
    //         this.userData.profile.company = company.dname;
    //         this.userData.companyName = company.title;

    //         //profiles
    //         if (company.EnvProfile)
    //         {
    //             let envProfile: EnvProfile = null;
    //             if (storageGroup > 0)
    //             {
    //                 let envProfileFilter: EnvProfile[];
    //                 envProfileFilter = company.EnvProfile.filter(prof => prof.profile === storageGroup);
    //                 if (envProfileFilter.length)
    //                 {
    //                     envProfile = envProfileFilter[0];
    //                 }
    //             }

    //             if (!envProfile)
    //             {
    //                 envProfile = company.EnvProfile[0];
    //             }

    //             this.userData.profile.group = envProfile.profile;
    //             this.userData.groupName = envProfile.profilename;
    //         }
    //     }
    // }

    

    // /*  Monitor server */
    // contactMonitorServer(action: string, form: string)
    // {
    //     let url: string = "https://monitor.priority-software.com/monitor/b.aspx"
    //         + "?u=" + encodeURI(this.userData.userName)
    //         + "&t=" + encodeURI(action)
    //         + "&f=" + encodeURI(form)
    //         + "&d=" + ""
    //         + "&e=" + ""
    //         + "&f=" + ""
    //         + "&c=" + ""
    //         + "&s=" + ""
    //         + "&m=" + ""
    //         + "&v=" + encodeURI(AppVersion);

    //     this.http.get(encodeURI(url)).subscribe();
    // }
    // /*************************** Passwords **********************/

    // /**
    //  * Returns a link to a page where he user can restore his password.
    //  * 
    //  * @returns 
    //  * @memberof AppService
    //  */
    // getForgotPasswordURL()
    // {
    //     let configuration = this.configService.configuration;
    //     return this.jsonUrlString + "/priority/prihtml.dll?WWWCHPWD&_tabulaini=" + configuration.tabulaini;
    // }

}