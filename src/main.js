import React, { Component } from "react";
import { AppRegistry, SafeAreaView } from "react-native";
import { Provider } from "react-redux";
import store from "./store";
import MapScreen from "./MapScreen";

function Root() {
  return (
    <Provider store={store}>
      <SafeAreaView style={{ flex: 1, backgroundColor: "#292D33" }}>
        <MapScreen />
      </SafeAreaView>
    </Provider>
  );
}

AppRegistry.registerComponent("MapDraw", () => Root);
