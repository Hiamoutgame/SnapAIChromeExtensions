// Service để gọi Google Gemini Pro API
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { AnalyzeImageRequest } from '../types/request.js';

export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set in environment variables');
    }

    this.genAI = new GoogleGenerativeAI(apiKey);

    const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite';
    this.model = this.genAI.getGenerativeModel({ model: modelName });
  }


  async analyzeImage(request: AnalyzeImageRequest): Promise<string> {
    try {
      const { image, question } = request;

      // Prompt mặc định nếu không có câu hỏi
      const prompt = question || 
        'Hãy phân tích hình ảnh này một cách chi tiết. Mô tả những gì bạn thấy, bao gồm văn bản, UI elements, màu sắc, và bất kỳ thông tin quan trọng nào khác. Trả lời bằng tiếng Việt.';

   
      const mimeType = `image/${request.format}`;
      const base64Image = image.includes(',')
        ? image.split(',')[1] 
        : image;

      // Gọi Gemini API với image và prompt
      const result = await this.model.generateContent([
        prompt,
        {
          inlineData: {
            data: base64Image, // Base64 string
            mimeType: mimeType,
          },
        },
      ]);

      const response = await result.response;
      const content = response.text();

      if (!content) {
        throw new Error('Không nhận được phản hồi từ Gemini');
      }

      return content;
    } catch (error: any) {
      console.error('Error calling Gemini API:', error);
      
      // Xử lý Gemini API errors
      if (error?.status === 429) {
        throw new Error(
          'Quota đã hết! Vui lòng kiểm tra quota của tài khoản Google AI Studio. ' +
          'Truy cập: https://aistudio.google.com/app/apikey'
        );
      }
      
      if (error?.status === 401 || error?.status === 403) {
        throw new Error('API key không hợp lệ hoặc không có quyền truy cập. Vui lòng kiểm tra GEMINI_API_KEY trong file .env');
      }
      
      if (error?.status === 400) {
        throw new Error(`Bad request: ${error.message || 'Dữ liệu đầu vào không hợp lệ'}`);
      }
      
      if (error?.message?.includes('not found for API version')) {
        throw new Error('Model không tồn tại ở API v1beta. Thử đổi sang gemini-1.5-flash-latest hoặc đặt biến môi trường GEMINI_MODEL.');
      }
      
      if (error?.message) {
        // Kiểm tra các lỗi phổ biến của Gemini
        if (error.message.includes('quota') || error.message.includes('QUOTA')) {
          throw new Error(`Gemini API: ${error.message}. Kiểm tra quota tại: https://aistudio.google.com/app/apikey`);
        }
        if (error.message.includes('API key') || error.message.includes('API_KEY')) {
          throw new Error(`Gemini API: ${error.message}. Kiểm tra API key tại: https://aistudio.google.com/app/apikey`);
        }
        throw new Error(`Gemini API error: ${error.message}`);
      }
      
      throw new Error('Lỗi không xác định khi gọi Gemini API');
    }
  }
}

