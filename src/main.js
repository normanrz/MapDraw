import React, {
  AppRegistry,
  Component,
} from 'react-native';
import { Provider } from 'react-redux';
import store from './store';
import MapScreen from './MapScreen';

class Root extends Component {
  render() {
    return <Provider store={store}>
      <MapScreen />
    </Provider>;
  }
}

AppRegistry.registerComponent('MapDraw', () => Root);
