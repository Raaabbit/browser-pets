/*
 * @Author: yhyang001 yhyang001@mail.nfsq.com.cn
 * @Date: 2025-03-05 23:02:40
 * @LastEditors: Raaabbit Raaabbit@users.noreply.github.com
 * @LastEditTime: 2025-04-27 18:52:50
 * @FilePath: /pets/entrypoints/content.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */

import ReactDOM from "react-dom/client";
import Home from "@/entrypoints/components/home";

export default defineContentScript({
  matches: ["<all_urls>"],
  cssInjectionMode: "manual",
  async main(ctx) {
    // 在 content script 中监听消息
    browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === "create-pet") {
        // 通过 document 传递事件，Shadow DOM 中的代码可以监听 document 事件
        document.dispatchEvent(
          new CustomEvent("create-pet", {
            detail: request.pet,
          })
        );
      } else if (request.action === "reload-pets") {
        // 重新加载宠物
        document.dispatchEvent(new CustomEvent("reload-pets"));
      }
    });

    if (ctx.isValid) {
      // 3. Define your UI
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

      // 4. Mount the UI
      ui.mount();
    }
  },
});
