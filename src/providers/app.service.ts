import { StorageService } from './storage.service';

export class AppService
{
    currentApp: { title: string, jsonUrl: string };

    constructor(private storage: StorageService)
    {
        this.currentApp = { title: "", jsonUrl: "" };
    }
    // ********************************* Apps **************************************

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
    getAppList()
    {
        return this.storage.userData.applist;
    }
    getUserName()
    {
        return this.storage.userData.userName;
    }

}