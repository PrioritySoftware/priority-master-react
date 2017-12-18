// import { FormConfig } from "../entities/form.class";
import { ServerResponse, ServerResponseCode } from '../modules';
import { StorageService } from './storage.service';

// const AppVersion: string = "app_master_2";
// const MasterMessagesEname: string = "MASTERMESSAGES";
// const MasterMessagesType: string = "C";

export class AppService
{
    currentApp: {title:string, jsonUrl:string};
    // RowsBatchSize: number = 115;

    constructor(private storage:StorageService)
    {
        this.currentApp={title:"",jsonUrl:""};
    }
    // // ********************************* Apps **************************************

    setApp(appTitle: string, jsonUrl: string)
    {
        let app;
        for (let ind in this.storage.userData.applist)
        {
            if (this.storage.userData.applist[ind].jsonUrl === jsonUrl)
            {
                app = this.storage.userData.applist[ind];
                this.storage.userData.applist[ind].title = appTitle;
            }
        }
        if (app === undefined) // if this app does not exist in apps list add it to the list
        {
            app = {
                title: appTitle,
                jsonUrl: jsonUrl
            }
            this.storage.userData.applist.push(app);
        }
        this.currentApp = app;
    }

    clearCurrentApp()
    {
        this.storage.userData.jsonUrl = null;
        this.storage.storeUserData();
    }

    deleteApp(app)
    {
        let index = this.storage.userData.applist.indexOf(app);
        this.storage.userData.applist.splice(index, 1);
        this.storage.storeUserData();
    }

    // // /** Clear the values of username and password saved in local storage */
    // clearLogin()
    // {
    //     this.loginExpired = false;
    //     this.storage.userData.userName = null;
    //     this.storage.userData.password = null;
    //     this.setLocalUserData();
    // }



    


  


    // /*  Monitor server */
    // contactMonitorServer(action: string, form: string)
    // {
    //     let url: string = "https://monitor.priority-software.com/monitor/b.aspx"
    //         + "?u=" + encodeURI(this.storage.userData.userName)
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
  

}