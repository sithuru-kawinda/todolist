import { forwardRef, memo, useCallback, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { useAuth } from '@/context/AuthContext';
import { useTodos } from '@/hooks/useTodos';
import { Colors } from '@/constants/theme';
import { Sidebar } from '@/components/Sidebar';
import { ToastContainer } from '@/components/ToastContainer';
import type { Todo, TodoColumnStatus } from '@/types/models';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_H = 54; // approximate card height for overlay centering

type ColumnKey = 'todo' | 'active' | 'done';

// ── KanbanSection ─────────────────────────────────────────────────────────────

interface SectionProps {
  title: string;
  dot: string;
  count: number;
  isOver: boolean;
  emptyLabel: string;
  children: React.ReactNode;
}

const KanbanSection = forwardRef<View, SectionProps>(function KanbanSection(
  { title, dot, count, isOver, emptyLabel, children },
  ref,
) {
  const hasCards = Array.isArray(children)
    ? children.filter(Boolean).length > 0
    : !!children;

  return (
    <View ref={ref}>
      {/* Section header — highlights blue when a card hovers over it */}
      <View style={[styles.sectionHeader, isOver && styles.sectionHeaderOver]}>
        <View style={[styles.dot, { backgroundColor: isOver ? Colors.inProgress : dot }]} />
        <Text style={[styles.sectionTitle, isOver && styles.sectionTitleOver]}>
          {title}
        </Text>
        <View style={[styles.badge, isOver && styles.badgeOver]}>
          <Text style={styles.badgeText}>{count}</Text>
        </View>
      </View>

      {/* Cards area */}
      <View style={styles.sectionBody}>
        {hasCards ? (
          children
        ) : (
          <Text style={[styles.emptyLabel, isOver && styles.emptyLabelOver]}>
            {isOver ? '↓  Drop here' : emptyLabel}
          </Text>
        )}
      </View>
    </View>
  );
});

// ── DraggableCard ─────────────────────────────────────────────────────────────

interface CardProps {
  todo: Todo;
  draggingId: SharedValue<string>;
  dragAbsX: SharedValue<number>;
  dragAbsY: SharedValue<number>;
  isDraggingShared: SharedValue<boolean>;
  onDragStart: (todo: Todo) => void;
  onDragUpdate: (absY: number) => void;
  onDragEnd: () => void;
  onToggle: (todo: Todo) => void;
  onDelete: (id: string) => void;
}

const DraggableCard = memo(function DraggableCard({
  todo,
  draggingId,
  dragAbsX,
  dragAbsY,
  isDraggingShared,
  onDragStart,
  onDragUpdate,
  onDragEnd,
  onToggle,
  onDelete,
}: CardProps) {
  const todoId = todo.id; // captured by worklet closure

  const gesture = Gesture.Pan()
    .activateAfterLongPress(400)
    .onStart((e) => {
      dragAbsX.value = e.absoluteX;
      dragAbsY.value = e.absoluteY;
      isDraggingShared.value = true;
      draggingId.value = todoId;
      runOnJS(onDragStart)(todo);
    })
    .onUpdate((e) => {
      dragAbsX.value = e.absoluteX;
      dragAbsY.value = e.absoluteY;
      runOnJS(onDragUpdate)(e.absoluteY);
    })
    .onEnd(() => {
      isDraggingShared.value = false;
      draggingId.value = '';
      runOnJS(onDragEnd)();
    })
    .onFinalize(() => {
      // safety net — fires even if gesture is cancelled
      if (isDraggingShared.value) {
        isDraggingShared.value = false;
        draggingId.value = '';
        runOnJS(onDragEnd)();
      }
    });

  // Dim the original card while it is being dragged (floating clone appears)
  const cardStyle = useAnimatedStyle(() => ({
    opacity: draggingId.value === todoId ? 0.25 : 1,
  }));

  const handleTogglePress = useCallback(() => onToggle(todo), [onToggle, todo]);
  const handleDeletePress = useCallback(() => onDelete(todo.id), [onDelete, todo.id]);

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.card, cardStyle]}>
        <Pressable onPress={handleTogglePress} style={styles.cardBody} hitSlop={8}>
          <View style={[styles.checkbox, todo.completed && styles.checkboxDone]}>
            {todo.completed && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text
            style={[styles.cardTitle, todo.completed && styles.cardTitleDone]}
            numberOfLines={2}
          >
            {todo.title}
          </Text>
        </Pressable>
        <Pressable onPress={handleDeletePress} style={styles.deleteBtn} hitSlop={8}>
          <Text style={styles.deleteIcon}>✕</Text>
        </Pressable>
      </Animated.View>
    </GestureDetector>
  );
});

