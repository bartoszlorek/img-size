var webpack = require('webpack');
var path = require('path');

module.exports = {
    entry: './src/img-size.js',
    output: {
        path: path.join(__dirname, 'dist'),
        filename: 'img-size.min.js'
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
        //new webpack.optimize.OccurrenceOrderPlugin()
    ]
}