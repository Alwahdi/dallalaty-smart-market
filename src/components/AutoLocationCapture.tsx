import { useAutoLocation } from '@/hooks/useAutoLocation';

/** Renders nothing — only triggers the geolocation hook once after sign-in. */
export default function AutoLocationCapture() {
  useAutoLocation();
  return null;
}
