import { api } from '../lib/api';

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  title: string;
  comment: string;
  createdAt: string;
}

export interface CreateReviewPayload {
  productId: string;
  rating: number;
  title: string;
  comment: string;
}

export interface ProductReviewSummary {
  averageRating: number;
  totalReviews: number;
  reviews: Review[];
}

export const reviewService = {
  getProductReviews: async (productId: string): Promise<ProductReviewSummary> => {
    return api.get<ProductReviewSummary>(`/products/${productId}/reviews`);
  },

  createReview: async (payload: CreateReviewPayload): Promise<Review> => {
    return api.post<Review>(`/products/${payload.productId}/reviews`, payload);
  },

  deleteReview: async (productId: string, reviewId: string): Promise<void> => {
    return api.delete<void>(`/products/${productId}/reviews/${reviewId}`);
  },
};
