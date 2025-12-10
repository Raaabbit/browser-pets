import { useState, useEffect, useRef } from "react";

import walkChicken from "@/assets/animals/chicken/walk.gif";
import standChicken from "@/assets/animals/chicken/stand.gif";
import chickenAttrs from "@/assets/animals/chicken/attr.json";

const { petWidth, petHeight, speed } = chickenAttrs;

// 根据宠物类型获取资源（暂时所有宠物都使用 chicken 的资源）
const getPetResources = (petType: string) => {
  // 暂时所有宠物都使用 chicken 的资源
  return {
    walk: walkChicken,
    stand: standChicken,
    attrs: chickenAttrs,
  };
};

const Pet = ({
  initPosition = {
    left: 0,
    bottom: 0,
    direction: "right",
  },
  petType = "chicken",
  onDelete,
}: {
  initPosition: {
    left: number;
    bottom: number;
    direction: "left" | "right" | string;
  };
  petType?: string;
  onDelete?: () => void;
}) => {
  const resources = getPetResources(petType);
  // 移动方向
  const [direction, setDirection] = useState(initPosition.direction); // left | right
  const [isMoving, setIsMoving] = useState(true);

  const positionRef = useRef({
    left: initPosition.left,
    bottom: initPosition.bottom,
  });
  const lastTimeRef = useRef<number | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);

  useEffect(() => {
    const movePet = (timestamp: number) => {
      if (!lastTimeRef.current) {
        lastTimeRef.current = timestamp;
      }
      const deltaTime = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;

      if (isMoving) {
        let newPosition = { ...positionRef.current };
        const distance = speed * deltaTime;

        switch (direction) {
          case "right":
            newPosition.left += distance;
            if (newPosition.left + petWidth > window.innerWidth) {
              newPosition.left = window.innerWidth - petWidth;
              setDirection("left");
            }
            break;
          case "left":
            newPosition.left -= distance;
            if (newPosition.left <= 0) {
              newPosition.left = 0;
              setDirection("right");
            }
            break;
          default:
            break;
        }
        positionRef.current = newPosition;
        setPosition(newPosition);
      }
      animationFrameIdRef.current = requestAnimationFrame(movePet);
    };

    animationFrameIdRef.current = requestAnimationFrame(movePet);

    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [direction, isMoving]);

  const [position, setPosition] = useState(positionRef.current);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault(); // 阻止默认右键菜单
    if (onDelete) {
      onDelete();
    }
  };

  return (
    <div
      id="pet"
      style={{
        position: "fixed",
        bottom: position.bottom,
        left: position.left,
        zIndex: 9999,
        width: petWidth,
        height: petHeight,
        transform: direction === "left" ? "scaleX(-1)" : "none",
        pointerEvents: "auto",
      }}
      onClick={() => setIsMoving(!isMoving)}
      onContextMenu={handleContextMenu}
    >
      <img
        src={isMoving ? resources.walk : resources.stand}
        alt="pet"
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
};

export default Pet;
