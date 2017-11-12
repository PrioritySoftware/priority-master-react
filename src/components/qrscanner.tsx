import React, { Component } from 'react';
import
{
  StyleSheet,
  Dimensions,
  Vibration,
  View
} from 'react-native';
import { Icon } from 'react-native-elements';
import { PageProps, Strings } from '../modules';

import Camera from 'react-native-camera'
export class QRCodeScanner extends Component<PageProps, any> {

  static navigationOptions = { header: null };

  params: { onRead };
  strings: Strings;
  isScannedOnce: boolean;

  constructor(props) 
  {
    super(props);
    this.strings = this.props.screenProps.strings;
    this.params = this.props.navigation.state.params;
  }

  _handleBarCodeRead(result: { data })
  {
    if (!this.isScannedOnce)
    {
      this.isScannedOnce=true;
      Vibration.vibrate([0, 500, 200, 500], false);
      this.props.navigation.goBack();
      if (this.params && this.params.onRead)
        this.params.onRead(result.data);
    }
  }

  _renderCameraMarker()
  {
    let icon = null;
    let isIOS = this.strings.platform === 'ios';
    if (this.strings.dirByLang === 'rtl')
    {
      let iconName = isIOS ? 'ios-arrow-forward' : 'md-arrow-forward';
      icon = <Icon
        name={iconName}
        type='ionicon'
        color='white'
        onPress={() => { this.goBack() }}
        style={[styles.backButtonRight , isIOS ? { marginTop: 20 } : {}]}
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
        onPress={() => { this.goBack() }}
        style={[styles.backButtonLeft, isIOS ? { marginTop: 20 } : {}]}
        underlayColor="transparent"
      />;
    }
    return (
      <View style={styles.rectangleContainer}>
        {icon}
        <View style={styles.rectangle} />
      </View>
    );
  }

  render()
  {
    this.isScannedOnce=false;
    return (
      <View style={styles.mainContainer}>
        <Camera style={styles.camera} onBarCodeRead={this._handleBarCodeRead.bind(this)}>
          {this._renderCameraMarker()}
        </Camera>
      </View>
    )
  }
  goBack()
  {
    this.props.navigation.goBack();
  }
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1
  },
  camera: {
    flex: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    height: Dimensions.get('window').height,
    width: Dimensions.get('window').width,
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
    position: 'absolute',
    top: 12,
    left: -15,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  backButtonRight:
  {
    position: 'absolute',
    top: 12,
    right: -15,
    paddingHorizontal: 20,
    paddingBottom: 30
  }
})
