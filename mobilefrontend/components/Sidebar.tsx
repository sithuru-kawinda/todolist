import { useEffect } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Colors } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import type { User } from '@/types/models';

const SIDEBAR_WIDTH = Math.min(Dimensions.get('window').width * 0.72, 280);

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onLogout: () => void;
  remaining: number;
}

export function Sidebar({ isOpen, onClose, user, onLogout, remaining }: SidebarProps) {
  const { isDark, colors, toggleTheme } = useTheme();
  const translateX = useSharedValue(-SIDEBAR_WIDTH);
  const backdropOpacity = useSharedValue(0);

  useEffect(() => {
    translateX.value = withTiming(isOpen ? 0 : -SIDEBAR_WIDTH, { duration: 260 });
    backdropOpacity.value = withTiming(isOpen ? 1 : 0, { duration: 260 });
  }, [isOpen, translateX, backdropOpacity]);

  const panelStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  return (
    <View style={styles.root} pointerEvents={isOpen ? 'auto' : 'none'}>
      {/* Tap backdrop to close */}
      <Animated.View style={[styles.backdrop, backdropStyle]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      {/* Sliding panel */}
      <Animated.View style={[styles.panel, panelStyle, { backgroundColor: colors.bgMid, borderRightColor: colors.border }]}>

        {/* User section */}
        <View style={styles.userSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarLabel}>✓</Text>
          </View>
          <Text style={[styles.username, { color: colors.text }]}>{user?.username ?? ''}</Text>
          <Text style={[styles.email, { color: colors.textSecondary }]}>{user?.email ?? ''}</Text>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {/* Nav items */}
        <View style={styles.nav}>
          <View style={styles.navItem}>
            <Text style={styles.navIcon}>▦</Text>
            <Text style={[styles.navText, { color: colors.text }]}>Dashboard</Text>
            <View style={styles.activeDot} />
          </View>

          {/* Dark / Light toggle */}
          <Pressable style={styles.navItem} onPress={toggleTheme} hitSlop={8}>
            <Text style={styles.navIcon}>{isDark ? '☀' : '☾'}</Text>
            <Text style={[styles.navText, { color: colors.text }]}>{isDark ? 'Light Mode' : 'Dark Mode'}</Text>
          </Pressable>

          <View style={styles.statsRow}>
            <Text style={[styles.statsLabel, { color: colors.textSecondary }]}>Tasks remaining</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{remaining}</Text>
            </View>
          </View>
        </View>

        {/* Logout */}
        <View style={styles.footer}>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <Pressable style={styles.logoutRow} onPress={onLogout} hitSlop={8}>
            <Text style={styles.logoutIcon}>↩</Text>
            <Text style={styles.logoutText}>Logout</Text>
          </Pressable>
        </View>

      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    zIndex: 100,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  panel: {
    width: SIDEBAR_WIDTH,
    height: '100%',
    backgroundColor: Colors.bgMid,
    borderRightWidth: 1,
    borderRightColor: Colors.border,
    paddingBottom: 24,
  },
  userSection: {
    alignItems: 'center',
    paddingTop: 48,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  avatarLabel:  { color: Colors.white, fontSize: 26, fontWeight: 'bold' },
  username:     { color: Colors.white, fontSize: 16, fontWeight: '700', marginBottom: 4 },
  email:        { color: Colors.textSecondary, fontSize: 12 },
  divider:      { height: 1, backgroundColor: Colors.border, marginHorizontal: 20 },
  nav:          { flex: 1, paddingTop: 14 },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 10,
    marginBottom: 10,
  },
  navIcon:      { color: Colors.accent, fontSize: 17 },
  navText:      { flex: 1, color: Colors.white, fontSize: 14, fontWeight: '600' },
  activeDot:    { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.accent },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 28,
    paddingVertical: 8,
  },
  statsLabel:   { color: Colors.textSecondary, fontSize: 12 },
  badge: {
    backgroundColor: Colors.inProgress,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 22,
    alignItems: 'center',
  },
  badgeText:    { color: Colors.white, fontSize: 11, fontWeight: '700' },
  footer:       { gap: 12 },
  logoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 28,
    paddingVertical: 14,
  },
  logoutIcon:   { color: Colors.accent, fontSize: 18 },
  logoutText:   { color: Colors.accent, fontSize: 14, fontWeight: '600' },
});
