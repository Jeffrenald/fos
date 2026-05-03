import { useState } from 'react';
import {
  Modal, View, Text, TouchableOpacity, StyleSheet,
  Pressable, Dimensions, FlatList, TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Spacing } from '@/constants/Colors';
import { FontSize } from '@/constants/fonts';
import { EXERCISES, WorkoutType } from '@/constants/exercises';
import { usePlanStore } from '@/stores/planStore';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const E = { sheet: '#1C1C1E', card: '#242428', line: '#333338' };

const FILTERS: { label: string; value: WorkoutType | 'all' }[] = [
  { label: 'All',      value: 'all'  },
  { label: '💪 Push',  value: 'push' },
  { label: '🔗 Pull',  value: 'pull' },
  { label: '🦵 Legs',  value: 'legs' },
  { label: '🔥 Core',  value: 'core' },
];

interface AddExerciseSheetProps {
  dayIndex:       number;
  currentIds:     string[];
  visible:        boolean;
  onClose:        () => void;
}

export function AddExerciseSheet({ dayIndex, currentIds, visible, onClose }: AddExerciseSheetProps) {
  const addExercise    = usePlanStore(s => s.addExerciseToDay);
  const removeExercise = usePlanStore(s => s.removeExerciseFromDay);

  const [filter, setFilter] = useState<WorkoutType | 'all'>('all');
  const [search, setSearch] = useState('');

  const filtered = EXERCISES.filter(ex => {
    const matchFilter = filter === 'all' || ex.type === filter;
    const matchSearch = search === '' || ex.name.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  function toggle(id: string) {
    if (currentIds.includes(id)) removeExercise(dayIndex, id);
    else addExercise(dayIndex, id);
  }

  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={s.overlay}>
        <Pressable style={StyleSheet.absoluteFillObject} onPress={onClose} />

        <View style={s.container}>
          <View style={s.handle} />

          {/* Header */}
          <View style={s.header}>
            <View>
              <Text style={s.title}>Add Exercises</Text>
              <Text style={s.subtitle}>Tap to add or remove from this day</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={s.closeBtn}>
              <Ionicons name="close" size={18} color="#777" />
            </TouchableOpacity>
          </View>

          {/* Search */}
          <View style={s.searchWrap}>
            <Ionicons name="search-outline" size={16} color="#555" />
            <TextInput
              style={s.searchInput}
              placeholder="Search exercises..."
              placeholderTextColor="#444"
              value={search}
              onChangeText={setSearch}
              autoCapitalize="none"
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Ionicons name="close-circle" size={16} color="#555" />
              </TouchableOpacity>
            )}
          </View>

          {/* Filter chips */}
          <View style={s.filterRow}>
            {FILTERS.map(f => (
              <TouchableOpacity
                key={f.value}
                style={[s.chip, filter === f.value && s.chipActive]}
                onPress={() => setFilter(f.value as any)}
                activeOpacity={0.8}
              >
                <Text style={[s.chipText, filter === f.value && s.chipTextActive]}>{f.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Exercise list */}
          <FlatList
            data={filtered}
            keyExtractor={item => item.id}
            contentContainerStyle={s.listContent}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const added = currentIds.includes(item.id);
              return (
                <TouchableOpacity
                  style={[s.exRow, added && s.exRowAdded]}
                  onPress={() => toggle(item.id)}
                  activeOpacity={0.8}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[s.exName, added && s.exNameAdded]}>{item.name}</Text>
                    <Text style={s.exMeta}>
                      {item.musclesPrimary.join(' · ')} · {item.defaultSets}×{item.defaultReps}
                    </Text>
                  </View>
                  <View style={[s.toggle, added && s.toggleAdded, added && {
                    shadowColor: Colors.teal,
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.5,
                    shadowRadius: 6,
                    elevation: 3,
                  }]}>
                    <Ionicons
                      name={added ? 'checkmark' : 'add'}
                      size={16}
                      color={added ? Colors.background : '#555'}
                    />
                  </View>
                </TouchableOpacity>
              );
            }}
          />

          {/* Done */}
          <View style={s.footer}>
            <TouchableOpacity style={s.doneBtn} onPress={onClose} activeOpacity={0.85}>
              <Text style={s.doneBtnText}>Done ({currentIds.length} exercises)</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay:   { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' },
  container: {
    height: SCREEN_HEIGHT * 0.82,
    backgroundColor: E.sheet,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    borderTopWidth: 1, borderColor: E.line,
  },
  handle: {
    width: 36, height: 4, backgroundColor: '#444',
    borderRadius: 2, alignSelf: 'center', marginTop: 10, marginBottom: 4,
  },
  header: {
    flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between',
    paddingHorizontal: Spacing.screenPadding, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: E.line,
  },
  title:    { color: '#FFFFFF', fontSize: FontSize.h3, fontFamily: 'Inter_500Medium' },
  subtitle: { color: '#666', fontSize: FontSize.caption, marginTop: 2 },
  closeBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#2A2A2E', alignItems: 'center', justifyContent: 'center',
  },

  searchWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: E.card, borderRadius: 12,
    borderWidth: 0.5, borderColor: E.line,
    marginHorizontal: Spacing.screenPadding, marginVertical: 12,
    paddingHorizontal: 12, paddingVertical: 10,
  },
  searchInput: { flex: 1, color: '#FFFFFF', fontSize: FontSize.body, padding: 0 },

  filterRow: {
    flexDirection: 'row', gap: 8,
    paddingHorizontal: Spacing.screenPadding, marginBottom: 8,
  },
  chip: {
    paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: Radius.full, borderWidth: 0.5,
    borderColor: E.line, backgroundColor: E.card,
  },
  chipActive:     { backgroundColor: 'rgba(0,201,167,0.12)', borderColor: 'rgba(0,201,167,0.4)' },
  chipText:       { color: '#666', fontSize: FontSize.caption, fontFamily: 'Inter_500Medium' },
  chipTextActive: { color: Colors.teal },

  listContent: { paddingHorizontal: Spacing.screenPadding, paddingBottom: 12 },

  exRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: E.card, borderRadius: 12,
    borderWidth: 0.5, borderColor: E.line,
    padding: 12, marginBottom: 8,
  },
  exRowAdded: { backgroundColor: 'rgba(0,201,167,0.07)', borderColor: 'rgba(0,201,167,0.3)' },
  exName:     { color: '#CCCCCC', fontSize: FontSize.body, fontFamily: 'Inter_500Medium', marginBottom: 2 },
  exNameAdded:{ color: '#FFFFFF' },
  exMeta:     { color: '#555', fontSize: 10, textTransform: 'capitalize' },

  toggle: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: '#2A2A2E', alignItems: 'center', justifyContent: 'center',
    borderWidth: 0.5, borderColor: E.line,
  },
  toggleAdded: { backgroundColor: Colors.teal, borderColor: Colors.teal },

  footer: {
    paddingHorizontal: Spacing.screenPadding, paddingVertical: 14,
    borderTopWidth: 1, borderTopColor: E.line,
  },
  doneBtn: {
    backgroundColor: Colors.teal, borderRadius: 12,
    paddingVertical: 14, alignItems: 'center',
    shadowColor: Colors.teal, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5, shadowRadius: 10, elevation: 5,
  },
  doneBtnText: { color: Colors.background, fontSize: FontSize.body, fontFamily: 'Inter_500Medium' },
});
