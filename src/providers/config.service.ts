import { Strings, ServerResponse, Entity, LocalStorageUserData, Configuration } from '../modules';
import { RootService,StorageService } from '.';

// const LocalJsonUrl: string = "assets/js/pridata.json";
export class ConfigService
{
    strings: Strings;
    config: Configuration;

    storage: StorageService;
    priorityService;
    // currentApp: any = {};
    entitiesData: Entity[];
    // formsConfig: { [key: string]: FormConfig } = {};
    // RowsBatchSize: number = 115;
    // loginExpired: boolean = false;
    // supportCompanySelection: boolean = true;
    private jsonCompanyDname: string = "";
    private jsonUrlString: string = "";
    private reason: ServerResponse;

    constructor(private rootService: RootService)
    {
        this.strings = this.rootService.strings;
        this.storage = this.rootService.storageService;
        this.priorityService = this.rootService.priorityService;
        this.reason = {
            message: '',
            form: null,
            fatal: false,
            code: '',
            type: ''
        };
    }
    /*************** Load data from a url that is taken from the qrcode or from local data *************/
    initApp(jsonUrl: string): Promise<any>
    {
        return new Promise((resolve, reject) =>
        {
            let request = new XMLHttpRequest();
            request.onreadystatechange = () =>
            {
                if (request.readyState === 4)
                {
                    if (request.status === 200)
                    {
                        this.readJson(request.responseText, jsonUrl).then(
                            () =>
                            {
                                resolve();
                            },
                            () =>
                            {
                                this.reason.message = this.strings.failedToReadJsonError;
                                reject(this.reason);
                            });
                    }
                    else if (request.status === 0 && request.responseText==='')
                    {
                        this.reason.message = this.strings.certificateProblem;
                        reject(this.reason);
                    }
                    else
                    {
                        this.reason.message = this.strings.failedToLoadJsonError;
                        reject(this.reason);
                    }
                }
            };
            request.open("GET", jsonUrl + "?_t=" + new Date().getTime(), true);
            request.send(null);
        });
    }

