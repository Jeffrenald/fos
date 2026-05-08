import { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Modal, Pressable, Switch, Dimensions, Alert,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius } from '@/constants/Colors';
import { FontSize } from '@/constants/fonts';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { supabase } from '@/lib/supabase';
import { useUserStore } from '@/stores/userStore';
import { usePlanStore } from '@/stores/planStore';
import { i18n, setLanguage, Language } from '@/lib/i18n';

const E = { sheet: '#1C1C1E', card: '#242428', line: '#333338' };

// ─── Generic Picker Sheet ─────────────────────────────────────────────────────

interface PickerOption { label: string; value: string; emoji?: string; }

function PickerSheet({
  visible, title, options, selected, onSelect, onClose,
}: {
  visible: boolean; title: string;
  options: PickerOption[]; selected: string;
  onSelect: (v: string) => void; onClose: () => void;
}) {
  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={pk.overlay}>
        <Pressable style={StyleSheet.absoluteFillObject} onPress={onClose} />
        <View style={pk.sheet}>
          <View style={pk.handle} />
          <View style={pk.header}>
            <Text style={pk.title}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={pk.closeBtn}>
              <Ionicons name="close" size={18} color="#777" />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={pk.list}>
            {options.map(opt => {
              const isSelected = opt.value === selected;
              return (
                <TouchableOpacity
                  key={opt.value}
                  style={[pk.row, isSelected && pk.rowSelected, isSelected && {
                    shadowColor: Colors.teal, shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.3, shadowRadius: 8, elevation: 3,
                  }]}
                  onPress={() => { onSelect(opt.value); onClose(); }}
                  activeOpacity={0.8}
                >
                  {opt.emoji && <Text style={pk.rowEmoji}>{opt.emoji}</Text>}
                  <Text style={[pk.rowLabel, isSelected && pk.rowLabelSelected]}>
                    {opt.label}
                  </Text>
                  {isSelected && <Ionicons name="checkmark" size={18} color={Colors.teal} />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const pk = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' },
  sheet: {
    maxHeight: Dimensions.get('window').height * 0.55,
    backgroundColor: E.sheet, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    borderTopWidth: 1, borderColor: E.line,
  },
  handle:  { width: 36, height: 4, backgroundColor: '#444', borderRadius: 2, alignSelf: 'center', marginTop: 10, marginBottom: 4 },
  header:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.screenPadding, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: E.line },
  title:   { color: '#FFFFFF', fontSize: FontSize.h3, fontFamily: 'Inter_500Medium' },
  closeBtn:{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#2A2A2E', alignItems: 'center', justifyContent: 'center' },
  list:    { padding: Spacing.screenPadding, paddingBottom: 32, gap: 8 },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: E.card, borderRadius: 12,
    borderWidth: 0.5, borderColor: E.line, padding: 14,
  },
  rowSelected: { backgroundColor: 'rgba(0,201,167,0.08)', borderColor: 'rgba(0,201,167,0.4)' },
  rowEmoji:    { fontSize: 20 },
  rowLabel:    { flex: 1, color: '#CCCCCC', fontSize: FontSize.body, fontFamily: 'Inter_500Medium' },
  rowLabelSelected: { color: '#FFFFFF' },
});

// ─── Setting Row ──────────────────────────────────────────────────────────────

function SettingRow({
  icon, label, value, onPress, danger,
}: {
  icon: string; label: string; value?: string; onPress: () => void; danger?: boolean;
}) {
  return (
    <TouchableOpacity style={sr.row} onPress={onPress} activeOpacity={0.75}>
      <View style={[sr.iconWrap, danger && sr.iconDanger]}>
        <Ionicons name={icon as any} size={17} color={danger ? Colors.danger : Colors.teal} />
      </View>
      <Text style={[sr.label, danger && sr.labelDanger]}>{label}</Text>
      {value && <Text style={sr.value}>{value}</Text>}
      {!danger && <Ionicons name="chevron-forward" size={14} color="#333" />}
    </TouchableOpacity>
  );
}

const sr = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13, borderBottomWidth: 0.5, borderBottomColor: E.line },
  iconWrap:   { width: 32, height: 32, borderRadius: 10, backgroundColor: 'rgba(0,201,167,0.1)', alignItems: 'center', justifyContent: 'center' },
  iconDanger: { backgroundColor: 'rgba(255,122,133,0.1)' },
  label:      { flex: 1, color: '#FFFFFF', fontSize: FontSize.body, fontFamily: 'Inter_500Medium' },
  labelDanger:{ color: Colors.danger },
  value:      { color: '#666', fontSize: FontSize.caption },
});

