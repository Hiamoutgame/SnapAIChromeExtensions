"use strict";
// Content script: tạo overlay chọn vùng chụp như snipping tool
// Lắng nghe message từ extension để bắt đầu chọn vùng
let isSelecting = false;
let overlayEl = null;
let boxEl = null;
let startX = 0;
let startY = 0;
function removeOverlay() {
    overlayEl?.remove();
    overlayEl = null;
    boxEl = null;
    isSelecting = false;
    document.removeEventListener('keydown', handleEsc, true);
}
function handleEsc(event) {
    if (event.key === 'Escape') {
        removeOverlay();
    }
}
function createOverlay() {
    overlayEl = document.createElement('div');
    overlayEl.style.position = 'fixed';
    overlayEl.style.inset = '0';
    overlayEl.style.background = 'rgba(0,0,0,0.25)';
    overlayEl.style.cursor = 'crosshair';
    overlayEl.style.zIndex = '2147483647';
    overlayEl.style.backdropFilter = 'blur(1px)';
    overlayEl.style.userSelect = 'none';
    boxEl = document.createElement('div');
    boxEl.style.position = 'absolute';
    boxEl.style.border = '2px solid #4CAF50';
    boxEl.style.background = 'rgba(76,175,80,0.2)';
    boxEl.style.pointerEvents = 'none';
    overlayEl.appendChild(boxEl);
    document.body.appendChild(overlayEl);
    document.addEventListener('keydown', handleEsc, true);
}
function startSelection() {
    return new Promise((resolve) => {
        if (isSelecting) {
            resolve(null);
            return;
        }
        isSelecting = true;
        createOverlay();
        function onMouseDown(e) {
            startX = e.clientX;
            startY = e.clientY;
            updateBox(e.clientX, e.clientY, 0, 0);
            overlayEl?.addEventListener('mousemove', onMouseMove);
            overlayEl?.addEventListener('mouseup', onMouseUp);
        }
        function onMouseMove(e) {
            const currentX = e.clientX;
            const currentY = e.clientY;
            const x = Math.min(startX, currentX);
            const y = Math.min(startY, currentY);
            const width = Math.abs(currentX - startX);
            const height = Math.abs(currentY - startY);
            updateBox(x, y, width, height);
        }
        function onMouseUp(e) {
            overlayEl?.removeEventListener('mousemove', onMouseMove);
            overlayEl?.removeEventListener('mouseup', onMouseUp);
            const endX = e.clientX;
            const endY = e.clientY;
            const x = Math.min(startX, endX);
            const y = Math.min(startY, endY);
            const width = Math.abs(endX - startX);
            const height = Math.abs(endY - startY);
            const result = width > 5 && height > 5
                ? {
                    x,
                    y,
                    width,
                    height,
                    devicePixelRatio: window.devicePixelRatio || 1,
                }
                : null;
            removeOverlay();
            resolve(result);
        }
        overlayEl?.addEventListener('mousedown', onMouseDown);
    });
}
function updateBox(x, y, width, height) {
    if (!boxEl)
        return;
    boxEl.style.left = `${x}px`;
    boxEl.style.top = `${y}px`;
    boxEl.style.width = `${width}px`;
    boxEl.style.height = `${height}px`;
}
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type === 'ping-selection') {
        sendResponse({ ok: true });
        return false;
    }
    if (message?.type === 'start-selection') {
        startSelection()
            .then((region) => {
            sendResponse({ success: true, region });
        })
            .catch((error) => {
            const msg = error instanceof Error ? error.message : 'Selection failed';
            sendResponse({ success: false, error: msg });
        });
        return true; // async response
    }
    return false;
});
//# sourceMappingURL=selectionOverlay.js.map