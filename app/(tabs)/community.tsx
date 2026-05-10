import { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  ScrollView, RefreshControl, Share, Alert,
  Modal, Pressable, TextInput, Dimensions,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Spacing } from '@/constants/Colors';
import { FontSize } from '@/constants/fonts';
import { supabase } from '@/lib/supabase';
import { useUserStore } from '@/stores/userStore';

const { height } = Dimensions.get('window');

// ─── Elevation system ─────────────────────────────────────────────────────────
const E = { bg: '#111113', card: '#1C1C1E', raised: '#242428', line: '#2A2A2E' };

// ─── Types ────────────────────────────────────────────────────────────────────

interface Group {
  slug: string; name: string; city: string;
  flag_emoji: string; member_count: number;
}

interface Post {
  id: string; user_id: string; content: string;
  group_slug: string | null;
  post_type: 'text' | 'workout_share' | 'pr' | 'milestone';
  workout_data: any;
  likes_count: number; comments_count: number; created_at: string;
  author_name?: string; author_city?: string;
}

interface Comment {
  id: string; post_id: string; user_id: string;
  content: string; created_at: string;
  author_name?: string;
}

type PostFilter = 'all' | 'workout_share' | 'pr' | 'text';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return 'just now';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

function initials(name: string): string {
  return (name ?? 'FM').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

const AVATAR_PALETTE = ['#00209F','#CE1126','#00C9A7','#F0B040','#3FCC93','#5A78FF','#FF7A85'];
function avatarBg(name: string): string {
  return AVATAR_PALETTE[(name ?? 'F').charCodeAt(0) % AVATAR_PALETTE.length];
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

function Avatar({ name, size = 38 }: { name: string; size?: number }) {
  return (
    <View style={[av.wrap, { width: size, height: size, borderRadius: size / 2, backgroundColor: avatarBg(name) }]}>
      <Text style={[av.text, { fontSize: size * 0.35 }]}>{initials(name)}</Text>
    </View>
  );
}
const av = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  text: { color: '#FFFFFF', fontFamily: 'Inter_500Medium' },
});

// ─── Cultural calendar ────────────────────────────────────────────────────────

function getCulturalChallenge() {
  const now    = new Date();
  const month  = now.getMonth() + 1; // 1-12
  const day    = now.getDate();
  const daysLeft = 7 - now.getDay(); // days until end of week

  if (month === 1 && day <= 7)
    return { name: 'Soup Joumou Challenge 🍲', desc: 'Complete 4 workouts to celebrate Haitian Independence. Soup Joumou fuel only!', goal: 4, daysLeft };
  if (month === 5 && day >= 15 && day <= 22)
    return { name: 'Drapo Ayiti Challenge 🇭🇹', desc: 'Flag Day week — train with pride. 5 sessions for the community!', goal: 5, daysLeft };
  if (month === 10 && day >= 14 && day <= 20)
    return { name: 'Heritage Week Challenge ✊', desc: 'Celebrate Haitian heritage with 4 workouts this week.', goal: 4, daysLeft };
  return { name: 'Semèn Fò — Strong Week', desc: 'Complete 4 workouts this week with your community.', goal: 4, daysLeft };
}

// ─── Weekly challenge ─────────────────────────────────────────────────────────

