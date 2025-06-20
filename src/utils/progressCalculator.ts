import { Vehicle } from '../types/vehicle';

export class ProgressCalculator {
  /**
   * Calculate the overall progress percentage based on individual inspection items
   * rather than just counting completed sections
   */
  static calculateDetailedProgress(vehicleId: string, vehicle: Vehicle): number {
    // Get inspection data from localStorage
    const savedInspections = localStorage.getItem('vehicleInspections');
    if (!savedInspections) return this.calculateSectionProgress(vehicle);
    
    try {
      const inspections = JSON.parse(savedInspections);
      const vehicleInspection = inspections[vehicleId];
      
      if (!vehicleInspection) return this.calculateSectionProgress(vehicle);
      
      // Count all inspection items
      let totalItems = 0;
      let completedItems = 0;
      
      // Process each section
      Object.keys(vehicleInspection).forEach(sectionKey => {
        // Skip non-array properties (like sectionNotes, overallNotes, lastSaved)
        if (!Array.isArray(vehicleInspection[sectionKey])) return;
        
        const sectionItems = vehicleInspection[sectionKey];
        totalItems += sectionItems.length;
        
        // Count completed items (rated as 'great')
        completedItems += sectionItems.filter(item => item.rating === 'great').length;
      });
      
      // Calculate percentage (avoid division by zero)
      return totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
    } catch (error) {
      console.error('Error calculating detailed progress:', error);
      return this.calculateSectionProgress(vehicle);
    }
  }
  
  /**
   * Fallback method that calculates progress based on section status
   * Used when detailed inspection data is not available
   */
  static calculateSectionProgress(vehicle: Vehicle): number {
    const statuses = Object.values(vehicle.status);
    const completed = statuses.filter(status => status === 'completed').length;
    return (completed / statuses.length) * 100;
  }
}