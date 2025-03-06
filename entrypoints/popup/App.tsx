/*
 * @Author: yhyang001 yhyang001@mail.nfsq.com.cn
 * @Date: 2025-03-05 23:02:40
 * @LastEditors: yhyang001 yhyang001@mail.nfsq.com.cn
 * @LastEditTime: 2025-03-06 17:55:10
 * @FilePath: /pets/src/entrypoints/popup/App.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */

import chicken from "@/assets/animals/chicken/stand.gif";

function App() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div>
        <img src={chicken} />
      </div>
      <div style={{ fontSize: 16 }}>更多宠物即将加入</div>
    </div>
  );
}

export default App;
