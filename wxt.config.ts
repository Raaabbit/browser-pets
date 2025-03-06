/*
 * @Author: yhyang001 yhyang001@mail.nfsq.com.cn
 * @Date: 2025-03-05 23:02:40
 * @LastEditors: yhyang001 yhyang001@mail.nfsq.com.cn
 * @LastEditTime: 2025-03-06 18:09:43
 * @FilePath: /pets/wxt.config.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  extensionApi: 'chrome',
  modules: ['@wxt-dev/module-react'],
  outDir: "dist",            // default: ".output"
  zip: {
    name: 'browser-pets.zip',
  },
  manifest: {
    name: 'Browser-Pets',
    version: '0.1.0',
    description: 'A simple pet game for the browser.',
    permissions: ['storage'],
  },
});