// ─── Section ──────────────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={sec.wrap}>
      <Text style={sec.title}>{title}</Text>
      <View style={sec.card}>{children}</View>
    </View>
  );
}

const sec = StyleSheet.create({
  wrap:  { marginBottom: 20 },
  title: { color: '#666', fontSize: FontSize.caption, fontFamily: 'Inter_500Medium', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 },
  card:  { backgroundColor: E.card, borderRadius: 16, borderWidth: 0.5, borderColor: E.line, paddingHorizontal: 16 },
});

// ─── Profile Screen ───────────────────────────────────────────────────────────

const GOAL_OPTIONS: PickerOption[] = [
  { value: 'muscle',      label: 'Build Muscle',    emoji: '💪' },
  { value: 'weight_loss', label: 'Lose Weight',     emoji: '🔥' },
  { value: 'toned',       label: 'Stay Toned',      emoji: '⚡' },
  { value: 'active',      label: 'Get Active',      emoji: '🏃' },
];
const LEVEL_OPTIONS: PickerOption[] = [
  { value: 'beginner',     label: 'Beginner',     emoji: '🌱' },
  { value: 'intermediate', label: 'Intermediate', emoji: '⚡' },
  { value: 'advanced',     label: 'Advanced',     emoji: '🏆' },
];
const EQUIPMENT_OPTIONS: PickerOption[] = [
  { value: 'gym',       label: 'Full Gym',      emoji: '🏋️' },
  { value: 'home',      label: 'Home Gym',      emoji: '🏠' },
  { value: 'dumbbells', label: 'Dumbbells Only', emoji: '💪' },
  { value: 'none',      label: 'No Equipment',  emoji: '🌿' },
];
const LANG_OPTIONS: PickerOption[] = [
  { value: 'en', label: 'English',  emoji: '🇺🇸' },
  { value: 'fr', label: 'Français', emoji: '🇫🇷' },
  { value: 'ht', label: 'Kreyòl',   emoji: '🇭🇹' },
];

