-- Enhance consultation_requests table with e-commerce best practices
-- Add new columns for better data collection and workflow management

-- Add project and room information
ALTER TABLE consultation_requests 
ADD COLUMN IF NOT EXISTS project_type TEXT,
ADD COLUMN IF NOT EXISTS room_types TEXT[], -- Array of room types
ADD COLUMN IF NOT EXISTS property_type TEXT,
ADD COLUMN IF NOT EXISTS budget_range TEXT,
ADD COLUMN IF NOT EXISTS timeline TEXT,
ADD COLUMN IF NOT EXISTS style_preferences TEXT[], -- Array of style preferences
ADD COLUMN IF NOT EXISTS current_challenges TEXT,
ADD COLUMN IF NOT EXISTS inspiration_images TEXT[], -- Array of image URLs

-- Add workflow management columns
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
ADD COLUMN IF NOT EXISTS assigned_to TEXT, -- Designer/consultant name or ID
ADD COLUMN IF NOT EXISTS follow_up_date DATE,
ADD COLUMN IF NOT EXISTS consultation_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS estimated_value DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS converted_to_sale BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS sale_amount DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'website'; -- website, referral, social, etc.

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_consultation_priority ON consultation_requests(priority);
CREATE INDEX IF NOT EXISTS idx_consultation_assigned ON consultation_requests(assigned_to);
CREATE INDEX IF NOT EXISTS idx_consultation_follow_up ON consultation_requests(follow_up_date);
CREATE INDEX IF NOT EXISTS idx_consultation_date ON consultation_requests(consultation_date);
CREATE INDEX IF NOT EXISTS idx_consultation_converted ON consultation_requests(converted_to_sale);

-- Add comments for documentation
COMMENT ON COLUMN consultation_requests.project_type IS 'Type of project: new_home, renovation, single_room, multiple_rooms';
COMMENT ON COLUMN consultation_requests.room_types IS 'Array of room types: living_room, bedroom, kitchen, etc.';
COMMENT ON COLUMN consultation_requests.budget_range IS 'Budget range: under_5k, 5k_10k, 10k_25k, 25k_50k, over_50k';
COMMENT ON COLUMN consultation_requests.timeline IS 'Project timeline: asap, 1_3_months, 3_6_months, 6plus_months, exploring';
COMMENT ON COLUMN consultation_requests.priority IS 'Request priority for admin workflow';
COMMENT ON COLUMN consultation_requests.assigned_to IS 'Designer or consultant assigned to this request';
COMMENT ON COLUMN consultation_requests.estimated_value IS 'Estimated project value in currency';
COMMENT ON COLUMN consultation_requests.converted_to_sale IS 'Whether consultation resulted in a sale';
