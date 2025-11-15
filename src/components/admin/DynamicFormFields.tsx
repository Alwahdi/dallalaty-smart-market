import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { CustomField } from './CustomFieldsEditor';

interface DynamicFormFieldsProps {
  fields: CustomField[];
  values: Record<string, any>;
  onChange: (name: string, value: any) => void;
}

export default function DynamicFormFields({ fields, values, onChange }: DynamicFormFieldsProps) {
  return (
    <div className="space-y-4">
      {fields.map((field) => (
        <div key={field.name} className="space-y-2">
          <Label htmlFor={field.name} className="text-sm font-medium">
            {field.label_ar}
            {field.required && <span className="text-destructive mr-1">*</span>}
          </Label>

          {field.type === 'text' && (
            <Input
              id={field.name}
              type="text"
              value={values[field.name] || ''}
              onChange={(e) => onChange(field.name, e.target.value)}
              required={field.required}
              placeholder={field.label_ar}
              className="h-11"
            />
          )}

          {field.type === 'number' && (
            <Input
              id={field.name}
              type="number"
              value={values[field.name] || ''}
              onChange={(e) => onChange(field.name, e.target.value)}
              required={field.required}
              placeholder={field.label_ar}
              className="h-11"
            />
          )}

          {field.type === 'textarea' && (
            <Textarea
              id={field.name}
              value={values[field.name] || ''}
              onChange={(e) => onChange(field.name, e.target.value)}
              required={field.required}
              placeholder={field.label_ar}
              rows={4}
            />
          )}

          {field.type === 'select' && field.options && (
            <Select
              value={values[field.name] || ''}
              onValueChange={(value) => onChange(field.name, value)}
            >
              <SelectTrigger id={field.name} className="h-11">
                <SelectValue placeholder={`اختر ${field.label_ar}`} />
              </SelectTrigger>
              <SelectContent>
                {field.options.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {field.type === 'checkbox' && (
            <div className="flex items-center space-x-2 rtl:space-x-reverse pt-2">
              <Checkbox
                id={field.name}
                checked={values[field.name] || false}
                onCheckedChange={(checked) => onChange(field.name, checked)}
              />
              <Label htmlFor={field.name} className="cursor-pointer font-normal">
                {field.label_ar}
              </Label>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}