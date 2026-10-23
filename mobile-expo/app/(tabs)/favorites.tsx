import React from 'react';
import {Page,Loading,Empty,ErrorState} from '../../src/components/UI';
import {ProductCard} from '../../src/components/ProductCard';
import {useFavorites,useProducts} from '../../src/lib/data';
import {useSettings} from '../../src/providers/Theme';
export default function Favorites(){const {t}=useSettings();const favorites=useFavorites(),products=useProducts();const list=products.data?.filter(p=>favorites.ids.includes(p.id))??[];return <Page title={t('المفضلة','Favorites')} refreshing={favorites.isRefetching||products.isRefetching} onRefresh={()=>{void favorites.refetch();void products.refetch();}}>{favorites.isPending||products.isPending?<Loading/>:favorites.isError||products.isError?<ErrorState retry={()=>{void favorites.refetch();void products.refetch();}}/>:list.length?list.map(p=><ProductCard key={p.id} product={p}/>):<Empty title={t('مفضلتك فارغة','No favorites yet')} icon="heart-outline"/>}</Page>;}