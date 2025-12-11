/*
 * @Author: Raaabbit Raaabbit@users.noreply.github.com
 * @Date: 2025-03-05 23:02:40
 * @LastEditors: Auto
 * @LastEditTime: 2025-01-XX
 * @FilePath: /pets/entrypoints/background.ts
 * @Description: Background script for handling messages and ensuring content script injection
 */

import type { ExtensionMessage, MessageResponse } from "@/types";
export default defineBackground(async () => {
  // 确保 content script 已注入的辅助函数
  const ensureContentScript = async (tabId: number): Promise<boolean> => {
    try {
      // 尝试发送 ping 消息检查 content script 是否已加载
      await browser.tabs.sendMessage(tabId, { action: "ping" });
      return true;
    } catch (error) {
      // Content script 未加载，尝试注入
      try {
        // 注意：在 Manifest V3 中，content script 应该通过 manifest.json 自动注入
        // 但如果需要动态注入，可以使用 scripting.executeScript
        // 这里我们假设 content script 应该已经通过 manifest 注入
        // 如果失败，返回 false
        console.warn(`Content script not ready for tab ${tabId}, will retry`);
        return false;
      } catch (injectError) {
        console.error(
          `Failed to inject content script for tab ${tabId}:`,
          injectError
        );
        return false;
      }
    }
  };

  // 带重试机制的消息发送
  const sendMessageWithRetry = async (
    tabId: number,
    message: ExtensionMessage,
    maxRetries: number = 3,
    delay: number = 100
  ): Promise<boolean> => {
    for (let i = 0; i < maxRetries; i++) {
      try {
        await browser.tabs.sendMessage(tabId, message);
        return true;
      } catch (error) {
        if (i < maxRetries - 1) {
          // 等待一段时间后重试
          await new Promise((resolve) => setTimeout(resolve, delay * (i + 1)));
        } else {
          console.error(
            `Failed to send message to tab ${tabId} after ${maxRetries} retries:`,
            error
          );
          return false;
        }
      }
    }
    return false;
  };

  // 监听来自 popup 的消息
  browser.runtime.onMessage.addListener(
    (
      request: ExtensionMessage,
      sender,
      sendResponse: (response?: MessageResponse) => void
    ) => {
      if (request.action === "create-pet") {
        // 异步处理，不阻塞
        (async () => {
          try {
            // 获取当前活动的标签页
            const tabs = await browser.tabs.query({
              active: true,
              currentWindow: true,
            });

            if (tabs.length === 0) {
              console.warn("No active tab found");
              sendResponse?.({ success: false, error: "No active tab" });
              return;
            }

            const activeTab = tabs[0];
            if (!activeTab.id) {
              console.warn("Active tab has no ID");
              sendResponse?.({ success: false, error: "Tab has no ID" });
              return;
            }

            // 检查是否是特殊页面（chrome://, chrome-extension:// 等）
            if (
              activeTab.url?.startsWith("chrome://") ||
              activeTab.url?.startsWith("chrome-extension://") ||
              activeTab.url?.startsWith("edge://") ||
              activeTab.url?.startsWith("moz-extension://")
            ) {
              console.warn("Cannot inject content script into special pages");
              sendResponse?.({
                success: false,
                error: "Cannot inject into special pages",
              });
              return;
            }

            // 尝试发送消息，带重试机制
            const success = await sendMessageWithRetry(activeTab.id, request);
            sendResponse?.({ success });
          } catch (error) {
            console.error("Error handling create-pet message:", error);
            sendResponse?.({ success: false, error: String(error) });
          }
        })();

        // 返回 true 表示将异步发送响应
        return true;
      }

      // 处理其他消息类型
      if (request.action === "reload-pets") {
        browser.tabs.query({}).then((tabs) => {
          tabs.forEach((tab) => {
            if (tab.id) {
              browser.tabs.sendMessage(tab.id, request).catch(() => {
                // 忽略错误
              });
            }
          });
        });
        return true;
      }

      return false;
    }
  );
});
