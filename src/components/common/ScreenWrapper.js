import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from '../../styles/common/ScreenWrapperStyles';

const ScreenWrapper = ({ children }) => (
  <SafeAreaView style={styles.container}>
    <StatusBar barStyle="dark-content" />
    {children}
  </SafeAreaView>
);

export default ScreenWrapper;