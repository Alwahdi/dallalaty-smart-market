import React from 'react';
import Svg,{Path} from 'react-native-svg';
import {useTheme} from 'react-native-paper';
export function Brand(){const theme=useTheme();return <Svg width={48} height={48} viewBox="0 0 24 24" fill="none" stroke={theme.colors.primary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" accessibilityLabel="متجر إب" accessibilityRole="image"><Path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><Path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2M18 8h2a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-2M10 6h4M10 10h4M10 14h4M10 18h4"/></Svg>;}