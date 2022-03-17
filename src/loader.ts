/**
 *****************************************
 * Created by edonet@163.com
 * Created on 2021-06-19 12:44:16
 *****************************************
 */
'use strict';


/**
 *****************************************
 * 加载依赖
 *****************************************
 */
import { LoaderContext } from 'webpack';


/**
 *****************************************
 * 资源加载器
 *****************************************
 */
export interface AssetLoader {
    (context: LoaderContext<Assets>): AssetData | Promise<AssetData>;
}


/**
 *****************************************
 * 资源
 *****************************************
 */
export type AssetData = string | undefined | Buffer | Record<string, unknown>;
export type Asset = AssetData | AssetLoader | Promise<AssetData>;
export type Assets = Map<string, { path: string, data: Asset }>;


/**
 *****************************************
 * 添加拦截对象
 *****************************************
 */
export async function pitch(this: LoaderContext<Assets>): Promise<string> {
    let { data } = this.getOptions().get(this.resourcePath) || {};

    // 处理数据
    if (typeof data === 'function') {
        data = data.call(this, this);
    }

    // 处理异步延时
    if (data instanceof Promise) {
        data = await data;
    }

    // 返回源数据
    if (typeof data === 'string' || typeof data === 'undefined' || data instanceof Buffer) {
        return data as string;
    }

    // 格式化数据
    return `export default ${ JSON.stringify(data) }`;
}


/**
 *****************************************
 * 加载文件
 *****************************************
 */
export default function loader(source: string): string {
    return source;
}
