// Types cho API requests

export interface AnalyzeImageRequest {
  image: string; // Base64 encoded image
  format: string; // Image format (png, jpg, etc.)
  question?: string; // Optional question to ask about the image
}

export interface AnalyzeImageResponse {
  success: boolean;
  data?: string; // AI response
  error?: string; // Error message
}

