import React, {
  PropTypes,
  StyleSheet,
  View,
} from 'react-native';

const styles = StyleSheet.create({
  navbar: {
    height: 64,
    backgroundColor: 'rgba(40, 44, 50, 1)',
    paddingTop: 20,
    paddingHorizontal: 10,
    paddingBottom: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  navbarText: {
    color: 'white',
  },
});


function Navbar({ children }) {
  return <View style={styles.navbar}>{children}</View>;
}
Navbar.propTypes = {
  children: PropTypes.any,
};

export default Navbar;
