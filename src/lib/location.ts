export interface GpsResult { latitude: number; longitude: number; city: string }

export function captureGpsLocation(): Promise<GpsResult> {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new Error('جهازك لا يدعم تحديد الموقع'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        let city = 'غير معروف';
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&accept-language=ar`,
          );
          const a = (await res.json())?.address ?? {};
          city = a.city || a.town || a.village || a.county || a.state || city;
        } catch { /* keep default */ }
        resolve({ latitude, longitude, city });
      },
      (err) => reject(new Error(
        err.code === err.PERMISSION_DENIED
          ? 'تم رفض إذن الموقع. فعّل الموقع من إعدادات المتصفح ثم أعد المحاولة.'
          : 'تعذر تحديد الموقع. تأكد من تشغيل GPS وحاول مرة أخرى.',
      )),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  });
}
