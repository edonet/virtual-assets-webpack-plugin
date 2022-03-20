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
 * 资源供给器
 *****************************************
 */
export interface Provider {

    /** 添加资源 */
    set(path: string, asset: Asset): void;

    /** 获取资源 */
    get(path: string): undefined | Asset;
}


/**
 *****************************************
 * 资源
 *****************************************
 */
export type AssetContext = LoaderContext<Provider>;
export type AssetData = string | undefined | Buffer | boolean | number | unknown[] | Record<string, unknown>;
export type AssetLoader = (this: AssetContext, context: AssetContext) => AssetData | Promise<AssetData>;
export type Asset = AssetData | AssetLoader | Promise<AssetData>;


/**
 *****************************************
 * 添加拦截对象
 *****************************************
 */
export async function pitch(this: AssetContext): Promise<string> {
    let data = this.getOptions().get(this.resourcePath);

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
