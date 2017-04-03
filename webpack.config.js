var webpack = require('webpack');
var path = require('path');

module.exports = {
    entry: './src/imageBinding.js',
    output: {
        path: path.join(__dirname, 'dist'),
        filename: 'img-size.min.js',
        library: 'imgSize',
        libraryTarget: 'umd'
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loaders: ['babel-loader']
            }
        ]
    },
    plugins: [
        new webpack.optimize.OccurrenceOrderPlugin()
    ]
}