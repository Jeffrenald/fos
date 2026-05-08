import { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Modal, Pressable, FlatList, TextInput, Dimensions,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Spacing } from '@/constants/Colors';
import { FontSize } from '@/constants/fonts';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { Card } from '@/components/ui/Card';
import { i18n } from '@/lib/i18n';
import { useUserStore } from '@/stores/userStore';
import { useNutritionStore, MealType, FoodEntry } from '@/stores/nutritionStore';
import { HAITIAN_FOODS, HaitianFood } from '@/constants/haitian-foods-db';

const { width, height } = Dimensions.get('window');
const E = { sheet: '#1C1C1E', card: '#242428', line: '#333338' };

// ─── Helpers ─────────────────────────────────────────────────────────────────

function todayStr() { return new Date().toISOString().split('T')[0]; }

function shiftDate(base: string, days: number): string {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function formatDate(iso: string): string {
  const d = new Date(iso + 'T12:00:00');
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

function isToday(iso: string) { return iso === todayStr(); }

// ─── Macro ring (circular kcal progress) ─────────────────────────────────────

function MacroRing({
  consumed, goal,
}: { consumed: number; goal: number }) {
  const pct     = Math.min(consumed / Math.max(goal, 1), 1);
  const SIZE    = 120;
  const STROKE  = 10;
  const R       = (SIZE - STROKE) / 2;
  const CIRC    = 2 * Math.PI * R;
  const offset  = CIRC * (1 - pct);
  const color   = pct >= 1 ? Colors.danger : Colors.teal;

  return (
    <View style={{ width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center' }}>
      {/* Background ring */}
      <View style={{
        position: 'absolute', width: SIZE, height: SIZE,
        borderRadius: SIZE / 2,
        borderWidth: STROKE, borderColor: '#1E1E20',
      }} />
      {/* Progress - use a simple arc approximation with View transforms */}
      <View style={{
        position: 'absolute', width: SIZE, height: SIZE,
        borderRadius: SIZE / 2,
        borderWidth: STROKE,
        borderColor: color,
        opacity: pct,
        transform: [{ rotate: `${-90 + pct * 360}deg` }],
        borderTopColor: 'transparent',
        borderRightColor: pct > 0.25 ? color : 'transparent',
        borderBottomColor: pct > 0.5 ? color : 'transparent',
        borderLeftColor: pct > 0.75 ? color : 'transparent',
      }} />
      {/* Center text */}
      <Text style={{ color: '#FFFFFF', fontSize: FontSize.h2, fontFamily: 'Inter_500Medium' }}>
        {consumed}
      </Text>
      <Text style={{ color: '#555', fontSize: 9, marginTop: 2 }}>/ {goal} kcal</Text>
    </View>
  );
}

// ─── Macro bar ────────────────────────────────────────────────────────────────

function MacroBar({
  label, value, goal, color,
}: { label: string; value: number; goal: number; color: string }) {
  const pct = Math.min(value / Math.max(goal, 1), 1);
  return (
    <View style={mb.wrap}>
      <View style={mb.labelRow}>
        <Text style={mb.label}>{label}</Text>
        <Text style={[mb.value, { color }]}>{value}g <Text style={mb.goal}>/ {goal}g</Text></Text>
      </View>
      <View style={mb.track}>
        <View style={[mb.fill, { width: `${pct * 100}%` as any, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const mb = StyleSheet.create({
  wrap:     { marginBottom: 10 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  label:    { color: '#AAAAAA', fontSize: FontSize.caption },
  value:    { fontSize: FontSize.caption, fontFamily: 'Inter_500Medium' },
  goal:     { color: '#555', fontFamily: 'Inter_400Regular' },
  track:    { height: 5, backgroundColor: '#1E1E20', borderRadius: 3, overflow: 'hidden' },
  fill:     { height: 5, borderRadius: 3 },
});

// ─── Water tracker ────────────────────────────────────────────────────────────

function WaterTracker({
  cups, onAdd, onRemove,
}: { cups: number; onAdd: () => void; onRemove: () => void }) {
  return (
    <View style={wt.wrap}>
      <View style={wt.left}>
        <Ionicons name="water-outline" size={18} color="#5A78FF" />
        <Text style={wt.label}>{i18n.t('nutrition.water')}</Text>
      </View>
      <View style={wt.cups}>
        {Array.from({ length: 8 }).map((_, i) => (
          <TouchableOpacity
            key={i}
            onPress={i < cups ? onRemove : onAdd}
            activeOpacity={0.7}
          >
            <Ionicons
              name={i < cups ? 'water' : 'water-outline'}
              size={20}
              color={i < cups ? '#5A78FF' : '#252528'}
            />
          </TouchableOpacity>
        ))}
      </View>
      <Text style={wt.count}>{cups}/8</Text>
    </View>
  );
}

const wt = StyleSheet.create({
  wrap:  { flexDirection: 'row', alignItems: 'center', gap: 12 },
  left:  { flexDirection: 'row', alignItems: 'center', gap: 6 },
  label: { color: '#AAAAAA', fontSize: FontSize.caption },
  cups:  { flexDirection: 'row', gap: 4, flex: 1 },
  count: { color: '#555', fontSize: FontSize.caption },
});

// ─── Add Food Sheet ───────────────────────────────────────────────────────────

function AddFoodSheet({
  visible, mealType, date, onClose,
}: {
  visible: boolean; mealType: MealType | null; date: string; onClose: () => void;
}) {
  const addEntry = useNutritionStore(s => s.addEntry);
  const [search, setSearch] = useState('');

  const filtered = HAITIAN_FOODS.filter(f =>
    search === '' ||
    f.name_en.toLowerCase().includes(search.toLowerCase()) ||
    f.name_ht.toLowerCase().includes(search.toLowerCase())
  );

  function add(food: HaitianFood) {
    if (!mealType) return;
    addEntry(date, mealType, {
      food_name:  food.name_en,
      food_id:    food.id,
      isHaitian:  true,
      calories:   food.kcal,
      protein_g:  food.p,
      carbs_g:    food.c,
      fat_g:      food.f,
      meal_type:  mealType,
    });
    onClose();
  }

  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={afs.overlay}>
        <Pressable style={StyleSheet.absoluteFillObject} onPress={onClose} />
        <View style={afs.sheet}>
          <View style={afs.handle} />
          <View style={afs.header}>
            <View>
              <Text style={afs.title}>{i18n.t('nutrition.addFood')}</Text>
              <Text style={afs.subtitle}>
                {mealType ? i18n.t(`nutrition.${mealType}`) : ''}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={afs.closeBtn}>
              <Ionicons name="close" size={18} color="#777" />
            </TouchableOpacity>
          </View>

          <View style={afs.searchWrap}>
            <Ionicons name="search-outline" size={15} color="#555" />
            <TextInput
              style={afs.searchInput}
              value={search}
              onChangeText={setSearch}
              placeholder="Search Haitian foods…"
              placeholderTextColor="#3A3A3E"
              autoCapitalize="none"
            />
          </View>

          <FlatList
            data={filtered}
            keyExtractor={f => f.id}
            contentContainerStyle={afs.list}
            showsVerticalScrollIndicator={false}
            renderItem={({ item: food }) => (
              <TouchableOpacity style={afs.foodRow} onPress={() => add(food)} activeOpacity={0.8}>
                <View style={{ flex: 1 }}>
                  <View style={afs.foodNameRow}>
                    <Text style={afs.foodName}>{food.name_en}</Text>
                    <View style={afs.haitianTag}>
                      <Text style={afs.haitianTagText}>🇭🇹 {food.name_ht}</Text>
                    </View>
                  </View>
                  <Text style={afs.foodMeta}>
                    {food.serving_g}g · {food.p}g protein · {food.c}g carbs · {food.f}g fat
                  </Text>
                </View>
                <Text style={afs.kcal}>{food.kcal}</Text>
                <Text style={afs.kcalLabel}>kcal</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );
}

const afs = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' },
  sheet: {
    height: height * 0.82, backgroundColor: E.sheet,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    borderTopWidth: 1, borderColor: E.line,
  },
  handle:   { width: 36, height: 4, backgroundColor: '#444', borderRadius: 2, alignSelf: 'center', marginTop: 10, marginBottom: 4 },
  header:   { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', paddingHorizontal: Spacing.screenPadding, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: E.line },
  title:    { color: '#FFFFFF', fontSize: FontSize.h3, fontFamily: 'Inter_500Medium' },
  subtitle: { color: '#666', fontSize: FontSize.caption, marginTop: 2 },
  closeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#2A2A2E', alignItems: 'center', justifyContent: 'center' },
  searchWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#141416', borderRadius: 12, borderWidth: 0.5, borderColor: '#1E1E20', paddingHorizontal: 12, paddingVertical: 10, margin: Spacing.screenPadding, marginBottom: 8 },
  searchInput: { flex: 1, color: '#FFFFFF', fontSize: FontSize.body, padding: 0 },
  list: { paddingHorizontal: Spacing.screenPadding, paddingBottom: 32 },
  foodRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: E.card, borderRadius: 12, borderWidth: 0.5, borderColor: E.line, padding: 12, marginBottom: 8 },
  foodNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' },
  foodName: { color: '#FFFFFF', fontSize: FontSize.body, fontFamily: 'Inter_500Medium' },
  haitianTag: { backgroundColor: 'rgba(206,17,38,0.12)', borderRadius: Radius.full, paddingHorizontal: 7, paddingVertical: 2 },
  haitianTagText: { color: Colors.danger, fontSize: 10 },
  foodMeta: { color: '#555', fontSize: 10 },
  kcal:      { color: Colors.teal, fontSize: FontSize.bodyLg, fontFamily: 'Inter_500Medium' },
  kcalLabel: { color: '#555', fontSize: 9 },
});

// ─── Meal Section ─────────────────────────────────────────────────────────────

const MEAL_LABELS: Record<MealType, string> = {
  breakfast: '🌅', lunch: '☀️', dinner: '🌙', snack: '🍎',
};

function MealSection({
  mealType, entries, onAdd, onRemove,
}: {
  mealType: MealType;
  entries: FoodEntry[];
  onAdd: () => void;
  onRemove: (id: string) => void;
}) {
  const total = entries.reduce((sum, e) => sum + e.calories, 0);
  const label = i18n.t(`nutrition.${mealType}`);
  const emoji = MEAL_LABELS[mealType];

  return (
    <View style={ms.wrap}>
      <View style={ms.header}>
        <Text style={ms.emoji}>{emoji}</Text>
        <Text style={ms.label}>{label}</Text>
        {total > 0 && <Text style={ms.total}>{total} kcal</Text>}
      </View>

      {entries.map(entry => (
        <View key={entry.id} style={ms.entryRow}>
          <View style={{ flex: 1 }}>
            <View style={ms.entryNameRow}>
              <Text style={ms.entryName}>{entry.food_name}</Text>
              {entry.isHaitian && (
                <View style={ms.hTag}><Text style={ms.hTagText}>🇭🇹</Text></View>
              )}
            </View>
            <Text style={ms.entryMeta}>
              P {entry.protein_g}g · C {entry.carbs_g}g · F {entry.fat_g}g
            </Text>
          </View>
          <Text style={ms.entryKcal}>{entry.calories}</Text>
          <TouchableOpacity onPress={() => onRemove(entry.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close-circle-outline" size={18} color="#333" />
          </TouchableOpacity>
        </View>
      ))}

      <TouchableOpacity style={ms.addBtn} onPress={onAdd} activeOpacity={0.8}>
        <Ionicons name="add" size={16} color={Colors.teal} />
        <Text style={ms.addBtnText}>{i18n.t('nutrition.addFood')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const ms = StyleSheet.create({
  wrap:   { backgroundColor: E.card, borderRadius: 16, borderWidth: 0.5, borderColor: E.line, marginBottom: 12, overflow: 'hidden' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 14, borderBottomWidth: 0.5, borderBottomColor: E.line },
  emoji:  { fontSize: 18 },
  label:  { flex: 1, color: '#FFFFFF', fontSize: FontSize.body, fontFamily: 'Inter_500Medium' },
  total:  { color: Colors.teal, fontSize: FontSize.caption, fontFamily: 'Inter_500Medium' },
  entryRow:    { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: '#1A1A1C' },
  entryNameRow:{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3 },
  entryName:   { color: '#CCCCCC', fontSize: FontSize.bodySm, fontFamily: 'Inter_500Medium' },
  hTag:        { backgroundColor: 'rgba(206,17,38,0.12)', borderRadius: Radius.full, paddingHorizontal: 5, paddingVertical: 1 },
  hTagText:    { fontSize: 9 },
  entryMeta:   { color: '#444', fontSize: 10 },
  entryKcal:   { color: Colors.teal, fontSize: FontSize.caption, fontFamily: 'Inter_500Medium', minWidth: 36, textAlign: 'right' },
  addBtn:      { flexDirection: 'row', alignItems: 'center', gap: 6, padding: 14 },
  addBtnText:  { color: Colors.teal, fontSize: FontSize.caption, fontFamily: 'Inter_500Medium' },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────

const CALORIE_GOALS: Record<string, number> = {
  muscle: 2800, weight_loss: 1800, toned: 2200, active: 2400,
};
const MACRO_GOALS = {
  muscle:      { protein: 180, carbs: 280, fat: 80 },
  weight_loss: { protein: 150, carbs: 150, fat: 60 },
  toned:       { protein: 160, carbs: 200, fat: 70 },
  active:      { protein: 160, carbs: 240, fat: 75 },
};

const MEALS: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];

const GOAL_BY_TARGET: Record<string, { kcal: number; protein: number; carbs: number; fat: number }> = {
  muscle:      { kcal: 2800, protein: 180, carbs: 280, fat: 80 },
  weight_loss: { kcal: 1800, protein: 150, carbs: 150, fat: 60 },
  toned:       { kcal: 2200, protein: 160, carbs: 200, fat: 70 },
  active:      { kcal: 2400, protein: 160, carbs: 240, fat: 75 },
};

export default function NutritionScreen() {
  const user = useUserStore(s => s.user);
  const [date,        setDate]        = useState(todayStr());
  const [addMeal,     setAddMeal]     = useState<MealType | null>(null);
  const [refreshing,  setRefreshing]  = useState(false);

  const { getDay, addEntry, removeEntry, addWater, removeWater } = useNutritionStore();
  // Re-read day on each render so it updates after entries are added
  const day = getDay(date);

  // Goals derived from user's fitness objective
  const goals     = GOAL_BY_TARGET[user?.goal ?? 'active'] ?? GOAL_BY_TARGET.active;
  const kcalGoal  = goals.kcal;
  const macroGoal = { protein: goals.protein, carbs: goals.carbs, fat: goals.fat };

  const totals = day.entries.reduce(
    (acc, e) => ({
      kcal:    acc.kcal    + e.calories,
      protein: acc.protein + e.protein_g,
      carbs:   acc.carbs   + e.carbs_g,
      fat:     acc.fat     + e.fat_g,
    }),
    { kcal: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const kcalLeft = Math.max(0, kcalGoal - totals.kcal);

  return (
    <>
      <ScreenWrapper
        scrollable
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); setTimeout(() => setRefreshing(false), 600); }}
            tintColor={Colors.teal}
          />
        }
      >
        {/* ── Header ── */}
        <Text style={s.heading}>{i18n.t('nutrition.title')} 🥗</Text>

        {/* ── Date navigator ── */}
        <View style={s.dateNav}>
          <TouchableOpacity onPress={() => setDate(shiftDate(date, -1))} style={s.dateArrow}>
            <Ionicons name="chevron-back" size={20} color={Colors.teal} />
          </TouchableOpacity>
          <View style={{ alignItems: 'center' }}>
            <Text style={s.dateLabel}>{formatDate(date)}</Text>
            {isToday(date) && <Text style={s.todayBadge}>Today</Text>}
          </View>
          <TouchableOpacity
            onPress={() => setDate(shiftDate(date, 1))}
            style={s.dateArrow}
            disabled={isToday(date)}
          >
            <Ionicons name="chevron-forward" size={20} color={isToday(date) ? '#2A2A2E' : Colors.teal} />
          </TouchableOpacity>
        </View>

        {/* ── Macro hero card ── */}
        <Card style={s.macroCard}>
          <View style={s.macroTop}>
            <MacroRing consumed={totals.kcal} goal={kcalGoal} />
            <View style={s.macroBars}>
              <MacroBar label={i18n.t('nutrition.protein')} value={Math.round(totals.protein)} goal={macroGoal.protein} color={Colors.protein} />
              <MacroBar label={i18n.t('nutrition.carbs')}   value={Math.round(totals.carbs)}   goal={macroGoal.carbs}   color={Colors.carbs}   />
              <MacroBar label={i18n.t('nutrition.fat')}     value={Math.round(totals.fat)}      goal={macroGoal.fat}     color={Colors.fat}     />
            </View>
          </View>
          <Text style={s.kcalLeft}>
            {kcalLeft > 0
              ? `${kcalLeft} kcal remaining`
              : `${Math.abs(kcalLeft)} kcal over goal`}
          </Text>
        </Card>

        {/* ── Water tracker ── */}
        <Card style={s.waterCard}>
          <WaterTracker
            cups={day.waterCups}
            onAdd={() => addWater(date)}
            onRemove={() => removeWater(date)}
          />
        </Card>

        {/* ── Meal sections ── */}
        {MEALS.map(meal => (
          <MealSection
            key={meal}
            mealType={meal}
            entries={day.entries.filter(e => e.meal_type === meal)}
            onAdd={() => setAddMeal(meal)}
            onRemove={(id) => removeEntry(date, id)}
          />
        ))}

      </ScreenWrapper>

      <AddFoodSheet
        visible={addMeal !== null}
        mealType={addMeal}
        date={date}
        onClose={() => setAddMeal(null)}
      />
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  heading:  { color: '#FFFFFF', fontSize: FontSize.h1, fontFamily: 'Inter_500Medium', marginBottom: 16 },

  dateNav:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  dateArrow:{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#1A1A1C', alignItems: 'center', justifyContent: 'center', borderWidth: 0.5, borderColor: '#252528' },
  dateLabel:{ color: '#FFFFFF', fontSize: FontSize.body, fontFamily: 'Inter_500Medium' },
  todayBadge:{ color: Colors.teal, fontSize: 10, marginTop: 2 },

  macroCard: { marginBottom: 12, gap: 14 },
  macroTop:  { flexDirection: 'row', alignItems: 'center', gap: 20 },
  macroBars: { flex: 1 },
  kcalLeft:  { color: '#555', fontSize: FontSize.caption, textAlign: 'center', fontStyle: 'italic' },

  waterCard: { marginBottom: 16, paddingVertical: 12 },
});
