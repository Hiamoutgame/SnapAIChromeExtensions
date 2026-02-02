// Popup script cho SnapAsk AI Extension
// File này chỉ đảm nhiệm việc quản lý UI và hiển thị

import { ScreenshotService } from './services/screenshotService.js';
import type { ScreenshotData } from './const/types.js';

class SnapAskPopup {
  // UI Elements
  private captureBtn!: HTMLButtonElement;
  private sendBtn!: HTMLButtonElement;
  private screenshotPreview!: HTMLImageElement;
  private loading!: HTMLElement;
  private resultContainer!: HTMLElement;
  private resultContent!: HTMLElement;
  private errorMessage!: HTMLElement;
  private questionInput!: HTMLTextAreaElement;

  // State
  private currentScreenshot: ScreenshotData | null = null;

  constructor() {
    this.initializeElements();
    this.attachEventListeners();
    console.log("✅ SnapAsk Popup initialized");
  }

  /**
   * Khởi tạo các DOM elements
   */
  private initializeElements(): void {
    this.captureBtn = document.getElementById("capture-btn") as HTMLButtonElement;
    this.sendBtn = document.getElementById("send-btn") as HTMLButtonElement;
    this.screenshotPreview = document.getElementById("screenshot-preview") as HTMLImageElement;
    this.loading = document.getElementById("loading") as HTMLElement;
    this.resultContainer = document.getElementById("result-container") as HTMLElement;
    this.resultContent = document.getElementById("result-content") as HTMLElement;
    this.errorMessage = document.getElementById("error-message") as HTMLElement;
    this.questionInput = document.getElementById("question-input") as HTMLTextAreaElement;
  }

  /**
   * Gắn event listeners cho các buttons và messages
   */
  private attachEventListeners(): void {
    this.captureBtn.addEventListener("click", () => this.handleCaptureClick());
    this.sendBtn.addEventListener("click", () => this.handleSendClick());

    // Listen cho messages từ background (keyboard shortcut)
    chrome.runtime.onMessage.addListener((message: any, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
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
  private async handleCaptureClick(): Promise<void> {
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
    } catch (error) {
      console.error("❌ Error capturing screenshot:", error);
      this.showError(`Lỗi khi chụp màn hình: ${error instanceof Error ? error.message : "Unknown error"}`);
      this.hideLoading();
      this.setButtonsEnabled(true);
    }
  }

  /**
   * Xử lý khi user click nút gửi
   */
  private async handleSendClick(): Promise<void> {
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

      // Gọi Gemini AI (trong dự án)
      const result = await ScreenshotService.analyzeWithGemini(this.currentScreenshot, question);

      // Hiển thị kết quả
      this.showResult(result);
      console.log("✅ Response received:", result);

    } catch (error) {
      console.error("❌ Error sending to Gemini:", error);
      this.showError(`Lỗi: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      this.hideLoading();
      this.setButtonsEnabled(true);
    }
  }

  // ========== UI Methods (Chỉ xử lý hiển thị) ==========

  /**
   * Hiển thị screenshot preview
   */
  private displayScreenshot(dataUrl: string): void {
    this.screenshotPreview.src = dataUrl;
    this.screenshotPreview.classList.add("show");
  }

  /**
   * Hiển thị kết quả từ Gemini
   */
  private showResult(content: string): void {
    this.resultContent.textContent = content;
    this.resultContainer.classList.add("show");
  }

  /**
   * Hiển thị loading state
   */
  private showLoading(message: string = "Đang xử lý..."): void {
    const loadingText = this.loading.querySelector("p");
    if (loadingText) {
      loadingText.textContent = message;
    }
    this.loading.classList.add("show");
  }

  /**
   * Ẩn loading state
   */
  private hideLoading(): void {
    this.loading.classList.remove("show");
  }

  /**
   * Hiển thị error message
   */
  private showError(message: string, isError: boolean = true): void {
    this.errorMessage.textContent = message;
    this.errorMessage.classList.add("show");
    if (!isError) {
      this.errorMessage.style.background = "#fff3cd";
      this.errorMessage.style.color = "#856404";
    } else {
      this.errorMessage.style.background = "#fee";
      this.errorMessage.style.color = "#e74c3c";
    }
  }

  /**
   * Ẩn error message
   */
  private hideError(): void {
    this.errorMessage.classList.remove("show");
  }

  /**
   * Ẩn result container
   */
  private hideResult(): void {
    this.resultContainer.classList.remove("show");
  }

  /**
   * Enable/Disable buttons
   */
  private setButtonsEnabled(enabled: boolean, options?: { sendBtn?: boolean }): void {
    this.captureBtn.disabled = !enabled;
    if (options?.sendBtn !== undefined) {
      this.sendBtn.disabled = !options.sendBtn;
    } else {
      this.sendBtn.disabled = !enabled;
    }
  }
}

// Khởi tạo popup khi DOM đã load
window.addEventListener("DOMContentLoaded", () => {
  new SnapAskPopup();
});
