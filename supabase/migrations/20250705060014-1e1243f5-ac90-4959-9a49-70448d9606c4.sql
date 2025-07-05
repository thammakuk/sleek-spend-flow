-- Add new utility categories to the default category list
-- Update the handle_new_user function to include new utility categories

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  
  -- Insert default categories for new user including utility categories
  INSERT INTO public.categories (user_id, name, icon, color, is_custom) VALUES
    (NEW.id, 'Food', '🍕', '#F97316', FALSE),
    (NEW.id, 'Rent', '🏠', '#3B82F6', FALSE),
    (NEW.id, 'Transport', '🚗', '#10B981', FALSE),
    (NEW.id, 'Shopping', '🛒', '#8B5CF6', FALSE),
    (NEW.id, 'Bills', '⚡', '#EF4444', FALSE),
    (NEW.id, 'Medical', '🏥', '#14B8A6', FALSE),
    (NEW.id, 'Education', '📚', '#6366F1', FALSE),
    (NEW.id, 'Gas', '⛽', '#F59E0B', FALSE),
    (NEW.id, 'Fuel', '🚗⛽', '#DC2626', FALSE),
    (NEW.id, 'Fastag', '🛣️', '#7C3AED', FALSE),
    (NEW.id, 'Credit Card Payment', '💳', '#059669', FALSE),
    (NEW.id, 'Loan Payment', '🏦', '#2563EB', FALSE),
    (NEW.id, 'Electricity Bill', '💡', '#FBBF24', FALSE),
    (NEW.id, 'Internet Bill', '📶', '#06B6D4', FALSE),
    (NEW.id, 'Phone Bill', '📱', '#8B5CF6', FALSE),
    (NEW.id, 'Water Bill', '💧', '#0EA5E9', FALSE),
    (NEW.id, 'Insurance', '🛡️', '#64748B', FALSE),
    (NEW.id, 'Misc', '📦', '#6B7280', FALSE);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;