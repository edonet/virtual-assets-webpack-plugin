/**
 *****************************************
 * Created by edonet@163.com
 * Created on 2022-03-17 10:52:15
 *****************************************
 */
'use strict';


/**
 *****************************************
 * 加载依赖
 *****************************************
 */
import { resolve } from 'path';
import { Volume } from 'memfs';
import { webpack } from 'webpack';
import { VirtualAssetsWebpackPlugin } from '../src';


/**
 *****************************************
 * 添加兼容钩子
 *****************************************
 */
global.setImmediate = setTimeout as unknown as typeof setImmediate;


/**
 *****************************************
 * 定义文件系统
 *****************************************
 */
const fs = Volume.fromJSON({
    '/data.json': '{"name": "data"}',
    '/style.css': '.app { color: red; }',
});



/**
 *****************************************
 * 测试模块
 *****************************************
 */
describe('virtaul', () => {
    test('生成虚拟模块', (done) => {
        const compiler = webpack({
            context: resolve('fixtures'),
            mode: 'production',
            target: 'node',
            entry: './index.js',
            output: {
                path: '/dist',
                filename: 'index.js',
                libraryTarget: 'commonjs2',
            },
            module: {
                rules: [{
                    test: /\.css$/,
                    use: [
                        'style-loader',
                        { loader: 'css-loader', options: { modules: true } },
                    ],
                }]
            },
            resolveLoader: {
                extensions: ['.ts', '.js'],
            },
            plugins: [
                new VirtualAssetsWebpackPlugin({
                    './data.json': () => fs.promises.readFile('/data.json'),
                    './index.css': () => fs.promises.readFile('/style.css'),
                }),
                new VirtualAssetsWebpackPlugin({
                    'virtual1': { name: 'virtual-1' },
                    'virtual2': { name: 'virtual-2' },
                    'virtual.css': '.vir { color: blue; }',
                    'virtual/style.css': '.vir { color: green; }',
                }),
            ],
        });

        // 更新输出文件系统
        compiler.outputFileSystem = fs;

        // 执行编译
        compiler.run((err, stats) => {

            // 执行失败
            if (err) {
                return console.error(err);
            }

            // 编译报告
            if (stats && stats.hasErrors()) {
                return console.error(stats.toString());
            }

            // 获取结果
            const result = fs.readFileSync('/dist/index.js', 'utf8');

            // console.log(result);

            // 校验内容
            expect(fs.readdirSync('/dist')).toEqual(['index.js']);
            expect(result.indexOf('{name:"data"}') > -1).toBe(true);
            expect(result.indexOf('{ color: red; }') > -1).toBe(true);
            expect(result.indexOf('{name:"virtual-1"}') > -1).toBe(true);
            expect(result.indexOf('{name:"virtual-2"}') > -1).toBe(true);
            expect(result.indexOf('{ color: blue; }') > -1).toBe(true);
            expect(result.indexOf('{ color: green; }') > -1).toBe(true);

            // 编译结束
            done();
        });
    });
});