export default function ProfileScreen() {
  const user      = useUserStore(s => s.user);
  const updateUser= useUserStore(s => s.updateUser);
  const clearUser = useUserStore(s => s.clearUser);
  const clearPlan = usePlanStore(s => s.clearPlan);

  const [totalSessions, setTotalSessions] = useState(0);
  const [totalVolume,   setTotalVolume]   = useState(0);
  const [streak,        setStreak]        = useState(0);

  // Picker state
  const [picker, setPicker] = useState<{
    open: boolean; type: 'goal' | 'level' | 'equipment' | 'language' | null;
  }>({ open: false, type: null });

  // Pref toggles — load from Supabase, save on change
  const [notifs,   setNotifs]   = useState(true);
  const [kourajCI, setKourajCI] = useState(true);

  const uid = user?.id;

  // Load saved preferences
  useEffect(() => {
    if (!uid) return;
    supabase.from('profiles').select('notifications_on, kouraj_checkins_on').eq('id', uid).single()
      .then(({ data }) => {
        if (!data) return;
        if (data.notifications_on   != null) setNotifs(data.notifications_on);
        if (data.kouraj_checkins_on != null) setKourajCI(data.kouraj_checkins_on);
      });
  }, [uid]);

  useEffect(() => {
    if (!uid) return;
    supabase
      .from('workout_sessions')
      .select('started_at, total_volume_kg, completed_at')
      .eq('user_id', uid)
      .not('completed_at', 'is', null)
      .then(({ data }) => {
        if (!data) return;
        setTotalSessions(data.length);
        setTotalVolume(Math.round(data.reduce((sum, s) => sum + (s.total_volume_kg ?? 0), 0)));
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const days  = new Set(data.map(s => s.started_at.split('T')[0]));
        let s = 0;
        for (let i = 0; i < 365; i++) {
          const d = new Date(today); d.setDate(d.getDate() - i);
          if (days.has(d.toISOString().split('T')[0])) s++;
          else if (i > 0) break;
        }
        setStreak(s);
      });
  }, [uid]);

  async function updateField(field: string, value: string) {
    if (!uid) return;
    updateUser({ [field]: value } as any);
    await supabase.from('profiles').update({ [field]: value }).eq('id', uid);
  }

  function openPicker(type: typeof picker.type) {
    setPicker({ open: true, type });
  }

  function handlePickerSelect(value: string) {
    if (!picker.type) return;
    if (picker.type === 'language') {
      setLanguage(value as Language);
      updateField('language', value);
    } else {
      updateField(picker.type, value);
    }
  }

  async function handleLogout() {
    Alert.alert('Log out?', 'You\'ll need to sign in again.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out', style: 'destructive', onPress: async () => {
          await supabase.auth.signOut();
          clearUser();
          clearPlan();
          router.replace('/(auth)/login');
        },
      },
    ]);
  }

  const firstName = user?.name?.split(' ')[0] ?? '?';
  const initials  = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const pickerOptions = {
    goal:      GOAL_OPTIONS,
    level:     LEVEL_OPTIONS,
    equipment: EQUIPMENT_OPTIONS,
    language:  LANG_OPTIONS,
  };
  const pickerTitles = {
    goal: 'Your Goal', level: 'Your Level',
    equipment: 'Your Equipment', language: 'Choose Language · Chwazi Lang · Choisir Langue',
  };

  return (
    <>
      <ScreenWrapper scrollable>

        {/* ── Profile hero ── */}
        <View style={s.hero}>
          <View style={[s.avatarWrap, {
            shadowColor: Colors.teal, shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.55, shadowRadius: 16, elevation: 8,
          }]}>
            <View style={s.avatar}>
              <Text style={s.avatarText}>{initials}</Text>
            </View>
          </View>
          <Text style={s.name}>{user?.name ?? 'Your Name'}</Text>
          {(user?.city || user?.country) && (
            <Text style={s.location}>
              <Ionicons name="location-outline" size={12} color="#666" />
              {' '}{[user.city, user.country].filter(Boolean).join(', ')}
            </Text>
          )}

          {/* Stats row */}
          <View style={s.statsRow}>
            {[
              { label: 'Sessions', value: `${totalSessions}` },
              { label: 'Volume',   value: totalVolume > 0 ? `${totalVolume}kg` : '—' },
              { label: 'Streak',   value: `${streak}🔥` },
            ].map((st, i) => (
              <View key={st.label} style={[s.statCell, i < 2 && s.statCellBorder]}>
                <Text style={s.statValue}>{st.value}</Text>
                <Text style={s.statLabel}>{st.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Fòs Pro upgrade ── */}
        <View style={[s.proCard, {
          shadowColor: '#F0B040', shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.3, shadowRadius: 14, elevation: 6,
        }]}>
          <View style={s.proBar} />
          <View style={s.proInner}>
            <View style={s.proTitleRow}>
              <Text style={s.proCrown}>👑</Text>
              <View>
                <Text style={s.proTitle}>Fòs Pro</Text>
                <Text style={s.proPrice}>$9.99/mo · $59.99/yr</Text>
              </View>
            </View>
            {[
              'Kouraj AI in French & Kreyòl',
              'Full nutrition tracking',
              'Voice-guided workouts',
              'Community + group challenges',
            ].map(f => (
              <View key={f} style={s.proFeature}>
                <Ionicons name="checkmark-circle" size={16} color={Colors.teal} />
                <Text style={s.proFeatureText}>{f}</Text>
              </View>
            ))}
            <TouchableOpacity
              style={s.proCTA}
              activeOpacity={0.85}
              onPress={() => Alert.alert(
                'Fòs Pro — Coming Soon 🚀',
                'Pro features include:\n\n• Kouraj AI in French & Kreyòl\n• Full nutrition tracking\n• Voice-guided workouts\n• Community challenges\n\nLaunching soon. You\'ll be notified, frè m!',
                [{ text: 'Can\'t wait! 💪' }]
              )}
            >
              <Text style={s.proCTAText}>Start 7-Day Free Trial</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── My Plan ── */}
        <Section title="My Plan">
          <SettingRow
            icon="trophy-outline" label="Goal"
            value={GOAL_OPTIONS.find(o => o.value === user?.goal)?.label ?? '—'}
            onPress={() => openPicker('goal')}
          />
          <SettingRow
            icon="bar-chart-outline" label="Level"
            value={LEVEL_OPTIONS.find(o => o.value === user?.level)?.label ?? '—'}
            onPress={() => openPicker('level')}
          />
          <SettingRow
            icon="barbell-outline" label="Equipment"
            value={EQUIPMENT_OPTIONS.find(o => o.value === user?.equipment)?.label ?? '—'}
            onPress={() => openPicker('equipment')}
          />
        </Section>

        {/* ── Preferences ── */}
        <Section title="Preferences">
          <SettingRow
            icon="language-outline" label="Language"
            value={LANG_OPTIONS.find(o => o.value === user?.language)?.label ?? 'English'}
            onPress={() => openPicker('language')}
          />
          <View style={[sr.row, { borderBottomWidth: 0.5, borderBottomColor: E.line }]}>
            <View style={sr.iconWrap}>
              <Ionicons name="notifications-outline" size={17} color={Colors.teal} />
            </View>
            <Text style={[sr.label, { flex: 1 }]}>Push Notifications</Text>
            <Switch
              value={notifs} onValueChange={v => {
                setNotifs(v);
                if (uid) supabase.from('profiles').update({ notifications_on: v }).eq('id', uid).then(() => {});
              }}
              trackColor={{ true: Colors.teal, false: '#333' }}
              thumbColor="#FFF"
            />
          </View>
          <View style={[sr.row, { borderBottomWidth: 0 }]}>
            <View style={sr.iconWrap}>
              <Ionicons name="flash-outline" size={17} color={Colors.teal} />
            </View>
            <Text style={[sr.label, { flex: 1 }]}>Kouraj Check-ins</Text>
            <Switch
              value={kourajCI} onValueChange={v => {
                setKourajCI(v);
                if (uid) supabase.from('profiles').update({ kouraj_checkins_on: v }).eq('id', uid).then(() => {});
              }}
              trackColor={{ true: Colors.teal, false: '#333' }}
              thumbColor="#FFF"
            />
          </View>
        </Section>

        {/* ── Account ── */}
        <Section title="Account">
          <SettingRow
            icon="log-out-outline" label="Log out"
            onPress={handleLogout} danger
          />
        </Section>

        {/* Bottom spacing */}
        <View style={{ height: 20 }} />
      </ScreenWrapper>

      {/* Picker sheet */}
      {picker.type && (
        <PickerSheet
          visible={picker.open}
          title={pickerTitles[picker.type]}
          options={pickerOptions[picker.type]}
          selected={
            picker.type === 'language' ? (user?.language ?? 'en')
            : picker.type === 'goal'   ? (user?.goal ?? '')
            : picker.type === 'level'  ? (user?.level ?? '')
            : (user?.equipment ?? '')
          }
          onSelect={handlePickerSelect}
          onClose={() => setPicker({ open: false, type: null })}
        />
      )}
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  // Hero
  hero: { alignItems: 'center', paddingVertical: 24, marginBottom: 20 },
  avatarWrap: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: 'rgba(0,201,167,0.15)',
    borderWidth: 2, borderColor: Colors.teal,
    padding: 3, marginBottom: 14,
  },
  avatar: {
    flex: 1, borderRadius: 40,
    backgroundColor: Colors.teal,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: Colors.background, fontSize: FontSize.h2, fontFamily: 'Inter_500Medium' },
  name:     { color: '#FFFFFF', fontSize: FontSize.h2, fontFamily: 'Inter_500Medium', marginBottom: 4 },
  location: { color: '#666', fontSize: FontSize.caption, marginBottom: 16 },
  statsRow: { flexDirection: 'row', backgroundColor: E.card, borderRadius: 14, borderWidth: 0.5, borderColor: E.line, width: '100%' },
  statCell: { flex: 1, alignItems: 'center', paddingVertical: 12 },
  statCellBorder: { borderRightWidth: 0.5, borderRightColor: E.line },
  statValue: { color: Colors.teal, fontSize: FontSize.h3, fontFamily: 'Inter_500Medium' },
  statLabel: { color: '#666', fontSize: 10, marginTop: 3 },

  // Pro card
  proCard: {
    backgroundColor: '#1A1A1C', borderRadius: 18,
    borderWidth: 1, borderColor: 'rgba(240,176,64,0.35)',
    overflow: 'hidden', marginBottom: 20,
  },
  proBar:   { height: 3, backgroundColor: '#F0B040' },
  proInner: { padding: 16 },
  proTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  proCrown: { fontSize: 28 },
  proTitle: { color: '#F0B040', fontSize: FontSize.h3, fontFamily: 'Inter_500Medium' },
  proPrice: { color: '#777', fontSize: FontSize.caption, marginTop: 2 },
  proFeature: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  proFeatureText: { color: '#CCCCCC', fontSize: FontSize.bodySm },
  proCTA: {
    backgroundColor: Colors.teal, borderRadius: 12,
    paddingVertical: 12, alignItems: 'center', marginTop: 8,
    shadowColor: Colors.teal, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4, shadowRadius: 8, elevation: 4,
  },
  proCTAText: { color: Colors.background, fontSize: FontSize.body, fontFamily: 'Inter_500Medium' },
});
