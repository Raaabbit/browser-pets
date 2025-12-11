/*
 * @Author: Auto
 * @Date: 2025-01-XX
 * @Description: Type definitions for the Browser Pets extension
 */

// 存储模式类型
export type StorageMode = "global" | "per-site";

// 初始位置类型
export type InitialPosition = "top" | "bottom";

// 宠物数据类型
export interface PetData {
  id: string;
  name: string;
  img: string;
  type: string; // 宠物类型：chicken, cat, dog, pig
  left: number;
  bottom: number;
  direction: "left" | "right";
}

// 宠物信息类型（用于 popup）
export interface PetInfo {
  name: string;
  nameEn: string;
  img: string;
}

// 宠物分类类型
export interface PetCategory {
  id: string;
  name: string;
  pets: PetInfo[];
}

// 消息类型
export interface CreatePetMessage {
  action: "create-pet";
  pet: {
    name: string;
    img: string;
  };
}

export interface ReloadPetsMessage {
  action: "reload-pets";
}

export interface PingMessage {
  action: "ping";
}

export type ExtensionMessage =
  | CreatePetMessage
  | ReloadPetsMessage
  | PingMessage;

// 消息响应类型
export interface MessageResponse {
  success?: boolean;
  error?: string;
  ready?: boolean;
}
