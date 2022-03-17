# virtual-assets-webpack-plugin
A webpack plugin for dynamical generation assets content!

## Install
``` shell
yarn add virtual-assets-webpack-plugin
```

## Usage
Add plugin in `webpack.config.js`:
``` typescript
import { VirtualAssetsWebpackPlugin } from 'virtual-assets-webpack-plugin';

export default {
    // ...
    plugins: [
        new VirtualAssetsWebpackPlugin({
            './fixtures/data.json': () => fs.promises.readFile('/data.json'),
            './fixtures/index.css': () => fs.promises.readFile('/style.css'),
            'virtual1': { name: 'virtual-1' },
            'virtual2': { name: 'virtual-2' },
        }),
    ],
};
```
Usage in code `./fixtures/index.js`:
``` typescript
import virtual1 from 'virtual1';
import virtual2 from '../node_modules/virtual2';
import data from './data';
import style from './index.css';

// ...
console.log(data, style, virtual1, virtual2);
```

## API
Usage [`loaderContext`](https://webpack.js.org/api/loaders/#the-loader-context):
``` typescript
import { LoaderContext } from 'webpack';
import { Assets, VirtualAssetsWebpackPlugin } from 'virtual-assets-webpack-plugin';

// icons loader
function icons(loaderContext: LoaderContext<Assets>): Promise<string[]> {

    // add dependency
    loaderContext.addContextDependency('/path/to/dir');
    loaderContext.addDependency('/path/to/file');

    // emit file
    loaderContext.emitFile('custom-asset', 'asset content as Buffer|string');

    // return content
    return fs.promises.readdir('./icons');
}

// webpack configuration
export default {
    // ...
    plugins: [
        new VirtualAssetsWebpackPlugin({ icons }),
    ],
};
```
