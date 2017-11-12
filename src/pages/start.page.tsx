import React from 'react';
import
{
  StyleSheet,
  Text,
  View,
  Image,
  Dimensions
} from 'react-native';
import { PageProps, ServerResponse, Strings } from '../modules';
import { MessageHandler } from '../components/message.handler';

import { NavigationActions } from 'react-navigation';
import Spinner from 'react-native-spinkit';
import { colors } from '../styles/common';
import { ConfigService } from '../providers/config.service';
import { AppService } from '../providers/app.service';
const Permissions = require('react-native-permissions');

export class StartPage extends React.Component<PageProps, any>
{
  static navigationOptions = { header: null };

  messageHandler: MessageHandler;
  configService: ConfigService;
  appService: AppService;
  strings: Strings;


  constructor(props)
  {
    super(props);
    this.state = {
      isShowSpinner: false
    };
    this.configService = this.props.screenProps.configService;
    this.messageHandler = this.props.screenProps.messageHandler;
    this.strings = this.props.screenProps.strings;
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
            <Image source={require('../../assets/img/start_logo.png')} />
          </View>
          {footer}
        </Image>
      </View>

    );
  }

  /**
   * Navigates to QRCodeScanner component to scan a qr code.
   * 
   * @memberof StartPage
   */
  scan = () =>
  {
    if (this.strings.platform === 'ios')
    {
      Permissions.check("camera")
        .then(result =>
        {
          if (result === "authorized" || result==="undetermined")
            this.props.navigation.navigate('QRCodeScanner', { onRead: this.scanFinished });
          else
            this.messageHandler.showErrorOrWarning(true, this.strings.scanPermissionError);
        })
        .catch(error => this.messageHandler.showErrorOrWarning(true, this.strings.scanError));
    }
    else
    {
      this.props.navigation.navigate('QRCodeScanner', { onRead: this.scanFinished });
    }

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
      this.messageHandler.showToast(this.strings.scanError, true);
    }
    else
    {
      // init app with the result json url
      this.configService.initApp(data).then(
        () =>
        {
          this.setState({ isShowSpinner: true });
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
let ScreenWidth = Dimensions.get("window").width;
let ScreenHeight = Dimensions.get("window").height;
const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  capture: {
    backgroundColor: colors.primaryColor,
    color: 'white',
    borderRadius: 2,
    padding: 10,
    paddingRight: 30,
    paddingLeft: 30,
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
    backgroundColor: 'transparent'
  },
  image: {
    width: ScreenWidth,
    height: ScreenHeight
  },
  top: {
    flex: 1,
    justifyContent: 'flex-start',
    marginTop: 60,
    alignItems: 'center'
  },
  bottom:
  {
    flex: 1,
    justifyContent: 'flex-end',
    marginBottom: 60,
    alignItems: 'center'
  }
});