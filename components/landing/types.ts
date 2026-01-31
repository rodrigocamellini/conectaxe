import React from 'react';

export interface Feature {
  title: string;
  description: string;
  icon: React.ReactNode;
}

export interface Testimonial {
  name: string;
  role: string;
  content: string;
  image: string;
}

export interface PricingPlan {
  name: string;
  price: string;
  features: string[];
  recommended?: boolean;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  visible: boolean;
}

export interface SocialConfig {
  facebook: string;
  instagram: string;
  youtube: string;
}
