import { apiCall, buildCoreUrl } from '../config/api';
import { User } from './authService';

export interface ReviewRequest {
  id: string;
  experiment_id: string;
  entry_id?: string;
  requested_by: User;
  assigned_to: User[];
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  deadline?: string;
  review_type: 'methodology' | 'data_analysis' | 'interpretation' | 'protocol' | 'general';
  attachments?: string[];
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  request_id: string;
  reviewer: User;
  status: 'pending' | 'approved' | 'rejected' | 'needs_revision';
  score?: number; // 1-5 rating
  comments: ReviewComment[];
  summary: string;
  recommendations: string[];
  created_at: string;
  updated_at: string;
}

export interface ReviewComment {
  id: string;
  review_id: string;
  author: User;
  content: string;
  type: 'general' | 'methodology' | 'data' | 'interpretation' | 'suggestion';
  line_reference?: number;
  resolved: boolean;
  created_at: string;
  updated_at: string;
  replies?: ReviewComment[];
}

export interface ReviewTemplate {
  id: string;
  name: string;
  description: string;
  review_type: string;
  criteria: ReviewCriterion[];
  created_by: User;
  is_public: boolean;
}

export interface ReviewCriterion {
  id: string;
  name: string;
  description: string;
  weight: number;
  type: 'rating' | 'boolean' | 'text';
  required: boolean;
}

export interface ReviewStats {
  total_requests: number;
  pending_reviews: number;
  completed_reviews: number;
  average_review_time: number;
  average_score: number;
  reviews_by_type: Record<string, number>;
}

export interface ReviewCreateRequest {
  experiment_id: string;
  entry_id?: string;
  assigned_to: string[];
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  review_type: 'methodology' | 'data_analysis' | 'interpretation' | 'protocol' | 'general';
  deadline?: string;
  template_id?: string;
}

export interface ReviewSubmissionRequest {
  request_id: string;
  status: 'approved' | 'rejected' | 'needs_revision';
  score?: number;
  summary: string;
  recommendations: string[];
  comments: Array<{
    content: string;
    type: 'general' | 'methodology' | 'data' | 'interpretation' | 'suggestion';
    line_reference?: number;
  }>;
}

class ReviewService {
  /**
   * Create a new review request
   */
  async createReviewRequest(request: ReviewCreateRequest): Promise<ReviewRequest> {
    const url = buildCoreUrl('/reviews/requests');
    return apiCall<ReviewRequest>(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
  }

  /**
   * Get review requests (with filtering)
   */
  async getReviewRequests(params?: {
    status?: string;
    assigned_to_me?: boolean;
    requested_by_me?: boolean;
    review_type?: string;
    priority?: string;
    page?: number;
    size?: number;
  }): Promise<{ requests: ReviewRequest[]; total: number; total_pages: number }> {
    const url = buildCoreUrl('/reviews/requests');
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    return apiCall<{ requests: ReviewRequest[]; total: number; total_pages: number }>(
      `${url}?${searchParams}`, 
      { method: 'GET' }
    );
  }

  /**
   * Get a specific review request
   */
  async getReviewRequest(requestId: string): Promise<ReviewRequest & { reviews: Review[] }> {
    const url = buildCoreUrl(`/reviews/requests/${requestId}`);
    return apiCall<ReviewRequest & { reviews: Review[] }>(url, { method: 'GET' });
  }

  /**
   * Update a review request
   */
  async updateReviewRequest(requestId: string, updates: Partial<ReviewCreateRequest>): Promise<ReviewRequest> {
    const url = buildCoreUrl(`/reviews/requests/${requestId}`);
    return apiCall<ReviewRequest>(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
  }

  /**
   * Delete a review request
   */
  async deleteReviewRequest(requestId: string): Promise<void> {
    const url = buildCoreUrl(`/reviews/requests/${requestId}`);
    await apiCall<void>(url, { method: 'DELETE' });
  }

  /**
   * Submit a review
   */
  async submitReview(submission: ReviewSubmissionRequest): Promise<Review> {
    const url = buildCoreUrl('/reviews/submit');
    return apiCall<Review>(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(submission),
    });
  }

  /**
   * Get reviews for a request
   */
  async getReviews(requestId: string): Promise<Review[]> {
    const url = buildCoreUrl(`/reviews/requests/${requestId}/reviews`);
    return apiCall<Review[]>(url, { method: 'GET' });
  }

  /**
   * Update a review
   */
  async updateReview(reviewId: string, updates: Partial<ReviewSubmissionRequest>): Promise<Review> {
    const url = buildCoreUrl(`/reviews/${reviewId}`);
    return apiCall<Review>(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
  }

  /**
   * Add a comment to a review
   */
  async addComment(reviewId: string, comment: {
    content: string;
    type: 'general' | 'methodology' | 'data' | 'interpretation' | 'suggestion';
    line_reference?: number;
    parent_id?: string;
  }): Promise<ReviewComment> {
    const url = buildCoreUrl(`/reviews/${reviewId}/comments`);
    return apiCall<ReviewComment>(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(comment),
    });
  }

  /**
   * Update a comment
   */
  async updateComment(commentId: string, updates: { content?: string; resolved?: boolean }): Promise<ReviewComment> {
    const url = buildCoreUrl(`/reviews/comments/${commentId}`);
    return apiCall<ReviewComment>(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
  }

  /**
   * Delete a comment
   */
  async deleteComment(commentId: string): Promise<void> {
    const url = buildCoreUrl(`/reviews/comments/${commentId}`);
    await apiCall<void>(url, { method: 'DELETE' });
  }

  /**
   * Get review templates
   */
  async getReviewTemplates(params?: { review_type?: string; is_public?: boolean }): Promise<ReviewTemplate[]> {
    const url = buildCoreUrl('/reviews/templates');
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    return apiCall<ReviewTemplate[]>(`${url}?${searchParams}`, { method: 'GET' });
  }

  /**
   * Create a review template
   */
  async createReviewTemplate(template: Omit<ReviewTemplate, 'id' | 'created_by'>): Promise<ReviewTemplate> {
    const url = buildCoreUrl('/reviews/templates');
    return apiCall<ReviewTemplate>(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(template),
    });
  }

  /**
   * Get review statistics
   */
  async getReviewStats(params?: { 
    start_date?: string; 
    end_date?: string; 
    reviewer_id?: string;
  }): Promise<ReviewStats> {
    const url = buildCoreUrl('/reviews/stats');
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    return apiCall<ReviewStats>(`${url}?${searchParams}`, { method: 'GET' });
  }

  /**
   * Get available reviewers for a project/experiment
   */
  async getAvailableReviewers(params: { 
    project_id?: string; 
    experiment_id?: string;
    expertise_area?: string;
  }): Promise<User[]> {
    const url = buildCoreUrl('/reviews/available-reviewers');
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });

    return apiCall<User[]>(`${url}?${searchParams}`, { method: 'GET' });
  }

  /**
   * Send review reminders
   */
  async sendReviewReminder(requestId: string): Promise<void> {
    const url = buildCoreUrl(`/reviews/requests/${requestId}/remind`);
    await apiCall<void>(url, { method: 'POST' });
  }

  /**
   * Generate review report
   */
  async generateReviewReport(requestId: string, format: 'pdf' | 'docx' = 'pdf'): Promise<Blob> {
    const url = buildCoreUrl(`/reviews/requests/${requestId}/report?format=${format}`);
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to generate report');
    }

    return response.blob();
  }
}

export const reviewService = new ReviewService();