import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export interface CustomField {
  name: string;
  label_ar: string;
  label_en: string;
  type: 'text' | 'number' | 'select' | 'textarea' | 'checkbox';
  required: boolean;
  options?: string[];
  icon?: string;
}

interface CustomFieldsEditorProps {
  fields: CustomField[];
  onChange: (fields: CustomField[]) => void;
}

export default function CustomFieldsEditor({ fields, onChange }: CustomFieldsEditorProps) {
  const [editingField, setEditingField] = useState<Partial<CustomField>>({
    type: 'text',
    required: false,
    options: []
  });

  const addField = () => {
    if (!editingField.name || !editingField.label_ar) {
      return;
    }

    const newField: CustomField = {
      name: editingField.name,
      label_ar: editingField.label_ar,
      label_en: editingField.label_en || editingField.label_ar,
      type: editingField.type || 'text',
      required: editingField.required || false,
      options: editingField.type === 'select' ? editingField.options : undefined,
      icon: editingField.icon
    };

    onChange([...fields, newField]);
    
    // Reset form
    setEditingField({
      type: 'text',
      required: false,
      options: []
    });
  };

  const removeField = (index: number) => {
    onChange(fields.filter((_, i) => i !== index));
  };

  const moveField = (index: number, direction: 'up' | 'down') => {
    const newFields = [...fields];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex < 0 || newIndex >= fields.length) return;
    
    [newFields[index], newFields[newIndex]] = [newFields[newIndex], newFields[index]];
    onChange(newFields);
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...(editingField.options || [])];
    newOptions[index] = value;
    setEditingField({ ...editingField, options: newOptions });
  };

  const addOption = () => {
    setEditingField({ 
      ...editingField, 
      options: [...(editingField.options || []), ''] 
    });
  };

  const removeOption = (index: number) => {
    setEditingField({ 
      ...editingField, 
      options: (editingField.options || []).filter((_, i) => i !== index) 
    });
  };

  return (
    <div className="space-y-6">
      {/* Existing Fields */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-foreground">الحقول المخصصة الحالية</h4>
        {fields.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8 bg-muted/30 rounded-lg">
            لم يتم إضافة حقول مخصصة بعد
          </p>
        ) : (
          fields.map((field, index) => (
            <Card key={index} className="bg-muted/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => moveField(index, 'up')}
                      disabled={index === 0}
                    >
                      <GripVertical className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => moveField(index, 'down')}
                      disabled={index === fields.length - 1}
                    >
                      <GripVertical className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{field.label_ar}</span>
                      <Badge variant="outline" className="text-xs">
                        {field.type}
                      </Badge>
                      {field.required && (
                        <Badge variant="destructive" className="text-xs">
                          مطلوب
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      الاسم: {field.name}
                    </p>
                    {field.options && field.options.length > 0 && (
                      <p className="text-xs text-muted-foreground">
                        الخيارات: {field.options.join(', ')}
                      </p>
                    )}
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => removeField(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Add New Field */}
      <Card className="border-2 border-dashed">
        <CardHeader className="pb-4">
          <CardTitle className="text-base">إضافة حقل جديد</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="field-name">اسم الحقل (بالإنجليزية)</Label>
              <Input
                id="field-name"
                placeholder="bedrooms"
                value={editingField.name || ''}
                onChange={(e) => setEditingField({ ...editingField, name: e.target.value.toLowerCase().replace(/\s/g, '_') })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="field-label-ar">التسمية (بالعربية)</Label>
              <Input
                id="field-label-ar"
                placeholder="عدد الغرف"
                value={editingField.label_ar || ''}
                onChange={(e) => setEditingField({ ...editingField, label_ar: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="field-label-en">التسمية (بالإنجليزية)</Label>
              <Input
                id="field-label-en"
                placeholder="Number of Bedrooms"
                value={editingField.label_en || ''}
                onChange={(e) => setEditingField({ ...editingField, label_en: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="field-type">نوع الحقل</Label>
              <Select
                value={editingField.type}
                onValueChange={(value: CustomField['type']) => 
                  setEditingField({ ...editingField, type: value, options: value === 'select' ? [''] : undefined })
                }
              >
                <SelectTrigger id="field-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">نص</SelectItem>
                  <SelectItem value="number">رقم</SelectItem>
                  <SelectItem value="textarea">نص طويل</SelectItem>
                  <SelectItem value="select">قائمة اختيار</SelectItem>
                  <SelectItem value="checkbox">خانة اختيار</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {editingField.type === 'select' && (
            <div className="space-y-3">
              <Label>الخيارات المتاحة</Label>
              {(editingField.options || []).map((option, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder={`الخيار ${index + 1}`}
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeOption(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addOption}
                className="w-full"
              >
                <Plus className="h-4 w-4 ml-2" />
                إضافة خيار
              </Button>
            </div>
          )}

          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <Checkbox
              id="field-required"
              checked={editingField.required}
              onCheckedChange={(checked) => 
                setEditingField({ ...editingField, required: checked as boolean })
              }
            />
            <Label htmlFor="field-required" className="cursor-pointer">
              حقل مطلوب
            </Label>
          </div>

          <Button
            onClick={addField}
            className="w-full"
            disabled={!editingField.name || !editingField.label_ar}
          >
            <Plus className="h-4 w-4 ml-2" />
            إضافة الحقل
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
