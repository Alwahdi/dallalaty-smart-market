import React from 'react';
import {Redirect} from 'expo-router';
import {useAuth} from '../providers/Auth';
import {profileComplete} from '../lib/rules';
import {Loading,Page,Empty,Button,ErrorState} from './UI';
import {check,supabase} from '../lib/client';
import {useSettings} from '../providers/Theme';
export function Guard({children}:{children:React.ReactNode}){const auth=useAuth();const {t}=useSettings();if(auth.loading)return <Loading/>;if(!auth.user)return <Redirect href="/auth"/>;if(auth.recovery)return <Redirect href="/reset-password"/>;if(auth.profile.isPending||auth.roles.isPending)return <Loading/>;if(auth.profile.isError||auth.roles.isError)return <Page><ErrorState retry={()=>{void auth.profile.refetch();void auth.roles.refetch();}}/></Page>;if(auth.profile.data?.is_active===false)return <Page><Empty title={t('الحساب موقوف','Account suspended')} action={<Button onPress={()=>void supabase.auth.signOut().then(r=>check(r.error))}>{t('تسجيل الخروج','Sign out')}</Button>}/></Page>;if(!profileComplete(auth.profile.data))return <Redirect href="/onboarding"/>;return <>{children}</>;}