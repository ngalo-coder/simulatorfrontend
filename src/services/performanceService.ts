/**
 * Progress, Performance & Achievement services (stub)
 * All /api/progress endpoints have been removed from the backend.
 */
import { httpClient } from './httpClient';
import type { PerformanceMetrics } from '../types';

export const performanceService = {
  // All /api/progress endpoints have been removed from the backend
  getPerformanceData: (_userId?: string) =>
    Promise.reject(new Error('Progress API has been removed')),
  evaluate: (_sessionId: string) =>
    Promise.reject(new Error('Progress API has been removed')),
  getLeaderboard: (_params?: { specialty?: string; limit?: number }) =>
    Promise.reject(new Error('Leaderboard API has been removed')),
};

export default performanceService;

