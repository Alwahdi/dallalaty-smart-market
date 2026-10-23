import React from 'react';
import {Guard} from './Guard';
import {Page,Empty,Loading} from './UI';
import {useAuth} from '../providers/Auth';
import {useSettings} from '../providers/Theme';
import {adminAccess} from '../lib/rules';
export function AdminGuard({area,children}:{area:'users'|'products'|'categories'|'notifications';children:React.ReactNode}){const {roles}=useAuth();const {t}=useSettings();return <Guard>{roles.isPending?<Loading/>:adminAccess(roles.data??[],area)?children:<Page back><Empty title={t('غير مسموح','Not allowed')}/></Page>}</Guard>;}