import { Platform, Easing, Animated } from "react-native";

export function navigationTransition(isRTL: boolean)
{
    if (Platform.OS !== 'ios')
        return () => { };
    return () => ({
        transitionSpec: {
            duration: 300,
            easing: Easing.out(Easing.poly(4)),
            timing: Animated.timing,
        },
        screenInterpolator: sceneProps =>
        {
            let { layout, position, scene } = sceneProps;
            let { index } = scene;

            let opacity = position.interpolate({
                inputRange: [index - 1, index - 0.99, index],
                outputRange: [0, 1, 1],
            });

            // For rtl : pages will appear from the left
            // For ltr : pages will appear from the right
            let width = layout.initWidth;
            width = isRTL ? -width : width;

            let translateY = 0;
            let translateX = position.interpolate({
                inputRange: [index - 1, index, index + 1],
                outputRange: [width, 0, 0],
            });

            return {
                opacity,
                transform: [{ translateX }, { translateY }]
            };
        },
    })
}