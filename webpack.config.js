// output.pathに絶対パスを指定する必要があるため、pathモジュールを読み込んでおく
const path = require('path');

const HtmlPlugin = require("html-webpack-plugin");

// 'production' か 'development' を指定
const MODE = "development";
// ソースマップの利用有無(productionのときはソースマップを利用しない)
const enabledSourceMap = MODE === "development";

module.exports = {
    // モードの設定、v4系以降はmodeを指定しないと、webpack実行時に警告が出る
    mode: 'development',
    // エントリーポイントの設定
    entry: './src/ts/index.ts',

    devtool: 'inline-source-map',

    // 出力の設定
    output: {
        // 出力するファイル名
        filename: 'index.js',
        // 出力先のパス（絶対パスを指定する必要がある）
        path: path.join(__dirname, './dist')
    },
    // ローダーの設定
    module: {
        rules: [
            {
                // ローダーの処理対象ファイル
                test: /\.ts$/,
                // ローダーの処理対象から外すディレクトリ
                exclude: /node_modules/,
                use: [
                    { loader: 'ts-loader' },
                    { loader: 'tslint-loader'}
                ]
            },
            {
                test: /\.html$/,
                exclude: /node_modules/,
                use: [
                    {loader: 'html-loader'}
                ]
            },
            // Sassファイルの読み込みとコンパイル
            {
                test: /\.scss/, // 対象となるファイルの拡張子
                // ローダー名
                use: [
                    // linkタグに出力する機能
                    "style-loader",
                    // CSSをバンドルするための機能
                    {
                        loader: "css-loader",
                        options: {
                            // オプションでCSS内のurl()メソッドを取り込む
                            url: true,
                            // ソースマップの利用有無
                            sourceMap: enabledSourceMap,

                            // 0 => no loaders (default);
                            // 1 => postcss-loader;
                            // 2 => postcss-loader, sass-loader
                            importLoaders: 2
                        }
                    },
                    // Sassをバンドルするための機能
                    {
                        loader: "sass-loader",
                        options: {
                            // ソースマップの利用有無
                            sourceMap: enabledSourceMap
                        }
                    }
                ]
            },
        ]
    },
    resolve: {
        extensions: ['.ts', '.js']
    },

    plugins: [
        new HtmlPlugin({ template: 'src/index.html' })
    ]
};