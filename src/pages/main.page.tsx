import React from 'react';
import
{
    StyleSheet,
    TextInput,
    View,
    Dimensions
} from 'react-native';
import { PageProps } from '../modules';
// import { StackNavigator } from 'react-navigation';
// import { MessageHandler } from '../components/message.handler';
// import { AppService } from '../providers/app.service';

export class MainPage extends React.Component<PageProps, any>
{
    //   messageHandler: MessageHandler;
    //   appService:AppService;
    
    constructor(props)
    {
        super(props);
        let appService = this.props.screenProps.appService;
        this.state = { text: 'Some text' };
    }
    render() 
    {
        return (
            <View style={styles.container}>
        
            </View>
        );
    }

}

/*********** style ************* */
const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row'
    }
});