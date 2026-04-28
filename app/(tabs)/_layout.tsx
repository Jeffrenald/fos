import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { FontSize } from '@/constants/fonts';
import { i18n } from '@/lib/i18n';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

function TabIcon({ name, focused }: { name: IoniconsName; focused: boolean }) {
  return (
    <Ionicons
      name={name}
      size={22}
      color={focused ? Colors.teal : Colors.textDim}
    />
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown:           false,
        tabBarStyle: {
          backgroundColor:     Colors.background,
          borderTopColor:      Colors.border,
          borderTopWidth:      0.5,
          height:              84,
          paddingBottom:       24,
          paddingTop:          10,
        },
        tabBarActiveTintColor:   Colors.teal,
        tabBarInactiveTintColor: Colors.textDim,
        tabBarLabelStyle: {
          fontSize:   FontSize.label,
          fontFamily: 'Inter_400Regular',
          marginTop:  2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title:    i18n.t('nav.home'),
          tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'home' : 'home-outline'} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="workout"
        options={{
          title:    i18n.t('nav.workout'),
          tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'barbell' : 'barbell-outline'} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="coach"
        options={{
          title: i18n.t('nav.coach'),
          tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'flash' : 'flash-outline'} focused={focused} />,
          tabBarLabel: 'Kouraj',
        }}
      />
      <Tabs.Screen
        name="nutrition"
        options={{
          title:    i18n.t('nav.nutrition'),
          tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'restaurant' : 'restaurant-outline'} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title:    i18n.t('nav.community'),
          tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'people' : 'people-outline'} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title:    i18n.t('nav.progress'),
          tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'stats-chart' : 'stats-chart-outline'} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title:    i18n.t('nav.profile'),
          tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'person' : 'person-outline'} focused={focused} />,
        }}
      />

    </Tabs>
  );
}
