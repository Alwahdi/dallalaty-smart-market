-- Add custom fields definition to categories table
ALTER TABLE public.categories 
ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.categories.custom_fields IS 'Array of custom field definitions for this category. Each field has: name, label_ar, label_en, type (text, number, select, textarea, checkbox), required, options (for select)';

-- Add custom data column to properties table for storing dynamic field values
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS custom_data JSONB DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.properties.custom_data IS 'Dynamic field values based on category custom_fields definition';

-- Update existing real-estate categories with default fields
UPDATE public.categories 
SET custom_fields = '[
  {"name": "bedrooms", "label_ar": "عدد الغرف", "label_en": "Bedrooms", "type": "number", "required": false, "icon": "bed"},
  {"name": "bathrooms", "label_ar": "عدد الحمامات", "label_en": "Bathrooms", "type": "number", "required": false, "icon": "bath"},
  {"name": "area_sqm", "label_ar": "المساحة (م²)", "label_en": "Area (sqm)", "type": "number", "required": false, "icon": "ruler"},
  {"name": "property_type", "label_ar": "نوع العقار", "label_en": "Property Type", "type": "select", "options": ["شقة", "فيلا", "أرض", "مكتب", "محل"], "required": true, "icon": "building"}
]'::jsonb
WHERE slug LIKE '%estate%' OR title LIKE '%عقار%';