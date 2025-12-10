// Popup script cho SnapAsk AI Extension
// File này chỉ đảm nhiệm việc quản lý UI và hiển thị
import { ScreenshotService } from './services/screenshotService.js';
class SnapAskPopup {
    constructor() {
        // State
        this.currentScreenshot = null;
        this.initializeElements();
        this.attachEventListeners();
        console.log("✅ SnapAsk Popup initialized");
    }
    /**
     * Khởi tạo các DOM elements
     */
    initializeElements() {
        this.captureBtn = document.getElementById("capture-btn");
        this.sendBtn = document.getElementById("send-btn");
        this.screenshotPreview = document.getElementById("screenshot-preview");
        this.loading = document.getElementById("loading");
        this.resultContainer = document.getElementById("result-container");
        this.resultContent = document.getElementById("result-content");
        this.errorMessage = document.getElementById("error-message");
        this.questionInput = document.getElementById("question-input");
    }
    /**
     * Gắn event listeners cho các buttons và messages
     */
    attachEventListeners() {
        this.captureBtn.addEventListener("click", () => this.handleCaptureClick());
        this.sendBtn.addEventListener("click", () => this.handleSendClick());
        // Listen cho messages từ background (keyboard shortcut)
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            if (message.type === "trigger-capture") {
                // Trigger capture khi nhận message từ background
                this.handleCaptureClick();
                sendResponse({ success: true });
            }
            return true;
        });
    }
    /**
     * Xử lý khi user click nút chụp màn hình
     */
    async handleCaptureClick() {
        try {
            this.showLoading("Đang chụp màn hình...");
            this.hideError();
            this.hideResult();
            this.setButtonsEnabled(false);
            // Gọi service để chụp màn hình
            const screenshot = await ScreenshotService.captureScreenshot();
            // Lưu screenshot và hiển thị UI
            this.currentScreenshot = screenshot;
            this.displayScreenshot(screenshot.dataUrl);
            this.setButtonsEnabled(true, { sendBtn: true });
            this.hideLoading();
            console.log("✅ Screenshot captured successfully");
        }
        catch (error) {
            console.error("❌ Error capturing screenshot:", error);
            this.showError(`Lỗi khi chụp màn hình: ${error instanceof Error ? error.message : "Unknown error"}`);
            this.hideLoading();
            this.setButtonsEnabled(true);
        }
    }
    /**
     * Xử lý khi user click nút gửi
     */
    async handleSendClick() {
        if (!this.currentScreenshot) {
            this.showError("Vui lòng chụp màn hình trước!");
            return;
        }
        try {
            this.showLoading("Đang gửi đến AI...");
            this.hideError();
            this.hideResult();
            this.setButtonsEnabled(false);
            // Lấy câu hỏi từ input (nếu có)
            const question = this.questionInput.value.trim() || undefined;
            // Gọi service để gửi đến backend
            const result = await ScreenshotService.sendToBackend(this.currentScreenshot, question);
            // Hiển thị kết quả
            this.showResult(result);
            console.log("✅ Response received:", result);
        }
        catch (error) {
            console.error("❌ Error sending to backend:", error);
            // Hiển thị mock data nếu backend chưa sẵn sàng
            if (error instanceof Error && error.message.includes("Failed to fetch")) {
                const mockResult = ScreenshotService.getMockResult();
                this.showResult(mockResult);
                this.showError("⚠️ Backend chưa được cấu hình. Đây là dữ liệu mẫu.", false);
            }
            else {
                this.showError(`Lỗi khi gửi request: ${error instanceof Error ? error.message : "Unknown error"}`);
            }
        }
        finally {
            this.hideLoading();
            this.setButtonsEnabled(true);
        }
    }
    // ========== UI Methods (Chỉ xử lý hiển thị) ==========
    /**
     * Hiển thị screenshot preview
     */
    displayScreenshot(dataUrl) {
        this.screenshotPreview.src = dataUrl;
        this.screenshotPreview.classList.add("show");
    }
    /**
     * Hiển thị kết quả từ backend
     */
    showResult(content) {
        this.resultContent.textContent = content;
        this.resultContainer.classList.add("show");
    }
    /**
     * Hiển thị loading state
     */
    showLoading(message = "Đang xử lý...") {
        const loadingText = this.loading.querySelector("p");
        if (loadingText) {
            loadingText.textContent = message;
        }
        this.loading.classList.add("show");
    }
    /**
     * Ẩn loading state
     */
    hideLoading() {
        this.loading.classList.remove("show");
    }
    /**
     * Hiển thị error message
     */
    showError(message, isError = true) {
        this.errorMessage.textContent = message;
        this.errorMessage.classList.add("show");
        if (!isError) {
            this.errorMessage.style.background = "#fff3cd";
            this.errorMessage.style.color = "#856404";
        }
        else {
            this.errorMessage.style.background = "#fee";
            this.errorMessage.style.color = "#e74c3c";
        }
    }
    /**
     * Ẩn error message
     */
    hideError() {
        this.errorMessage.classList.remove("show");
    }
    /**
     * Ẩn result container
     */
    hideResult() {
        this.resultContainer.classList.remove("show");
    }
    /**
     * Enable/Disable buttons
     */
    setButtonsEnabled(enabled, options) {
        this.captureBtn.disabled = !enabled;
        if (options?.sendBtn !== undefined) {
            this.sendBtn.disabled = !options.sendBtn;
        }
        else {
            this.sendBtn.disabled = !enabled;
        }
    }
}
// Khởi tạo popup khi DOM đã load
window.addEventListener("DOMContentLoaded", () => {
    new SnapAskPopup();
});
//# sourceMappingURL=popup.js.map