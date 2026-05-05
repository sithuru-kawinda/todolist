import { Redirect, Stack } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { Colors } from '@/constants/theme';

export default function AuthLayout() {
  const { user, loading } = useAuth();

  if (!loading && user) return <Redirect href="/" />;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.bgDeep },
        animation: 'fade',
      }}
    />
  );
}
