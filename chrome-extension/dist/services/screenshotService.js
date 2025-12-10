export class ScreenshotService {
    /**
     * Chụp màn hình của tab hiện tại
     */
    static async captureScreenshot() {
        // Lấy tab hiện tại
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab.id || !tab.windowId) {
            throw new Error("Không tìm thấy tab hiện tại");
        }
        // Chụp màn hình
        const dataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, {
            format: "png",
            quality: 100
        });
        // Convert data URL sang base64
        const base64Data = dataUrl.split(",")[1];
        return {
            dataUrl,
            base64: base64Data,
            format: "png"
        };
    }
    /**
     * Gửi screenshot đến backend API
     */
    static async sendToBackend(screenshot, question) {
        try {
            const requestBody = {
                image: screenshot.base64,
                format: screenshot.format
            };
            // Thêm question nếu có
            if (question) {
                requestBody.question = question;
            }
            const response = await fetch(this.BACKEND_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody)
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error || response.statusText}`);
            }
            const result = await response.json();
            if (result.success && result.data) {
                return result.data;
            }
            else {
                throw new Error(result.error || "Không nhận được kết quả từ server");
            }
        }
        catch (error) {
            // Error handling
            if (error instanceof TypeError && error.message.includes("fetch")) {
                // Network error
                throw new Error("Network error: Không thể kết nối đến server");
            }
            else if (error instanceof Error) {
                // Re-throw với message
                throw error;
            }
            else {
                throw new Error("Lỗi không xác định khi gửi request");
            }
        }
    }
    /**
     * Get mock result để test UI (xóa khi có backend thật)
     */
    static getMockResult() {
        return `Đây là kết quả mẫu từ AI:

📸 Ảnh màn hình đã được phân tích thành công!

🔍 Phát hiện:
- Có văn bản trong ảnh
- Có các element UI
- Độ phân giải: HD

💡 Gợi ý: Đây chỉ là dữ liệu mẫu. Kết nối với backend thật để nhận kết quả chính xác.

(Lưu ý: Backend chưa được cấu hình, đây chỉ là UI demo)`;
    }
}
ScreenshotService.BACKEND_URL = "http://localhost:3000/api/analyze"; // TODO: Move to config
//# sourceMappingURL=screenshotService.js.map