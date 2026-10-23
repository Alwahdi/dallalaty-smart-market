import React from 'react';
import {View} from 'react-native';
import {Image} from 'expo-image';
import {Card,Text,IconButton,useTheme} from 'react-native-paper';
import {router} from 'expo-router';
import type {Product} from '../lib/client';
import {formatPrice} from '../lib/currency';
import {isRentListing} from '../lib/format';
import {useFavorites} from '../lib/data';
import {useSettings} from '../providers/Theme';
import {useAction,Empty} from './UI';
export function ProductCard({product}:{product:Product}){const theme=useTheme();const {t}=useSettings();const favorites=useFavorites();const action=useAction();return <View><Card mode="outlined" style={{borderRadius:8,overflow:'hidden'}} onPress={()=>router.push(`/product/${product.id}`)} accessibilityLabel={product.title}>{product.images?.[0]?<Image source={product.images[0]} style={{width:'100%',aspectRatio:1.5,backgroundColor:theme.colors.surfaceVariant}} contentFit="cover" transition={150}/>:<Empty title={t('لا توجد صورة','No image')}/>}<Card.Content style={{gap:8,paddingTop:16}}><Text variant="titleMedium" numberOfLines={2}>{product.title}</Text><Text variant="titleLarge" style={{color:theme.colors.primary}}>{formatPrice(product.price,product.currency)}</Text><View style={{flexDirection:'row',alignItems:'center',gap:8}}><Text style={{flex:1,color:theme.colors.onSurfaceVariant}}>{[product.city,isRentListing(product.listing_type)?t('للإيجار','For rent'):t('للبيع','For sale')].filter(Boolean).join(' · ')}</Text><IconButton icon={favorites.ids.includes(product.id)?'heart':'heart-outline'} iconColor={favorites.ids.includes(product.id)?theme.colors.error:theme.colors.onSurfaceVariant} disabled={favorites.busy} accessibilityLabel={favorites.ids.includes(product.id)?t('إزالة من المفضلة','Remove favorite'):t('إضافة للمفضلة','Add favorite')} onPress={()=>void action.run(async()=>{await favorites.toggle(product.id);})}/></View></Card.Content></Card>{action.feedback}</View>;}