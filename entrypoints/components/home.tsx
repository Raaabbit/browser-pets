/*
 * @Author: yhyang001 yhyang001@mail.nfsq.com.cn
 * @Date: 2025-03-06 17:36:22
 * @LastEditors: Raaabbit Raaabbit@users.noreply.github.com
 * @LastEditTime: 2025-04-27 18:52:33
 * @FilePath: /pets/entrypoints/components/home.tsx
 * @Description: 所有宠物的容器
 */
// 一个容器，用于放置所有的 Pet，点击可以穿透

import { useState, useEffect } from "react";
import Pet from "@/entrypoints/components/pet";
import chickenAttrs from "@/assets/animals/chicken/attr.json";
import type { PetData, StorageMode } from "@/types";

const { petWidth, petHeight } = chickenAttrs;

const Home = () => {
  const [pets, setPets] = useState<PetData[]>([]);
  const [storageMode, setStorageMode] = useState<StorageMode>("global");

  // 获取存储 key
  const getStorageKey = () => {
    if (storageMode === "global") {
      return "global-pets";
    } else {
      // 按网站存储，使用 origin
      const origin = window.location.origin;
      return `pets-${origin}`;
    }
  };

  // 加载存储模式设置
  const loadStorageMode = async () => {
    try {
      const result = await browser.storage.local.get("storage-mode");
      if (result["storage-mode"]) {
        setStorageMode(result["storage-mode"]);
      }
    } catch (error) {
      console.error("Failed to load storage mode:", error);
    }
  };

  // 从存储加载宠物
  const loadPetsFromStorage = async () => {
    try {
      const storageKey = getStorageKey();
      const result = await browser.storage.local.get(storageKey);
      if (result[storageKey]) {
        setPets(result[storageKey]);
      } else {
        setPets([]);
      }
    } catch (error) {
      console.error("Failed to load pets from storage:", error);
    }
  };

  // 保存宠物到存储
  const savePetsToStorage = async (petsToSave: PetData[]) => {
    try {
      const storageKey = getStorageKey();
      await browser.storage.local.set({ [storageKey]: petsToSave });
    } catch (error) {
      console.error("Failed to save pets to storage:", error);
    }
  };

  // 初始化时加载设置和宠物
  useEffect(() => {
    loadStorageMode();
  }, []);

  // 当存储模式变化时重新加载宠物
  useEffect(() => {
    loadPetsFromStorage();
  }, [storageMode]);

  // 监听存储变化和设置变化
  useEffect(() => {
    const handleAllChanges = (
      changes: { [key: string]: any },
      areaName: string
    ) => {
      if (areaName !== "local") return;

      // 监听存储模式变化
      if (changes["storage-mode"]) {
        const newMode = changes["storage-mode"].newValue;
        setStorageMode(newMode);
        // 存储模式变化时，需要重新加载对应模式的宠物数据
        // 这个会在 storageMode 的 useEffect 中处理
        return;
      }

      // 监听宠物数据变化
      // 检查全局存储
      if (changes["global-pets"]) {
        setStorageMode((currentMode) => {
          if (currentMode === "global") {
            const newPets = changes["global-pets"].newValue;
            setPets(newPets || []);
          }
          return currentMode;
        });
      }

      // 检查当前网站的存储
      const currentOrigin = window.location.origin;
      const siteStorageKey = `pets-${currentOrigin}`;
      if (changes[siteStorageKey]) {
        setStorageMode((currentMode) => {
          if (currentMode === "per-site") {
            const newPets = changes[siteStorageKey].newValue;
            setPets(newPets || []);
          }
          return currentMode;
        });
      }
    };

    browser.storage.onChanged.addListener(handleAllChanges);

    // 清理监听器
    return () => {
      browser.storage.onChanged.removeListener(handleAllChanges);
    };
  }, []); // 空依赖数组，使用函数形式更新状态

  useEffect(() => {
    const handleCreatePet = (event: Event) => {
      try {
        const customEvent = event as CustomEvent;
        const pet = customEvent.detail;

        if (!pet || !pet.name) {
          console.warn("Invalid pet data received:", pet);
          return;
        }

        // 生成随机位置
        const maxLeft = Math.max(0, window.innerWidth - petWidth);
        const randomLeft = Math.random() * maxLeft;
        const randomBottom = 0; // 底部对齐
        const randomDirection = Math.random() < 0.5 ? "left" : "right";

        // 创建新宠物，使用时间戳作为唯一 ID
        const newPet: PetData = {
          id: `pet-${Date.now()}-${Math.random()}`,
          name: pet.name,
          img: pet.img,
          type: pet.name, // 使用 name 作为类型（chicken, cat, dog, pig）
          left: randomLeft,
          bottom: randomBottom,
          direction: randomDirection,
        };

        setPets((prevPets) => {
          const updatedPets = [...prevPets, newPet];
          // 异步保存，不阻塞 UI
          savePetsToStorage(updatedPets).catch((error) => {
            console.error("Failed to save pet to storage:", error);
          });
          return updatedPets;
        });
      } catch (error) {
        console.error("Error handling create-pet event:", error);
      }
    };

    const handleReloadPets = () => {
      loadStorageMode()
        .then(() => {
          return loadPetsFromStorage();
        })
        .catch((error) => {
          console.error("Error reloading pets:", error);
        });
    };

    // 在 document 上监听自定义事件
    document.addEventListener("create-pet", handleCreatePet);
    document.addEventListener("reload-pets", handleReloadPets);

    // 清理监听器
    return () => {
      document.removeEventListener("create-pet", handleCreatePet);
      document.removeEventListener("reload-pets", handleReloadPets);
    };
  }, []); // 空依赖数组，因为函数内部使用了 setPets 和 savePetsToStorage

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
      {pets.map((pet) => {
        return (
          <Pet
            key={pet.id}
            initPosition={{
              left: pet.left,
              bottom: pet.bottom,
              direction: pet.direction,
            }}
            petType={pet.type}
            onDelete={() => {
              setPets((prevPets) => {
                const updatedPets = prevPets.filter((p) => p.id !== pet.id);
                // 异步保存，不阻塞 UI
                savePetsToStorage(updatedPets).catch((error) => {
                  console.error("Failed to save pets after deletion:", error);
                });
                return updatedPets;
              });
            }}
            onPositionChange={(newPosition) => {
              setPets((prevPets) => {
                const updatedPets = prevPets.map((p) =>
                  p.id === pet.id
                    ? {
                        ...p,
                        left: newPosition.left,
                        bottom: newPosition.bottom,
                      }
                    : p
                );
                // 异步保存，不阻塞 UI
                savePetsToStorage(updatedPets).catch((error) => {
                  console.error(
                    "Failed to save pets after position change:",
                    error
                  );
                });
                return updatedPets;
              });
            }}
          />
        );
      })}
    </div>
  );
};

export default Home;
