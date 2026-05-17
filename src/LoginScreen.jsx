import React, { useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Pressable } from './components/ui/Pressable.jsx';
import iconPng from '../public/icon.png';
import { colors, glass } from './theme.js';
import { auth } from './services/firebase.js';
import { GoogleAuthProvider, signInWithPopup, signInWithRedirect } from 'firebase/auth';

export function LoginScreen() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const signIn = async () => {
    setLoading(true);
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      try {
        await signInWithPopup(auth, provider);
      } catch (popupErr) {
        if (popupErr.code === 'auth/popup-blocked' || popupErr.code === 'auth/popup-closed-by-user') {
          await signInWithRedirect(auth, provider);
        } else {
          throw popupErr;
        }
      }
    } catch (e) {
      setError(e.message);
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <View style={[styles.card, { backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' }]}>
        <Image
          source={iconPng}
          style={{ width: 72, height: 72, alignSelf: 'center', marginBottom: 12, borderRadius: 16 }}
        />
        <Text style={styles.title}>INJECTION TRACKER</Text>
        <Text style={styles.subtitle}>
          The clinical companion for your peptide and hormone protocols.
        </Text>

        <Pressable
          onPress={signIn}
          disabled={loading}
          style={[styles.signInBtn, loading && styles.signInBtnDisabled]}
        >
          <View style={styles.signInRow}>
            <Image
              source={{ uri: 'https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg' }}
              style={styles.googleIcon}
            />
            <Text style={styles.signInText}>
              {loading ? 'INITIALIZING...' : 'SIGN IN WITH GOOGLE'}
            </Text>
          </View>
        </Pressable>

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <Text style={styles.footer}>SECURE DATA · PRIVATE ACCESS ONLY</Text>
      </View>
    </View>
  );
}

export default LoginScreen;

const styles = StyleSheet.create({
  root: {
    minHeight: '100vh',
    backgroundImage: 'radial-gradient(circle at top left, #164e63 0%, #111827 100%)',
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    ...glass.card,
    alignItems: 'center',
    maxWidth: 400,
    width: '100%',
    borderRadius: 40,
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.white,
    marginBottom: 12,
    letterSpacing: -1.28,
    textAlign: 'center',
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 15,
    marginBottom: 40,
    fontWeight: '500',
    lineHeight: 22,
    textAlign: 'center',
  },
  signInBtn: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 100,
    // White Google-brand button — signInText uses colors.bg (#111827) to read against this
    backgroundColor: 'white',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2)',
    alignItems: 'center',
  },
  signInBtnDisabled: {
    opacity: 0.7,
  },
  signInRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  googleIcon: {
    width: 20,
    height: 20,
  },
  signInText: {
    color: colors.bg,
    fontSize: 16,
    fontWeight: '800',
  },
  errorBox: {
    marginTop: 24,
    padding: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    width: '100%',
  },
  errorText: {
    color: '#fca5a5',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  footer: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 32,
    fontWeight: '600',
    letterSpacing: 0.24,
  },
});
