// Types và interfaces cho SnapAsk Extension

export interface ApiResponse {
  success: boolean;
  data?: string;
  error?: string;
}

export interface ScreenshotData {
  dataUrl: string;
  base64: string;
  format: string;
}

