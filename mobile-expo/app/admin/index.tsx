import React from 'react';
import {router} from 'expo-router';
import {Guard} from '../../src/components/Guard';
import {Page,Button,Empty} from '../../src/components/UI';
import {useAuth} from '../../src/providers/Auth';
import {useSettings} from '../../src/providers/Theme';
import {adminAccess} from '../../src/lib/rules';
function Dashboard(){const {roles}=useAuth();const {t}=useSettings();const options=[{area:'users',ar:'المستخدمون والصلاحيات',en:'Users and roles',icon:'account-group-outline'},{area:'products',ar:'إدارة المنتجات',en:'Manage products',icon:'package-variant'},{area:'categories',ar:'التصنيفات والمشرفون',en:'Categories and managers',icon:'file-tree-outline'},{area:'notifications',ar:'إرسال الإشعارات',en:'Send notifications',icon:'bell-plus-outline'}] as const;const allowed=options.filter(o=>adminAccess(roles.data??[],o.area));return <Page title={t('الإدارة','Administration')} back>{allowed.length?allowed.map(o=><Button key={o.area} mode="outlined" icon={o.icon} contentStyle={{minHeight:56}} onPress={()=>router.push(`/admin/${o.area}`)}>{t(o.ar,o.en)}</Button>):<Empty title={t('غير مسموح','Not allowed')}/>}</Page>;}
export default function Admin(){return <Guard><Dashboard/></Guard>;}