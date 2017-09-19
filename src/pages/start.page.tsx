import React from 'react';
import
{
  StyleSheet,
  Text,
  View,
  Image
} from 'react-native';
import { PageProps, ServerResponse, Strings } from '../modules';
import { MessageHandler } from '../components/message.handler';
import { ConfigService } from '../providers';

import { NavigationActions } from 'react-navigation';
import Spinner from 'react-native-spinkit';
// import { SVGImage} from '../components/svg';

export class StartPage extends React.Component<PageProps, any>
{
  messageHandler: MessageHandler;
  configService: ConfigService;
  strings: Strings;
  navigateToLoginAction: NavigationActions;

  constructor(props)
  {
    super(props);
    this.state = {
      isShowSpinner: false
    };
    this.configService = this.props.screenProps.rootService.configService;
    this.messageHandler = this.props.screenProps.rootService.messageHandler;
    this.strings = this.props.screenProps.rootService.strings;
    this.navigateToLoginAction = NavigationActions.navigate({
      routeName: 'Login',
      params: {}
    })
  }
  render() 
  {
    let scanbutton = this.strings.scanButton;
    let scanInst = this.strings.scanInstructions;
    let preparingApp = this.strings.preparingApp;

    let footer = null;
    if (this.state.isShowSpinner)
    {
      footer =
        <View style={styles.bottom}>
          <Text style={styles.text}>{preparingApp}</Text>
          <Spinner style={styles.center} type='ThreeBounce' color='white' />
        </View>;
    }
    else
    {
      footer =
        <View style={styles.bottom}>
          <Text style={styles.text}>{scanInst}</Text>
          <Text style={styles.capture} onPress={() => this.scan()}>{scanbutton}</Text>
        </View>;
    }

    return (

      <View style={styles.container}>
        <Image style={styles.image} source={require('../../assets/img/start_bg.png')} >
          <View style={styles.top}>
            <Image style={styles.center} source={require('../../assets/img/start_logo.png')} />
          </View>
          {footer}
        </Image>
      </View>

    );
  }

  /**
   * Navigates to QRCodeScanner component to scan a qa code.
   * 
   * @memberof StartPage
   */
  scan = () =>
  {
    this.props.navigation.navigate('QRCodeScanner', { onRead: this.scanFinished });
  }

  /**
   * Executed after a qa code is scanned. Navigates to Login page upon success. 
   * 
   * @memberof StartPage
   */
  scanFinished = (data) => 
  {
    if (data == undefined || data === "")
    {
      this.messageHandler.showToast("Scan Error", 3000);
    }
    else
    {
      // init app with the result json url
      this.configService.initApp(data).then(
        () =>
        {
          // set the json in local storage
          //   this.appService.setJsonUrl(result.text);
         // this.setState({isShowSpinner:true});
          // go to login
          this.setRoot('Login');
        },
        (reason: ServerResponse) =>
        {
          this.messageHandler.showErrorOrWarning(true, reason.message);
        });
    }
  }
  setRoot(rootName: string)
  {
    let resetAction = NavigationActions.reset({
      index: 0,
      actions: [
        NavigationActions.navigate({ routeName: rootName })
      ]
    });
    this.props.navigation.dispatch(resetAction);
  }
}
/*********** style ************* */
const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  capture: {
    backgroundColor: '#1f9bd1',
    color: 'white',
    borderRadius: 2,
    padding: 10,
    paddingRight: 30,
    paddingLeft: 30,
    alignSelf: 'center',
    marginTop: 25,
    fontSize: 20
  },
  center:
  {
    alignSelf: 'center',
  },
  text: {
    color: 'white',
    fontSize: 19,
    alignSelf: 'center',
  },
  image: {
    flex: 1,
  },
  top: {
    flex: 1,
    justifyContent: 'flex-start',
    marginTop: 60,
  },
  bottom:
  {
    flex: 1,
    justifyContent: 'flex-end',
    marginBottom: 60,
  }

});