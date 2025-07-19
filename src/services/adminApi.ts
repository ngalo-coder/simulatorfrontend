import { api } from './api';

/**
 * API functions for program area and specialty management
 */
export const adminApi = {
  /**
   * Add a new program area
   * @param name Name of the program area to add
   * @returns Promise with creation result
   */
  async addProgramArea(name: string): Promise<any> {
    console.log('Adding program area:', name);
    return api.post('/api/admin/program-areas', { name });
  },

  /**
   * Update an existing program area
   * @param id ID of the program area to update
   * @param name New name for the program area
   * @returns Promise with update result
   */
  async updateProgramArea(id: string, name: string): Promise<any> {
    console.log('Updating program area:', id, name);
    return api.put(`/api/admin/program-areas/${id}`, { name });
  },

  /**
   * Delete a program area
   * @param id ID of the program area to delete
   * @returns Promise with deletion result
   */
  async deleteProgramArea(id: string): Promise<any> {
    console.log('Deleting program area:', id);
    return api.delete(`/api/admin/program-areas/${id}`);
  },

  /**
   * Add a new specialty
   * @param name Name of the specialty to add
   * @param programArea Program area the specialty belongs to
   * @returns Promise with creation result
   */
  async addSpecialty(name: string, programArea: string): Promise<any> {
    console.log('Adding specialty:', name, 'to program area:', programArea);
    return api.post('/api/admin/specialties', { name, programArea });
  },

  /**
   * Update an existing specialty
   * @param id ID of the specialty to update
   * @param name New name for the specialty
   * @param programArea New program area for the specialty
   * @returns Promise with update result
   */
  async updateSpecialty(id: string, name: string, programArea: string): Promise<any> {
    console.log('Updating specialty:', id, name, programArea);
    return api.put(`/api/admin/specialties/${id}`, { name, programArea });
  },

  /**
   * Delete a specialty
   * @param id ID of the specialty to delete
   * @returns Promise with deletion result
   */
  async deleteSpecialty(id: string): Promise<any> {
    console.log('Deleting specialty:', id);
    return api.delete(`/api/admin/specialties/${id}`);
  },

  /**
   * Get program areas with case counts
   * @returns Promise with program areas and their case counts
   */
  async getProgramAreasWithCounts(): Promise<any> {
    console.log('Fetching program areas with case counts');
    return api.get('/api/admin/program-areas/counts');
  },

  /**
   * Get specialties with case counts
   * @returns Promise with specialties and their case counts
   */
  async getSpecialtiesWithCounts(): Promise<any> {
    console.log('Fetching specialties with case counts');
    return api.get('/api/admin/specialties/counts');
  }
};