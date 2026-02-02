// Service xử lý chụp màn hình và gửi đến Gemini AI (dùng biến môi trường .env)
import { GeminiService } from './gemini.service.js';
import type { ScreenshotData } from '../const/types.js';

export class ScreenshotService {
  /**
   * Chụp màn hình của tab hiện tại
   * Dùng lastFocusedWindow để lấy đúng tab khi popup mở
   */
  static async captureScreenshot(): Promise<ScreenshotData> {
    const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });

    if (!tab?.id || !tab?.windowId) {
      throw new Error('Không tìm thấy tab. Vui lòng mở một trang web rồi thử lại.');
    }

    const dataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, {
      format: 'png',
      quality: 100
    });

    const base64Data = dataUrl.split(',')[1];
    if (!base64Data) {
      throw new Error('Không thể xử lý ảnh chụp màn hình');
    }

    return {
      dataUrl,
      base64: base64Data,
      format: 'png'
    };
  }

  /**
   * Gửi screenshot đến Gemini AI (dùng GEMINI_API_KEY, GEMINI_MODEL từ .env)
   */
  static async analyzeWithGemini(screenshot: ScreenshotData, question?: string): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY;
    const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite';

    if (!apiKey) {
      throw new Error(
        'GEMINI_API_KEY chưa được cấu hình. Thêm vào file .env và build lại.'
      );
    }

    const geminiService = new GeminiService({ apiKey, modelName });

    return geminiService.analyzeImage({
      image: screenshot.base64,
      format: screenshot.format,
      question
    });
  }
}
