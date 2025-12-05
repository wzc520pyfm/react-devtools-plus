/**
 * Graph module types for React DevTools
 * 模块依赖图类型定义
 */

import type { Edge, Node, Options } from 'vis-network'

/**
 * Module information from bundler
 * 来自打包器的模块信息
 */
export interface ModuleInfo {
  id: string
  deps: string[]
  virtual: boolean
}

/**
 * File type configuration with associated color
 * 文件类型配置及其关联颜色
 */
export interface FileTypeConfig {
  color: string
}

/**
 * File types color mapping
 * 文件类型颜色映射
 */
export const fileTypes: Record<string, FileTypeConfig> = {
  tsx: {
    color: '#4FC7FF',
  },
  jsx: {
    color: '#54B9D1',
  },
  ts: {
    color: '#3B86CB',
  },
  js: {
    color: '#d6cb2d',
  },
  json: {
    color: '#cf8f30',
  },
  css: {
    color: '#e6659a',
  },
  html: {
    color: '#e34c26',
  },
  other: {
    color: '#B86542',
  },
}

/**
 * File type display item
 * 文件类型展示项
 */
export interface FileTypeItem {
  key: string
  color: string
  capitalize: boolean
}

/**
 * Graph settings for filtering
 * 图表过滤设置
 */
export interface GraphSettings {
  node_modules: boolean
  virtual: boolean
  lib: boolean
}

/**
 * Searcher node for graph search
 * 图表搜索节点
 */
export interface SearcherNode {
  id: string
  fullId: string
  node: Node
  edges: Edge[]
  deps: string[]
}

/**
 * Graph node total data including module info
 * 图表节点完整数据，包含模块信息
 */
export interface GraphNodesTotalData {
  mod: ModuleInfo
  info: {
    displayName: string
    displayPath: string
  }
  node: Node
  edges: Edge[]
}

/**
 * Drawer data for selected node
 * 选中节点的抽屉数据
 */
export interface DrawerData {
  name: string
  path: string
  displayPath: string
  refs: Array<{ path: string, displayPath: string }>
  deps: Array<{ path: string, displayPath: string }>
}

/**
 * Default graph options for vis-network
 * vis-network 默认图表选项
 */
export function getGraphOptions(isDark: boolean): Options {
  return {
    nodes: {
      shape: 'dot',
      size: 16,
      font: {
        color: isDark ? '#fff' : '#000',
        multi: 'html',
      },
    },
    interaction: {
      hover: true,
    },
    physics: {
      maxVelocity: 146,
      solver: 'forceAtlas2Based',
      timestep: 0.35,
      stabilization: {
        enabled: true,
        iterations: 200,
      },
    },
    groups: fileTypes,
  }
}