    // We need to check the url to wcf service provided by the json
    // Because sometimes there are extra subfolders in the url
    // So we try to connect and if fails - we remove a subfolder, until connetion is ok.
    checkUrl(serverUrl: string): Promise<string>
    {
        return new Promise((resolve, reject) =>
        {
            fetch(serverUrl + '/wcf/wcf/service.svc', { method: 'HEAD' })
                .then(response =>
                {
                    if (response.status === 400)
                        resolve(serverUrl);
                    else
                    {
                        if (serverUrl.match(/\/(\w|\d)+$/) !== null) // there is a subfolder to remove
                        {
                            let url = serverUrl.replace(/\/(\w|\d)+$/, ''); // remove it and check again
                            this.checkUrl(url).then(
                                resurl =>
                                {
                                    resolve(resurl);
                                },
                                () =>
                                {
                                    reject();
                                });
                        }
                        else
                        {
                            reject();
                        }
                    }
                })
                .catch(error =>
                {
                    reject();
                });

        });
    }
    /** Reads the json file and sets the configuration settings and entities */
    readJson(jsonString, jsonUrl): Promise<any>
    {
        return new Promise((resolve, reject) =>
        {
            try
            {
                let json = JSON.parse(jsonString);
                this.jsonUrlString = json.url;
                // update storage
                if (this.storage.userData.jsonUrl !== jsonUrl)
                {
                    this.storage.userData.jsonUrl = jsonUrl;
                    this.storage.storetUserData();
                }
                this.checkUrl(json.url).then(
                    (url) =>
                    {
                        this.jsonCompanyDname = json.dname;
                        if (this.storage.userData.companyName === null) // First time or in selecting apps without support for companies selection
                        {
                            this.storage.userData.profile.company = json.dname;
                        }
                        this.config = {
                            appname: json.appname,
                            url: url,
                            profileConfig: this.storage.userData.profile,
                            language: json.lang,
                            tabulaini: json.tabulaini,
                            devicename: ''// this.device.uuid
                        }
                        // this.setApp(json.appdes, jsonUrl);
                        try
                        {
                            this.entitiesData = json.forms_data;
                            // this.initFormsConfig(this.entitiesData);
                        }
                        catch (err)
                        {
                            reject();
                        }
                        if (this.config.language === 1)
                        {

                            this.strings.setRtlConstants();
                            this.strings.setFirstRtlConstants();
                        }
                        else
                        {
                            this.strings.setLtrConstants();
                            this.strings.setFirstLtrConstants();
                        }
                        resolve();
                    },
                    () =>
                    {
                        reject();
                    });
            }
            catch (err)
            {
                reject();
            }
        });
    }
    /********* Local data********** */
    loadConfigData()
    {
        return new Promise((resolve, reject) =>
        {
            this.getLocalUserData()
                .then(() =>
                {
                    if (this.storage.userData.jsonUrl)
                    {
                        return this.initApp(this.storage.userData.jsonUrl);
                    }
                    this.reason.message = this.strings.failedToLoadJsonError;
                    reject(this.reason);
                })
                .then(() => resolve(this.storage.userData))
                .catch(() =>
                {
                    this.reason.message = this.strings.failedToLoadJsonError;
                    reject(this.reason);
                });
        });
    }
    getLocalUserData(): Promise<any>
    {
        return new Promise((resolve, reject) =>
        {

            if (this.storage.userData)
            {
                resolve();
                return;
            }

            this.storage.getUserData()
                .then((storageData: LocalStorageUserData) =>
                {
                    resolve();
                })
                .catch(() =>
                {
                    this.storage.userData = {
                        jsonUrl: null,
                        applist: [],
                        userName: null,
                        password: null,
                        companyName: null,
                        groupName: null,
                        notShowSaveMessage: false,
                        profile: { company: null, group: 0 }
                    }
                    reject();
                });
        });
    }
    /****** Login *************/
    login(username: string, password: string): Promise<any>
    {
        return new Promise((resolve, reject) =>
        {
            this.config.username = username;
            this.config.password = password;
            this.priorityService.login(this.config).then(
                () =>
                {
                    // save username and password in local storage
                    this.storage.userData.userName = username;
                    this.storage.userData.password = password;
                    this.storage.storetUserData();
                    resolve();
                    // this.messagesService.setMessages(MasterMessagesEname, MasterMessagesType, 1, 1000);
                    // if (this.supportCompanySelection)
                    // {
                    //     this.getCompanies().then(
                    //         (companies: Company[]) =>
                    //         {
                    //             if (companies)
                    //             {
                    //                 this.setProfile(companies);
                    //                 this.setLocalUserData();
                    //                 resolve();
                    //             }
                    //             else
                    //             {
                    //                 this.reason.message = this.messagesService.getMessage(MasterMessagesEname, MasterMessagesType, 3);
                    //                 reject(this.reason);
                    //             }

                    //         },
                    //         (reason) =>
                    //         {
                    //             this.setLocalUserData();
                    //             resolve();
                    //         }
                    //     );
                    // }
                    // else
                    // {
                    //     this.setLocalUserData();
                    //     resolve();
                    // }
                },
                (reason: ServerResponse) =>
                {
                    // this.loginExpired = (reason.code === ServerResponseCode.LoginExpired);
                    reject(reason);
                });
        });
    }
    /* Checks if there is a local json file */
    // localJsonExists(): Promise<any>
    // {
    //     return new Promise((resolve, reject) =>
    //     {
    //         let request = new XMLHttpRequest();
    //         request.onreadystatechange = () =>
    //         {
    //             if (request.readyState === 4)
    //             {
    //                 if (request.status === 200)
    //                 {
    //                     resolve();
    //                 }
    //                 else
    //                 {
    //                     reject();
    //                 }
    //             }
    //         };
    //         request.open('HEAD', LocalJsonUrl, false);
    //         request.send();
    //     });
    // }
    // /* Retrives the json url from local storage */
    // jsonUrl(): Promise<any>
    // {
    //     return new Promise((resolve, reject) =>
    //     {
    //         this.getLocalUserData().then(
    //             () =>
    //             {
    //                 this.localJsonExists().then(
    //                     (exists) =>
    //                     {
    //                         resolve(LocalJsonUrl);
    //                     },
    //                     (notexists) =>
    //                     {
    //                         if (this.userData.jsonUrl)
    //                         {
    //                             resolve(this.userData.jsonUrl);
    //                         }
    //                         else
    //                         {
    //                             this.reason.message = this.strings.failedToLoadJsonError;
    //                             reject(this.reason);
    //                         }
    //                     });
    //             });
    //     });
    // }

    // setLocalUserData()
    // {
    //     this.storage.set(LocalStorageUserData, this.userData);
    // }

    // setLocalUserPreferenceShowSaveMessage(value: boolean)
    // {
    //     this.userData.notShowSaveMessage = value;
    //     this.setLocalUserData();
    // }
    /** Loads the json file from the url */

    // /** Set json url in local storage */
    // setJsonUrl(jsonUrl: string)
    // {
    //     this.userData.jsonUrl = jsonUrl;
    //     this.setLocalUserData();
    // }

}