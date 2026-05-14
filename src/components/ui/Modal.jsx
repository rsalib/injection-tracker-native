import React from 'react';
import { View, Text } from 'react-native';

export function Modal({ children }) {
  return (
    <View>
      <Text style={{ color: '#9ca3af' }}>Modal — TODO</Text>
      {children}
    </View>
  );
}

export default Modal;
