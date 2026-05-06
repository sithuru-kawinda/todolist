import { useState } from 'react';
import {
  ActivityIndicator,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Link, router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { Colors } from '@/constants/theme';

function passwordStrength(p: string): number {
  let s = 0;
  if (p.length >= 8) s++;
  if (/[A-Z]/.test(p)) s++;
  if (/[a-z]/.test(p)) s++;
  if (/[0-9]/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p)) s++;
  return s;
}

const STRENGTH_COLORS = ['#374151', '#dc2626', '#f97316', '#facc15', '#84cc16', '#22c55e'];
const STRENGTH_LABELS = ['', 'Very weak', 'Weak', 'Fair', 'Strong', 'Very strong'];

export default function RegisterScreen() {
  const { register } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const strength = passwordStrength(password);

  async function handleRegister() {
    if (!username.trim() || !email.trim() || !password.trim()) {
      setError('All fields are required.');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await register(username.trim(), email.trim(), password);
      // Registration done — send to login so the user authenticates fresh
      router.replace({ pathname: '/(auth)/login', params: { registered: '1' } });
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: { message?: string } } }; code?: string };
      if (e.code === 'ERR_NETWORK' || e.code === 'ECONNABORTED') {
        setError('Cannot reach the server. Check your API URL in .env and make sure the backend is running.');
      } else {
        setError(e.response?.data?.error?.message ?? 'Registration failed. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ImageBackground
      source={require('../../assets/images/mobilebackground.jpg')}
      style={styles.root}
      resizeMode="cover"
    >
      <View style={styles.overlay} />
      <KeyboardAvoidingView
        style={styles.inner}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
      <View style={styles.card}>
        <Text style={styles.title}>SIGN UP</Text>

        <View style={styles.inputRow}>
          <Text style={styles.icon}>👤</Text>
          <TextInput
            style={styles.input}
            placeholder="Username"
            placeholderTextColor={Colors.textSecondary}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoComplete="username"
          />
        </View>

        <View style={styles.inputRow}>
          <Text style={styles.icon}>✉</Text>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={Colors.textSecondary}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
          />
        </View>

        <View>
          <View style={styles.inputRow}>
            <Text style={styles.icon}>🔒</Text>
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={Colors.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="new-password"
            />
          </View>
          {/* Password strength bar */}
          <View style={styles.strengthTrack}>
            <View
              style={[
                styles.strengthFill,
                {
                  width: `${(strength / 5) * 100}%` as `${number}%`,
                  backgroundColor: STRENGTH_COLORS[strength] ?? STRENGTH_COLORS[0],
                },
              ]}
            />
          </View>
          {password.length > 0 && (
            <Text style={styles.strengthLabel}>{STRENGTH_LABELS[strength]}</Text>
          )}
        </View>

        {error && <Text style={styles.errorText}>{error}</Text>}

        <Pressable
          style={[styles.btn, submitting && styles.btnDisabled]}
          onPress={handleRegister}
          disabled={submitting}
        >
          {submitting
            ? <ActivityIndicator color={Colors.white} />
            : <Text style={styles.btnText}>CREATE ACCOUNT</Text>}
        </Pressable>

        <Link href="/(auth)/login" asChild>
          <Pressable style={styles.linkWrap}>
            <Text style={styles.linkText}>
              Already have an account?{' '}
              <Text style={styles.linkAccent}>Login here</Text>
            </Text>
          </Pressable>
        </Link>
      </View>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 36, 64, 0.72)',
  },
  inner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: Colors.inputBg,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 28,
    paddingVertical: 28,
    gap: 14,
  },
  title: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 4,
    textAlign: 'center',
    marginBottom: 4,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.inputBg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    height: 50,
  },
  icon: {
    fontSize: 16,
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: Colors.white,
    fontSize: 14,
  },
  strengthTrack: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    marginTop: 6,
    overflow: 'hidden',
  },
  strengthFill: {
    height: '100%',
    borderRadius: 2,
  },
  strengthLabel: {
    color: Colors.textSecondary,
    fontSize: 11,
    marginTop: 3,
  },
  errorText: {
    color: Colors.accent,
    fontSize: 13,
    textAlign: 'center',
  },
  btn: {
    backgroundColor: Colors.accent,
    borderRadius: 25,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnText: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: 13,
    letterSpacing: 2,
  },
  linkWrap: {
    alignItems: 'center',
    paddingTop: 4,
  },
  linkText: {
    color: Colors.textSecondary,
    fontSize: 13,
  },
  linkAccent: {
    color: Colors.accent,
    fontWeight: '600',
  },
});
