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

const { petWidth, petHeight } = chickenAttrs;

interface PetData {
  id: string;
  name: string;
  img: string;
  type: string; // 宠物类型：chicken, cat, dog, pig
  left: number;
  bottom: number;
  direction: "left" | "right";
}

const Home = () => {
  const [pets, setPets] = useState<PetData[]>([]);
  const [storageMode, setStorageMode] = useState<"global" | "per-site">(
    "global"
  );

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
        setStorageMode(changes["storage-mode"].newValue);
      }

      // 监听宠物数据变化（需要检查当前存储模式对应的 key）
      const currentStorageKey = getStorageKey();
      if (changes[currentStorageKey]) {
        const newPets = changes[currentStorageKey].newValue;
        if (newPets) {
          setPets(newPets);
        } else {
          setPets([]);
        }
      }
    };

    browser.storage.onChanged.addListener(handleAllChanges);

    // 清理监听器
    return () => {
      browser.storage.onChanged.removeListener(handleAllChanges);
    };
  }, [storageMode]);

  useEffect(() => {
    const handleCreatePet = (event: Event) => {
      const customEvent = event as CustomEvent;
      const pet = customEvent.detail;
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
        savePetsToStorage(updatedPets);
        return updatedPets;
      });
    };

    const handleReloadPets = () => {
      loadStorageMode().then(() => {
        loadPetsFromStorage();
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
  }, []);

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
                savePetsToStorage(updatedPets);
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
