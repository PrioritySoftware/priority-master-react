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

  params: { onRead };
  strings: Strings;
  constructor(props) 
  {
    super(props);
    this.strings = this.props.screenProps.rootService.strings;
    this.params = this.props.navigation.state.params;
  }

  _handleBarCodeRead(result: { data })
  {
    Vibration.vibrate([0, 500, 200, 500], false);
    this.props.navigation.goBack();
    if (this.params && this.params.onRead)
      this.params.onRead(result.data);
  }

  _renderCameraMarker()
  {
    let icon = null;
    if (this.strings.dirByLang === 'rtl')
    {
      let iconName=this.strings.platform==='ios'? 'ios-arrow-forward' :'md-arrow-forward';
      icon = <Icon
        name= {iconName}
        type='ionicon'
        color='#517fa4'
        onPress={() => { this.goBack() }}
        style={styles.backButtonRTL}
      />;
    }
    else
    {
      let iconName=this.strings.platform==='ios'? 'ios-arrow-back' :'md-arrow-back';
      icon = <Icon
        name={iconName}
        type='ionicon'
        color='#517fa4'
        onPress={() => { this.goBack() }}
        style={styles.backButtonLTR}
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
  backButtonRTL:
  {
    position: 'absolute',
    top: 10,
    left: 0
   
  },
  backButtonLTR:
  {
    position: 'absolute',
    top: 10,
    right: 0
  }
})
