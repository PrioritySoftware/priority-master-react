import
{
    Platform
} from 'react-native';

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
        menuBackground: "#e8e8e8",

        // blue
        darkBlue: "#175676",
        blue: "#00adee",
        middleBlue: '#96DDF7',
        blueHighlight: '#edf9fe',
        blueDisabled: '#85C4DF',

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
    };

export const flexDirection = (isRTL: boolean) =>
{
    return isRTL ? { flexDirection: "row-reverse" } : { flexDirection: "row" };
}
export const textAlign = (isRTL: boolean) =>
{
    return isRTL ? { textAlign: "right" } : { textAlign: "left" };
}
export const alignItems = (isRTL: boolean) =>
{
    return isRTL ? { alignItems: "flex-start" } : { alignItems: "flex-end" };
}
export const alignSelf = (isRTL: boolean) =>
{
    return isRTL ? { alignSelf: "flex-start" } : { alignSelf: "flex-end" };
}
export const padding = (isRTL: boolean, padding: number, ) =>
{
    return isRTL ? { paddingRight: padding } : { paddingLeft: padding };
}
export const margin = (isRTL: boolean, margin: number) =>
{
    return isRTL ? { marginRight: margin } : { marginLeft: margin };
}
export const position = (isRTL: boolean, position: number) =>
{
    return isRTL ? { right: position } : { left: position };
}
