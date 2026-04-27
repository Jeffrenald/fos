import { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, ActivityIndicator, Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { Colors, Radius, Spacing } from '@/constants/Colors';
import { FontSize } from '@/constants/fonts';
import { i18n, setLanguage, Language } from '@/lib/i18n';
import { useUserStore } from '@/stores/userStore';
import { supabase } from '@/lib/supabase';

const { width } = Dimensions.get('window');

// ─── Types ───────────────────────────────────────────────────────────────────

type Goal      = 'muscle' | 'weight_loss' | 'toned' | 'active';
type Level     = 'beginner' | 'intermediate' | 'advanced';
type Equipment = 'gym' | 'home' | 'dumbbells' | 'none';

interface OnboardingState {
  language:  Language | null;
  goal:      Goal | null;
  level:     Level | null;
  equipment: Equipment | null;
}

// ─── Step Dots ───────────────────────────────────────────────────────────────

function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <View style={dots.row}>
      {Array.from({ length: total }).map((_, i) => (
        <View key={i} style={[dots.dot, i === current && dots.active]} />
      ))}
    </View>
  );
}

const dots = StyleSheet.create({
  row:    { flexDirection: 'row', gap: 6, justifyContent: 'center', marginBottom: 32 },
  dot:    { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.textDim },
  active: { width: 20, backgroundColor: Colors.teal },
});

// ─── Step 1 — Language ───────────────────────────────────────────────────────

