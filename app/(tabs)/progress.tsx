import { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Modal, Pressable, TextInput, Dimensions,
  ScrollView, RefreshControl, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius } from '@/constants/Colors';
import { FontSize } from '@/constants/fonts';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { Card } from '@/components/ui/Card';
import { supabase } from '@/lib/supabase';
import { useUserStore } from '@/stores/userStore';
import { i18n } from '@/lib/i18n';
import { DAY_LABELS } from '@/lib/planGenerator';

const { width } = Dimensions.get('window');
const E = { sheet: '#1C1C1E', card: '#242428', line: '#333338' };

// ─── Types ────────────────────────────────────────────────────────────────────

interface BodyMetric {
  id: string;
  recorded_at: string;
  weight_kg:     number | null;
  body_fat_pct:  number | null;
  waist_cm:      number | null;
  chest_cm:      number | null;
}

interface PR {
  exercise_name: string;
  max_weight:    number;
  max_reps:      number;
}

interface WeeklyBar { dayIdx: number; volume: number; }

// ─── Helpers ─────────────────────────────────────────────────────────────────

function thisWeekStart(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function todayMonIdx(): number {
  const d = new Date().getDay();
  return d === 0 ? 6 : d - 1;
}

function delta(current: number | null, previous: number | null): string | null {
  if (current == null || previous == null) return null;
  const diff = current - previous;
  if (diff === 0) return null;
  return `${diff > 0 ? '+' : ''}${diff.toFixed(1)}`;
}

// ─── Log Metrics Sheet ────────────────────────────────────────────────────────

function LogMetricsSheet({
  visible, onClose, onSaved,
}: {
  visible: boolean; onClose: () => void; onSaved: () => void;
}) {
  const user = useUserStore(s => s.user);
  const [weight,  setWeight]  = useState('');
  const [fat,     setFat]     = useState('');
  const [waist,   setWaist]   = useState('');
  const [chest,   setChest]   = useState('');
  const [saving,  setSaving]  = useState(false);

  async function save() {
    if (!user?.id) return;
    setSaving(true);
    try {
      await supabase.from('body_metrics').insert({
        user_id:      user.id,
        recorded_at:  new Date().toISOString().split('T')[0],
        weight_kg:    weight   ? parseFloat(weight)   : null,
        body_fat_pct: fat      ? parseFloat(fat)      : null,
        waist_cm:     waist    ? parseFloat(waist)    : null,
        chest_cm:     chest    ? parseFloat(chest)    : null,
      });
      setWeight(''); setFat(''); setWaist(''); setChest('');
      onSaved();
      onClose();
    } catch (e) { Alert.alert('Error', 'Could not save metrics.'); }
    finally { setSaving(false); }
  }

  const fields = [
    { label: 'Weight (kg)',   value: weight,  set: setWeight,  placeholder: '75.0' },
    { label: 'Body fat (%)',  value: fat,     set: setFat,     placeholder: '18.0' },
    { label: 'Waist (cm)',    value: waist,   set: setWaist,   placeholder: '82.0' },
    { label: 'Chest (cm)',    value: chest,   set: setChest,   placeholder: '98.0' },
  ];

  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={ms.overlay}>
        <Pressable style={StyleSheet.absoluteFillObject} onPress={onClose} />
        <View style={ms.sheet}>
          <View style={ms.handle} />
          <View style={ms.header}>
            <Text style={ms.title}>Log Body Metrics</Text>
            <TouchableOpacity onPress={onClose} style={ms.closeBtn}>
              <Ionicons name="close" size={18} color="#777" />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={{ padding: Spacing.screenPadding, paddingBottom: 32 }}>
            <Text style={ms.note}>Leave any field blank to skip it.</Text>
            {fields.map(f => (
              <View key={f.label} style={ms.fieldWrap}>
                <Text style={ms.fieldLabel}>{f.label}</Text>
                <TextInput
                  style={ms.input}
                  value={f.value}
                  onChangeText={f.set}
                  placeholder={f.placeholder}
                  placeholderTextColor="#444"
                  keyboardType="decimal-pad"
                />
              </View>
            ))}
            <TouchableOpacity
              style={[ms.saveBtn, saving && { opacity: 0.6 }, {
                shadowColor: Colors.teal, shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.5, shadowRadius: 10, elevation: 5,
              }]}
              onPress={save}
              disabled={saving}
              activeOpacity={0.85}
            >
              <Text style={ms.saveBtnText}>{saving ? 'Saving…' : 'Save Metrics'}</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const ms = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' },
  sheet: {
    height: Dimensions.get('window').height * 0.65,
    backgroundColor: E.sheet, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    borderTopWidth: 1, borderColor: E.line,
  },
  handle: { width: 36, height: 4, backgroundColor: '#444', borderRadius: 2, alignSelf: 'center', marginTop: 10, marginBottom: 4 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.screenPadding, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: E.line,
  },
  title:    { color: '#FFFFFF', fontSize: FontSize.h3, fontFamily: 'Inter_500Medium' },
  closeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#2A2A2E', alignItems: 'center', justifyContent: 'center' },
  note:     { color: '#555', fontSize: FontSize.caption, marginBottom: 16, fontStyle: 'italic' },
  fieldWrap:{ marginBottom: 14 },
  fieldLabel:{ color: '#AAAAAA', fontSize: FontSize.caption, fontFamily: 'Inter_500Medium', marginBottom: 6 },
  input: {
    backgroundColor: E.card, borderRadius: 12, borderWidth: 0.5, borderColor: E.line,
    paddingHorizontal: 14, paddingVertical: 12,
    color: '#FFFFFF', fontSize: FontSize.body, fontFamily: 'Inter_500Medium',
  },
  saveBtn:    { backgroundColor: Colors.teal, borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  saveBtnText:{ color: Colors.background, fontSize: FontSize.body, fontFamily: 'Inter_500Medium' },
});

// ─── Progress Screen ──────────────────────────────────────────────────────────

export default function ProgressScreen() {
  const user = useUserStore(s => s.user);
  const uid  = user?.id;

  const [sessions,    setSessions]    = useState<any[]>([]);
  const [prs,         setPRs]         = useState<PR[]>([]);
  const [metrics,     setMetrics]     = useState<BodyMetric[]>([]);
  const [weekBars,    setWeekBars]    = useState<WeeklyBar[]>([]);
  const [streak,      setStreak]      = useState(0);
  const [logOpen,     setLogOpen]     = useState(false);
  const [refreshing,  setRefreshing]  = useState(false);

  const fetch = useCallback(async () => {
    if (!uid) return;

    const [sessRes, logsRes, metricsRes] = await Promise.all([
      supabase
        .from('workout_sessions')
        .select('started_at, duration_seconds, total_volume_kg, completed_at')
        .eq('user_id', uid)
        .not('completed_at', 'is', null)
        .order('started_at', { ascending: false }),

      supabase
        .from('exercise_logs')
        .select('exercise_name, weight_kg, reps')
        .order('weight_kg', { ascending: false }),

      supabase
        .from('body_metrics')
        .select('*')
        .eq('user_id', uid)
        .order('recorded_at', { ascending: false })
        .limit(10),
    ]);

    const allSessions = sessRes.data ?? [];
    setSessions(allSessions);

    // Weekly bars
    const weekStart = thisWeekStart();
    const thisWeek  = allSessions.filter(s => s.started_at >= weekStart);
    const bars: WeeklyBar[] = DAY_LABELS.map((_, i) => ({ dayIdx: i, volume: 0 }));
    thisWeek.forEach(s => {
      const d = new Date(s.started_at).getDay();
      const idx = d === 0 ? 6 : d - 1;
      bars[idx].volume += s.total_volume_kg ?? 0;
    });
    setWeekBars(bars);

    // Streak
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const sessionDays = new Set(allSessions.map(s => s.started_at.split('T')[0]));
    let s = 0;
    for (let i = 0; i < 365; i++) {
      const d = new Date(today); d.setDate(d.getDate() - i);
      if (sessionDays.has(d.toISOString().split('T')[0])) s++;
      else if (i > 0) break;
    }
    setStreak(s);

    // PRs — max weight per exercise
    const allLogs = logsRes.data ?? [];
    const prMap   = new Map<string, { max_weight: number; max_reps: number }>();
    allLogs.forEach(l => {
      if (!l.exercise_name || !l.weight_kg) return;
      const cur = prMap.get(l.exercise_name);
      if (!cur || l.weight_kg > cur.max_weight) {
        prMap.set(l.exercise_name, { max_weight: l.weight_kg, max_reps: l.reps ?? 0 });
      }
    });
    const prList = Array.from(prMap.entries())
      .map(([exercise_name, v]) => ({ exercise_name, ...v }))
      .sort((a, b) => b.max_weight - a.max_weight)
      .slice(0, 8);
    setPRs(prList);

    setMetrics((metricsRes.data ?? []) as BodyMetric[]);
    setRefreshing(false);
  }, [uid]);

  useEffect(() => { fetch(); }, [fetch]);

  const latestMetric  = metrics[0] ?? null;
  const prevMetric    = metrics[1] ?? null;
  const totalVolume   = sessions.reduce((sum, s) => sum + (s.total_volume_kg ?? 0), 0);
  const maxBar        = Math.max(...weekBars.map(b => b.volume), 1);
  const todayIdx      = todayMonIdx();

  return (
    <>
      <ScreenWrapper
        scrollable
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetch(); }} tintColor={Colors.teal} />}
      >
        {/* ── Header ── */}
        <View style={s.header}>
          <View>
            <Text style={s.title}>{i18n.t('progress.title')} 📊</Text>
            <Text style={s.subtitle}>Keep showing up. Jodi a konte.</Text>
          </View>
        </View>

        {/* ── Hero stats ── */}
        <View style={s.heroRow}>
          {[
            { label: 'Sessions',   value: `${sessions.length}` },
            { label: 'Day Streak', value: `${streak}` },
            { label: 'Total Volume', value: totalVolume > 0 ? `${Math.round(totalVolume)}kg` : '—' },
          ].map(stat => (
            <View key={stat.label} style={[s.heroCard, {
              shadowColor: Colors.teal, shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.2, shadowRadius: 8, elevation: 3,
            }]}>
              <Text style={s.heroValue}>{stat.value}</Text>
              <Text style={s.heroLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* ── Weekly volume chart ── */}
        <Text style={s.sectionTitle}>This Week's Volume</Text>
        <Card style={s.chartCard}>
          <View style={s.barsRow}>
            {weekBars.map(bar => {
              const isToday = bar.dayIdx === todayIdx;
              const height  = bar.volume > 0 ? Math.max(8, (bar.volume / maxBar) * 80) : 4;
              return (
                <View key={bar.dayIdx} style={s.barCol}>
                  <View style={[
                    s.bar,
                    { height },
                    isToday ? s.barToday : bar.volume > 0 ? s.barDone : s.barEmpty,
                    isToday && bar.volume > 0 && {
                      shadowColor: Colors.teal, shadowOffset: { width: 0, height: 0 },
                      shadowOpacity: 0.6, shadowRadius: 6, elevation: 3,
                    },
                  ]} />
                  <Text style={[s.barLabel, isToday && s.barLabelToday]}>
                    {DAY_LABELS[bar.dayIdx]}
                  </Text>
                </View>
              );
            })}
          </View>
        </Card>

        {/* ── Body metrics ── */}
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>Body Metrics</Text>
          <TouchableOpacity style={s.logBtn} onPress={() => setLogOpen(true)} activeOpacity={0.8}>
            <Ionicons name="add" size={14} color={Colors.teal} />
            <Text style={s.logBtnText}>Log</Text>
          </TouchableOpacity>
        </View>

        <View style={s.metricsGrid}>
          {[
            { label: 'Weight',    key: 'weight_kg',    unit: 'kg', icon: '⚖️' },
            { label: 'Body Fat',  key: 'body_fat_pct', unit: '%',  icon: '📉' },
            { label: 'Waist',     key: 'waist_cm',     unit: 'cm', icon: '📏' },
            { label: 'Chest',     key: 'chest_cm',     unit: 'cm', icon: '💪' },
          ].map(m => {
            const cur  = latestMetric?.[m.key as keyof BodyMetric] as number | null;
            const prev = prevMetric?.[m.key as keyof BodyMetric] as number | null;
            const d    = delta(cur, prev);
            const isUp = d != null && parseFloat(d) > 0;
            return (
              <View key={m.label} style={s.metricCard}>
                <Text style={s.metricIcon}>{m.icon}</Text>
                <Text style={s.metricValue}>
                  {cur != null ? `${cur}${m.unit}` : '—'}
                </Text>
                {d && (
                  <View style={[s.deltaBadge, { backgroundColor: isUp ? 'rgba(255,122,133,0.12)' : 'rgba(63,204,147,0.12)' }]}>
                    <Ionicons name={isUp ? 'arrow-up' : 'arrow-down'} size={10} color={isUp ? Colors.danger : Colors.success} />
                    <Text style={[s.deltaText, { color: isUp ? Colors.danger : Colors.success }]}>{Math.abs(parseFloat(d))}</Text>
                  </View>
                )}
                <Text style={s.metricLabel}>{m.label}</Text>
              </View>
            );
          })}
        </View>

        {/* ── Personal Records ── */}
        <Text style={s.sectionTitle}>Personal Records</Text>
        {prs.length === 0 ? (
          <Card style={s.emptyCard}>
            <Text style={s.emptyText}>Complete workouts to see your personal records here.</Text>
          </Card>
        ) : (
          prs.map((pr, i) => (
            <View key={pr.exercise_name} style={[s.prRow, i === 0 && {
              borderColor: 'rgba(240,176,64,0.35)',
              shadowColor: '#F0B040', shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.35, shadowRadius: 8, elevation: 3,
            }]}>
              <View style={[s.prRank, i === 0 && s.prRankGold]}>
                <Text style={[s.prRankText, i === 0 && { color: '#F0B040' }]}>
                  {i === 0 ? '🏆' : `#${i + 1}`}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.prName}>{pr.exercise_name}</Text>
                {pr.max_reps > 0 && (
                  <Text style={s.prReps}>{pr.max_reps} reps</Text>
                )}
              </View>
              <Text style={s.prWeight}>{pr.max_weight}kg</Text>
            </View>
          ))
        )}

        {/* ── Progress photos ── */}
        <Text style={[s.sectionTitle, { marginTop: 8 }]}>{i18n.t('progress.progressPhotos')}</Text>
        <View style={s.photoGrid}>
          {/* First slot: add */}
          <TouchableOpacity style={s.photoAdd} activeOpacity={0.8}>
            <Ionicons name="camera-outline" size={24} color={Colors.teal} />
            <Text style={s.photoAddText}>{i18n.t('progress.addPhoto')}</Text>
          </TouchableOpacity>
          {/* Locked slots */}
          {[1, 2, 3].map(n => (
            <View key={n} style={s.photoLocked}>
              <Ionicons name="lock-closed-outline" size={20} color="#333" />
              <Text style={s.photoLockedText}>Add a photo{'\n'}to unlock</Text>
            </View>
          ))}
        </View>

      </ScreenWrapper>

      <LogMetricsSheet
        visible={logOpen}
        onClose={() => setLogOpen(false)}
        onSaved={fetch}
      />
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const CARD_W = (width - Spacing.screenPadding * 2 - 12) / 2;

const s = StyleSheet.create({
  header:   { marginBottom: 20 },
  title:    { color: '#FFFFFF', fontSize: FontSize.h1, fontFamily: 'Inter_500Medium' },
  subtitle: { color: '#555', fontSize: FontSize.caption, marginTop: 3, fontStyle: 'italic' },

  // Hero
  heroRow:   { flexDirection: 'row', gap: 10, marginBottom: 20 },
  heroCard: {
    flex: 1, backgroundColor: E.card, borderRadius: 14,
    borderWidth: 0.5, borderColor: 'rgba(0,201,167,0.2)',
    padding: 12, alignItems: 'center', gap: 4,
  },
  heroValue: { color: Colors.teal, fontSize: FontSize.h2, fontFamily: 'Inter_500Medium' },
  heroLabel: { color: '#666', fontSize: 9, textAlign: 'center' },

  sectionTitle:  { color: '#FFFFFF', fontSize: FontSize.bodyLg, fontFamily: 'Inter_500Medium', marginBottom: 12 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  logBtn:  { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(0,201,167,0.1)', borderRadius: Radius.full, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 0.5, borderColor: 'rgba(0,201,167,0.3)' },
  logBtnText: { color: Colors.teal, fontSize: FontSize.caption, fontFamily: 'Inter_500Medium' },

  // Chart
  chartCard: { marginBottom: 20, paddingVertical: 12 },
  barsRow:   { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 96, paddingTop: 16 },
  barCol:    { flex: 1, alignItems: 'center', gap: 6 },
  bar:       { width: 20, borderRadius: 4, minHeight: 4 },
  barToday:  { backgroundColor: Colors.teal },
  barDone:   { backgroundColor: '#2A2A3A' },
  barEmpty:  { backgroundColor: '#1A1A1C' },
  barLabel:      { color: '#444', fontSize: 8, fontFamily: 'Inter_500Medium' },
  barLabelToday: { color: Colors.teal },

  // Metrics
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  metricCard: {
    width: CARD_W, backgroundColor: E.card, borderRadius: 14,
    borderWidth: 0.5, borderColor: E.line,
    padding: 14, alignItems: 'center', gap: 5,
  },
  metricIcon:  { fontSize: 22 },
  metricValue: { color: '#FFFFFF', fontSize: FontSize.h2, fontFamily: 'Inter_500Medium' },
  metricLabel: { color: '#666', fontSize: 10 },
  deltaBadge:  { flexDirection: 'row', alignItems: 'center', gap: 3, borderRadius: Radius.full, paddingHorizontal: 6, paddingVertical: 2 },
  deltaText:   { fontSize: 10, fontFamily: 'Inter_500Medium' },

  // PRs
  prRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: E.card, borderRadius: 12,
    borderWidth: 0.5, borderColor: E.line,
    padding: 12, marginBottom: 8,
  },
  prRank:     { width: 36, height: 36, borderRadius: 18, backgroundColor: '#1A1A1C', alignItems: 'center', justifyContent: 'center' },
  prRankGold: { backgroundColor: 'rgba(240,176,64,0.1)' },
  prRankText: { color: '#555', fontSize: 10, fontFamily: 'Inter_500Medium' },
  prName:     { color: '#FFFFFF', fontSize: FontSize.body, fontFamily: 'Inter_500Medium', marginBottom: 2 },
  prReps:     { color: '#666', fontSize: 10 },
  prWeight:   { color: Colors.teal, fontSize: FontSize.h3, fontFamily: 'Inter_500Medium' },

  // Empty
  emptyCard: { alignItems: 'center', paddingVertical: 24, marginBottom: 16 },
  emptyText: { color: '#555', fontSize: FontSize.bodySm, textAlign: 'center', fontStyle: 'italic', lineHeight: 20 },

  // Photos
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  photoAdd: {
    width: CARD_W, aspectRatio: 3 / 4,
    backgroundColor: 'rgba(0,201,167,0.06)',
    borderRadius: 14, borderWidth: 1,
    borderColor: 'rgba(0,201,167,0.25)',
    borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  photoAddText:   { color: Colors.teal, fontSize: FontSize.caption, fontFamily: 'Inter_500Medium' },
  photoLocked: {
    width: CARD_W, aspectRatio: 3 / 4,
    backgroundColor: '#111113',
    borderRadius: 14, borderWidth: 0.5,
    borderColor: '#1E1E20',
    alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  photoLockedText:{ color: '#333', fontSize: 10, textAlign: 'center', lineHeight: 16 },
});
