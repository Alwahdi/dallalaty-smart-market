import React from 'react';
import {Tabs} from 'expo-router';
import {MaterialCommunityIcons} from '@expo/vector-icons';
import {useTheme} from 'react-native-paper';
import {Guard} from '../../src/components/Guard';
import {useSettings} from '../../src/providers/Theme';
import {useFavorites} from '../../src/lib/data';
import {formatNumber} from '../../src/lib/format';
export default function Layout(){const theme=useTheme();const {t}=useSettings();const favorites=useFavorites();const tabIcon=(name:'view-grid-outline'|'heart-outline'|'bell-outline'|'account-outline')=>({color,size}:{color:unknown;size:number})=><MaterialCommunityIcons name={name} color={typeof color==='string'?color:theme.colors.onSurfaceVariant} size={size}/>;return <Guard><Tabs screenOptions={{headerShown:false,tabBarActiveTintColor:theme.colors.primary,tabBarInactiveTintColor:theme.colors.onSurfaceVariant,tabBarStyle:{backgroundColor:theme.colors.surface,borderTopColor:theme.colors.outlineVariant},tabBarLabelStyle:{fontFamily:'Cairo_400Regular',letterSpacing:0}}}><Tabs.Screen name="index" options={{title:t('المنتجات','Products'),tabBarIcon:tabIcon('view-grid-outline')}}/><Tabs.Screen name="favorites" options={{title:t('المفضلة','Favorites'),tabBarBadge:favorites.ids.length?formatNumber(favorites.ids.length):undefined,tabBarIcon:tabIcon('heart-outline')}}/><Tabs.Screen name="notifications" options={{title:t('الإشعارات','Inbox'),tabBarIcon:tabIcon('bell-outline')}}/><Tabs.Screen name="account" options={{title:t('حسابي','Account'),tabBarIcon:tabIcon('account-outline')}}/></Tabs></Guard>;}