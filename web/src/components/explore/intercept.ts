/**
 * 連結的一般點擊改成在地圖內處理（例如開政策面板）；
 * 按著 Ctrl／Cmd／Shift／Alt 或用中鍵點時照常開連結，保留「在新分頁開完整頁」。
 */
export function intercept(e: React.MouseEvent, fn: () => void) {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  e.preventDefault();
  fn();
}
