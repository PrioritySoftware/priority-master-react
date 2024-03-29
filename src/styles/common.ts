import
{
    Platform, Dimensions
} from 'react-native';

const { width, height } = Dimensions.get('window');
export const fullHeight=height;
export const fullWidth=width;
export const opacityOff = 0.5;
export const headerHeight = 60;
export const bodyHeight = height - headerHeight;

export const colors =
    {
        primaryColor: "#1f9bd1",
        // gray 
        lightGray: "#f4f4f4",
        middleGray: '#e2e2e2',
        gray: "#d8d8d8",
        middleGrayLight: "#e4e7ec",
        darkGray: "#525252",
        overlay: "#dedede4a",
        disabledGray: "#b5b5b5",
        label: '#606060',
        menuBackground: "#e8e8e8",
        toggleOff: '#a0a0a0',

        background: "#e8e8e8",
        middleDarkGray: "#00000080",
        // blue
        darkBlue: "#175676",
        blue: "#00adee",
        middleBlue: '#96DDF7',
        blueHighlight: '#edf9fe',
        blueDisabled: '#85C4DF',
        toggleOn: '#51cfff',

        // black
        dark: '#222222',

        // red
        red: "#D62839",

        // purple
        purple: '#9773ba',
        purpleActive: '#5a436f',
        purpleInactive: '#d8cfe0',
    }
export const center =
    {
        alignSelf: 'center',
        alignItems: 'center'
    };
export const container =
    {
        flex: 1
    }
export const header =
    {
        backgroundColor: colors.primaryColor,
        height: '100%'
    }
export const body =
    {
        height: bodyHeight
    }
export const modal =
    {
        backgroundColor: 'transparent',
        justifyContent: 'center',
        alignItems: 'center',
        flex:1
    }

export const iconName = (name) =>
{
    let OSprefix = Platform.OS === 'android' ? 'md' : 'ios';
    return OSprefix + "-" + name;
};
export const iconNames =
    {
        barcode: iconName("barcode"),
        phone: iconName("call"),
        url: iconName("link"),
        email: iconName("mail"),
        search: "ios-arrow-down",
        attach: iconName("attach"),
        menu: iconName("more"),
        arrowForward: iconName("arrow-forward"),
        arrowBack: iconName("arrow-back"),
        mainMenu: iconName("menu"),
        checkmark: "md-checkmark",
        checkboxIOS: 'check-circle',
        checkBoxMD: 'checkbox-marked',
        blankCheckboxIOS: 'checkbox-blank-circle-outline',
        blankCheckboxMD: 'checkbox-blank-outline',
        folder:iconName('folder'),
        camera:'md-camera',
        image:iconName('image'),
    };

export const flexDirection: any = (isRTL: boolean) =>
{
    return isRTL ? { flexDirection: "row-reverse" } : { flexDirection: "row" };
}
export const textAlign: any = (isRTL: boolean) =>
{
    return isRTL ? { textAlign: "right" } : { textAlign: "left" };
}
export const alignItems: any = (isRTL: boolean) =>
{
    return isRTL ? { alignItems: "flex-start" } : { alignItems: "flex-end" };
}
export const justifyContent: any = (isRTL: boolean) =>
{
    return isRTL ? { justifyContent: "flex-start" } : { justifyContent: "flex-end" };
}
export const alignSelf: any = (isRTL: boolean) =>
{
    return isRTL ? { alignSelf: "flex-start" } : { alignSelf: "flex-end" };
}
export const padding: any = (isRTL: boolean, paddingNum: number, ) =>
{
    return isRTL ? { paddingRight: paddingNum } : { paddingLeft: paddingNum };
}
export const margin: any = (isRTL: boolean, marginNum: number) =>
{
    return isRTL ? { marginRight: marginNum } : { marginLeft: marginNum };
}
export const position: any = (isRTL: boolean, positionNum: number) =>
{
    return isRTL ? { right: positionNum } : { left: positionNum };
}