
/**
 * Service to handle image processing.
 * Currently serves as a pass-through for Base64 but prepares for future cloud upload integration.
 */
export const ImageService = {
  /**
   * Processes an image file or base64 string.
   * In the future, this will upload to S3/Firebase and return a URL.
   * Currently, it returns the Base64 string as is or validates it.
   */
  processImage: async (imageData: string): Promise<string> => {
    // Placeholder for future size validation or compression
    if (!imageData) return '';
    
    // Simulate async operation for future compatibility
    return Promise.resolve(imageData);
  },

  /**
   * Returns a default image if none provided
   */
  getProfileImage: (photo?: string): string => {
    return photo && photo.trim() !== '' ? photo : '/images/membro.png';
  }
};
