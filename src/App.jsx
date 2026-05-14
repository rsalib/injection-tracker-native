import { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { auth } from './services/firebase.js';
import { onAuthStateChanged, getRedirectResult, signOut } from 'firebase/auth';
import { LoginScreen } from './LoginScreen.jsx';
import Calculator from './components/tabs/Calculator.jsx';

export default function App() {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    // Consume any pending redirect auth result on load (mobile fallback flow)
    getRedirectResult(auth).catch(() => {});
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => {
      setUser(u);
      setAuthReady(true);
    });
    return unsub;
  }, []);

  if (!authReady) return null;

  if (!user) return <LoginScreen />;

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.headerEmail} numberOfLines={1}>{user.email}</Text>
        <Pressable onPress={() => signOut(auth)} style={styles.signOutBtn}>
          <Text style={styles.signOutText}>SIGN OUT</Text>
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.appContainer}>
          <Calculator />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#111827',
    minHeight: '100vh',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(17, 24, 39, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
  },
  headerEmail: {
    color: '#9ca3af',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
    marginRight: 12,
  },
  signOutBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 100,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  signOutText: {
    color: '#9ca3af',
    fontSize: 12,
    fontWeight: '800',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  appContainer: {
    width: '100%',
    maxWidth: 672,  // matches v2: padding: 16, maxWidth: 672, margin: "0 auto"
    alignSelf: 'center',
    flex: 1,
  },
});
