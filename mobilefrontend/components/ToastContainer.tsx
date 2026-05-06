import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useToast, type ToastItem, type ToastType } from '@/context/ToastContext';
import { Colors } from '@/constants/theme';

const CONFIG: Record<ToastType, { color: string; icon: string }> = {
  success: { color: Colors.success,    icon: '✓' },
  error:   { color: Colors.accent,     icon: '✕' },
  info:    { color: Colors.inProgress, icon: 'i' },
};

function Toast({ id, message, type }: ToastItem) {
  const { dismiss } = useToast();
  const translateY = useSharedValue(60);
  const opacity    = useSharedValue(0);
  const { color, icon } = CONFIG[type];

  useEffect(() => {
    translateY.value = withTiming(0,   { duration: 280 });
    opacity.value    = withTiming(1,   { duration: 280 });
  }, [translateY, opacity]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.toast, animStyle]}>
      <View style={[styles.iconWrap, { backgroundColor: color }]}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <Text style={styles.message} numberOfLines={2}>{message}</Text>
      <Pressable onPress={() => dismiss(id)} hitSlop={10}>
        <Text style={styles.close}>✕</Text>
      </Pressable>
    </Animated.View>
  );
}

export function ToastContainer() {
  const { toasts } = useToast();
  if (toasts.length === 0) return null;

  return (
    <View style={styles.container} pointerEvents="box-none">
      {toasts.map((t) => <Toast key={t.id} {...t} />)}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 90,
    left: 16,
    right: 16,
    zIndex: 200,
    gap: 8,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgMid,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon:    { color: Colors.white, fontSize: 13, fontWeight: 'bold' },
  message: { flex: 1, color: Colors.white, fontSize: 13, lineHeight: 18 },
  close:   { color: Colors.textMuted, fontSize: 12 },
});
