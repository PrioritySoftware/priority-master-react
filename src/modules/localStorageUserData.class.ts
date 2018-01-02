import { ProfileConfig } from "./profileConfig.class";
export interface LocalStorageUserData {
    jsonUrl : string;
    applist: any;
    userName: string;
    password: string;
    companyName: string;
    groupName: string;
    isHideSaveMessage: boolean;
    profile: ProfileConfig;
}