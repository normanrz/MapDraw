import React, {
  PropTypes,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { noop } from './utils';

const styles = StyleSheet.create({
  iconButton: {
    width: 36,
    height: 36,
    marginHorizontal: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

function IconButton({ iconName, onPress = noop, onLongPress = noop }) {
  return <TouchableOpacity
    onPress={onPress}
    onLongPress={onLongPress}
    delayLongPress={1000}
    style={styles.iconButton}
  >
    <Icon name={iconName} size={20} color="white" />
  </TouchableOpacity>;
}
IconButton.propTypes = {
  iconName: PropTypes.string.isRequired,
  onPress: PropTypes.func,
  onLongPress: PropTypes.func,
};

export default IconButton;
