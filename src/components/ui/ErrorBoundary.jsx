import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Pressable } from './Pressable.jsx';
import { CircuitBreaker } from './CircuitBreaker.jsx';

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
        <CircuitBreaker
          icon="⚠️"
          title="Application Error"
          message="The app encountered a critical error, likely due to corrupted local data. Don't worry, your cloud backup is safe."
          buttonText="Clear Local Cache & Reload"
          onAction={this.handleEmergencyReset}
        />
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
