import React, { Component } from 'react';
import
{
  StyleSheet,
  Dimensions,
  Vibration,
  View,
  BackHandler
} from 'react-native';
import { Icon } from 'react-native-elements';
import { Strings } from '../modules';
import Camera from 'react-native-camera'
import { inject } from 'mobx-react';

@inject("strings")
export class QRCodeScanner extends Component<any, any> {

  static navigationOptions = { header: null };

  params: { onRead };
  strings: Strings;
  isScannedOnce: boolean;

  constructor(props) 
  {
    super(props);
    this.strings = this.props.strings;
    this.params = this.props.navigation.state.params;
  }
  componentDidMount()
  {
    BackHandler.addEventListener('hardwareBackPress', this.scanCanceled);
  }
  componentWillUnmount()
  {
    BackHandler.removeEventListener('hardwareBackPress', this.scanCanceled);
  }
  goBack(result, iscanceled: boolean = false)
  {
    this.props.navigation.goBack();
    if (this.params && this.params.onRead)
      this.params.onRead(result, iscanceled);
  }
  scanCanceled = () =>
  {
    this.goBack('', true);
    return true;
  }
  handleBarCodeRead(result: { data })
  {
    if (!this.isScannedOnce)
    {
      this.isScannedOnce = true;
      Vibration.vibrate([0, 500, 200, 500], false);
      this.goBack(result.data);
    }
  }

  renderCameraMarker()
  {
    return (
      <View style={styles.rectangleContainer}>
        <View style={styles.rectangle} />
      </View>
    );
  }
  renderBackIcon()
  {
    let icon = null;
    let isIOS = this.strings.platform === 'ios';
    if (this.strings.isRTL)
    {
      let iconName = isIOS ? 'ios-arrow-forward' : 'md-arrow-forward';
      icon = <Icon
        name={iconName}
        type='ionicon'
        color='white'
        onPress={this.scanCanceled}
        style={[styles.backButtonRight, isIOS ? { marginTop: 20 } : {}]}
        underlayColor="transparent"
      />;
    }
    else
    {
      let iconName = this.strings.platform === 'ios' ? 'ios-arrow-back' : 'md-arrow-back';
      icon = <Icon
        name={iconName}
        type='ionicon'
        color='white'
        onPress={this.scanCanceled}
        style={[styles.backButtonLeft, isIOS ? { marginTop: 20 } : {}]}
        underlayColor="transparent"
      />;
    }
    return (icon);
  }

  render()
  {
    this.isScannedOnce = false;
    return (
      <View style={styles.mainContainer}>
        {this.renderBackIcon()}
        <Camera style={styles.camera} onBarCodeRead={this.handleBarCodeRead.bind(this)}>
          {this.renderCameraMarker()}
        </Camera>
      </View>
    )
  }

}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  camera: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    height: '100%',
    width: '100%',
    zIndex: 1
  },

  rectangleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },

  rectangle: {
    height: 250,
    width: 250,
    borderWidth: 2,
    borderColor: '#00FF00',
    backgroundColor: 'transparent',
  },
  backButtonLeft:
    {
      zIndex: 2,
      position: 'absolute',
      top: 12,
      left: 0,
      paddingHorizontal: 20,
      paddingBottom: 30,
    },
  backButtonRight:
    {
      zIndex: 2,
      position: 'absolute',
      top: 12,
      right: 0,
      paddingHorizontal: 20,
      paddingBottom: 30
    }
})
