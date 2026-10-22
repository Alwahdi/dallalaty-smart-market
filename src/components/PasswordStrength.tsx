export function passwordScore(p: string): number {
  let s = 0;
  if (p.length >= 8) s++;
  if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s++;
  if (/\d/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p) || p.length >= 12) s++;
  return s;
}

const labels = ['ضعيفة جداً', 'ضعيفة', 'متوسطة', 'جيدة', 'قوية'];

export default function PasswordStrength({ password }: { password: string }) {
  if (!password) return <p className="text-xs text-muted-foreground">8 أحرف على الأقل</p>;
  const s = passwordScore(password);
  return (
    <div className="space-y-1">
      <div className="flex gap-1" dir="ltr">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={`h-1.5 flex-1 rounded-full ${i < s ? (s >= 3 ? 'bg-primary' : 'bg-destructive') : 'bg-muted'}`} />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">القوة: {labels[s]}{password.length < 8 && ' — 8 أحرف على الأقل'}</p>
    </div>
  );
}
