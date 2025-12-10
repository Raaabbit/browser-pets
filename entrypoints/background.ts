/*
 * @Author: Raaabbit Raaabbit@users.noreply.github.com
 * @Date: 2025-03-05 23:02:40
 * @LastEditors: Raaabbit Raaabbit@users.noreply.github.com
 * @LastEditTime: 2025-04-27 18:52:03
 * @FilePath: /pets/entrypoints/background.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
export default defineBackground(async () => {
  // 监听来自 popup 的消息
  browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "create-pet") {
      // 只向当前活动的标签页发送消息
      browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
        tabs.forEach((tab) => {
          if (tab.id) {
            // 发送消息到当前活动标签页的 content script
            browser.tabs.sendMessage(tab.id, request).catch(() => {
              // 忽略错误（如果 content script 未加载）
            });
          }
        });
      });
    }
    return true; // 保持消息通道开放
  });
});
