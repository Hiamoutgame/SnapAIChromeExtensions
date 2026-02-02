# SnapAIChromeExtensions

**SnapAsk AI** - Giải pháp phân tích màn hình thông minh với AI, cho phép bạn chụp và hỏi về bất kỳ nội dung nào trên trình duyệt mà không cần rời khỏi trang hiện tại. Extension tích hợp sâu với Google Gemini AI để phân tích hình ảnh và trả lời câu hỏi ngay trong popup, mang lại trải nghiệm liền mạch và tiện lợi. Hỗ trợ phím tắt `Ctrl+Shift+Y` để chụp nhanh từ bất kỳ tab nào, kèm theo backend Express được xây dựng bằng TypeScript để xử lý hình ảnh base64 và giao tiếp với Gemini API một cách hiệu quả.

SnapAsk AI lets you capture the current tab and send it straight to Gemini for analysis without leaving the page. The extension ships with an Express backend using the Gemini API, receiving base64 images at `/api/analyze` and returning answers. You can trigger capture via the `Ctrl+Shift+Y` shortcut, preview the screenshot, add an optional question, and view the response directly in the popup.

## Quick usage
1) Backend (`BE-chrome-extension-callAI`)
   - Create `.env` with `GEMINI_API_KEY=<your_key>` and optional `GEMINI_MODEL`.
   - Install: `npm install`
   - Dev run: `npm run dev` (default port 3000, endpoint `/api/analyze`).
   - Health check: open `http://localhost:3000/health`.

2) Extension (`chrome-extension`)
   - Install/build: `npm install && npm run build` (generates `dist/` for background).
   - Chrome: `chrome://extensions` → enable Developer mode → Load unpacked → select `chrome-extension` folder.

3) Use
   - Open the extension popup, click **Capture** to grab the current tab and see a preview.
   - Enter an optional question → **Send** to call the Gemini backend and receive the answer.
   - Shortcut: `Ctrl+Shift+Y` to trigger capture from any active tab.

4) Notes
   - Ensure the backend is running and `ScreenshotService.BACKEND_URL` points to it.
   - If the backend isn’t ready, the popup will show mock data so you can test the UI.
