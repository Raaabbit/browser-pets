/*
 * @Author: yhyang001 yhyang001@mail.nfsq.com.cn
 * @Date: 2025-03-05 23:02:40
 * @LastEditors: Auto
 * @LastEditTime: 2025-01-XX
 * @FilePath: /pets/entrypoints/content.ts
 * @Description: Content script for injecting pet UI and handling messages
 */

import ReactDOM from "react-dom/client";
import Home from "@/entrypoints/components/home";
import type { ExtensionMessage, MessageResponse } from "@/types";

export default defineContentScript({
  matches: ["<all_urls>"],
  cssInjectionMode: "manual",
  async main(ctx) {
    // 在 content script 中监听消息
    browser.runtime.onMessage.addListener(
      (
        request: ExtensionMessage,
        sender,
        sendResponse: (response?: MessageResponse) => void
      ) => {
        try {
          if (request.action === "ping") {
            // 响应 ping 消息，表示 content script 已加载
            sendResponse?.({ ready: true });
            return true;
          }

          if (request.action === "create-pet") {
            // 通过 document 传递事件，Shadow DOM 中的代码可以监听 document 事件
            document.dispatchEvent(
              new CustomEvent("create-pet", {
                detail: request.pet,
              })
            );
            sendResponse?.({ success: true });
            return true;
          }

          if (request.action === "reload-pets") {
            // 重新加载宠物
            document.dispatchEvent(new CustomEvent("reload-pets"));
            sendResponse?.({ success: true });
            return true;
          }

          return false;
        } catch (error) {
          console.error("Error handling message in content script:", error);
          sendResponse?.({ success: false, error: String(error) });
          return true;
        }
      }
    );

    // 等待 DOM 准备就绪
    const waitForBody = () => {
      return new Promise<void>((resolve) => {
        if (document.body) {
          resolve();
        } else {
          const observer = new MutationObserver(() => {
            if (document.body) {
              observer.disconnect();
              resolve();
            }
          });
          observer.observe(document.documentElement, {
            childList: true,
            subtree: true,
          });
        }
      });
    };

    // 确保 body 存在后再挂载 UI
    await waitForBody();

    if (ctx.isValid) {
      try {
        // 定义 UI
        const ui = await createShadowRootUi(ctx, {
          name: "pets-home",
          position: "inline",
          anchor: "body",
          onMount: (container) => {
            // Container is a body, and React warns when creating a root on the body, so create a wrapper div
            const app = document.createElement("div");
            container.append(app);

            // Create a root on the UI container and render a component
            const root = ReactDOM.createRoot(app);
            root.render(<Home />);
            return root;
          },
          onRemove: (root) => {
            // Unmount the root when the UI is removed
            root?.unmount();
          },
        });

        // 挂载 UI
        ui.mount();
      } catch (error) {
        console.error("Error mounting pets UI:", error);
      }
    }
  },
});
