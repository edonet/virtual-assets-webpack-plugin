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
import { VirtualAssetsWebpackPlugin } from './src';


/**
 *****************************************
 * 测试模块
 *****************************************
 */
const fs = Volume.fromJSON({ '/data.json': '{"name": "data"}' });
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
    plugins: [
        new VirtualAssetsWebpackPlugin({
            'virtual-module': { name: 'virtual-module' },
            './fixtures/data.json': () => fs.promises.readFile('/data.json'),
        }),
    ]
});


fs.writeFileSync('/data.json', '{"name": "data"}');

compiler.outputFileSystem = fs;

new Promise<void>((resolve, reject) => {
    compiler.run((err, stats) => {

        // 处理错误信息
        if (err) {
            return reject(err);
        }

        console.log(stats?.toString());
        console.log(fs.readdirSync('/'));
        console.log(fs.readdirSync('/dist'));
        console.log('result:', fs.readFileSync('/dist/index.js', 'utf8'));
        resolve();
    });
});
