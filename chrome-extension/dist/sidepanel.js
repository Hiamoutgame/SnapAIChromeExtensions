import { ScreenshotService } from './services/screenshotService.js';
class SnapAskSidePanel {
    constructor() {
        this.currentScreenshot = null;
        this.initializeElements();
        this.attachEventListeners();
    }
    initializeElements() {
        this.captureBtn = document.getElementById('capture-btn');
        this.sendBtn = document.getElementById('send-btn');
        this.screenshotPreview = document.getElementById('screenshot-preview');
        this.loading = document.getElementById('loading');
        this.resultContainer = document.getElementById('result-container');
        this.resultContent = document.getElementById('result-content');
        this.errorMessage = document.getElementById('error-message');
        this.questionInput = document.getElementById('question-input');
    }
    attachEventListeners() {
        this.captureBtn.addEventListener('click', () => this.handleCaptureClick());
        this.sendBtn.addEventListener('click', () => this.handleSendClick());
    }
    async handleCaptureClick() {
        try {
            this.showLoading('Chọn vùng cần chụp trên trang...');
            this.hideError();
            this.hideResult();
            this.setButtonsEnabled(false);
            const screenshot = await ScreenshotService.captureSelectedRegion();
            this.currentScreenshot = screenshot;
            this.displayScreenshot(screenshot.dataUrl);
            this.setButtonsEnabled(true, { sendBtn: true });
        }
        catch (error) {
            console.error('❌ Error capturing screenshot:', error);
            this.showError(error instanceof Error ? error.message : 'Unknown error');
            this.setButtonsEnabled(true);
        }
        finally {
            this.hideLoading();
        }
    }
    async handleSendClick() {
        if (!this.currentScreenshot) {
            this.showError('Vui lòng chụp màn hình trước!');
            return;
        }
        try {
            this.showLoading('Đang gửi đến AI...');
            this.hideError();
            this.hideResult();
            this.setButtonsEnabled(false);
            const question = this.questionInput.value.trim() || undefined;
            const result = await ScreenshotService.sendToBackend(this.currentScreenshot, question);
            this.showResult(result);
        }
        catch (error) {
            console.error('❌ Error sending to backend:', error);
            this.showError(error instanceof Error ? error.message : 'Unknown error');
        }
        finally {
            this.hideLoading();
            this.setButtonsEnabled(true);
        }
    }
    displayScreenshot(dataUrl) {
        this.screenshotPreview.src = dataUrl;
        this.screenshotPreview.classList.add('show');
    }
    showResult(content) {
        this.resultContent.textContent = content;
        this.resultContainer.classList.add('show');
    }
    showLoading(message = 'Đang xử lý...') {
        const loadingText = this.loading.querySelector('p');
        if (loadingText)
            loadingText.textContent = message;
        this.loading.classList.add('show');
    }
    hideLoading() {
        this.loading.classList.remove('show');
    }
    showError(message) {
        this.errorMessage.textContent = message;
        this.errorMessage.classList.add('show');
        this.errorMessage.style.background = '#fee';
        this.errorMessage.style.color = '#e74c3c';
    }
    hideError() {
        this.errorMessage.classList.remove('show');
    }
    hideResult() {
        this.resultContainer.classList.remove('show');
    }
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
window.addEventListener('DOMContentLoaded', () => {
    new SnapAskSidePanel();
});
//# sourceMappingURL=sidepanel.js.map