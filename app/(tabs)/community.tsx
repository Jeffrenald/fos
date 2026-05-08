import { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  ScrollView, RefreshControl, Share, Alert,
  Modal, Pressable, TextInput, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Spacing } from '@/constants/Colors';
import { FontSize } from '@/constants/fonts';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { supabase } from '@/lib/supabase';
import { useUserStore } from '@/stores/userStore';
import { i18n } from '@/lib/i18n';

const { width } = Dimensions.get('window');

// ─── Types ────────────────────────────────────────────────────────────────────

interface Group {
  slug:         string;
  name:         string;
  city:         string;
  flag_emoji:   string;
  member_count: number;
}

interface Post {
  id:             string;
  user_id:        string;
  content:        string;
  group_slug:     string | null;
  post_type:      'text' | 'workout_share' | 'pr' | 'milestone';
  workout_data:   any;
  likes_count:    number;
  comments_count: number;
  created_at:     string;
  // joined from profiles
  author_name?:   string;
  author_city?:   string;
}

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
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

// Gradient colors for avatars based on name
const AVATAR_COLORS = [
  ['#00209F', '#00C9A7'],
  ['#CE1126', '#F0B040'],
  ['#00C9A7', '#5A78FF'],
  ['#F0B040', '#FF7A85'],
  ['#3FCC93', '#00209F'],
];
function avatarColor(name: string): string[] {
  const idx = name.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

// ─── Weekly challenge ─────────────────────────────────────────────────────────

const CHALLENGE = {
  name:        'Semèn Fò — Strong Week',
  description: 'Complete 4 workouts this week with your community',
  target:      4,
  current:     847,
  total:       1200,
  daysLeft:    3,
};

function ChallengeBanner({ onJoin }: { onJoin: () => void }) {
  const pct = CHALLENGE.current / CHALLENGE.total;
  return (
    <View style={cb.card}>
      {/* Haitian flag accent top */}
      <View style={cb.flagBar}>
        <View style={cb.flagBlue} />
        <View style={cb.flagRed} />
      </View>

      <View style={cb.body}>
        <View style={cb.top}>
          <View style={{ flex: 1 }}>
            <Text style={cb.name}>{CHALLENGE.name}</Text>
            <Text style={cb.desc}>{CHALLENGE.description}</Text>
          </View>
          <View style={cb.daysPill}>
            <Text style={cb.daysText}>{CHALLENGE.daysLeft}d left</Text>
          </View>
        </View>

        {/* Progress */}
        <View style={cb.progressWrap}>
          <View style={cb.progressTrack}>
            <View style={[cb.progressFill, { width: `${pct * 100}%` as any }]} />
          </View>
          <Text style={cb.progressLabel}>
            {CHALLENGE.current.toLocaleString()} / {CHALLENGE.total.toLocaleString()} members joined
          </Text>
        </View>

        <TouchableOpacity style={cb.joinBtn} onPress={onJoin} activeOpacity={0.85}>
          <Text style={cb.joinText}>Join Challenge</Text>
          <Ionicons name="arrow-forward" size={14} color={Colors.background} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const cb = StyleSheet.create({
  card:         { backgroundColor: '#1A1A1C', borderRadius: 16, borderWidth: 0.5, borderColor: '#2A2A2E', overflow: 'hidden', marginBottom: 20 },
  flagBar:      { flexDirection: 'row', height: 4 },
  flagBlue:     { flex: 1, backgroundColor: '#00209F' },
  flagRed:      { flex: 1, backgroundColor: '#CE1126' },
  body:         { padding: Spacing.cardPadding },
  top:          { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14, gap: 10 },
  name:         { color: '#FFFFFF', fontSize: FontSize.bodyLg, fontFamily: 'Inter_500Medium', marginBottom: 4 },
  desc:         { color: '#777', fontSize: FontSize.caption, lineHeight: 18 },
  daysPill:     { backgroundColor: 'rgba(240,176,64,0.12)', borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 0.5, borderColor: 'rgba(240,176,64,0.3)' },
  daysText:     { color: '#F0B040', fontSize: 10, fontFamily: 'Inter_500Medium' },
  progressWrap: { marginBottom: 14 },
  progressTrack:{ height: 5, backgroundColor: '#252528', borderRadius: 3, overflow: 'hidden', marginBottom: 6 },
  progressFill: { height: 5, backgroundColor: Colors.teal, borderRadius: 3 },
  progressLabel:{ color: '#555', fontSize: 10 },
  joinBtn:      { backgroundColor: Colors.teal, borderRadius: 10, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, shadowColor: Colors.teal, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 4 },
  joinText:     { color: Colors.background, fontSize: FontSize.body, fontFamily: 'Inter_500Medium' },
});

// ─── Groups strip ─────────────────────────────────────────────────────────────

function GroupsStrip({ groups, activeSlug, onSelect }: {
  groups: Group[];
  activeSlug: string | null;
  onSelect: (slug: string) => void;
}) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={gs.scroll} contentContainerStyle={gs.content}>
      {groups.map(g => {
        const active = g.slug === activeSlug;
        return (
          <TouchableOpacity
            key={g.slug}
            style={[gs.chip, active && gs.chipActive]}
            onPress={() => onSelect(g.slug)}
            activeOpacity={0.8}
          >
            <Text style={gs.flag}>{g.flag_emoji}</Text>
            <View>
              <Text style={[gs.name, active && gs.nameActive]}>{g.name}</Text>
              <Text style={gs.count}>{g.member_count.toLocaleString()} members</Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const gs = StyleSheet.create({
  scroll:     { marginHorizontal: -Spacing.screenPadding, marginBottom: 16 },
  content:    { paddingHorizontal: Spacing.screenPadding, gap: 8 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#141416', borderRadius: 12,
    borderWidth: 0.5, borderColor: '#1E1E20',
    paddingHorizontal: 12, paddingVertical: 8,
  },
  chipActive: { backgroundColor: 'rgba(0,201,167,0.08)', borderColor: 'rgba(0,201,167,0.3)' },
  flag:       { fontSize: 18 },
  name:       { color: '#AAAAAA', fontSize: FontSize.caption, fontFamily: 'Inter_500Medium' },
  nameActive: { color: Colors.teal },
  count:      { color: '#444', fontSize: 9, marginTop: 1 },
});

// ─── Post card ────────────────────────────────────────────────────────────────

function PostCard({ post, onLike, onShare }: {
  post: Post;
  onLike: (id: string) => void;
  onShare: (post: Post) => void;
}) {
  const name   = post.author_name ?? 'Fòs Member';
  const colors = avatarColor(name);
  const [liked, setLiked] = useState(false);

  return (
    <View style={pc.card}>
      {/* Author row */}
      <View style={pc.authorRow}>
        <View style={[pc.avatar, { backgroundColor: colors[0] }]}>
          <Text style={pc.avatarText}>{initials(name)}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={pc.name}>{name}</Text>
          <Text style={pc.meta}>
            {post.author_city ?? 'Diaspora'} · {timeAgo(post.created_at)}
          </Text>
        </View>
        {post.post_type === 'workout_share' && (
          <View style={pc.typeBadge}>
            <Ionicons name="barbell-outline" size={11} color={Colors.teal} />
            <Text style={pc.typeBadgeText}>Workout</Text>
          </View>
        )}
        {post.post_type === 'pr' && (
          <View style={[pc.typeBadge, pc.typeBadgePR]}>
            <Text style={pc.typePRText}>🏆 PR</Text>
          </View>
        )}
      </View>

      {/* Content */}
      <Text style={pc.content}>{post.content}</Text>

      {/* Workout data card */}
      {post.workout_data && (
        <View style={pc.workoutCard}>
          {Object.entries(post.workout_data).map(([k, v]) => (
            <View key={k} style={pc.workoutStat}>
              <Text style={pc.workoutValue}>{String(v)}</Text>
              <Text style={pc.workoutKey}>{k}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Actions */}
      <View style={pc.actions}>
        <TouchableOpacity
          style={pc.action}
          onPress={() => { setLiked(l => !l); onLike(post.id); }}
          activeOpacity={0.7}
        >
          <Ionicons
            name={liked ? 'heart' : 'heart-outline'}
            size={18}
            color={liked ? Colors.danger : '#555'}
          />
          <Text style={[pc.actionText, liked && { color: Colors.danger }]}>
            {post.likes_count + (liked ? 1 : 0)}
          </Text>
        </TouchableOpacity>

        <View style={pc.action}>
          <Ionicons name="chatbubble-outline" size={17} color="#555" />
          <Text style={pc.actionText}>{post.comments_count}</Text>
        </View>

        <TouchableOpacity style={pc.action} onPress={() => onShare(post)} activeOpacity={0.7}>
          <Ionicons name="logo-whatsapp" size={18} color="#25D366" />
          <Text style={[pc.actionText, { color: '#25D366' }]}>Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const pc = StyleSheet.create({
  card:        { backgroundColor: '#1C1C1E', borderRadius: 16, borderWidth: 0.5, borderColor: '#252528', padding: Spacing.cardPadding, marginBottom: 10 },
  authorRow:   { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  avatar:      { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarText:  { color: '#FFFFFF', fontSize: FontSize.caption, fontFamily: 'Inter_500Medium' },
  name:        { color: '#FFFFFF', fontSize: FontSize.body, fontFamily: 'Inter_500Medium', marginBottom: 2 },
  meta:        { color: '#555', fontSize: 10 },
  typeBadge:   { backgroundColor: 'rgba(0,201,167,0.1)', borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 3, flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 0.5, borderColor: 'rgba(0,201,167,0.25)' },
  typeBadgeText:{ color: Colors.teal, fontSize: 10, fontFamily: 'Inter_500Medium' },
  typeBadgePR: { backgroundColor: 'rgba(240,176,64,0.1)', borderColor: 'rgba(240,176,64,0.25)' },
  typePRText:  { color: '#F0B040', fontSize: 10, fontFamily: 'Inter_500Medium' },
  content:     { color: '#CCCCCC', fontSize: FontSize.body, lineHeight: 22, marginBottom: 12 },
  workoutCard: { flexDirection: 'row', backgroundColor: '#141416', borderRadius: 10, padding: 12, marginBottom: 12, gap: 16 },
  workoutStat: { alignItems: 'center' },
  workoutValue:{ color: Colors.teal, fontSize: FontSize.bodyLg, fontFamily: 'Inter_500Medium' },
  workoutKey:  { color: '#555', fontSize: 9, marginTop: 2 },
  actions:     { flexDirection: 'row', gap: 20, paddingTop: 10, borderTopWidth: 0.5, borderTopColor: '#1E1E1E' },
  action:      { flexDirection: 'row', alignItems: 'center', gap: 5 },
  actionText:  { color: '#555', fontSize: FontSize.caption },
});

// ─── New Post Sheet ───────────────────────────────────────────────────────────

function NewPostSheet({ visible, groupSlug, onClose, onPosted }: {
  visible: boolean; groupSlug: string | null;
  onClose: () => void; onPosted: () => void;
}) {
  const user = useUserStore(s => s.user);
  const [text,   setText]   = useState('');
  const [saving, setSaving] = useState(false);

  async function post() {
    if (!text.trim() || !user?.id) return;
    setSaving(true);
    await supabase.from('posts').insert({
      user_id:    user.id,
      content:    text.trim(),
      group_slug: groupSlug,
      post_type:  'text',
    });
    setText('');
    setSaving(false);
    onPosted();
    onClose();
  }

  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={np.overlay}>
        <Pressable style={StyleSheet.absoluteFillObject} onPress={onClose} />
        <View style={np.sheet}>
          <View style={np.handle} />
          <View style={np.header}>
            <Text style={np.title}>Share with the community</Text>
            <TouchableOpacity onPress={onClose} style={np.closeBtn}>
              <Ionicons name="close" size={18} color="#777" />
            </TouchableOpacity>
          </View>
          <TextInput
            style={np.input}
            value={text}
            onChangeText={setText}
            placeholder="What's on your mind? Sak pase today?"
            placeholderTextColor="#3A3A3E"
            multiline
            maxLength={300}
            autoFocus
          />
          <Text style={np.counter}>{text.length}/300</Text>
          <TouchableOpacity
            style={[np.postBtn, (!text.trim() || saving) && { opacity: 0.5 }]}
            onPress={post}
            disabled={!text.trim() || saving}
            activeOpacity={0.85}
          >
            <Text style={np.postBtnText}>{saving ? 'Posting…' : 'Post to Community'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const np = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' },
  sheet:   { backgroundColor: '#1C1C1E', borderTopLeftRadius: 24, borderTopRightRadius: 24, borderTopWidth: 1, borderColor: '#2A2A2E', padding: Spacing.screenPadding, paddingBottom: 40 },
  handle:  { width: 36, height: 4, backgroundColor: '#444', borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  header:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  title:   { color: '#FFFFFF', fontSize: FontSize.h3, fontFamily: 'Inter_500Medium' },
  closeBtn:{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#2A2A2E', alignItems: 'center', justifyContent: 'center' },
  input:   { backgroundColor: '#141416', borderRadius: 14, borderWidth: 0.5, borderColor: '#252528', padding: 14, color: '#FFFFFF', fontSize: FontSize.body, minHeight: 100, lineHeight: 22, textAlignVertical: 'top', marginBottom: 8 },
  counter: { color: '#444', fontSize: 10, textAlign: 'right', marginBottom: 16 },
  postBtn: { backgroundColor: Colors.teal, borderRadius: 12, paddingVertical: 14, alignItems: 'center', shadowColor: Colors.teal, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 4 },
  postBtnText: { color: Colors.background, fontSize: FontSize.body, fontFamily: 'Inter_500Medium' },
});

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function CommunityScreen() {
  const user = useUserStore(s => s.user);
  const [groups,      setGroups]      = useState<Group[]>([]);
  const [posts,       setPosts]       = useState<Post[]>([]);
  const [loaded,      setLoaded]      = useState(false);   // true once first fetch completes
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const [refreshing,  setRefreshing]  = useState(false);
  const [postOpen,    setPostOpen]    = useState(false);

  const fetchGroups = useCallback(async () => {
    const { data } = await supabase
      .from('groups')
      .select('slug, name, city, flag_emoji, member_count')
      .order('member_count', { ascending: false });
    if (data) setGroups(data as Group[]);
  }, []);

  const fetchPosts = useCallback(async () => {
    let q = supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);
    if (activeGroup) q = q.eq('group_slug', activeGroup);

    const { data } = await q;
    if (!data) return;

    // Fetch author names from profiles
    const userIds = [...new Set(data.map(p => p.user_id))];
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, name, city')
      .in('id', userIds);

    const profileMap = new Map(profiles?.map(p => [p.id, p]) ?? []);

    setPosts(data.map(p => ({
      ...p,
      author_name: profileMap.get(p.user_id)?.name ?? 'Fòs Member',
      author_city: profileMap.get(p.user_id)?.city ?? null,
    })) as Post[]);
    setLoaded(true);
    setRefreshing(false);
  }, [activeGroup]);

  useEffect(() => { fetchGroups(); }, [fetchGroups]);
  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  async function handleLike(postId: string) {
    try { await supabase.rpc('increment_likes' as any, { post_id: postId }); } catch (_) {}
  }

  async function handleShare(post: Post) {
    const name   = post.author_name ?? 'Someone';
    const group  = groups.find(g => g.slug === post.group_slug);
    const text   = `${name} on Fòs${group ? ` (${group.name})` : ''}:\n\n"${post.content}"\n\nJoin the Haitian diaspora fitness community 🇭🇹\nDownload Fòs`;
    await Share.share({ message: text });
  }

  function handleChallengeJoin() {
    Alert.alert('Joined! 💪', 'You\'re in the Semèn Fò challenge. Complete 4 workouts this week to finish it, frè m!');
  }

  function refresh() {
    setRefreshing(true);
    fetchPosts();
  }

  // Show sample posts only after first load completes and feed is genuinely empty
  const SAMPLE_POSTS: Post[] = loaded && posts.length === 0 ? [
    {
      id: 's1', user_id: '', content: 'Just finished my first Pull Day session on Fòs! Men anpil chay pa lou 💪🇭🇹',
      group_slug: 'miami-ayisyen', post_type: 'workout_share',
      workout_data: { Duration: '48 min', Volume: '2,140 kg', Sets: 18 },
      likes_count: 23, comments_count: 4, created_at: new Date(Date.now() - 3600000).toISOString(),
      author_name: 'Jean-Paul M.', author_city: 'Miami',
    },
    {
      id: 's2', user_id: '', content: 'New squat PR today — 120kg! Dèyè mòn gen mòn, never stopping 🔥',
      group_slug: 'nyc-diaspora', post_type: 'pr',
      workout_data: { 'Squat PR': '120 kg', Streak: '12 days' },
      likes_count: 47, comments_count: 11, created_at: new Date(Date.now() - 7200000).toISOString(),
      author_name: 'Mirlanda C.', author_city: 'New York',
    },
    {
      id: 's3', user_id: '', content: 'Après griot ak diri, j\'ai fait mon entraînement. La nourriture haïtienne est le meilleur carburant! 🇭🇹',
      group_slug: 'montreal-fos', post_type: 'text',
      workout_data: null, likes_count: 31, comments_count: 8,
      created_at: new Date(Date.now() - 14400000).toISOString(),
      author_name: 'Farah D.', author_city: 'Montréal',
    },
  ] : posts;

  return (
    <>
      <FlatList
        data={SAMPLE_POSTS}
        keyExtractor={p => p.id}
        renderItem={({ item }) => (
          <PostCard post={item} onLike={handleLike} onShare={handleShare} />
        )}
        contentContainerStyle={s.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={Colors.teal} />}
        ListHeaderComponent={
          <View style={s.listHeader}>
            {/* Header */}
            <View style={s.header}>
              <Text style={s.heading}>{i18n.t('community.title')} 🇭🇹</Text>
              <TouchableOpacity style={s.postBtn} onPress={() => setPostOpen(true)} activeOpacity={0.85}>
                <Ionicons name="add" size={16} color={Colors.background} />
                <Text style={s.postBtnText}>Post</Text>
              </TouchableOpacity>
            </View>

            {/* Challenge */}
            <ChallengeBanner onJoin={handleChallengeJoin} />

            {/* Groups */}
            <Text style={s.section}>{i18n.t('community.title')}</Text>
            <GroupsStrip
              groups={groups}
              activeSlug={activeGroup}
              onSelect={slug => setActiveGroup(prev => prev === slug ? null : slug)}
            />

            {/* Feed header */}
            <Text style={s.section}>
              {activeGroup
                ? (groups.find(g => g.slug === activeGroup)?.name ?? 'Feed')
                : 'Recent Posts'}
            </Text>
          </View>
        }
        ListEmptyComponent={
          !refreshing ? (
            <View style={s.empty}>
              <Text style={s.emptyEmoji}>🇭🇹</Text>
              <Text style={s.emptyTitle}>Be the first to post!</Text>
              <Text style={s.emptySub}>Share your workout, a PR, or just say Sak pase to the community.</Text>
            </View>
          ) : null
        }
      />

      <NewPostSheet
        visible={postOpen}
        groupSlug={activeGroup}
        onClose={() => setPostOpen(false)}
        onPosted={fetchPosts}
      />
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  listContent: { paddingBottom: 32 },
  listHeader:  { paddingHorizontal: Spacing.screenPadding },

  header:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 16, marginBottom: 20 },
  heading:   { color: '#FFFFFF', fontSize: FontSize.h1, fontFamily: 'Inter_500Medium' },
  postBtn:   { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: Colors.teal, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, shadowColor: Colors.teal, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 4 },
  postBtnText: { color: Colors.background, fontSize: FontSize.caption, fontFamily: 'Inter_500Medium' },

  section:   { color: '#FFFFFF', fontSize: FontSize.bodyLg, fontFamily: 'Inter_500Medium', marginBottom: 12 },

  empty:     { alignItems: 'center', paddingTop: 40, paddingHorizontal: Spacing.screenPadding },
  emptyEmoji:{ fontSize: 40, marginBottom: 12 },
  emptyTitle:{ color: '#FFFFFF', fontSize: FontSize.bodyLg, fontFamily: 'Inter_500Medium', marginBottom: 8 },
  emptySub:  { color: '#555', fontSize: FontSize.bodySm, textAlign: 'center', lineHeight: 20 },
});
