import React from 'react';
import {useLocalSearchParams} from 'expo-router';
import {Guard} from '../../src/components/Guard';
import {ProductEditor} from '../../src/components/ProductEditor';
import {Page,Empty,Loading,ErrorState} from '../../src/components/UI';
import {useStores,useProduct} from '../../src/lib/data';
import {useAuth} from '../../src/providers/Auth';
import {adminAccess} from '../../src/lib/rules';
import {useSettings} from '../../src/providers/Theme';
function Edit(){const {merchantId,id,admin}=useLocalSearchParams<{merchantId:string;id?:string;admin?:string}>();const stores=useStores();const {roles}=useAuth();const product=useProduct(id??'');const {t}=useSettings();const store=stores.data?.find(s=>s.id===merchantId);const isAdmin=admin==='true'&&adminAccess(roles.data??[],'products');const can=isAdmin||(id?store?.permissions.can_edit_products:store?.permissions.can_add_products);if(stores.isPending||(id&&product.isPending))return <Page back><Loading/></Page>;if(stores.isError||(id&&product.isError))return <Page back><ErrorState retry={()=>{void stores.refetch();if(id)void product.refetch();}}/></Page>;if(!can||(id&&(!product.data||(!isAdmin&&product.data.agent_id!==merchantId))))return <Page back><Empty title={t('غير مسموح أو المنتج غير موجود','Not allowed or product not found')}/></Page>;return <Page title={id?t('تعديل المنتج','Edit product'):t('إضافة منتج','Add product')} back><ProductEditor key={`${merchantId}-${id??'new'}`} agentId={merchantId} product={product.data??undefined}/></Page>;}
export default function Editor(){return <Guard><Edit/></Guard>;}