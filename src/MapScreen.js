import React, { Component } from "react";
import {
  Alert,
  StyleSheet,
  AppState,
  StatusBar,
  View,
  Text
} from "react-native";
import MapView, { Polyline } from "react-native-maps";
import update from "immutability-helper";

import Navbar from "./Navbar";
import Chart from "./Chart";
import IconButton from "./IconButton";
import { distanceOfPolyline, noop } from "./utils";

const GOOGLE_API_KEY = "AIzaSyDvcskYIr5KAOk5SdAutp_c18aU0iV975w";

const styles = StyleSheet.create({
  scene: {
    flex: 1
  },
  mapContainer: {
    position: "relative",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#292D33"
  },
  map: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },
  iconButton: {
    width: 36,
    height: 36,
    marginHorizontal: 5,
    justifyContent: "center",
    alignItems: "center"
  },
  navbarText: {
    color: "white"
  },
  chartContainer: {
    height: 100,
    padding: 10,
    backgroundColor: "#292D33"
  }
});

const MAP_TYPES = ["hybrid", "standard", "satellite"];

class MapScreen extends Component {
  state = {
    userLocation: null,
    line: [],
    elevationData: null,
    mapTypeIndex: 0
  };

  componentDidMount() {
    this.registerLocationWatcher();
    AppState.addEventListener("change", this.handleAppStateChange);
  }

  componentWillUnmount() {
    this.unregisterLocationWatcher();
    AppState.removeEventListener("change", this.handleAppStateChange);
  }

  registerLocationWatcher() {
    if (!this._watchId) {
      this._watchId = navigator.geolocation.watchPosition(
        position => {
          this.setState({ userLocation: position.coords });
        },
        null,
        {
          enableHighAccuracy: true,
          timeout: 20000,
          maximumAge: 1000
        }
      );
    }
  }

  unregisterLocationWatcher() {
    if (this._watchId) {
      navigator.geolocation.clearWatch(this._watchId);
      this._watchId = null;
    }
  }

  loadElevation() {
    let line = this.state.line;
    if (line.length === 0) {
      return;
    }
    let url =
      line.length > 1
        ? "https://maps.googleapis.com/maps/api/elevation/json?" +
          `key=${GOOGLE_API_KEY}&samples=50&` +
          `path=${line
            .map(point => `${point.latitude},${point.longitude}`)
            .join("|")}`
        : "https://maps.googleapis.com/maps/api/elevation/json?" +
          `key=${GOOGLE_API_KEY}&locations=${line[0].latitude},${
            line[0].longitude
          }`;
    fetch(url)
      .then(res => res.json())
      .then(({ results }) => {
        this.setState({
          elevationData: results.map(point => ({
            longitude: point.location.lng,
            latitude: point.location.lat,
            elevation: point.elevation
          }))
        });
      });
  }

  handleAppStateChange = currentAppState => {
    if (currentAppState === "active") {
      if (!this._watchId) {
        this.registerLocationWatcher();
      }
    } else {
      this.unregisterLocationWatcher();
    }
  };

  handleMapPress = ({ nativeEvent: { coordinate } }) => {
    this.setState({ line: this.state.line.concat([coordinate]) });
    if (this.refs.map) {
      this.refs.map.animateToCoordinate(coordinate, 200);
    }
    this.loadElevation();
  };

  handleRemovePress = () => {
    if (this.state.line.length > 0) {
      if (this.state.line.length === 1) {
        this.setState({ line: [], elevationData: null });
      } else {
        let newLastPoint = this.state.line[this.state.line.length - 2];
        this.setState({ line: this.state.line.slice(0, -1) });
        this.loadElevation();
        if (this.refs.map) {
          this.refs.map.animateToCoordinate(newLastPoint, 200);
        }
      }
    }
  };

  handleResetPress = event => {
    event.stopPropagation();
    if (this.state.line.length > 0) {
      Alert.alert("Reset", "Do you wish to reset your current track?", [
        {
          text: "Cancel",
          onPress: noop,
          style: "cancel"
        },
        {
          text: "Reset",
          onPress: () => {
            this.setState({ line: [], elevationData: null });
          },
          style: "destructive"
        }
      ]);
    }
  };

  handleDragMarker = (i, { nativeEvent: { coordinate } }) => {
    this.setState({
      line: update(this.state.line, { [i]: { $set: coordinate } })
    });
    this.loadElevation();
  };

  handleToggleMapTypePress = () => {
    this.setState({
      mapTypeIndex: (this.state.mapTypeIndex + 1) % MAP_TYPES.length
    });
  };

  render() {
    return (
      <View style={styles.scene}>
        <StatusBar barStyle="light-content" translucent />
        <Navbar>
          <Text style={styles.navbarText}>
            {distanceOfPolyline(this.state.line).toFixed(2)} km
          </Text>
          <View style={{ flex: 1 }} />
          <IconButton
            iconName="ios-trash"
            onPress={this.handleRemovePress}
            onLongPress={this.handleResetPress}
          />
          <IconButton iconName="ios-map" onPress={this.handleToggleMapTypePress} />
        </Navbar>
        <View style={styles.mapContainer}>
          {this.state.userLocation ? (
            <MapView
              style={styles.map}
              initialRegion={{
                ...this.state.userLocation,
                latitudeDelta: 0.03,
                longitudeDelta: 0.015
              }}
              onPress={this.handleMapPress}
              onLongPress={this.handleMapLongPress}
              mapType={MAP_TYPES[this.state.mapTypeIndex]}
              ref="map"
            >
              <MapView.Marker
                coordinate={this.state.userLocation}
                pinColor="#000000"
              />
              {this.state.line.length > 1 ? (
                <MapView.Polyline
                  coordinates={this.state.line}
                  strokeColor="#ff0000"
                  strokeWidth={4}
                  lineJoin="round"
                />
              ) : null}
              {this.state.line.map((coordinate, i) => (
                /* eslint react/jsx-no-bind: 0 */
                <MapView.Marker
                  coordinate={coordinate}
                  key={i}
                  draggable
                  onDragStart={this.handleDragMarker.bind(this, i)}
                  onDrag={this.handleDragMarker.bind(this, i)}
                  onDragEnd={this.handleDragMarker.bind(this, i)}
                />
              ))}
            </MapView>
          ) : null}
        </View>
        <View style={styles.chartContainer}>
          {this.state.elevationData ? (
            <Chart elevationData={this.state.elevationData} />
          ) : null}
        </View>
      </View>
    );
  }
}

export default MapScreen;
