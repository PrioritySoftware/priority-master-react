import React from 'react';
import
{
    StyleSheet,
    TextInput,
    View
} from 'react-native';
import { PageProps } from '../modules';
// import { StackNavigator } from 'react-navigation';
// import { MessageHandler } from '../components/message.handler';
// import { AppService } from '../providers/app.service';

export class LoginPage extends React.Component<PageProps, any>
{
    //   messageHandler: MessageHandler;
    //   appService:AppService;

    constructor(props)
    {
        super(props);
        this.state = { text: 'Some text' };
    }
    render() 
    {
        return (
            <View style={styles.container}>
                <TextInput
                    style={{ height: 40, borderColor: 'gray', borderWidth: 1 }}
                    onChangeText={(text) => this.setState({ text })}
                    value={this.state.text}
                />
                <TextInput
                    style={{ height: 40, borderColor: 'gray', borderWidth: 1 }}
                    onChangeText={(text) => this.setState({ text })}
                    value={this.state.text}
                />
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