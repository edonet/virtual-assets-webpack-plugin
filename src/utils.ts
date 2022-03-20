/**
 *****************************************
 * Created by edonet@163.com
 * Created on 2022-03-20 12:34:08
 *****************************************
 */
'use strict';


/**
 *****************************************
 * 加载依赖
 *****************************************
 */
import * as fs from 'fs';
import * as path from 'path';


/**
 *****************************************
 * 判断是否为相对路径
 *****************************************
 */
export function isRelative(id: string): boolean {

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
 * 判断是否为目录
 *****************************************
 */
export function isDirectory(id: string): string | undefined {
    const stats = fs.statSync(id, { throwIfNoEntry: false });

    // 存在目录
    if (stats && stats.isDirectory()) {
        return id;
    }
}


/**
 *****************************************
 * 获取上级目录
 *****************************************
 */
export function dirname(from: string): string | undefined {
    const dir = path.dirname(from);

    // 返回路径
    if (dir !== from) {
        return dir;
    }
}


/**
 *****************************************
 * 解析模块目录
 *****************************************
 */
export function resolveModuleDir(from: string): string {
    let dir: string | undefined = from;

    // 查找目录
    while (dir) {
        const result = isDirectory(path.join(dir, 'node_modules'));

        // 存在目录
        if (result) {
            return result;
        }

        // 获取上级路径
        dir = dirname(dir);
    }

    // 返回默认路径
    return path.join(from, 'node_modules');
}
