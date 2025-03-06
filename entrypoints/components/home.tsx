/*
 * @Author: yhyang001 yhyang001@mail.nfsq.com.cn
 * @Date: 2025-03-06 17:36:22
 * @LastEditors: yhyang001 yhyang001@mail.nfsq.com.cn
 * @LastEditTime: 2025-03-06 17:50:53
 * @FilePath: /pets/entrypoints/components/home.tsx
 * @Description: 所有宠物的容器
 */
// 一个容器，用于放置所有的 Pet，点击可以穿透

import Pet from "@/entrypoints/components/pet";

const Home = () => {
  return (
    <div
      id="pets-home"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        pointerEvents: "none",
      }}
    >
      <Pet />
    </div>
  );
};

export default Home;
