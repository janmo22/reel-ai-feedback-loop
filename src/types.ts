
export interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
  subscription_tier: 'free' | 'premium';
  created_at: string;
  updated_at: string;
}

export interface Video {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  video_url: string;
  thumbnail_url: string | null;
  status: 'processing' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
  feedback?: Feedback[];
}

export interface Feedback {
  id: string;
  video_id: string;
  overall_score: number;
  feedback_data: any;
  created_at: string;
}