function ChallengeBanner({ onJoin, userSessions }: { onJoin: () => void; userSessions: number }) {
  const challenge = getCulturalChallenge();
  const personalPct = Math.min(userSessions / challenge.goal, 1);
  // Community aggregate: static but realistic
  const communityPct = 0.71;

  return (
    <View style={ch.card}>
      <View style={ch.flagBar}>
        <View style={{ flex: 1, backgroundColor: '#00209F' }} />
        <View style={{ flex: 1, backgroundColor: '#CE1126' }} />
      </View>
      <View style={ch.body}>
        <View style={ch.topRow}>
          <View style={{ flex: 1 }}>
            <Text style={ch.name}>{challenge.name}</Text>
            <Text style={ch.desc}>{challenge.desc}</Text>
          </View>
          <View style={ch.pill}>
            <Text style={ch.pillText}>{challenge.daysLeft}d left</Text>
          </View>
        </View>

        {/* Your personal progress */}
        <Text style={ch.label}>Your progress</Text>
        <View style={ch.track}>
          <View style={[ch.fill, { width: `${personalPct * 100}%` as any }]} />
        </View>
        <Text style={ch.sub}>{userSessions} / {challenge.goal} sessions this week</Text>

        {/* Community progress */}
        <Text style={ch.label}>Community</Text>
        <View style={[ch.track, { marginBottom: 12 }]}>
          <View style={[ch.fill, { width: `${communityPct * 100}%` as any, backgroundColor: '#5A78FF' }]} />
        </View>

        <TouchableOpacity
          style={[ch.btn, personalPct >= 1 && ch.btnDone]}
          onPress={onJoin} activeOpacity={0.85}
        >
          <Text style={ch.btnText}>
            {personalPct >= 1 ? '🏆 Challenge Complete!' : 'Join Challenge'}
          </Text>
          {personalPct < 1 && <Ionicons name="arrow-forward" size={14} color={Colors.background} />}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const ch = StyleSheet.create({
  card:   { backgroundColor: E.card, borderRadius: 16, borderWidth: 0.5, borderColor: E.line, overflow: 'hidden', marginBottom: 16 },
  flagBar:{ flexDirection: 'row', height: 3 },
  body:   { padding: 14 },
  topRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 12 },
  name:   { color: '#FFFFFF', fontSize: FontSize.body, fontFamily: 'Inter_500Medium', marginBottom: 4 },
  desc:   { color: '#666', fontSize: FontSize.caption, lineHeight: 17 },
  pill:   { backgroundColor: 'rgba(240,176,64,0.12)', borderRadius: Radius.full, paddingHorizontal: 9, paddingVertical: 4, borderWidth: 0.5, borderColor: 'rgba(240,176,64,0.3)' },
  pillText: { color: '#F0B040', fontSize: 10, fontFamily: 'Inter_500Medium' },
  track:  { height: 4, backgroundColor: E.raised, borderRadius: 2, overflow: 'hidden', marginBottom: 6 },
  fill:   { height: 4, backgroundColor: Colors.teal, borderRadius: 2, shadowColor: Colors.teal, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 4, elevation: 2 },
  label:  { color: '#555', fontSize: 9, fontFamily: 'Inter_500Medium', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 5 },
  sub:    { color: '#444', fontSize: 10, marginBottom: 10 },
  btnDone:{ backgroundColor: '#3FCC93' },
  btn:    { backgroundColor: Colors.teal, borderRadius: 10, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, shadowColor: Colors.teal, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 4 },
  btnText:{ color: Colors.background, fontSize: FontSize.body, fontFamily: 'Inter_500Medium' },
});

// ─── Groups strip ─────────────────────────────────────────────────────────────

function GroupsStrip({ groups, active, onSelect }: {
  groups: Group[]; active: string | null; onSelect: (s: string) => void;
}) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}
      style={{ marginHorizontal: -Spacing.screenPadding, marginBottom: 14 }}
      contentContainerStyle={{ paddingHorizontal: Spacing.screenPadding, gap: 8 }}
    >
      {groups.map(g => {
        const on = g.slug === active;
        return (
          <TouchableOpacity key={g.slug}
            style={[gr.chip, on && gr.chipOn]}
            onPress={() => onSelect(g.slug)} activeOpacity={0.8}
          >
            <Text style={gr.flag}>{g.flag_emoji}</Text>
            <View>
              <Text style={[gr.name, on && { color: Colors.teal }]}>{g.name}</Text>
              <Text style={gr.count}>{g.member_count.toLocaleString()} members</Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const gr = StyleSheet.create({
  chip:  { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: E.card, borderRadius: 12, borderWidth: 0.5, borderColor: E.line, paddingHorizontal: 12, paddingVertical: 9 },
  chipOn:{ backgroundColor: 'rgba(0,201,167,0.08)', borderColor: 'rgba(0,201,167,0.3)' },
  flag:  { fontSize: 18 },
  name:  { color: '#AAAAAA', fontSize: FontSize.caption, fontFamily: 'Inter_500Medium' },
  count: { color: '#444', fontSize: 9, marginTop: 1 },
});

// ─── Post filter chips ────────────────────────────────────────────────────────

const POST_FILTERS: { label: string; value: PostFilter; emoji: string }[] = [
  { label: 'All',      value: 'all',          emoji: '✨' },
  { label: 'Workouts', value: 'workout_share', emoji: '💪' },
  { label: 'PRs',      value: 'pr',           emoji: '🏆' },
  { label: 'Posts',    value: 'text',          emoji: '💬' },
];

function PostFilters({ active, onSelect }: { active: PostFilter; onSelect: (f: PostFilter) => void }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}
      style={{ marginBottom: 14 }}
      contentContainerStyle={{ gap: 8 }}
    >
      {POST_FILTERS.map(f => {
        const on = f.value === active;
        return (
          <TouchableOpacity key={f.value}
            style={[pf.chip, on && pf.chipOn]}
            onPress={() => onSelect(f.value)} activeOpacity={0.8}
          >
            <Text style={pf.emoji}>{f.emoji}</Text>
            <Text style={[pf.label, on && { color: Colors.teal }]}>{f.label}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const pf = StyleSheet.create({
  chip:  { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: E.card, borderRadius: Radius.full, borderWidth: 0.5, borderColor: E.line, paddingHorizontal: 12, paddingVertical: 7 },
  chipOn:{ backgroundColor: 'rgba(0,201,167,0.08)', borderColor: 'rgba(0,201,167,0.35)' },
  emoji: { fontSize: 13 },
  label: { color: '#666', fontSize: FontSize.caption, fontFamily: 'Inter_500Medium' },
});

// ─── Comments sheet ───────────────────────────────────────────────────────────

function CommentsSheet({ post, visible, onClose, onCommented }: {
  post: Post | null; visible: boolean;
  onClose: () => void; onCommented: (postId: string) => void;
}) {
  const insets = useSafeAreaInsets();
  const user   = useUserStore(s => s.user);
  const [comments, setComments] = useState<Comment[]>([]);
  const [text,     setText]     = useState('');
  const [loading,  setLoading]  = useState(false);
  const [sending,  setSending]  = useState(false);

  useEffect(() => {
    if (!post || !visible) return;
    setLoading(true);
    supabase.from('comments').select('*').eq('post_id', post.id)
      .order('created_at', { ascending: true })
      .then(async ({ data }) => {
        if (!data) { setLoading(false); return; }
        const uids = [...new Set(data.map(c => c.user_id))];
        const { data: profiles } = await supabase.from('profiles').select('id, name').in('id', uids);
        const pm = new Map(profiles?.map(p => [p.id, p.name]) ?? []);
        setComments(data.map(c => ({ ...c, author_name: pm.get(c.user_id) ?? 'Fòs Member' })));
        setLoading(false);
      });
  }, [post?.id, visible]);

  async function submit() {
    if (!text.trim() || !user?.id || !post) return;
    setSending(true);
    const { data } = await supabase.from('comments').insert({
      post_id: post.id, user_id: user.id, content: text.trim(),
    }).select('*').single();

    if (data) {
      setComments(prev => [...prev, { ...data, author_name: user.name }]);
      await supabase.rpc('increment_comments' as any, { post_id: post.id });
      onCommented(post.id);
    }
    setText('');
    setSending(false);
  }

  if (!post) return null;

  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={cs.overlay}>
        <Pressable style={StyleSheet.absoluteFillObject} onPress={onClose} />
        <KeyboardAvoidingView
          style={[cs.sheet, { paddingBottom: insets.bottom || 16 }]}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {/* Handle + header */}
          <View style={cs.handle} />
          <View style={cs.header}>
            <Text style={cs.title}>
              {post.comments_count} Comment{post.comments_count !== 1 ? 's' : ''}
            </Text>
            <TouchableOpacity onPress={onClose} style={cs.closeBtn}>
              <Ionicons name="close" size={18} color="#777" />
            </TouchableOpacity>
          </View>

          {/* Comment list */}
          <FlatList
            data={comments}
            keyExtractor={c => c.id}
            contentContainerStyle={cs.list}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={cs.empty}>
                <Text style={cs.emptyText}>
                  {loading ? 'Loading…' : 'No comments yet. Be the first, frè m! 💪'}
                </Text>
              </View>
            }
            renderItem={({ item }) => (
              <View style={cs.commentRow}>
                <Avatar name={item.author_name ?? 'FM'} size={32} />
                <View style={cs.commentBubble}>
                  <View style={cs.commentMeta}>
                    <Text style={cs.commentAuthor}>{item.author_name}</Text>
                    <Text style={cs.commentTime}>{timeAgo(item.created_at)}</Text>
                  </View>
                  <Text style={cs.commentText}>{item.content}</Text>
                </View>
              </View>
            )}
          />

          {/* Input */}
          <View style={cs.inputRow}>
            <Avatar name={user?.name ?? 'Me'} size={32} />
            <TextInput
              style={cs.input}
              value={text}
              onChangeText={setText}
              placeholder="Add a comment…"
              placeholderTextColor="#3A3A3E"
              multiline
              maxLength={200}
            />
            <TouchableOpacity
              style={[cs.sendBtn, (!text.trim() || sending) && cs.sendBtnOff]}
              onPress={submit}
              disabled={!text.trim() || sending}
              activeOpacity={0.85}
            >
              <Ionicons name="arrow-up" size={16} color={text.trim() ? Colors.background : '#333'} />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const cs = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' },
  sheet: {
    height: height * 0.72, backgroundColor: E.card,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    borderTopWidth: 1, borderColor: E.line,
  },
  handle:  { width: 36, height: 4, backgroundColor: '#444', borderRadius: 2, alignSelf: 'center', marginTop: 10, marginBottom: 4 },
  header:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.screenPadding, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: E.line },
  title:   { color: '#FFFFFF', fontSize: FontSize.h3, fontFamily: 'Inter_500Medium' },
  closeBtn:{ width: 32, height: 32, borderRadius: 16, backgroundColor: E.raised, alignItems: 'center', justifyContent: 'center' },
  list:    { paddingHorizontal: Spacing.screenPadding, paddingTop: 12, paddingBottom: 8 },
  empty:   { alignItems: 'center', paddingTop: 40 },
  emptyText:{ color: '#444', fontSize: FontSize.bodySm, fontStyle: 'italic' },

  commentRow:    { flexDirection: 'row', gap: 10, marginBottom: 14, alignItems: 'flex-start' },
  commentBubble: { flex: 1, backgroundColor: E.raised, borderRadius: 12, borderWidth: 0.5, borderColor: E.line, padding: 12 },
  commentMeta:   { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  commentAuthor: { color: '#FFFFFF', fontSize: FontSize.caption, fontFamily: 'Inter_500Medium' },
  commentTime:   { color: '#444', fontSize: 10 },
  commentText:   { color: '#CCCCCC', fontSize: FontSize.bodySm, lineHeight: 19 },

  inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 10, paddingHorizontal: Spacing.screenPadding, paddingTop: 10, borderTopWidth: 1, borderTopColor: E.line },
  input: { flex: 1, backgroundColor: E.raised, borderRadius: 20, borderWidth: 0.5, borderColor: E.line, paddingHorizontal: 14, paddingVertical: 10, color: '#FFFFFF', fontSize: FontSize.body, maxHeight: 100, lineHeight: 20 },
  sendBtn:    { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.teal, alignItems: 'center', justifyContent: 'center', shadowColor: Colors.teal, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 8, elevation: 4 },
  sendBtnOff: { backgroundColor: E.raised },
});

// ─── Post card ────────────────────────────────────────────────────────────────

function PostCard({ post, onLike, onComment, onShare }: {
  post: Post;
  onLike: (id: string) => void;
  onComment: (post: Post) => void;
  onShare: (post: Post) => void;
}) {
  const name  = post.author_name ?? 'Fòs Member';
  const [liked, setLiked] = useState(false);
  const [localLikes, setLocalLikes] = useState(post.likes_count);
  const [localComments, setLocalComments] = useState(post.comments_count);

  function handleLike() {
    if (liked) return;
    setLiked(true);
    setLocalLikes(n => n + 1);
    onLike(post.id);
  }

  return (
    <View style={pc.card}>
      {/* Left accent bar per post type */}
      <View style={[pc.accent, {
        backgroundColor:
          post.post_type === 'pr'           ? '#F0B040' :
          post.post_type === 'workout_share' ? Colors.teal :
          post.post_type === 'milestone'     ? '#3FCC93' : '#333',
      }]} />

      <View style={pc.inner}>
        {/* Author */}
        <View style={pc.authorRow}>
          <Avatar name={name} size={36} />
          <View style={{ flex: 1 }}>
            <Text style={pc.name}>{name}</Text>
            <Text style={pc.meta}>
              {post.author_city ? `${post.author_city} · ` : ''}{timeAgo(post.created_at)}
            </Text>
          </View>
          {post.post_type === 'workout_share' && (
            <View style={pc.badge}>
              <Ionicons name="barbell-outline" size={11} color={Colors.teal} />
              <Text style={[pc.badgeText, { color: Colors.teal }]}>Workout</Text>
            </View>
          )}
          {post.post_type === 'pr' && (
            <View style={[pc.badge, pc.badgePR]}>
              <Text style={[pc.badgeText, { color: '#F0B040' }]}>🏆 PR</Text>
            </View>
          )}
          {post.post_type === 'milestone' && (
            <View style={[pc.badge, pc.badgeMilestone]}>
              <Text style={[pc.badgeText, { color: '#3FCC93' }]}>🎯 Milestone</Text>
            </View>
          )}
        </View>

        {/* Content */}
        <Text style={pc.content}>{post.content}</Text>

        {/* Workout stats */}
        {post.workout_data && Object.keys(post.workout_data).length > 0 && (
          <View style={pc.statsRow}>
            {Object.entries(post.workout_data).map(([k, v]) => (
              <View key={k} style={pc.statCell}>
                <Text style={pc.statValue}>{String(v)}</Text>
                <Text style={pc.statKey}>{k}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Actions */}
        <View style={pc.actions}>
          <TouchableOpacity style={pc.action} onPress={handleLike} activeOpacity={0.7}>
            <Ionicons
              name={liked ? 'heart' : 'heart-outline'}
              size={19}
              color={liked ? Colors.danger : '#555'}
            />
            <Text style={[pc.actionCount, liked && { color: Colors.danger }]}>
              {localLikes > 0 ? localLikes : ''}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={pc.action}
            onPress={() => { onComment(post); setLocalComments(post.comments_count); }}
            activeOpacity={0.7}
          >
            <Ionicons name="chatbubble-outline" size={18} color="#555" />
            <Text style={pc.actionCount}>{localComments > 0 ? localComments : ''}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={pc.action} onPress={() => onShare(post)} activeOpacity={0.7}>
            <Ionicons name="logo-whatsapp" size={19} color="#25D366" />
            <Text style={[pc.actionCount, { color: '#25D366' }]}>Share</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const pc = StyleSheet.create({
  card:     { backgroundColor: E.card, borderRadius: 16, borderWidth: 0.5, borderColor: E.line, marginBottom: 10, flexDirection: 'row', overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.15, shadowRadius: 4, elevation: 2 },
  accent:   { width: 3, flexShrink: 0 },
  inner:    { flex: 1, padding: 14 },
  authorRow:{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  name:     { color: '#FFFFFF', fontSize: FontSize.body, fontFamily: 'Inter_500Medium', marginBottom: 2 },
  meta:     { color: '#555', fontSize: 10 },
  badge:    { backgroundColor: 'rgba(0,201,167,0.1)', borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 3, flexDirection: 'row', alignItems: 'center', gap: 3, borderWidth: 0.5, borderColor: 'rgba(0,201,167,0.2)' },
  badgePR:  { backgroundColor: 'rgba(240,176,64,0.1)', borderColor: 'rgba(240,176,64,0.2)' },
  badgeMilestone: { backgroundColor: 'rgba(63,204,147,0.1)', borderColor: 'rgba(63,204,147,0.2)' },
  badgeText:{ fontSize: 10, fontFamily: 'Inter_500Medium' },
  content:  { color: '#DDDDDD', fontSize: FontSize.body, lineHeight: 23, marginBottom: 12 },
  statsRow: { flexDirection: 'row', gap: 16, backgroundColor: E.raised, borderRadius: 10, padding: 12, marginBottom: 12, borderWidth: 0.5, borderColor: E.line },
  statCell: { alignItems: 'center' },
  statValue:{ color: Colors.teal, fontSize: FontSize.bodyLg, fontFamily: 'Inter_500Medium' },
  statKey:  { color: '#555', fontSize: 9, marginTop: 2 },
  actions:  { flexDirection: 'row', gap: 20, paddingTop: 10, borderTopWidth: 0.5, borderTopColor: E.line },
  action:   { flexDirection: 'row', alignItems: 'center', gap: 5 },
  actionCount: { color: '#555', fontSize: FontSize.caption, fontFamily: 'Inter_500Medium', minWidth: 16 },
});

// ─── New post sheet ───────────────────────────────────────────────────────────

function NewPostSheet({ visible, groupSlug, onClose, onPosted }: {
  visible: boolean; groupSlug: string | null;
  onClose: () => void; onPosted: () => void;
}) {
  const insets = useSafeAreaInsets();
  const user   = useUserStore(s => s.user);
  const [text,   setText]   = useState('');
  const [type,   setType]   = useState<'text' | 'workout_share' | 'pr'>('text');
  const [saving, setSaving] = useState(false);

  const POST_TYPES = [
    { value: 'text',          label: '💬 Post',    active: type === 'text' },
    { value: 'workout_share', label: '💪 Workout', active: type === 'workout_share' },
    { value: 'pr',            label: '🏆 PR',      active: type === 'pr' },
  ] as const;

  async function post() {
    if (!text.trim() || !user?.id) return;
    setSaving(true);
    await supabase.from('posts').insert({
      user_id: user.id, content: text.trim(),
      group_slug: groupSlug, post_type: type,
    });
    setText(''); setType('text');
    setSaving(false);
    onPosted(); onClose();
  }

  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView style={np.overlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <Pressable style={StyleSheet.absoluteFillObject} onPress={onClose} />
        <View style={[np.sheet, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <View style={np.handle} />
          <View style={np.header}>
            <Text style={np.title}>Share with Kominote</Text>
            <TouchableOpacity onPress={onClose} style={np.closeBtn}>
              <Ionicons name="close" size={18} color="#777" />
            </TouchableOpacity>
          </View>

          {/* Post type selector */}
          <View style={np.typeRow}>
            {POST_TYPES.map(t => (
              <TouchableOpacity
                key={t.value}
                style={[np.typeChip, t.active && np.typeChipOn]}
                onPress={() => setType(t.value)}
                activeOpacity={0.8}
              >
                <Text style={[np.typeChipText, t.active && np.typeChipTextOn]}>{t.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            style={np.input}
            value={text}
            onChangeText={setText}
            placeholder={
              type === 'workout_share' ? 'Share your workout — what did you crush today? 💪' :
              type === 'pr'            ? 'New personal record! Tell the community 🏆' :
              'Sak pase? What\'s on your mind?'
            }
            placeholderTextColor="#3A3A3E"
            multiline maxLength={300} autoFocus
          />
          <Text style={np.counter}>{text.length}/300</Text>
          <TouchableOpacity
            style={[np.postBtn, (!text.trim() || saving) && { opacity: 0.5 }]}
            onPress={post} disabled={!text.trim() || saving} activeOpacity={0.85}
          >
            <Text style={np.postBtnText}>{saving ? 'Posting…' : 'Post'}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const np = StyleSheet.create({
  overlay:  { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' },
  sheet:    { backgroundColor: E.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, borderTopWidth: 1, borderColor: E.line, padding: Spacing.screenPadding },
  handle:   { width: 36, height: 4, backgroundColor: '#444', borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  header:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  title:    { color: '#FFFFFF', fontSize: FontSize.h3, fontFamily: 'Inter_500Medium' },
  closeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: E.raised, alignItems: 'center', justifyContent: 'center' },
  typeRow:  { flexDirection: 'row', gap: 8, marginBottom: 14 },
  typeChip: { flex: 1, alignItems: 'center', paddingVertical: 9, borderRadius: 10, backgroundColor: E.raised, borderWidth: 0.5, borderColor: E.line },
  typeChipOn:{ backgroundColor: 'rgba(0,201,167,0.1)', borderColor: 'rgba(0,201,167,0.35)' },
  typeChipText:   { color: '#666', fontSize: FontSize.caption, fontFamily: 'Inter_500Medium' },
  typeChipTextOn: { color: Colors.teal },
  input:    { backgroundColor: E.raised, borderRadius: 14, borderWidth: 0.5, borderColor: E.line, padding: 14, color: '#FFFFFF', fontSize: FontSize.body, minHeight: 100, lineHeight: 22, textAlignVertical: 'top', marginBottom: 8 },
  counter:  { color: '#444', fontSize: 10, textAlign: 'right', marginBottom: 14 },
  postBtn:  { backgroundColor: Colors.teal, borderRadius: 12, paddingVertical: 14, alignItems: 'center', shadowColor: Colors.teal, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 4 },
  postBtnText: { color: Colors.background, fontSize: FontSize.body, fontFamily: 'Inter_500Medium' },
});

// ─── Leaderboard ─────────────────────────────────────────────────────────────

interface LeaderEntry { name: string; sessions: number; volume: number; }

function Leaderboard() {
  const [leaders, setLeaders] = useState<LeaderEntry[]>([]);

  useEffect(() => {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0,0,0,0);

    supabase
      .from('workout_sessions')
      .select('user_id, total_volume_kg, completed_at')
      .gte('started_at', weekStart.toISOString())
      .not('completed_at', 'is', null)
      .then(async ({ data: sessions }) => {
        if (!sessions?.length) return;
        // Aggregate by user
        const map = new Map<string, { sessions: number; volume: number }>();
        sessions.forEach(s => {
          const cur = map.get(s.user_id) ?? { sessions: 0, volume: 0 };
          map.set(s.user_id, { sessions: cur.sessions + 1, volume: cur.volume + (s.total_volume_kg ?? 0) });
        });
        const top5 = [...map.entries()]
          .sort((a, b) => b[1].volume - a[1].volume)
          .slice(0, 5);

        const uids = top5.map(([uid]) => uid);
        const { data: profiles } = await supabase.from('profiles').select('id,name').in('id', uids);
        const pm = new Map(profiles?.map(p => [p.id, p.name]) ?? []);

        setLeaders(top5.map(([uid, stats]) => ({
          name:     pm.get(uid) ?? 'Fòs Member',
          sessions: stats.sessions,
          volume:   Math.round(stats.volume),
        })));
      });
  }, []);

  if (!leaders.length) return null;

  const MEDALS = ['🥇','🥈','🥉','4️⃣','5️⃣'];

  return (
    <View style={lb.wrap}>
      <Text style={lb.title}>🏆 This Week's Leaders</Text>
      {leaders.map((l, i) => (
        <View key={i} style={[lb.row, i === 0 && lb.rowFirst]}>
          <Text style={lb.medal}>{MEDALS[i]}</Text>
          <Avatar name={l.name} size={30} />
          <Text style={[lb.name, i === 0 && { color: '#F0B040' }]} numberOfLines={1}>{l.name}</Text>
          <View style={lb.stats}>
            <Text style={lb.vol}>{l.volume > 0 ? `${l.volume}kg` : '—'}</Text>
            <Text style={lb.sess}>{l.sessions} sessions</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const lb = StyleSheet.create({
  wrap:     { backgroundColor: E.card, borderRadius: 16, borderWidth: 0.5, borderColor: E.line, marginBottom: 16, overflow: 'hidden' },
  title:    { color: '#FFFFFF', fontSize: FontSize.body, fontFamily: 'Inter_500Medium', padding: 14, borderBottomWidth: 0.5, borderBottomColor: E.line },
  row:      { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: '#1A1A1C' },
  rowFirst: { backgroundColor: 'rgba(240,176,64,0.05)' },
  medal:    { fontSize: 16, width: 24 },
  name:     { flex: 1, color: '#CCCCCC', fontSize: FontSize.body, fontFamily: 'Inter_500Medium' },
  stats:    { alignItems: 'flex-end' },
  vol:      { color: Colors.teal, fontSize: FontSize.caption, fontFamily: 'Inter_500Medium' },
  sess:     { color: '#555', fontSize: 10, marginTop: 1 },
});

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function CommunityScreen() {
  const insets = useSafeAreaInsets();
  const user   = useUserStore(s => s.user);
  const [groups,       setGroups]      = useState<Group[]>([]);
  const [posts,        setPosts]       = useState<Post[]>([]);
  const [loaded,       setLoaded]      = useState(false);
  const [activeGroup,  setActiveGroup] = useState<string | null>(null);
  const [postFilter,   setPostFilter]  = useState<PostFilter>('all');
  const [refreshing,   setRefreshing]  = useState(false);
  const [postOpen,     setPostOpen]    = useState(false);
  const [commentPost,  setCommentPost] = useState<Post | null>(null);
  const [weekSessions, setWeekSessions] = useState(0);

  // Fetch user's sessions this week for challenge tracking
  useEffect(() => {
    if (!user?.id) return;
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);
    supabase.from('workout_sessions')
      .select('id', { count: 'exact' })
      .eq('user_id', user.id)
      .gte('started_at', weekStart.toISOString())
      .not('completed_at', 'is', null)
      .then(({ count }) => setWeekSessions(count ?? 0));
  }, [user?.id]);

  const fetchGroups = useCallback(async () => {
    const { data } = await supabase.from('groups').select('slug,name,city,flag_emoji,member_count').order('member_count', { ascending: false });
    if (data) setGroups(data as Group[]);
  }, []);

  const fetchPosts = useCallback(async () => {
    let q = supabase.from('posts').select('*').order('created_at', { ascending: false }).limit(30);
    if (activeGroup) q = q.eq('group_slug', activeGroup);

    const { data } = await q;
    if (!data) { setLoaded(true); setRefreshing(false); return; }

    const uids = [...new Set(data.map(p => p.user_id).filter(Boolean))];
    const { data: profiles } = uids.length
      ? await supabase.from('profiles').select('id,name,city').in('id', uids)
      : { data: [] };

    const pm = new Map(profiles?.map(p => [p.id, p]) ?? []);
    setPosts(data.map(p => ({
      ...p,
      author_name: pm.get(p.user_id)?.name ?? 'Fòs Member',
      author_city: pm.get(p.user_id)?.city ?? null,
    })) as Post[]);
    setLoaded(true);
    setRefreshing(false);
  }, [activeGroup]);

  useEffect(() => { fetchGroups(); }, [fetchGroups]);
  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  async function handleLike(postId: string) {
    try { await supabase.rpc('increment_likes' as any, { post_id: postId }); } catch (_) {}
  }

  function handleCommented(postId: string) {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, comments_count: p.comments_count + 1 } : p));
  }

  async function handleShare(post: Post) {
    const group = groups.find(g => g.slug === post.group_slug);
    const msg   = `${post.author_name ?? 'Someone'} on Fòs${group ? ` (${group.name})` : ''}:\n\n"${post.content}"\n\nJoin the Haitian diaspora fitness community 🇭🇹`;
    await Share.share({ message: msg });
  }

  // Filter posts by type
  const displayPosts = postFilter === 'all'
    ? posts
    : posts.filter(p => p.post_type === postFilter);

  const SAMPLES: Post[] = loaded && posts.length === 0 ? [
    { id: 's1', user_id: '', content: 'Just finished my first Pull Day on Fòs! Men anpil chay pa lou 💪🇭🇹', group_slug: 'miami-ayisyen', post_type: 'workout_share', workout_data: { Duration: '48 min', Volume: '2,140 kg' }, likes_count: 23, comments_count: 4, created_at: new Date(Date.now() - 3600000).toISOString(), author_name: 'Jean-Paul M.', author_city: 'Miami' },
    { id: 's2', user_id: '', content: 'New squat PR — 120kg! Dèyè mòn gen mòn, never stopping 🔥', group_slug: 'nyc-diaspora', post_type: 'pr', workout_data: { 'Squat PR': '120 kg', Streak: '12 days' }, likes_count: 47, comments_count: 11, created_at: new Date(Date.now() - 7200000).toISOString(), author_name: 'Mirlanda C.', author_city: 'New York' },
    { id: 's3', user_id: '', content: 'Après griot ak diri, j\'ai fait mon entraînement. Meilleur carburant! 🇭🇹', group_slug: 'montreal-fos', post_type: 'text', workout_data: null, likes_count: 31, comments_count: 8, created_at: new Date(Date.now() - 14400000).toISOString(), author_name: 'Farah D.', author_city: 'Montréal' },
  ] : (displayPosts.length > 0 ? displayPosts : []);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <FlatList
        data={SAMPLES}
        keyExtractor={p => p.id}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            onLike={handleLike}
            onComment={setCommentPost}
            onShare={handleShare}
          />
        )}
        style={{ backgroundColor: Colors.background }}
        contentContainerStyle={[s.list, { paddingHorizontal: Spacing.screenPadding }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchPosts(); }} tintColor={Colors.teal} />}
        ListHeaderComponent={
          <View style={{ paddingTop: insets.top + 12 }}>
            {/* Header */}
            <View style={s.header}>
              <Text style={s.heading}>Kominote 🇭🇹</Text>
              <TouchableOpacity style={s.postBtn} onPress={() => setPostOpen(true)} activeOpacity={0.85}>
                <Ionicons name="add" size={15} color={Colors.background} />
                <Text style={s.postBtnText}>Post</Text>
              </TouchableOpacity>
            </View>

            <ChallengeBanner
              userSessions={weekSessions}
              onJoin={() => {
                if (weekSessions >= getCulturalChallenge().goal)
                  Alert.alert('🏆 Defi fini!', 'You completed the challenge this week. Nou fyè de ou, frè m!');
                else
                  Alert.alert('Joined! 💪', `${weekSessions} / ${getCulturalChallenge().goal} done. Keep going!`);
              }}
            />

            <Leaderboard />

            <Text style={s.section}>Groups</Text>
            <GroupsStrip groups={groups} active={activeGroup} onSelect={s => setActiveGroup(p => p === s ? null : s)} />

            <Text style={s.section}>{activeGroup ? (groups.find(g => g.slug === activeGroup)?.name ?? 'Feed') : 'Recent Posts'}</Text>
            <PostFilters active={postFilter} onSelect={setPostFilter} />
          </View>
        }
        ListEmptyComponent={
          loaded && !refreshing ? (
            <View style={s.empty}>
              <Text style={s.emptyEmoji}>🇭🇹</Text>
              <Text style={s.emptyTitle}>Be the first to post!</Text>
              <Text style={s.emptySub}>Share a workout, a PR, or just say Sak pase.</Text>
            </View>
          ) : null
        }
      />

      <NewPostSheet visible={postOpen} groupSlug={activeGroup} onClose={() => setPostOpen(false)} onPosted={fetchPosts} />
      <CommentsSheet post={commentPost} visible={!!commentPost} onClose={() => setCommentPost(null)} onCommented={handleCommented} />
    </View>
  );
}

const s = StyleSheet.create({
  list:     { paddingBottom: 40 },
  header:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  heading:  { color: '#FFFFFF', fontSize: FontSize.h1, fontFamily: 'Inter_500Medium' },
  postBtn:  { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: Colors.teal, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, shadowColor: Colors.teal, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 4 },
  postBtnText: { color: Colors.background, fontSize: FontSize.caption, fontFamily: 'Inter_500Medium' },
  section:  { color: '#FFFFFF', fontSize: FontSize.bodyLg, fontFamily: 'Inter_500Medium', marginBottom: 12 },
  empty:    { alignItems: 'center', paddingTop: 40 },
  emptyEmoji: { fontSize: 40, marginBottom: 12 },
  emptyTitle: { color: '#FFFFFF', fontSize: FontSize.bodyLg, fontFamily: 'Inter_500Medium', marginBottom: 8 },
  emptySub:   { color: '#555', fontSize: FontSize.bodySm, textAlign: 'center', lineHeight: 20 },
});
