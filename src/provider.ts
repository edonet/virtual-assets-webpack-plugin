/**
 *****************************************
 * Created by edonet@163.com
 * Created on 2022-03-17 08:49:59
 *****************************************
 */
'use strict';


/**
 *****************************************
 * 加载依赖
 *****************************************
 */
import { resolve, isAbsolute, extname } from 'path';
import { isRelative, resolveModuleDir } from './utils';
import { Asset, Provider } from './loader';


/**
 *****************************************
 * 资源集
 *****************************************
 */
type AssetDescription = { path: string, data: Asset, module?: boolean };
type Assets = Record<string, AssetDescription>;


/**
 *****************************************
 * 虚拟资源插件
 *****************************************
 */
export class VirtualAssetsProvider implements Provider {

    /** 资源上下文 */
    private context: string;

    /** 模块目录 */
    private moduleDir: string;

    /** 资源列表 */
    private assets: Assets = Object.create(null);

    /** 初始化插件 */
    public constructor(context: string) {

        // 设置上下文
        this.context = context;
        this.moduleDir = resolveModuleDir(context);

        // 绑定函数
        this.set = this.set.bind(this);
    }

    /** 判断是否存在资源 */
    public has(path: string): undefined | AssetDescription {
        return this.assets[path];
    }

    /** 设置资源 */
    public set(path: string, data: Asset): void {
        const asset = this.resolveAsset(path, data);

        // 添加资源映射
        this.assets[asset.path] = asset;

        // 添加模块映射
        if (asset.module) {
            this.assets[path] = asset;
        }
    }

    /** 获取资源 */
    public get(path: string): Asset | undefined {
        const asset = this.assets[path];

        // 存在资源
        if (asset) {
            return asset.data;
        }
    }

    /** 解析资源 */
    private resolveAsset(path: string, data: Asset): AssetDescription {

        // 处理相对路径
        if (isRelative(path)) {
            return { path: resolve(this.context, path), data };
        }

        // 处理绝对路径
        if (isAbsolute(path)) {
            return { path, data };
        }

        // 获取扩展名
        const ext = extname(path);

        // 添加
        if (!ext) {
            path += '.js';
        }

        // 处理模块
        return {
            path: resolve(this.moduleDir, path),
            data,
            module: true,
        };
    }
}
