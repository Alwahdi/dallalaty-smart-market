import React from 'react';
import {router} from 'expo-router';
import {Page,Empty,Button} from '../src/components/UI';
import {useSettings} from '../src/providers/Theme';
export default function NotFound(){const {t}=useSettings();return <Page><Empty title={t('الصفحة غير موجودة','Page not found')} action={<Button onPress={()=>router.replace('/')}>{t('المنتجات','Products')}</Button>}/></Page>;}