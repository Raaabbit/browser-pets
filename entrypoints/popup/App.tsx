/*
 * @Author: yhyang001 yhyang001@mail.nfsq.com.cn
 * @Date: 2025-03-05 23:02:40
 * @LastEditors: Raaabbit Raaabbit@users.noreply.github.com
 * @LastEditTime: 2025-04-27 18:52:29
 * @FilePath: /pets/src/entrypoints/popup/App.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */

import { useState, useEffect } from "react";
import chicken from "@/assets/animals/chicken/stand.gif";
import type {
  StorageMode,
  PetInfo,
  PetCategory,
  InitialPosition,
} from "@/types";
import "./App.css";

// 宠物分类数据
const petCategories: PetCategory[] = [
  {
    id: "cat",
    name: "猫",
    pets: [
      { name: "白猫", nameEn: "white-cat", img: chicken },
      { name: "黑猫", nameEn: "black-cat", img: chicken },
      { name: "花猫", nameEn: "calico-cat", img: chicken },
      { name: "橘猫", nameEn: "orange-cat", img: chicken },
    ],
  },
  {
    id: "dog",
    name: "狗",
    pets: [
      { name: "金毛", nameEn: "golden-retriever", img: chicken },
      { name: "柯基", nameEn: "corgi", img: chicken },
      { name: "柴犬", nameEn: "shiba", img: chicken },
      { name: "田园犬", nameEn: "mixed-dog", img: chicken },
    ],
  },
  {
    id: "bird",
    name: "鸟",
    pets: [
      { name: "鸡", nameEn: "chicken", img: chicken },
      { name: "柯尔鸭", nameEn: "call-duck", img: chicken },
    ],
  },
];

const allPets = [
  {
    id: "all",
    name: "所有",
    pets: petCategories.map((category) => category.pets).flat(),
  },
  ...petCategories,
];

