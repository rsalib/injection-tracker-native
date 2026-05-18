import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, shadow } from '../../theme.js';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App Crashed! Caught by Error Boundary:', error, errorInfo);
  }

  handleEmergencyReset = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.root}>
          <Text style={styles.heading}>⚠️ Application Error</Text>
          <Text style={styles.body}>
            The app encountered a critical error, likely due to corrupted local data. Don't worry, your cloud backup is safe.
          </Text>
          <Pressable onPress={this.handleEmergencyReset} style={styles.btn}>
            <Text style={styles.btnText}>Clear Local Cache &amp; Reload</Text>
          </Pressable>
        </View>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    padding: 20,
    backgroundColor: colors.bg,
  },
  heading: {
    color: colors.errorStrong,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 16,
    textAlign: 'center',
  },
  body: {
    color: colors.textSecondary,
    fontSize: 15,
    marginBottom: 24,
    maxWidth: 400,
    textAlign: 'center',
    lineHeight: 22,
  },
  btn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: colors.errorStrong,
    borderRadius: 100,
    boxShadow: shadow.errorBtn,
    cursor: 'pointer',
  },
  btnText: {
    color: colors.white,
    fontWeight: '800',
    fontSize: 15,
  },
});
