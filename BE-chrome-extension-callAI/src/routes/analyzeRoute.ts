// Route handler cho /api/analyze
import { Router, type Request, type Response } from 'express';
import { GeminiService } from '../services/geminiService.js';
import type { AnalyzeImageRequest, AnalyzeImageResponse } from '../types/request.js';

const router = Router();
// Lazy initialization - chỉ khởi tạo khi cần dùng
let geminiService: GeminiService | null = null;

function getGeminiService(): GeminiService {
  if (!geminiService) {
    geminiService = new GeminiService();
  }
  return geminiService;
}

/**
 * POST /api/analyze
 * Nhận hình ảnh base64 và gửi đến Gemini Pro để phân tích
 */
router.post('/analyze', async (req: Request, res: Response) => {
  try {
    const { image, format, question }: AnalyzeImageRequest = req.body;

    // Validation
    if (!image) {
      const response: AnalyzeImageResponse = {
        success: false,
        error: 'Thiếu trường image trong request body',
      };
      return res.status(400).json(response);
    }

    if (!format) {
      const response: AnalyzeImageResponse = {
        success: false,
        error: 'Thiếu trường format trong request body',
      };
      return res.status(400).json(response);
    }

    console.log('📸 Nhận được request phân tích hình ảnh...');
    console.log(`   Format: ${format}`);
    console.log(`   Image size: ${image.length} characters`);
    console.log(`   Question: ${question || 'Mặc định'}`);

    // Gọi Gemini Pro để phân tích hình ảnh
    const aiResponse = await getGeminiService().analyzeImage({
      image,
      format,
      question,
    });

    console.log('✅ Phân tích thành công!');

    const response: AnalyzeImageResponse = {
      success: true,
      data: aiResponse,
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error(' Error in /api/analyze:', error);

    const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';
    
    const response: AnalyzeImageResponse = {
      success: false,
      error: errorMessage,
    };

    return res.status(500).json(response);
  }
});

export default router;


