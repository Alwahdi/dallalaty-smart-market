import React from 'react';
import {useVideoPlayer,VideoView} from 'expo-video';
export function ProductVideo({uri}:{uri:string}){const player=useVideoPlayer(uri,p=>{p.muted=true;});return <VideoView player={player} style={{width:'100%',aspectRatio:16/9}} nativeControls contentFit="contain" allowsFullscreen/>;}