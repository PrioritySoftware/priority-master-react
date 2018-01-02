import { Strings, ServerResponse, Entity, LocalStorageUserData, Configuration, LoginFunctions, Company, ServerResponseCode } from '../modules';
import pridata from '../../assets/js/pridata.json';
import { EnvProfile } from '../modules/envProfile.class';
import { StorageService } from './storage.service';
import { AppService } from './app.service';

// const LocalJsonUrl: string = "assets/js/pridata.json";
export class ConfigService
{
    config: Configuration;

    // currentApp: any = {};
    entitiesData: Entity[];
    // formsConfig: { [key: string]: FormConfig } = {};
    // RowsBatchSize: number = 115;
    passwordExpired: boolean;
    // supportCompanySelection: boolean;
    private jsonCompanyDname: string;
    private priorityUrl: string;
    private reason: ServerResponse;

    constructor(private appService: AppService, private storage: StorageService, private priorityService, private strings: Strings)
    {

        // initializations
        // this.supportCompanySelection = true;
        this.jsonCompanyDname = '';
        this.priorityUrl = '';
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
                    else if (request.status === 0 && (request.responseText === '' || request.responseText.includes("certification")))
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
            fetch(serverUrl + '/wcf/wcf/Service.svc', { method: 'HEAD' })
                .then(response =>
                {
                    if (response.status === 400 || response.status === 200)
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
                this.priorityUrl = json.url;
                this.appService.setApp(json.appdes, jsonUrl);
                // update storage
                if (this.storage.userData.jsonUrl !== jsonUrl)
                {
                    this.storage.userData.jsonUrl = jsonUrl;
                    this.storage.storeUserData();
                }
                // Configures wcf url from 'json.url'
                this.checkUrl(json.url).then(
                    (wcfurl) =>
                    {
                        this.jsonCompanyDname = json.dname;
                        if (this.storage.userData.companyName === null) // First time or in selecting apps without support for companies selection
                        {
                            this.storage.userData.profile.company = json.dname;
                        }
                        this.config = {
                            appname: json.appname,
                            url: wcfurl,
                            profileConfig: this.storage.userData.profile,
                            language: json.lang,
                            tabulaini: json.tabulaini,
                            devicename: ''// this.device.uuid
                        }
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
                    reason =>
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
                    if (__DEV__)
                        return this.readJson(JSON.stringify(pridata), '');
                    if (this.storage.userData.jsonUrl)
                    {
                        return this.initApp(this.storage.userData.jsonUrl);
                    }
                    this.reason.message = this.strings.failedToLoadJsonError;
                    reject(this.reason);
                })
                .then(() => resolve(this.storage.userData))
                .catch(reason =>
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
                        isHideSaveMessage: false,
                        profile: { company: null, group: 0 }
                    }
                    if (__DEV__)
                        resolve();
                    else
                        reject();
                });
        });
    }
    /**
     * Saves user's choice for showing 'changes not saved' messages. 
     * Applies only for when the user navigates to a subform without saving changes in a parent form row.
     * 
     * @param {boolean} value 
     * @memberof ConfigService
     */
    setIsHideSaveMessage(value: boolean)
    {
        this.storage.userData.isHideSaveMessage = value;
        this.storage.storeUserData();
    }
    getIsHideSaveMessage()
    {
        return this.storage.userData.isHideSaveMessage;
    }
    /****** Login *************/
    login(username: string, password: string): Promise<any>
    {
        return new Promise((resolve, reject) =>
        {
            this.config.username = username;
            this.config.password = password;
            this.passwordExpired = false;
            this.priorityService.login(this.config).then(
                (loginFunctions: LoginFunctions) =>
                {
                    this.config.loginFunctions = loginFunctions;
                    // save username and password in local storage
                    this.storage.userData.userName = username;
                    this.storage.userData.password = password;

                    this.getCompanies()
                        .then(() =>
                        {
                            this.storage.storeUserData();
                            resolve();
                        },
                        reason =>
                        {
                            this.storage.storeUserData();
                            reject(reason);// getCompanies rejects only in case the user doesn't have permissions for any company.
                        });
                    // this.messagesService.setMessages(MasterMessagesEname, MasterMessagesType, 1, 1000);
                },
                (reason: ServerResponse) =>
                {
                    this.passwordExpired = (reason.code === ServerResponseCode.LoginExpired);
                    reject(reason);
                });
        });
    }

    /********* Profiles  **********************/
    // setProfileConfig(profile: ProfileConfig, companyName: string, groupName: string)
    // {
    //     this.configService.setProfileConfiguration(profile);
    //     this.storage.userData.profile = profile;
    //     this.storage.userData.companyName = companyName;
    //     this.storage.userData.groupName = groupName;
    //     this.setLocalUserData();
    // }
    getCurrentCompany(): string
    {
        return this.storage.userData.profile.company;
    }
    getCompanies(): Promise<any>
    {
        return new Promise((resolve, reject) =>
        {
            if (!this.config.loginFunctions)// !this.supportCompanySelection || 
            {
                /**  No user login yet */
                reject();
                return;
            }
            this.config.loginFunctions.companies()
                .then((companies) =>
                {
                    if (companies && companies.Company)
                    {
                        this.setProfile(companies.Company);
                        resolve();
                    }
                    else
                    {
                        this.reason.message = this.strings.noCompanyIsAllowed;
                        reject(this.reason);
                    }
                })
                .catch((reason: ServerResponse) =>
                {
                    // if (reason.code === ServerResponseCode.NotSupport)
                    // {
                    //     this.supportCompanySelection = false;
                    // }
                    resolve();
                });

        });
    }

    setProfile(companies: Company[])
    {
        let storageCompany: string = this.storage.userData.profile.company;
        let storageGroup: number = this.storage.userData.profile.group;
        this.storage.userData.companyName = null;
        this.storage.userData.groupName = null;
        this.storage.userData.profile.company = this.jsonCompanyDname;
        this.storage.userData.profile.group = 0;
        let company: Company = null;
        let companyFilter: Company[] = companies.filter(comp => comp.dname === storageCompany);
        if (companyFilter.length)
        {
            company = companyFilter[0];
        }
        else // stored company doesn't exist in companies list 
        {
            companyFilter = companies.filter(comp => comp.dname === this.jsonCompanyDname);
            if (companyFilter.length)
            {
                company = companyFilter[0];
            }
        }
        if (company) 
        {
            this.storage.userData.profile.company = company.dname;
            this.storage.userData.companyName = company.title;

            // profiles
            if (company.EnvProfile)
            {
                let envProfile: EnvProfile = null;
                if (storageGroup > 0)
                {
                    let envProfileFilter: EnvProfile[];
                    envProfileFilter = company.EnvProfile.filter(prof => prof.profile === storageGroup);
                    if (envProfileFilter.length)
                    {
                        envProfile = envProfileFilter[0];
                    }
                }

                if (!envProfile)
                {
                    envProfile = company.EnvProfile[0];
                }

                this.storage.userData.profile.group = envProfile.profile;
                this.storage.userData.groupName = envProfile.profilename;
            }
        }
    }

    /*************************** Passwords **********************/

    /**
     * Returns a link to a page where the user can restore his password.
     * 
     * @returns 
     * @memberof AppService
     */
    getForgotPasswordURL()
    {
        let configuration = this.config;
        return this.priorityUrl + "/priority/prihtml.dll?WWWCHPWD&_tabulaini=" + configuration.tabulaini;
    }
    changePassword(newPwd, confirmNewPwd, oldPwd): Promise<any>
    {
        return this.priorityService.changePassword(newPwd, confirmNewPwd, oldPwd)
    }

}