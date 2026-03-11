export interface User {
  id: string
  email: string
  name: string | null
  plan_type: 'free' | 'pro' | 'business'
  created_at: string
  total_links: number
  total_clicks: number
}

export interface Link {
  id: string
  user_id: string
  short_code: string
  original_url: string
  title: string | null
  clicks_count: number
  created_at: string
  updated_at: string
  is_active: boolean
  expires_at: string | null
  max_clicks: number | null
  password_hash: string | null
}

export interface ClickAnalytics {
  id: string
  link_id: string
  country: string | null
  city: string | null
  device_type: string | null
  browser: string | null
  os: string | null
  referer: string | null
  clicked_at: string
  visitor_id: string | null
}