function App() {
  const [clickedPet, setClickedPet] = useState<string | null>(null);
  const [storageMode, setStorageMode] = useState<StorageMode>("global");
  const [initialPosition, setInitialPosition] =
    useState<InitialPosition>("top");
  const [showSettings, setShowSettings] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("cat");

  // 加载设置
  useEffect(() => {
    browser.storage.local
      .get(["storage-mode", "initial-position"])
      .then((result) => {
        if (result["storage-mode"]) {
          setStorageMode(result["storage-mode"]);
        }
        if (result["initial-position"]) {
          setInitialPosition(result["initial-position"]);
        }
      });
  }, []);

  // 保存设置
  const handleStorageModeChange = async (mode: StorageMode) => {
    setStorageMode(mode);
    await browser.storage.local.set({ "storage-mode": mode });
    // 通知所有标签页重新加载宠物
    browser.tabs.query({}).then((tabs) => {
      tabs.forEach((tab) => {
        if (tab.id) {
          browser.tabs
            .sendMessage(tab.id, {
              action: "reload-pets",
            })
            .catch(() => {});
        }
      });
    });
  };

  // 保存初始位置设置
  const handleInitialPositionChange = async (position: InitialPosition) => {
    setInitialPosition(position);
    await browser.storage.local.set({ "initial-position": position });
  };

  const handlePetClick = async (pet: PetInfo) => {
    try {
      setClickedPet(pet.nameEn);

      const response = await browser.runtime.sendMessage({
        action: "create-pet",
        pet: {
          name: pet.nameEn,
          img: pet.img,
        },
      });

      // 检查响应
      if (response && !response.success) {
        console.error("Failed to create pet:", response.error);
        // 可以在这里显示错误提示给用户
        alert(
          `无法添加宠物：${
            response.error || "未知错误"
          }\n\n请确保已打开一个网页标签页。`
        );
      }

      setTimeout(() => setClickedPet(null), 500);
    } catch (error) {
      console.error("Error sending create-pet message:", error);
      // 显示用户友好的错误提示
      alert("无法添加宠物，请确保已打开一个网页标签页。");
      setClickedPet(null);
    }
  };

  // 清除所有宠物
  const handleClearAllPets = async () => {
    if (!confirm("确定要清除所有宠物吗？此操作不可恢复。")) {
      return;
    }

    try {
      // 获取当前存储模式
      const result = await browser.storage.local.get("storage-mode");
      const mode = result["storage-mode"] || "global";

      if (mode === "global") {
        // 清除全局存储
        await browser.storage.local.remove("global-pets");
      } else {
        // 清除所有按网站存储的宠物
        const allData = await browser.storage.local.get(null);
        const keysToRemove = Object.keys(allData).filter((key) =>
          key.startsWith("pets-")
        );
        if (keysToRemove.length > 0) {
          await browser.storage.local.remove(keysToRemove);
        }
      }

      // 通知所有标签页重新加载
      browser.tabs.query({}).then((tabs) => {
        tabs.forEach((tab) => {
          if (tab.id) {
            browser.tabs
              .sendMessage(tab.id, {
                action: "reload-pets",
              })
              .catch(() => {});
          }
        });
      });
    } catch (error) {
      console.error("Failed to clear pets:", error);
    }
  };

  return (
    <div className="popup-container">
      <div className="popup-header">
        <h1
          className="popup-title"
          onClick={() => {
            console.log("open options page", chrome.runtime.openOptionsPage);
            if (chrome.runtime.openOptionsPage) {
              chrome.runtime.openOptionsPage();
            } else {
              window.open(chrome.runtime.getURL("options.html"));
            }
          }}
        >
          <span className="title-icon">🐾</span>
          Browser Pets
        </h1>
        <p className="popup-subtitle">点击，为你添加可爱宠物</p>
      </div>

      <div className="category-tabs">
        {allPets.map((category) => (
          <button
            key={category.id}
            className={`category-tab ${
              selectedCategory === category.id ? "active" : ""
            }`}
            onClick={() => setSelectedCategory(category.id)}
          >
            <span>{category.name}</span>
          </button>
        ))}
      </div>

      <div className="pets-grid">
        {allPets
          .find((cat) => cat.id === selectedCategory)
          ?.pets.map((pet, index) => {
            const isClicked = clickedPet === pet.nameEn;
            return (
              <div
                key={index}
                className={`pet-card ${isClicked ? "pet-card-clicked" : ""}`}
                onClick={() => handlePetClick(pet)}
              >
                <div className="pet-image-wrapper">
                  <img src={pet.img} alt={pet.name} className="pet-image" />
                </div>
                <div className="pet-name">{pet.name}</div>
              </div>
            );
          })}
      </div>

      <div className="popup-footer">
        {/* 暂时隐藏设置功能 */}
        {/* <div className="settings-section">
          <div
            className="settings-toggle"
            onClick={() => setShowSettings(!showSettings)}
          >
            <span className="settings-icon">⚙️</span>
            <span>设置</span>
            <span className={`settings-arrow ${showSettings ? "open" : ""}`}>
              ▼
            </span>
          </div>
          {showSettings && (
            <div className="settings-content">
              <div className="settings-item">
                <label className="settings-label">存储方式</label>
                <div className="radio-group horizontal">
                  <label className="radio-option">
                    <input
                      type="radio"
                      name="storage-mode"
                      value="global"
                      checked={storageMode === "global"}
                      onChange={(e) =>
                        handleStorageModeChange(e.target.value as StorageMode)
                      }
                    />
                    <span>所有页面统一</span>
                  </label>
                  <label className="radio-option">
                    <input
                      type="radio"
                      name="storage-mode"
                      value="per-site"
                      checked={storageMode === "per-site"}
                      onChange={(e) =>
                        handleStorageModeChange(e.target.value as StorageMode)
                      }
                    />
                    <span>按网站存储</span>
                  </label>
                </div>
              </div>
              <div className="settings-item">
                <label className="settings-label">初始位置</label>
                <div className="radio-group horizontal">
                  <label className="radio-option">
                    <input
                      type="radio"
                      name="initial-position"
                      value="top"
                      checked={initialPosition === "top"}
                      onChange={(e) =>
                        handleInitialPositionChange(
                          e.target.value as InitialPosition
                        )
                      }
                    />
                    <span>顶部（落地）</span>
                  </label>
                  <label className="radio-option">
                    <input
                      type="radio"
                      name="initial-position"
                      value="bottom"
                      checked={initialPosition === "bottom"}
                      onChange={(e) =>
                        handleInitialPositionChange(
                          e.target.value as InitialPosition
                        )
                      }
                    />
                    <span>底部</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div> */}
        <div className="action-buttons">
          <button className="clear-all-btn" onClick={handleClearAllPets}>
            <span className="clear-icon">🗑️</span>
            清除所有宠物
          </button>
        </div>
        <div className="coming-soon">
          <span className="coming-soon-icon">✨</span>
          更多宠物即将加入
        </div>
        <div className="footer-hint">长按拖动宠物，右键点击可删除</div>
      </div>
    </div>
  );
}

export default App;