// ── Dashboard ─────────────────────────────────────────────────────────────────

const NEXT_STATUS: Record<string, TodoColumnStatus> = {
  todo: 'in_progress',
  in_progress: 'done',
  done: 'todo',
};

const COLUMN_TO_STATUS: Record<ColumnKey, TodoColumnStatus> = {
  todo: 'todo',
  active: 'in_progress',
  done: 'done',
};

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { todos, loading, error, add, remove, refresh, updateStatus } = useTodos();
  const [adding, setAdding] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const titleRef = useRef('');
  const inputRef = useRef<TextInput>(null);

  // ── drag state ──────────────────────────────────────────────────────────────
  const [draggingTodo, setDraggingTodo] = useState<Todo | null>(null);
  const [overSection, setOverSection] = useState<ColumnKey | null>(null);

  // Shared values (UI thread) for smooth 60fps floating card animation
  const dragAbsX = useSharedValue(0);
  const dragAbsY = useSharedValue(0);
  const isDraggingShared = useSharedValue(false);
  const draggingId = useSharedValue('');

  // Section View refs for measureInWindow
  const todoRef = useRef<View>(null);
  const activeRef = useRef<View>(null);
  const doneRef = useRef<View>(null);

  // Absolute screen layouts, populated when drag starts
  const layouts = useRef<Record<ColumnKey, { y: number; height: number }>>({
    todo: { y: 0, height: 0 },
    active: { y: 0, height: 0 },
    done: { y: 0, height: 0 },
  });

  // ── section helpers ─────────────────────────────────────────────────────────

  function measureSections() {
    todoRef.current?.measureInWindow((_x, y, _w, h) => {
      layouts.current.todo = { y, height: h };
    });
    activeRef.current?.measureInWindow((_x, y, _w, h) => {
      layouts.current.active = { y, height: h };
    });
    doneRef.current?.measureInWindow((_x, y, _w, h) => {
      layouts.current.done = { y, height: h };
    });
  }

  function getSectionAt(absY: number): ColumnKey | null {
    for (const key of ['todo', 'active', 'done'] as ColumnKey[]) {
      const { y, height } = layouts.current[key];
      if (absY >= y && absY <= y + Math.max(height, 80)) return key;
    }
    return null;
  }

  // ── column logic (derived from server status) ───────────────────────────────

  const todoItems   = todos.filter((t) => t.status === 'todo');
  const activeItems = todos.filter((t) => t.status === 'in_progress');
  const doneItems   = todos.filter((t) => t.status === 'done');
  const remaining   = todos.filter((t) => !t.completed).length;

  function getColumn(todo: Todo): ColumnKey {
    if (todo.status === 'in_progress') return 'active';
    return todo.status as ColumnKey; // 'todo' | 'done' map directly
  }

  // ── gesture callbacks (called via runOnJS) ──────────────────────────────────

  const handleDragStart = useCallback((todo: Todo) => {
    measureSections();
    setDraggingTodo(todo);
    setOverSection(getColumn(todo));
  }, []);

  const handleDragUpdate = useCallback((absY: number) => {
    setOverSection(getSectionAt(absY));
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggingTodo((current) => {
      if (!current) return null;
      setOverSection((section) => {
        if (section && section !== getColumn(current)) {
          void updateStatus(current, COLUMN_TO_STATUS[section]);
        }
        return null;
      });
      return null;
    });
  }, [updateStatus]);

  // ── tap toggle: cycles todo → in_progress → done → todo ────────────────────

  const handleToggle = useCallback((todo: Todo) => {
    void updateStatus(todo, NEXT_STATUS[todo.status] ?? 'todo');
  }, [updateStatus]);

  const handleDelete = useCallback((id: string) => {
    Alert.alert('Delete todo', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => void remove(id) },
    ]);
  }, [remove]);

  async function handleAdd() {
    const title = titleRef.current.trim();
    if (!title) return;
    setAdding(true);
    try {
      await add(title);
      inputRef.current?.clear();
      titleRef.current = '';
    } finally {
      setAdding(false);
    }
  }

  // ── floating card (animated overlay) ───────────────────────────────────────

  const floatingStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    left: 14,
    top: dragAbsY.value - CARD_H / 2,
    width: SCREEN_WIDTH - 28,
    zIndex: 999,
    opacity: withTiming(isDraggingShared.value ? 1 : 0, { duration: 120 }),
    transform: [{ scale: withSpring(isDraggingShared.value ? 1.04 : 0.98) }],
    shadowColor: Colors.inProgress,
    shadowOpacity: isDraggingShared.value ? 0.4 : 0,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: isDraggingShared.value ? 12 : 0,
  }));

  // Common card props passed to every DraggableCard — memoized so memo() on DraggableCard is effective
  const dragProps = useMemo(() => ({
    draggingId,
    dragAbsX,
    dragAbsY,
    isDraggingShared,
    onDragStart: handleDragStart,
    onDragUpdate: handleDragUpdate,
    onDragEnd: handleDragEnd,
  }), [handleDragStart, handleDragUpdate, handleDragEnd]);

  // ── render ──────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Pressable onPress={() => setSidebarOpen(true)} style={styles.menuBtn} hitSlop={8}>
            <Text style={styles.menuIcon}>☰</Text>
          </Pressable>
          <View style={styles.logo}><Text style={styles.logoCheck}>✓</Text></View>
          <View>
            <Text style={styles.appName}>TodoApp</Text>
            <Text style={styles.remaining}>{remaining} task{remaining !== 1 ? 's' : ''} remaining</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.username}>{user?.username}</Text>
          <Pressable onPress={() => void logout()} style={styles.logoutBtn} hitSlop={8}>
            <Text style={styles.logoutIcon}>→</Text>
          </Pressable>
        </View>
      </View>

      {/* Add todo */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.addBar}>
          <TextInput
            ref={inputRef}
            style={styles.addInput}
            placeholder="Add a new task…"
            placeholderTextColor={Colors.textMuted}
            onChangeText={(t) => { titleRef.current = t; }}
            onSubmitEditing={handleAdd}
            returnKeyType="done"
            blurOnSubmit={false}
          />
          <Pressable style={[styles.addBtn, adding && styles.addBtnDisabled]} onPress={handleAdd} disabled={adding}>
            {adding
              ? <ActivityIndicator color={Colors.white} size="small" />
              : <Text style={styles.addBtnText}>+</Text>}
          </Pressable>
        </View>
      </KeyboardAvoidingView>

      <Text style={styles.hint}>Hold & drag a card to move it between columns</Text>

      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* Kanban sections — disabled scroll while dragging */}
      {loading ? (
        <View style={styles.center}><ActivityIndicator color={Colors.accent} size="large" /></View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.listContent}
          scrollEnabled={!draggingTodo}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} tintColor={Colors.accent} />}
        >
          <KanbanSection ref={todoRef} title="To Do" dot={Colors.textSecondary}
            count={todoItems.length} isOver={overSection === 'todo'} emptyLabel="No tasks to do">
            {todoItems.map((todo) => (
              <DraggableCard key={todo.id} todo={todo} {...dragProps}
                onToggle={handleToggle} onDelete={handleDelete} />
            ))}
          </KanbanSection>

          <KanbanSection ref={activeRef} title="In Progress" dot={Colors.inProgress}
            count={activeItems.length} isOver={overSection === 'active'} emptyLabel="Nothing in progress">
            {activeItems.map((todo) => (
              <DraggableCard key={todo.id} todo={todo} {...dragProps}
                onToggle={handleToggle} onDelete={handleDelete} />
            ))}
          </KanbanSection>

          <KanbanSection ref={doneRef} title="Done" dot={Colors.success}
            count={doneItems.length} isOver={overSection === 'done'} emptyLabel="Nothing completed yet">
            {doneItems.map((todo) => (
              <DraggableCard key={todo.id} todo={todo} {...dragProps}
                onToggle={handleToggle} onDelete={handleDelete} />
            ))}
          </KanbanSection>
        </ScrollView>
      )}

      {/* Toast notifications — overlays all content */}
      <ToastContainer />

      {/* Left sidebar — overlays all content */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
        onLogout={() => { setSidebarOpen(false); void logout(); }}
        remaining={remaining}
      />

      {/* Floating drag clone — rendered outside ScrollView so it doesn't scroll */}
      <Animated.View style={[styles.floatingCard, floatingStyle]} pointerEvents="none">
        {draggingTodo && (
          <>
            <View style={styles.checkbox}/>
            <Text style={styles.cardTitle} numberOfLines={1}>{draggingTodo.title}</Text>
          </>
        )}
      </Animated.View>
    </SafeAreaView>
  );
}

// ── styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root:            { flex: 1, backgroundColor: Colors.bgDeep },
  center:          { flex: 1, alignItems: 'center', justifyContent: 'center' },

  // Hamburger
  menuBtn:         { padding: 4 },
  menuIcon:        { color: Colors.white, fontSize: 20, fontWeight: 'bold' },

  // Header
  header:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                     backgroundColor: Colors.bgMid, paddingHorizontal: 14, paddingVertical: 8,
                     borderBottomWidth: 1, borderBottomColor: Colors.border },
  headerLeft:      { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logo:            { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.accent,
                     alignItems: 'center', justifyContent: 'center' },
  logoCheck:       { color: Colors.white, fontSize: 13, fontWeight: 'bold' },
  appName:         { color: Colors.white, fontSize: 13, fontWeight: 'bold' },
  remaining:       { color: Colors.inProgress, fontSize: 10 },
  headerRight:     { flexDirection: 'row', alignItems: 'center', gap: 8 },
  username:        { color: Colors.textSecondary, fontSize: 12 },
  logoutBtn:       { padding: 4 },
  logoutIcon:      { color: Colors.accent, fontSize: 16, fontWeight: 'bold' },

  // Add bar
  addBar:          { flexDirection: 'row', margin: 14, gap: 10 },
  addInput:        { flex: 1, backgroundColor: Colors.bgCard, borderRadius: 10,
                     borderWidth: 1, borderColor: Colors.border,
                     paddingHorizontal: 14, paddingVertical: 12,
                     color: Colors.white, fontSize: 14 },
  addBtn:          { width: 48, height: 48, borderRadius: 10, backgroundColor: Colors.accent,
                     alignItems: 'center', justifyContent: 'center' },
  addBtnDisabled:  { opacity: 0.6 },
  addBtnText:      { color: Colors.white, fontSize: 24, lineHeight: 28, fontWeight: 'bold' },

  hint:            { color: Colors.textMuted, fontSize: 11, textAlign: 'center', marginBottom: 6 },
  errorText:       { color: Colors.accent, fontSize: 13, textAlign: 'center',
                     marginHorizontal: 16, marginBottom: 8 },
  listContent:     { paddingHorizontal: 14, paddingBottom: 40 },

  // Section
  sectionHeader:   { flexDirection: 'row', alignItems: 'center', gap: 8,
                     marginTop: 18, marginBottom: 6, paddingVertical: 8,
                     paddingHorizontal: 12, borderRadius: 10,
                     borderWidth: 1, borderColor: 'transparent' },
  sectionHeaderOver: { backgroundColor: 'rgba(59,130,246,0.12)', borderColor: Colors.inProgress },
  sectionTitle:    { color: Colors.white, fontSize: 14, fontWeight: '700', flex: 1 },
  sectionTitleOver:{ color: Colors.inProgress },
  badge:           { backgroundColor: Colors.bgMid, borderRadius: 10,
                     paddingHorizontal: 7, paddingVertical: 2 },
  badgeOver:       { backgroundColor: Colors.inProgress },
  badgeText:       { color: Colors.white, fontSize: 11, fontWeight: '600' },
  sectionBody:     { gap: 8, minHeight: 48 },
  emptyLabel:      { color: Colors.textMuted, fontSize: 12, fontStyle: 'italic',
                     textAlign: 'center', paddingVertical: 14 },
  emptyLabelOver:  { color: Colors.inProgress, fontStyle: 'normal', fontWeight: '600' },
  dot:             { width: 10, height: 10, borderRadius: 5 },

  // Card
  card:            { backgroundColor: Colors.bgCard, borderRadius: 12,
                     borderWidth: 1, borderColor: Colors.border,
                     flexDirection: 'row', alignItems: 'center',
                     paddingHorizontal: 14, paddingVertical: 12 },
  cardBody:        { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  checkbox:        { width: 22, height: 22, borderRadius: 11, borderWidth: 2,
                     borderColor: Colors.textSecondary, alignItems: 'center', justifyContent: 'center' },
  checkboxDone:    { backgroundColor: Colors.success, borderColor: Colors.success },
  checkmark:       { color: Colors.white, fontSize: 13, fontWeight: 'bold' },
  cardTitle:       { flex: 1, color: Colors.white, fontSize: 14 },
  cardTitleDone:   { color: Colors.textMuted, textDecorationLine: 'line-through' },
  deleteBtn:       { paddingLeft: 12 },
  deleteIcon:      { color: Colors.textMuted, fontSize: 14 },

  // Floating drag clone
  floatingCard:    { flexDirection: 'row', alignItems: 'center',
                     backgroundColor: Colors.bgCard, borderRadius: 12,
                     borderWidth: 1, borderColor: Colors.inProgress,
                     paddingHorizontal: 14, paddingVertical: 12, gap: 12 },
});
