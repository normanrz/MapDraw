import React, { Component } from "react";
import { StyleSheet, View, Text } from "react-native";
import { Surface, Shape, Path } from "ReactNativeART";
import { distanceBetweenCoordinates } from "./utils";
import PropTypes from "prop-types";

const PADDING = 5;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative"
  },
  label: {
    position: "absolute",
    left: 0,
    color: "rgba(255, 255, 255, 0.7)",
    backgroundColor: "transparent"
  }
});

function transformData(elevationData) {
  let output = new Array(elevationData.length);
  let accumulatedDistance = 0;
  for (let i = 0; i < output.length; i++) {
    let coordinate = elevationData[i];
    let distance =
      i === 0
        ? 0
        : distanceBetweenCoordinates(elevationData[i - 1], coordinate);
    output[i] = {
      distance: accumulatedDistance + distance,
      elevation: coordinate.elevation
    };
    accumulatedDistance += distance;
  }
  return output;
}

class Chart extends Component {
  static propTypes = {
    elevationData: PropTypes.arrayOf(
      PropTypes.shape({
        latitude: PropTypes.number.isRequired,
        longitude: PropTypes.number.isRequired,
        elevation: PropTypes.number.isRequired
      })
    ).isRequired
  };

  state = {
    layout: null
  };

  getPath() {
    let { width, height } = this.state.layout;
    width -= 2 * PADDING;
    height -= 2 * PADDING;
    let data = transformData(this.props.elevationData);
    if (data.length === 0) {
      return "";
    }
    if (data.length === 1) {
      return Path()
        .moveTo(PADDING, height * 0.5)
        .line(width, 0);
    }
    let minElevation = Math.min(...data.map(point => point.elevation));
    let maxElevation = Math.max(...data.map(point => point.elevation));
    let maxDistance = data[data.length - 1].distance;
    let scaleY = height / (maxElevation - minElevation);
    let scaleX = width / maxDistance;
    let path = Path().moveTo(
      PADDING,
      PADDING + scaleY * (maxElevation - data[0].elevation)
    );
    data.slice(1).forEach(({ distance, elevation }) => {
      path = path.lineTo(
        PADDING + scaleX * distance,
        PADDING + scaleY * (maxElevation - elevation)
      );
    });
    return path;
  }

  handleLayout = ({ nativeEvent: { layout } }) => {
    this.setState({ layout });
  };

  renderLabels() {
    if (this.props.elevationData.length === 0) {
      return null;
    }
    let minElevation = Math.min(
      ...this.props.elevationData.map(point => point.elevation)
    );
    let maxElevation = Math.max(
      ...this.props.elevationData.map(point => point.elevation)
    );
    return [
      <Text style={[styles.label, { top: 0 }]} key="label-max">
        {Math.round(maxElevation)}
      </Text>,
      <Text style={[styles.label, { bottom: 0 }]} key="label-min">
        {Math.round(minElevation)}
      </Text>
    ];
  }

  render() {
    return (
      <View style={styles.container} onLayout={this.handleLayout}>
        {this.state.layout && this.props.elevationData.length > 0 ? (
          <Surface
            width={this.state.layout.width}
            height={this.state.layout.height}
          >
            <Shape
              d={this.getPath()}
              stroke="white"
              strokeWidth={1}
              strokeCap="square"
            />
          </Surface>
        ) : null}
        {this.renderLabels()}
      </View>
    );
  }
}

export default Chart;
