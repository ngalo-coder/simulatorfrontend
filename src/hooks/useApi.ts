import { useQuery } from 'react-query';
import { api } from '../services/api';

export const useSystemStats = () => {
  return useQuery('systemStats', api.fetchSystemStats);
};

export const useUsers = () => {
  return useQuery('users', api.fetchUsers);
};

export const useAdminCases = () => {
  return useQuery('adminCases', api.fetchAdminCases);
};

export const useUsersWithScores = () => {
  return useQuery('usersWithScores', api.fetchUsersWithScores);
};

export const useProgramAreas = () => {
  return useQuery('programAreas', api.fetchProgramAreas);
};

export const useSpecialties = () => {
  return useQuery('specialties', api.fetchSpecialties);
};

export const useClinicianProgress = (userId: string) => {
  return useQuery(['clinicianProgress', userId], () => api.fetchClinicianProgress(userId), {
    enabled: !!userId,
  });
};

export const useProgressRecommendations = (userId: string) => {
  return useQuery(['progressRecommendations', userId], () => api.fetchProgressRecommendations(userId), {
    enabled: !!userId,
  });
};

export const useCases = (programArea: string, specialty: string) => {
  return useQuery(['cases', programArea, specialty], () => api.getCases({ program_area: programArea, specialty }), {
    enabled: !!programArea && !!specialty,
  });
};

export const useCaseCategories = (programArea?: string) => {
  return useQuery(['caseCategories', programArea], () => api.getCaseCategories({ program_area: programArea }), {
    enabled: !!programArea,
  });
};

export const usePerformanceMetrics = (sessionId: string) => {
  return useQuery(['performanceMetrics', sessionId], () => api.getPerformanceMetrics(sessionId), {
    enabled: !!sessionId,
  });
};
