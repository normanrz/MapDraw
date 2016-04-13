import React, {
  AppRegistry,
  Component,
  StyleSheet,
  View,
  Text,
} from 'react-native';
import MapView, {
  Polyline,
} from 'react-native-maps';
import update from 'react-addons-update';

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  map: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});

function distanceBetweenCoordinates(coordinate1, coordinate2) {
  // Source: http://stackoverflow.com/questions/27928/calculate-distance-between-two-latitude-longitude-points-haversine-formula
  let p = 0.017453292519943295;    // Math.PI / 180
  let c = Math.cos;
  let a = 0.5 - c((coordinate2.latitude - coordinate1.latitude) * p) / 2 +
          c(coordinate1.latitude * p) * c(coordinate2.latitude * p) *
          (1 - c((coordinate2.longitude - coordinate1.longitude) * p)) / 2;

  return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
}

function distanceOfPolyline(coordinates) {
  if (coordinates.length < 2) {
    return 0;
  }
  let output = 0;
  for (let i = 1, len = coordinates.length; i < len; i++) {
    output += distanceBetweenCoordinates(coordinates[i - 1], coordinates[i]);
  }
  return output;
}


class MapDraw extends Component {
  state = {
    userLocation: null,
    line: [],
  };

  componentDidMount() {
    this._watchId = navigator.geolocation.watchPosition(position => {
      this.setState({ userLocation: position.coords });
    }, null, {
      enableHighAccuracy: true,
      timeout: 20000,
      maximumAge: 1000,
    });
  }

  componentWillUnmount() {
    if (this._watchId) {
      navigator.geolocation.clearWatch(this._watchId);
    }
  }

  handleMapPress = ({ nativeEvent: { coordinate } }) => {
    this.setState({ line: this.state.line.concat([coordinate]) });
    if (this.refs.map) {
      this.refs.map.animateToCoordinate(coordinate, 200);
    }
  };

  handleRemovePress = () => {
    if (this.state.line.length > 0) {
      if (this.state.line.length === 1) {
        this.setState({ line: [] });
      } else {
        let newLastPoint = this.state.line[this.state.line.length - 2];
        this.setState({ line: this.state.line.slice(0, -1) });
        if (this.refs.map) {
          this.refs.map.animateToCoordinate(newLastPoint, 200);
        }
      }
    }
  };

  handleDragMarker = (i, { nativeEvent: { coordinate } }) => {
    this.setState({ line: update(this.state.line, { [i]: { $set: coordinate } }) });
  };

  render() {
    return <View style={styles.container}>
      {
        this.state.userLocation ?
          <MapView
            style={styles.map}
            initialRegion={{
              ...this.state.userLocation,
              latitudeDelta: 0.03,
              longitudeDelta: 0.015,
            }}
            onPress={this.handleMapPress}
            onLongPress={this.handleMapLongPress}
            mapType="hybrid"
            ref="map"
          >
            <MapView.Marker
              coordinate={this.state.userLocation}
              pinColor="#000000"
            />
            {
              this.state.line.length > 1 ?
                <MapView.Polyline
                  coordinates={this.state.line}
                  strokeColor="#F00"
                  strokeWidth={4}
                  lineJoin="round"
                /> :
                null
            }
            {
              this.state.line.map((coordinate, i) =>
                <MapView.Marker
                  coordinate={coordinate}
                  key={i}
                  draggable
                  onDragStart={this.handleDragMarker.bind(this, i)}
                  onDrag={this.handleDragMarker.bind(this, i)}
                  onDragEnd={this.handleDragMarker.bind(this, i)}
                />)
            }
          </MapView> :
          null
      }
      <View
        style={{
          position: 'absolute',
          top: 25,
          left: 10,
          backgroundColor: 'rgba(255,255,255,0.8)',
          padding: 10,
          borderRadius: 5,
        }}
      >
        <Text>{distanceOfPolyline(this.state.line).toFixed(2)} km</Text>
        <Text onPress={this.handleRemovePress}>Remove last point</Text>
        <Text onPress={this.handleSavePress}>Save</Text>
      </View>
    </View>;
  }
}

AppRegistry.registerComponent('MapDraw', () => MapDraw);
