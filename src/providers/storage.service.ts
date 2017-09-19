import { RootService } from './root.service';
import { LocalStorageUserData } from '../modules';
import { AsyncStorage } from 'react-native';

const LocalStorageUserData: string = "userdata"
export class StorageService
{
    userData: LocalStorageUserData = undefined;
    constructor(private rootService: RootService)
    {

    }
    setItem(key: string, value: string): Promise<any>
    {
        return AsyncStorage.setItem(key, value);
    }
    getItem(key: string): Promise<any>
    {
        return new Promise((resolve, reject) =>
        {
            AsyncStorage.getItem(key)
                .then(data =>
                {
                    if (!data)
                        reject();
                    else
                        resolve(data)
                })
                .catch(eror => reject());
        });

    }
    getUserData()
    {
        return new Promise((resolve, reject) =>
        {
            if (!this.userData)
            {
                this.getItem(LocalStorageUserData)
                    .then(userData =>
                    {
                        this.userData = JSON.parse(userData);
                        resolve(this.userData);
                    })
                    .catch(error => reject());
            }
            else
            {
                resolve(this.userData);
            }

        });
    }
    storetUserData()
    {
        this.setItem(LocalStorageUserData, JSON.stringify(this.userData));
    }
}