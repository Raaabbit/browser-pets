/*
 * @Author: yhyang001 yhyang001@mail.nfsq.com.cn
 * @Date: 2025-03-05 23:02:40
 * @LastEditors: Auto
 * @LastEditTime: 2025-01-XX
 * @FilePath: /pets/entrypoints/options/App.tsx
 * @Description: 设置页面 - 介绍页面
 */

import "./App.css";

function App() {
  return (
    <div className="options-container">
      <div className="options-header">
        <h1 className="options-title">
          <span className="title-icon">🐾</span>
          Browser Pets
        </h1>
        <p className="options-subtitle">浏览器电子宠物扩展</p>
      </div>

      <div className="options-content">
        <div className="intro-section">
          <div className="intro-card">
            <h2 className="intro-title">关于 Browser Pets</h2>
            <p className="intro-text">
              Browser Pets
              是一个有趣的浏览器扩展，可以在网页上添加可爱的电子宠物。
              这些宠物会在页面底部自由移动，为你的浏览体验增添乐趣。
            </p>
          </div>

          <div className="intro-card">
            <h2 className="intro-title">如何使用</h2>
            <ul className="intro-list">
              <li>点击浏览器工具栏中的扩展图标打开弹窗</li>
              <li>选择你喜欢的宠物类型和品种</li>
              <li>点击宠物卡片即可在网页上添加宠物</li>
              <li>右键点击网页中的宠物可以删除</li>
            </ul>
          </div>

          <div className="intro-card">
            <h2 className="intro-title">功能特点</h2>
            <ul className="intro-list">
              <li>多种宠物类型：猫、狗、鸟等</li>
              <li>每个类型下有多个品种可选</li>
              <li>宠物会在页面底部自动移动</li>
              <li>支持多个宠物同时存在</li>
              <li>支持全局存储或按网站存储</li>
              <li>切换标签页时保留宠物状态</li>
            </ul>
          </div>

          <div className="intro-card">
            <h2 className="intro-title">设置说明</h2>
            <p className="intro-text">
              所有功能设置都在扩展弹窗中完成。点击浏览器工具栏中的扩展图标，
              你可以在弹窗中选择宠物、调整存储方式、清除所有宠物等。
            </p>
          </div>

          <div className="intro-card">
            <h2 className="intro-title">版本信息</h2>
            <p className="intro-text">
              当前版本：0.1.0
              <br />
              更多宠物和功能正在开发中，敬请期待！
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
