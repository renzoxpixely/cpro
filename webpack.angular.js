// Generated using webpack-cli https://github.com/webpack/webpack-cli

const path = require('path');

const isProduction = process.env.NODE_ENV == 'production';


const config = {
    entry: ['./index.angular.js'],
//    context:path.resolve('src'),
    output: {
    globalObject: 'window',
	filename:'nubefa.angular.js',

        path: path.resolve(__dirname, 'dist'),
    },

	resolve:{
		extensions:['.js']
	},
    
};
config.output.libraryTarget="umd";

module.exports = () => {
    
    if (isProduction) {
        config.mode = 'production';
        
        
    } else {
        config.mode = 'development';
    }
    config.mode='production';
    return config;
};
