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
import { Compiler, Resolver } from 'webpack';
import { ResolveRequest, ResolveContext } from 'enhanced-resolve';
import { VirtualAssetsProvider } from './provider';
import { Asset, AssetLoader, AssetContext, AssetData } from './loader';


/**
 *****************************************
 * 加载器
 *****************************************
 */
export const loader = require.resolve('./loader');


/**
 *****************************************
 * 资源编译器
 *****************************************
 */
interface AssetsCompiler extends Compiler {
    $$virtualAssetsProvider?: VirtualAssetsProvider;
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
    private assets: Map<string, Asset> = new Map();

    /** 资源列表 */
    private provider!: VirtualAssetsProvider;

    /** 初始化插件 */
    public constructor(assets?: Record<string, Asset>) {
        if (assets && typeof assets === 'object') {
            Object.keys(assets).forEach(key => this.assets.set(key, assets[key]));
        }
    }

    /** 设置资源 */
    public set(path: string, asset: Asset): void {
        this.assets.set(path, asset);
    }

    /** 应用插件 */
    public apply(compiler: AssetsCompiler): void {
        const provider = compiler.$$virtualAssetsProvider || this.generateAssetsProvider(compiler);
        const { set } = provider;

        // 更新接口
        this.set = set;
        this.provider = provider;

        // 处理资源
        this.assets.forEach((asset, path) => set(path, asset));
        this.assets.clear();
    }

    /** 路径解析器 */
    private resolveAssets(resolver: Resolver): void {
        const target = resolver.ensureHook('resolved');
        const provider = this.provider;

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
            const asset = provider.has(innerRequest);

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

    /** 生成资源供给器 */
    private generateAssetsProvider(compiler: AssetsCompiler): VirtualAssetsProvider {
        const { context, hooks, options } = compiler;
        const provider = new VirtualAssetsProvider(context);
        const plugins = options.resolve.plugins || [];

        // 添加资源解析器
        plugins.unshift(this.resolveAssets.bind(this));

        // 更新解析插件
        options.resolve.plugins = plugins;

        // 添加加载器
        hooks.afterEnvironment.tap(this.descriptor, () => {
            options.module.rules.push({
                test: id => !!provider.has(id),
                enforce: 'pre',
                loader,
                options: provider
            });
        });

        // 返回对象
        return compiler.$$virtualAssetsProvider = provider;
    }
}


/**
 *****************************************
 * 导出类型
 *****************************************
 */
export type { Asset, AssetLoader, AssetContext, AssetData };


/**
 *****************************************
 * 导出接口
 *****************************************
 */
export default VirtualAssetsWebpackPlugin;
