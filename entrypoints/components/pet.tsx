import { useState, useEffect, useRef } from "react";
import Draggable, { DraggableData, DraggableEvent } from "react-draggable";

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
  onPositionChange,
}: {
  initPosition: {
    left: number;
    bottom: number;
    direction: "left" | "right" | string;
  };
  petType?: string;
  onDelete?: () => void;
  onPositionChange?: (position: { left: number; bottom: number }) => void;
}) => {
  const resources = getPetResources(petType);
  // 移动方向
  const [direction, setDirection] = useState(initPosition.direction); // left | right
  const [isMoving, setIsMoving] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [isFalling, setIsFalling] = useState(false);

  const positionRef = useRef({
    left: initPosition.left,
    bottom: initPosition.bottom,
  });
  const lastTimeRef = useRef<number | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);

  // 拖拽相关 ref
  const wasMovingBeforeDragRef = useRef(false);
  const dragStartPositionRef = useRef<{ left: number; bottom: number } | null>(
    null
  );
  const hasDraggedRef = useRef(false);

  // 落地动画相关 ref
  const fallAnimationFrameIdRef = useRef<number | null>(null);
  const fallStartBottomRef = useRef<number>(0);

  // Draggable 的位置状态（使用 x, y 坐标，但我们需要转换为 left, bottom）
  const [draggablePosition, setDraggablePosition] = useState({
    x: initPosition.left,
    y: window.innerHeight - initPosition.bottom - petHeight, // 转换为 top 坐标
  });

  // 初始化时如果需要落地，启动落地动画
  // 如果 bottom > 0，说明在顶部或半空，需要落地到底部
  useEffect(() => {
    if (initPosition.bottom > 0) {
      // 记录初始移动状态（落地完成后应该开始移动）
      wasMovingBeforeDragRef.current = true;
      // 初始化时先不移动，等落地完成后再移动
      setIsMoving(false);
      // 延迟一小段时间再开始落地，让宠物先显示出来
      const timer = setTimeout(() => {
        setIsFalling(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [initPosition.bottom]);

  // 同步 draggablePosition 到 positionRef
  useEffect(() => {
    const bottom = window.innerHeight - draggablePosition.y - petHeight;
    positionRef.current = {
      left: draggablePosition.x,
      bottom: Math.max(0, bottom),
    };
    setPosition(positionRef.current);
  }, [draggablePosition]);

  useEffect(() => {
    const movePet = (timestamp: number) => {
      if (!lastTimeRef.current) {
        lastTimeRef.current = timestamp;
      }
      const deltaTime = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;

      // 拖拽时或落地动画时不执行自动移动
      if (isMoving && !isDragging && !isFalling) {
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
        // 同步到 draggablePosition
        setDraggablePosition({
          x: newPosition.left,
          y: window.innerHeight - newPosition.bottom - petHeight,
        });
      }
      animationFrameIdRef.current = requestAnimationFrame(movePet);
    };

    animationFrameIdRef.current = requestAnimationFrame(movePet);

    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [direction, isMoving, isDragging, isFalling]);

  const [position, setPosition] = useState(positionRef.current);

  // 落地动画
  useEffect(() => {
    if (!isFalling) return;

    const fallSpeed = 0.3; // 落地速度（像素/毫秒）
    const startTime = performance.now();
    fallStartBottomRef.current = positionRef.current.bottom;

    const animateFall = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const distance = fallSpeed * elapsed;
      const newBottom = Math.max(0, fallStartBottomRef.current - distance);

      if (newBottom <= 0) {
        // 落地完成
        positionRef.current.bottom = 0;
        positionRef.current.left = positionRef.current.left; // 保持水平位置
        setPosition({ ...positionRef.current });
        setIsFalling(false);
        // 恢复移动状态
        setIsMoving(wasMovingBeforeDragRef.current);
        // 同步到 draggablePosition
        setDraggablePosition({
          x: positionRef.current.left,
          y: window.innerHeight - petHeight,
        });
        if (onPositionChange) {
          onPositionChange({ ...positionRef.current });
        }
      } else {
        positionRef.current.bottom = newBottom;
        setPosition({ ...positionRef.current });
        // 同步到 draggablePosition
        setDraggablePosition({
          x: positionRef.current.left,
          y: window.innerHeight - newBottom - petHeight,
        });
        fallAnimationFrameIdRef.current = requestAnimationFrame(animateFall);
      }
    };

    fallAnimationFrameIdRef.current = requestAnimationFrame(animateFall);

    return () => {
      if (fallAnimationFrameIdRef.current) {
        cancelAnimationFrame(fallAnimationFrameIdRef.current);
      }
    };
  }, [isFalling, onPositionChange]);

  // 拖拽开始
  const handleDragStart = (e: DraggableEvent, data: DraggableData) => {
    wasMovingBeforeDragRef.current = isMoving;
    setIsMoving(false); // 拖拽时暂停移动
    setIsDragging(true);
    hasDraggedRef.current = false;
    dragStartPositionRef.current = {
      left: positionRef.current.left,
      bottom: positionRef.current.bottom,
    };
  };

  // 拖拽中
  const handleDrag = (e: DraggableEvent, data: DraggableData) => {
    hasDraggedRef.current = true;

    // 限制在窗口范围内
    const newX = Math.max(0, Math.min(data.x, window.innerWidth - petWidth));
    const newY = Math.max(0, Math.min(data.y, window.innerHeight - petHeight));

    // 更新位置，但不要直接设置 draggablePosition，让 react-draggable 控制
    // 我们需要同步更新 positionRef
    const newBottom = window.innerHeight - newY - petHeight;
    positionRef.current = {
      left: newX,
      bottom: Math.max(0, newBottom),
    };
    setPosition(positionRef.current);

    // 根据移动方向更新宠物朝向
    if (data.deltaX > 0) {
      setDirection("right");
    } else if (data.deltaX < 0) {
      setDirection("left");
    }
  };

  // 拖拽结束
  const handleDragStop = (e: DraggableEvent, data: DraggableData) => {
    setIsDragging(false);

    // 更新最终位置
    const newX = Math.max(0, Math.min(data.x, window.innerWidth - petWidth));
    const newY = Math.max(0, Math.min(data.y, window.innerHeight - petHeight));
    const newBottom = window.innerHeight - newY - petHeight;

    positionRef.current = {
      left: newX,
      bottom: Math.max(0, newBottom),
    };
    setPosition(positionRef.current);
    setDraggablePosition({ x: newX, y: newY });

    // 如果移动距离很小，认为是点击而不是拖拽
    if (
      !hasDraggedRef.current ||
      (dragStartPositionRef.current &&
        Math.abs(dragStartPositionRef.current.left - positionRef.current.left) <
          5 &&
        Math.abs(
          dragStartPositionRef.current.bottom - positionRef.current.bottom
        ) < 5)
    ) {
      // 恢复移动状态
      setIsMoving(wasMovingBeforeDragRef.current);
      dragStartPositionRef.current = null;
      hasDraggedRef.current = false;
      return;
    }

    dragStartPositionRef.current = null;
    hasDraggedRef.current = false;

    // 如果释放时在半空（bottom > 0），开始落地动画
    if (positionRef.current.bottom > 0) {
      setIsFalling(true);
    } else {
      // 恢复移动状态
      setIsMoving(wasMovingBeforeDragRef.current);
      if (onPositionChange) {
        onPositionChange({ ...positionRef.current });
      }
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault(); // 阻止默认右键菜单
    if (onDelete) {
      onDelete();
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    // 如果正在拖拽或落地，不触发点击切换移动状态
    if (isDragging || isFalling || hasDraggedRef.current) {
      e.stopPropagation();
      return;
    }
    setIsMoving(!isMoving);
  };

  const nodeRef = useRef<HTMLDivElement>(null);
  const [bounds, setBounds] = useState({
    left: 0,
    top: 0,
    right: window.innerWidth - petWidth,
    bottom: window.innerHeight - petHeight,
  });

  // 更新 bounds 和处理窗口大小变化
  useEffect(() => {
    const handleResize = () => {
      // 更新 bounds
      setBounds({
        left: 0,
        top: 0,
        right: window.innerWidth - petWidth,
        bottom: window.innerHeight - petHeight,
      });

      // 确保位置在窗口范围内
      const newX = Math.max(
        0,
        Math.min(positionRef.current.left, window.innerWidth - petWidth)
      );
      const newY = Math.max(
        0,
        Math.min(
          window.innerHeight - positionRef.current.bottom - petHeight,
          window.innerHeight - petHeight
        )
      );
      setDraggablePosition({ x: newX, y: newY });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 确保 react-draggable 使用 fixed 定位
  useEffect(() => {
    if (nodeRef.current) {
      const element = nodeRef.current;
      // 强制设置 position: fixed
      if (element.style.position !== "fixed") {
        element.style.position = "fixed";
      }
    }
  });

  return (
    <Draggable
      nodeRef={nodeRef}
      position={draggablePosition}
      onStart={handleDragStart}
      onDrag={handleDrag}
      onStop={handleDragStop}
      handle=".pet-drag-handle"
      bounds={bounds}
      cancel=".pet-no-drag"
      defaultClassName="pet-draggable"
      defaultClassNameDragging="pet-dragging"
    >
      <div
        ref={nodeRef}
        id="pet"
        className="pet-drag-handle"
        style={{
          position: "fixed",
          zIndex: 9999,
          width: petWidth,
          height: petHeight,
          pointerEvents: "auto",
          cursor: isDragging ? "grabbing" : "grab",
          userSelect: "none",
        }}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
      >
        <img
          src={
            isMoving && !isDragging && !isFalling
              ? resources.walk
              : resources.stand
          }
          alt="pet"
          className="pet-no-drag"
          style={{
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            transform: direction === "left" ? "scaleX(-1)" : "none",
          }}
        />
      </div>
    </Draggable>
  );
};

export default Pet;
