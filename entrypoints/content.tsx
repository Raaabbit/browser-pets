/*
 * @Author: yhyang001 yhyang001@mail.nfsq.com.cn
 * @Date: 2025-03-05 23:02:40
 * @LastEditors: yhyang001 yhyang001@mail.nfsq.com.cn
 * @LastEditTime: 2025-03-06 17:43:58
 * @FilePath: /pets/entrypoints/content.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */

import ReactDOM from "react-dom/client";
import Pet from "@/entrypoints/components/pet";
import Home from "@/entrypoints/components/home";

export default defineContentScript({
  matches: ["<all_urls>"],
  cssInjectionMode: "ui",
  async main(ctx) {
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