function Step1({ value, onChange }: { value: Language | null; onChange: (v: Language) => void }) {
  const options: { lang: Language; labels: string[] }[] = [
    { lang: 'en', labels: ['English', 'Anglais', 'Anglè'] },
    { lang: 'fr', labels: ['French', 'Français', 'Franse'] },
    { lang: 'ht', labels: ['Creole', 'Créole', 'Kreyòl'] },
  ];

  return (
    <View style={s.stepWrap}>
      <Text style={s.stepTitle}>🌍  Choose your language</Text>
      <Text style={s.stepSub}>Chwazi lang ou • Choisissez votre langue</Text>
      <View style={{ gap: 14, marginTop: 8 }}>
        {options.map(({ lang, labels }) => (
          <TouchableOpacity
            key={lang}
            style={[s.langCard, value === lang && s.cardSelected]}
            onPress={() => onChange(lang)}
            activeOpacity={0.8}
          >
            <Text style={[s.langMain, value === lang && s.textSelected]}>{labels[0]}</Text>
            <Text style={s.langSub}>{labels[1]} · {labels[2]}</Text>
            {value === lang && <View style={s.checkDot} />}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// ─── Step 2 — Goal ───────────────────────────────────────────────────────────

function Step2({ value, onChange }: { value: Goal | null; onChange: (v: Goal) => void }) {
  const goals: { id: Goal; emoji: string; labelKey: string }[] = [
    { id: 'muscle',       emoji: '💪', labelKey: 'onboarding.buildMuscle' },
    { id: 'weight_loss',  emoji: '🔥', labelKey: 'onboarding.loseWeight'  },
    { id: 'toned',        emoji: '⚡', labelKey: 'onboarding.stayToned'   },
    { id: 'active',       emoji: '🏃', labelKey: 'onboarding.getActive'   },
  ];

  return (
    <View style={s.stepWrap}>
      <Text style={s.stepTitle}>{i18n.t('onboarding.step2Title')}</Text>
      <Text style={s.stepSub}>Pick the one that feels right</Text>
      <View style={s.grid}>
        {goals.map(({ id, emoji, labelKey }) => (
          <TouchableOpacity
            key={id}
            style={[s.gridCard, value === id && s.cardSelected]}
            onPress={() => onChange(id)}
            activeOpacity={0.8}
          >
            <Text style={s.gridEmoji}>{emoji}</Text>
            <Text style={[s.gridLabel, value === id && s.textSelected]}>
              {i18n.t(labelKey)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// ─── Step 3 — Level ──────────────────────────────────────────────────────────

function Step3({ value, onChange }: { value: Level | null; onChange: (v: Level) => void }) {
  const levels: { id: Level; labelKey: string; desc: string }[] = [
    { id: 'beginner',     labelKey: 'onboarding.beginner',     desc: 'New to working out or getting back into it' },
    { id: 'intermediate', labelKey: 'onboarding.intermediate', desc: 'Training consistently for 6+ months'        },
    { id: 'advanced',     labelKey: 'onboarding.advanced',     desc: 'Years of training, know your lifts'         },
  ];

  return (
    <View style={s.stepWrap}>
      <Text style={s.stepTitle}>{i18n.t('onboarding.step3Title')}</Text>
      <Text style={s.stepSub}>Be honest — Kouraj will adapt your plan</Text>
      <View style={{ gap: 14, marginTop: 8 }}>
        {levels.map(({ id, labelKey, desc }) => (
          <TouchableOpacity
            key={id}
            style={[s.levelCard, value === id && s.cardSelected]}
            onPress={() => onChange(id)}
            activeOpacity={0.8}
          >
            <View style={{ flex: 1 }}>
              <Text style={[s.levelLabel, value === id && s.textSelected]}>
                {i18n.t(labelKey)}
              </Text>
              <Text style={s.levelDesc}>{desc}</Text>
            </View>
            {value === id && <View style={s.checkDot} />}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// ─── Step 4 — Equipment ──────────────────────────────────────────────────────

function Step4({ value, onChange }: { value: Equipment | null; onChange: (v: Equipment) => void }) {
  const options: { id: Equipment; emoji: string; labelKey: string }[] = [
    { id: 'gym',       emoji: '🏋️', labelKey: 'onboarding.fullGym'      },
    { id: 'home',      emoji: '🏠', labelKey: 'onboarding.homeGym'       },
    { id: 'dumbbells', emoji: '💪', labelKey: 'onboarding.dumbbells'     },
    { id: 'none',      emoji: '🌿', labelKey: 'onboarding.noEquipment'   },
  ];

  return (
    <View style={s.stepWrap}>
      <Text style={s.stepTitle}>{i18n.t('onboarding.step4Title')}</Text>
      <Text style={s.stepSub}>Kouraj builds your plan around what you have</Text>
      <View style={s.grid}>
        {options.map(({ id, emoji, labelKey }) => (
          <TouchableOpacity
            key={id}
            style={[s.gridCard, value === id && s.cardSelected]}
            onPress={() => onChange(id)}
            activeOpacity={0.8}
          >
            <Text style={s.gridEmoji}>{emoji}</Text>
            <Text style={[s.gridLabel, value === id && s.textSelected]}>
              {i18n.t(labelKey)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// ─── Main screen ─────────────────────────────────────────────────────────────

export default function OnboardingScreen() {
  const [step, setStep]       = useState(0);
  const [saving, setSaving]   = useState(false);
  const [data, setData]       = useState<OnboardingState>({
    language: null, goal: null, level: null, equipment: null,
  });

  const { setUser, setOnboarded } = useUserStore();

  const TOTAL = 4;

  function canAdvance() {
    if (step === 0) return !!data.language;
    if (step === 1) return !!data.goal;
    if (step === 2) return !!data.level;
    if (step === 3) return !!data.equipment;
    return false;
  }

  function handleLanguage(lang: Language) {
    setLanguage(lang);
    setData(d => ({ ...d, language: lang }));
  }

  async function handleFinish() {
    if (!data.language || !data.goal || !data.level || !data.equipment) return;
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace('/(auth)/login'); return; }

      await supabase.from('profiles').upsert({
        id:        user.id,
        name:      user.user_metadata?.name ?? 'Fòs User',
        language:  data.language,
        goal:      data.goal,
        level:     data.level,
        equipment: data.equipment,
      });

      setUser({
        id:        user.id,
        name:      user.user_metadata?.name ?? 'Fòs User',
        language:  data.language,
        goal:      data.goal,
        level:     data.level,
        equipment: data.equipment,
        weight_kg: null,
        height_cm: null,
        city:      null,
        country:   null,
        isPremium: false,
      });

      setOnboarded(true);
      router.replace('/(tabs)');
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  function next() {
    if (step < TOTAL - 1) setStep(s => s + 1);
    else handleFinish();
  }

  function back() {
    if (step > 0) setStep(s => s - 1);
  }

  return (
    <View style={s.root}>
      <ScrollView
        contentContainerStyle={s.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={s.header}>
          <Text style={s.logo}>⚡ Fòs</Text>
          <StepDots current={step} total={TOTAL} />
        </View>

        {/* Steps */}
        {step === 0 && <Step1 value={data.language}  onChange={handleLanguage} />}
        {step === 1 && <Step2 value={data.goal}      onChange={v => setData(d => ({ ...d, goal: v }))} />}
        {step === 2 && <Step3 value={data.level}     onChange={v => setData(d => ({ ...d, level: v }))} />}
        {step === 3 && <Step4 value={data.equipment} onChange={v => setData(d => ({ ...d, equipment: v }))} />}

        {/* Navigation */}
        <View style={s.navRow}>
          {step > 0 && (
            <TouchableOpacity style={s.backBtn} onPress={back} activeOpacity={0.7}>
              <Text style={s.backText}>{i18n.t('onboarding.back')}</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[s.nextBtn, !canAdvance() && s.nextDisabled, step > 0 && { flex: 1 }]}
            onPress={next}
            disabled={!canAdvance() || saving}
            activeOpacity={0.85}
          >
            {saving
              ? <ActivityIndicator color={Colors.background} />
              : <Text style={s.nextText}>
                  {step === TOTAL - 1 ? i18n.t('onboarding.cta') : i18n.t('onboarding.next')}
                </Text>
            }
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const CARD_W = (width - Spacing.screenPadding * 2 - 12) / 2;

const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: Colors.background },
  scroll: { flexGrow: 1, padding: Spacing.screenPadding, paddingTop: 56, paddingBottom: 32 },

  header: { alignItems: 'center', marginBottom: 8 },
  logo:   { color: Colors.teal, fontSize: FontSize.h2, fontFamily: 'Inter_500Medium', marginBottom: 24 },

  stepWrap: { flex: 1, marginBottom: 32 },
  stepTitle: { color: Colors.textPrimary, fontSize: FontSize.h2, fontFamily: 'Inter_500Medium', marginBottom: 6 },
  stepSub:   { color: Colors.textMuted,   fontSize: FontSize.bodySm, marginBottom: 28 },

  // Language cards
  langCard: {
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    borderWidth: 0.5, borderColor: Colors.border,
    padding: 18, flexDirection: 'row', alignItems: 'center',
  },
  langMain:  { color: Colors.textPrimary, fontSize: FontSize.bodyLg, fontFamily: 'Inter_500Medium', flex: 1 },
  langSub:   { color: Colors.textMuted,   fontSize: FontSize.caption },

  // Goal & Equipment grid
  grid:     { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  gridCard: {
    width: CARD_W, backgroundColor: Colors.surface,
    borderRadius: Radius.lg, borderWidth: 0.5, borderColor: Colors.border,
    padding: 20, alignItems: 'center', gap: 10,
  },
  gridEmoji: { fontSize: 32 },
  gridLabel: { color: Colors.textSecondary, fontSize: FontSize.body, fontFamily: 'Inter_500Medium', textAlign: 'center' },

  // Level cards
  levelCard: {
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    borderWidth: 0.5, borderColor: Colors.border,
    padding: 18, flexDirection: 'row', alignItems: 'center',
  },
  levelLabel: { color: Colors.textPrimary, fontSize: FontSize.bodyLg, fontFamily: 'Inter_500Medium', marginBottom: 4 },
  levelDesc:  { color: Colors.textMuted,   fontSize: FontSize.caption },

  // Selected state
  cardSelected: { borderColor: Colors.teal, backgroundColor: Colors.tealDim },
  textSelected: { color: Colors.teal },
  checkDot: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: Colors.teal, marginLeft: 8,
  },

  // Navigation
  navRow:      { flexDirection: 'row', gap: 12, marginTop: 8 },
  backBtn: {
    paddingVertical: 16, paddingHorizontal: 20,
    borderRadius: 14, borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center',
  },
  backText:    { color: Colors.textMuted, fontSize: FontSize.body, fontFamily: 'Inter_500Medium' },
  nextBtn: {
    flex: 1, backgroundColor: Colors.teal,
    borderRadius: 14, paddingVertical: 16,
    alignItems: 'center',
  },
  nextDisabled: { opacity: 0.4 },
  nextText: { color: Colors.background, fontSize: FontSize.bodyLg, fontFamily: 'Inter_500Medium' },
});
