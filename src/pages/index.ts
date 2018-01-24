import { StartPage } from "./start.page";
import { QRCodeScanner } from "../components/qrscanner";
import { LoginPage } from "./login.page";
import { MainPage } from "./main.page";
import { ListPage } from "./list.page";
import { DetailsPage } from "./details.page";
import { SearchPage } from "./search.page";
import {SwitchApp} from "./switchApp.page"
import {SwitchCompany} from "./switchCompany.page"
export const Pages =
    {
        Start: { screen: StartPage, name: 'Start' },
        QRCodeScanner: { screen: QRCodeScanner, name: 'QRCodeScanner' },
        Login: { screen: LoginPage, name: 'Login' },
        Main: { screen: MainPage, name: 'Main' },
        List: { screen: ListPage, name: 'List' },
        Details: { screen: DetailsPage, name: 'Details' },
        Search: { screen: SearchPage, name: 'Search' },
        SwitchApp: {screen: SwitchApp, name:'SwitchApp'},
        SwitchCompany:{screen: SwitchCompany , name:'SwitchCompany'}
    };