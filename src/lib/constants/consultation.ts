/**
 * Constants for Style Expert Consultation System
 */

import { Home, Palette, Users, Sparkles } from "lucide-react";

export const serviceTypes = [
  {
    id: "interior-design",
    name: "Interior Design Consultation",
    description: "Complete room makeover with our expert designers",
    icon: Home,
    duration: "2-3 hours",
    price: "Free"
  },
  {
    id: "color-consultation",
    name: "Color & Style Consultation",
    description: "Perfect color schemes and style recommendations",
    icon: Palette,
    duration: "1-2 hours",
    price: "Free"
  },
  {
    id: "space-planning",
    name: "Space Planning",
    description: "Optimize your space layout and functionality",
    icon: Users,
    duration: "1-2 hours",
    price: "Free"
  },
  {
    id: "custom-design",
    name: "Custom Design Solutions",
    description: "Bespoke design solutions for unique requirements",
    icon: Sparkles,
    duration: "3-4 hours",
    price: "Free"
  }
];

export const PROJECT_TYPES = [
  { id: "new_home", label: "New Home", description: "Furnishing a new property" },
  { id: "renovation", label: "Renovation", description: "Updating existing space" },
  { id: "single_room", label: "Single Room", description: "One room makeover" },
  { id: "multiple_rooms", label: "Multiple Rooms", description: "Several rooms" },
] as const;

export const ROOM_TYPES = [
  { id: "living_room", label: "Living Room", icon: "🛋️" },
  { id: "bedroom", label: "Bedroom", icon: "🛏️" },
  { id: "dining_room", label: "Dining Room", icon: "🍽️" },
  { id: "kitchen", label: "Kitchen", icon: "🍳" },
  { id: "bathroom", label: "Bathroom", icon: "🚿" },
  { id: "home_office", label: "Home Office", icon: "💼" },
  { id: "kids_room", label: "Kids Room", icon: "🧸" },
  { id: "outdoor", label: "Outdoor/Patio", icon: "🌿" },
  { id: "other", label: "Other", icon: "🏠" },
] as const;

export const PROPERTY_TYPES = [
  { id: "house", label: "House" },
  { id: "apartment", label: "Apartment" },
  { id: "condo", label: "Condo" },
  { id: "office", label: "Office" },
  { id: "commercial", label: "Commercial Space" },
  { id: "other", label: "Other" },
] as const;

export const BUDGET_RANGES = [
  { id: "under_5k", label: "Under ₹5,000", value: "< 5K" },
  { id: "5k_10k", label: "₹5,000 - ₹10,000", value: "5K-10K" },
  { id: "10k_25k", label: "₹10,000 - ₹25,000", value: "10K-25K" },
  { id: "25k_50k", label: "₹25,000 - ₹50,000", value: "25K-50K" },
  { id: "50k_100k", label: "₹50,000 - ₹1,00,000", value: "50K-100K" },
  { id: "over_100k", label: "Over ₹1,00,000", value: "> 100K" },
  { id: "flexible", label: "Flexible/Not Sure", value: "Flexible" },
] as const;

export const TIMELINES = [
  { id: "asap", label: "ASAP (Within 2 weeks)", urgency: "high" },
  { id: "1_3_months", label: "1-3 Months", urgency: "medium" },
  { id: "3_6_months", label: "3-6 Months", urgency: "medium" },
  { id: "6plus_months", label: "6+ Months", urgency: "low" },
  { id: "exploring", label: "Just Exploring", urgency: "low" },
] as const;

export const STYLE_PREFERENCES = [
  { id: "modern", label: "Modern", description: "Clean lines, minimal decor" },
  { id: "contemporary", label: "Contemporary", description: "Current trends" },
  { id: "traditional", label: "Traditional", description: "Classic elegance" },
  { id: "minimalist", label: "Minimalist", description: "Less is more" },
  { id: "industrial", label: "Industrial", description: "Raw, urban feel" },
  { id: "scandinavian", label: "Scandinavian", description: "Light, functional" },
  { id: "bohemian", label: "Bohemian", description: "Eclectic, colorful" },
  { id: "rustic", label: "Rustic", description: "Natural, cozy" },
  { id: "luxury", label: "Luxury", description: "High-end, opulent" },
  { id: "eclectic", label: "Eclectic", description: "Mix of styles" },
] as const;

export const PRIORITY_LEVELS = [
  { id: "low", label: "Low", color: "gray" },
  { id: "medium", label: "Medium", color: "blue" },
  { id: "high", label: "High", color: "orange" },
  { id: "urgent", label: "Urgent", color: "red" },
] as const;

export const CONSULTATION_STATUS = [
  { id: "pending", label: "Pending", color: "yellow" },
  { id: "confirmed", label: "Confirmed", color: "blue" },
  { id: "completed", label: "Completed", color: "green" },
  { id: "cancelled", label: "Cancelled", color: "red" },
] as const;
