import React from 'react';
import {Tabs} from 'expo-router';
import {MaterialCommunityIcons} from '@expo/vector-icons';
import {useTheme} from 'react-native-paper';
import {Guard} from '../../src/components/Guard';
import {useSettings} from '../../src/providers/Theme';
import {useFavorites} from '../../src/lib/data';
import {formatNumber} from '../../src/lib/format';
export default function Layout(){const theme=useTheme();const {t}=useSettings();const favorites=useFavorites();return <Guard><Tabs screenOptions={{headerShown:false,tabBarActiveTintColor:theme.colors.primary,tabBarInactiveTintColor:theme.colors.onSurfaceVariant,tabBarStyle:{backgroundColor:theme.colors.surface,borderTopColor:theme.colors.outlineVariant},tabBarLabelStyle:{fontFamily:'Cairo_400Regular',letterSpacing:0}}}><Tabs.Screen name="index" options={{title:t('المنتجات','Products'),tabBarIcon:({color,size})=><MaterialCommunityIcons name="view-grid-outline" color={color} size={size}/>}}/><Tabs.Screen name="favorites" options={{title:t('المفضلة','Favorites'),tabBarBadge:favorites.ids.length?formatNumber(favorites.ids.length):undefined,tabBarIcon:({color,size})=><MaterialCommunityIcons name="heart-outline" color={color} size={size}/>}}/><Tabs.Screen name="notifications" options={{title:t('الإشعارات','Inbox'),tabBarIcon:({color,size})=><MaterialCommunityIcons name="bell-outline" color={color} size={size}/>}}/><Tabs.Screen name="account" options={{title:t('حسابي','Account'),tabBarIcon:({color,size})=><MaterialCommunityIcons name="account-outline" color={color} size={size}/>}}/></Tabs></Guard>;}