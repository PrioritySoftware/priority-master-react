import React, { Component } from 'react';
import SvgUri from 'react-native-svg-uri';

export class SVGImage extends Component<any, any>
{

  render()
  {
    return (
      <SvgUri svgXmlData={this.props.svg} />
    );
  }
}
