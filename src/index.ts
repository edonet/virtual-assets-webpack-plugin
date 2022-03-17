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
import { resolve, isAbsolute } from 'path';
import { Compiler, Resolver } from 'webpack';
import { ResolveRequest, ResolveContext } from 'enhanced-resolve';
import { Asset } from './loader';


/**
 *****************************************
 * 加载器
 *****************************************
 */
export const loader = require.resolve('./loader');


/**
 *****************************************
 * 判断是否为相对路径
 *****************************************
 */
function isRelative(id: string): boolean {

    // 判断是否以 '.' 开头
    if (id.charAt(0) !== '.') {
        return false;
    }

    // 获取下一字符
    const ch = id.charAt(1);

    // 判断是否以 './' 开头
    if (id.length === 1 || ch === '/') {
        return true;
    }

    // 判断以 '../' 开头
    return ch === '.' && id.charAt(2) === '/';
}


/**
 *****************************************
 * 虚拟资源插件
 *****************************************
 */
export class VirtualAssetsWebpackPlugin {

    /** 插件描述 */
    protected descriptor = { name: 'virtual-assets-webpack-plugin' };

    /** 资源列表 */
    private assets: Map<string, { path: string, data: Asset }> = new Map();

    /** 初始化插件 */
    public constructor(assets?: Record<string, Asset>) {
        if (assets && typeof assets === 'object') {
            Object.keys(assets).forEach(key => this.set(key, assets[key]));
        }
    }

    /** 设置资源 */
    public set(path: string, data: Asset): void {

        // 处理绝对路径
        if (isAbsolute(path)) {
            this.assets.set(path, { path, data });
            return;
        }

        // 处理相对路径
        if (isRelative(path)) {
            const asset = { path: resolve(path), data };

            // 添加资源
            this.assets.set(asset.path, asset);
        } else {
            const asset = { path: resolve('node_modules', path + '.js'), data };

            // 添加资源
            this.assets.set(path, asset);
            this.assets.set(asset.path, asset);
        }
    }

    /** 应用插件 */
    public apply({ hooks, options }: Compiler): void {
        const plugins = options.resolve.plugins || [];

        // 添加资源解析器
        plugins.unshift(this.resolveAssets.bind(this));

        // 更新解析插件
        options.resolve.plugins = plugins;

        // 添加加载器
        hooks.afterEnvironment.tap(this.descriptor, () => {
            options.module.rules.push({
                test: id => this.assets.has(id),
                enforce: 'pre',
                loader,
                options: this.assets
            });
        });
    }

    /** 路径解析器 */
    private resolveAssets(resolver: Resolver): void {
        const assets = this.assets;
        const target = resolver.ensureHook('resolved');

        // 添加钩子回调
        resolver.getHook('described-resolve').tapAsync(this.descriptor, resolvePath);
        resolver.getHook('file').tapAsync(this.descriptor, resolvePath);

        // 解析路径
        function resolvePath(request: ResolveRequest, resolveContext: ResolveContext, callback: () => void): void {
            const innerRequest = request.request || request.path;

            // 不存在路径配置
            if (!innerRequest) {
                return callback();
            }

            // 获取资源
            const asset = assets.get(innerRequest);

            // 未匹配到资源
            if (!asset) {
                return callback();
            }

            // 执行回调
            resolver.doResolve(
                target,
                { ...request, path: asset.path },
                'existing virtual asset: ' + asset.path,
                resolveContext,
                callback
            );
        }
    }
}


/**
 *****************************************
 * 导出默认接口
 *****************************************
 */
export default VirtualAssetsWebpackPlugin;
