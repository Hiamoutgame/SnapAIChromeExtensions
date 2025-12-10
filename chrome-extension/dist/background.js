"use strict";
// Background service worker cho SnapAsk AI Extension
// Nhiệm vụ: Xử lý keyboard shortcuts và messages giữa các parts của extension
console.log("SnapAsk Background Service Worker đã khởi động!");
// Listen cho keyboard command (Ctrl+Shift+Y)
chrome.commands.onCommand.addListener((command) => {
    console.log("📝 Command received:", command);
    if (command === "capture-and-ask") {
        handleCaptureAndAsk();
    }
});
/**
 * Xử lý command capture-and-ask từ keyboard shortcut
 * Gửi message đến popup để trigger capture (nếu popup đang mở)
 */
async function handleCaptureAndAsk() {
    try {
        // Lấy tab hiện tại
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab.id) {
            console.error("❌ Không tìm thấy tab hiện tại");
            return;
        }
        console.log("✅ Capture command processed for tab:", tab.id);
        // Gửi message đến popup để trigger capture
        // Popup sẽ tự xử lý nếu đang mở
        chrome.runtime.sendMessage({
            type: "trigger-capture",
            tabId: tab.id
        }).catch(() => {
            // Popup có thể chưa mở, không sao
            console.log("ℹ️ Popup chưa mở, user cần mở popup để sử dụng");
        });
    }
    catch (error) {
        console.error("❌ Error handling capture command:", error);
    }
}
// Listen cho messages từ popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("📨 Message received:", message);
    if (message.type === "capture-screenshot") {
        // Xử lý capture từ popup nếu cần
        sendResponse({ success: true });
    }
    return true; // Keep channel open for async response
});
//# sourceMappingURL=background.js.map