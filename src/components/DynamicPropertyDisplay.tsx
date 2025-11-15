import { CustomField } from '@/components/admin/CustomFieldsEditor';
import { Badge } from '@/components/ui/badge';
import { Bed, Bath, Ruler, Check, X } from 'lucide-react';

interface DynamicPropertyDisplayProps {
  fields: CustomField[];
  data: Record<string, any>;
  variant?: 'card' | 'detail';
}

export default function DynamicPropertyDisplay({ fields, data, variant = 'card' }: DynamicPropertyDisplayProps) {
  const getIcon = (iconName?: string) => {
    switch (iconName) {
      case 'bed': return <Bed className="w-4 h-4" />;
      case 'bath': return <Bath className="w-4 h-4" />;
      case 'ruler': return <Ruler className="w-4 h-4" />;
      default: return null;
    }
  };

  const visibleFields = variant === 'card' ? fields.slice(0, 3) : fields;

  return (
    <div className={variant === 'card' ? 'flex gap-3 flex-wrap' : 'grid grid-cols-2 gap-4'}>
      {visibleFields.map((field) => {
        const value = data[field.name];
        if (!value && value !== 0 && value !== false) return null;

        if (field.type === 'checkbox') {
          return (
            <div key={field.name} className="flex items-center gap-2">
              {value ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <X className="w-4 h-4 text-muted-foreground" />
              )}
              <span className="text-sm text-muted-foreground">{field.label_ar}</span>
            </div>
          );
        }

        if (variant === 'card') {
          return (
            <div key={field.name} className="flex items-center gap-2 text-sm">
              {getIcon(field.icon)}
              <span className="font-medium">{value}</span>
              <span className="text-muted-foreground text-xs">{field.label_ar}</span>
            </div>
          );
        }

        return (
          <div key={field.name} className="space-y-1">
            <p className="text-sm text-muted-foreground">{field.label_ar}</p>
            {field.type === 'select' ? (
              <Badge variant="secondary">{value}</Badge>
            ) : (
              <p className="font-semibold">{value}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}