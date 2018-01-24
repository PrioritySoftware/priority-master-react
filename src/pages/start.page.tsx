import React from 'react';
import
{
  StyleSheet,
  Text,
  View,
  Image,
  Platform
} from 'react-native';
import { ServerResponse, Strings } from '../modules';
import { Pages } from '.';
import { NavigationActions } from 'react-navigation';
import Spinner from 'react-native-spinkit';
import { colors, iconNames, alignSelf } from '../styles/common';
import { ConfigService } from '../providers/config.service';
import { AppService } from '../providers/app.service';
import { inject } from 'mobx-react';
import { Messages } from '../handlers/index';
import { MessageHandler } from '../handlers/message.handler';

import { Icon } from 'react-native-elements';
import { scale } from '../utils/scale';

const Permissions = require('react-native-permissions');

@inject("configService", "strings", "appService")
export class StartPage extends React.Component<any, any>
{
  static navigationOptions = { header: null };
  appService: AppService;
  messageHandler: MessageHandler;
  configService: ConfigService;
  strings: Strings;
  constructor(props)
  {
    super(props);
    this.state = {
      isShowSpinner: false
    };
    this.appService = this.props.appService;
    this.configService = this.props.configService;
    this.strings = this.props.strings;
  }
  componentDidMount()
  {
    this.messageHandler = Messages;
  }
  goBack()
  {
    this.props.navigation.goBack();
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
          <View>
            {this.renderBackIcon()}
            <View style={styles.top}>
              <Image source={require('../../assets/img/start_logo.png')} />
            </View>
          </View>
          {footer}
        </Image>
      </View>

    );
  }

  renderBackIcon()
  {
    let backIconName
    if (this.strings.isRTL)
      backIconName = iconNames.arrowForward;
    else
      backIconName = iconNames.arrowBack;

    if (this.appService.getAppList().length >= 1)
    {
      return (
        <Icon
          type='ionicon'
          name={backIconName}
          onPress={() => { this.goBack() }}
          color='white'
          underlayColor='transparent'
          size={22}
          containerStyle={[styles.backButton, alignSelf(!this.strings.isRTL)]} />
      )
    }
    else
    {
      return (null)
    }
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
          if (result === "authorized" || result === "undetermined")
            this.props.navigation.navigate(Pages.QRCodeScanner.name, { onRead: this.scanFinished });
          else
            this.messageHandler.showErrorOrWarning(true, this.strings.scanPermissionError);
        })
        .catch(error => this.messageHandler.showErrorOrWarning(true, this.strings.scanError));
    }
    else
    {
      this.props.navigation.navigate(Pages.QRCodeScanner.name, { onRead: this.scanFinished });
    }

  }

  /**
   * Executed after a qa code is scanned. Navigates to Login page upon success. 
   * 
   * @memberof StartPage
   */
  scanFinished = (data, iscanceled) => 
  {
    if (iscanceled)
      return;
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
          // Try to login with local (stored) data. Used for when the user adds a new application.
          // If login was successful - go to main page,
          // else - go to login page.
          this.configService.loginWithLocalData()
            .then(() => this.setRoot(Pages.Main.name))
            .catch(error => this.setRoot(Pages.Login.name));
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
    width: '100%',
    height: '100%'
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
    },
  backButton:
    {
      paddingVertical: scale(10),
      paddingHorizontal: scale(20),
      ...Platform.select({
        ios:
          {
            paddingTop: scale(35)
          }
      })

    }
});