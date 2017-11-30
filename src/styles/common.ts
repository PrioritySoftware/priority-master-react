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