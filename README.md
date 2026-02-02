# SnapAsk AI (Chrome Extension)

SnapAsk AI là Chrome Extension cho phép bạn **chụp màn hình tab hiện tại** và **hỏi Google Gemini** ngay trong popup, không cần rời khỏi trang. Extension hỗ trợ phím tắt `Ctrl+Shift+Y` để trigger chụp nhanh (khi popup đang mở).

## Tính năng
- **Chụp màn hình tab hiện tại** và preview ngay trong popup
- **Nhập câu hỏi tùy chọn** (để trống sẽ dùng prompt phân tích mặc định)
- **Gọi Gemini trực tiếp trong extension** (không cần backend)
- **Phím tắt**: `Ctrl+Shift+Y`

## Yêu cầu
- Node.js (khuyến nghị bản LTS)
- Google Chrome (Manifest V3)
- Gemini API key từ Google AI Studio

## Setup nhanh
### 1) Cài dependencies
```bash
npm install
```

### 2) Tạo file `.env` ở thư mục gốc project
Tạo file `.env` (cùng cấp với `package.json`) với nội dung:
```bash
GEMINI_API_KEY=YOUR_API_KEY
# Optional (mặc định: gemini-2.5-flash-lite)
GEMINI_MODEL=gemini-2.5-flash-lite
```

Lưu ý: Vite sẽ inject các biến này vào bundle khi build. Nếu đổi `.env`, bạn cần build lại.

### 3) Build extension
```bash
npm run build
```
Sau bước này sẽ tạo thư mục `dist/` (ví dụ: `dist/popup.js`, `dist/background.js`).

## Load extension vào Chrome
1) Mở `chrome://extensions`
2) Bật **Developer mode**
3) Chọn **Load unpacked**
4) Chọn **thư mục gốc** của project (thư mục có `manifest.json`)
5) Nếu bạn vừa build lại: bấm **Reload** ở card extension

## Cách dùng
- Mở popup của extension
- Bấm **Chụp màn hình**
- Nhập câu hỏi (tuỳ chọn) → bấm **Gửi**
- Hoặc bấm `Ctrl+Shift+Y` để trigger chụp (popup cần đang mở để nhận message)

## Dev workflow
Nếu bạn đang code và muốn build lại tự động:
```bash
npm run watch
```
Sau mỗi lần `dist/` thay đổi, bạn vẫn cần **Reload extension** trong `chrome://extensions` để Chrome nạp bundle mới.

## Troubleshooting
- **Báo lỗi `GEMINI_API_KEY chưa được cấu hình`**: tạo `.env` và chạy lại `npm run build`, sau đó Reload extension.
- **401/403**: API key sai hoặc không có quyền.
- **429 / quota**: hết quota; kiểm tra tại `https://aistudio.google.com/app/apikey`.
- **Model not found**: thử đổi `GEMINI_MODEL` (ví dụ `gemini-1.5-flash-latest`) rồi build lại.

## Lưu ý bảo mật
Vì extension đang gọi Gemini **trực tiếp từ client**, API key sẽ bị **bundle vào mã build** (người dùng có thể trích xuất). Nếu bạn định phát hành rộng rãi, nên chuyển sang mô hình có backend/proxy để bảo vệ API key.
