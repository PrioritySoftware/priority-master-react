import { Platform } from "react-native";
import Permissions from 'react-native-permissions';

export function RequestPermission(permission: string): Promise<boolean>
{
    return new Promise((resolve, reject) =>
    {
        if (Platform.OS === 'android' && Platform.Version < 23)
        {
            resolve(true);
            return;
        }
        Permissions.request(permission)
            .then(result =>
            {
                if (result === 'authorized')
                    resolve(true);
                else
                    resolve(false);
            })
            .catch(() => reject());
    });

}
