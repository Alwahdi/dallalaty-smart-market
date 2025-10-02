-- Create properties storage bucket for property images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('properties', 'properties', true);

-- Create storage policies for property images
CREATE POLICY "Property images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'properties');

CREATE POLICY "Authenticated users can upload property images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'properties' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own property images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'properties' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete their own property images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'properties' AND auth.uid() IS NOT NULL);