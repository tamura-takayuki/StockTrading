/* 設定 */
global.mongo = { db: 'stock_bk', collection: 'stocks' };// DB
global.capitalS = 200000;// 資本
global.key = { target_flg : true };
global.outputDir = 'StockTrading/Simulate/data';
global.outputFile = 'StockTrading/Simulate/data/output.csv';
global.buyCsvFile = 'StockTrading/Simulate/buyCase-stock.csv';
// global.buyCaces = [// 買う指標

// 	/* 移動平均乖離率 */
// 	{
// 		'indicator': 'dv_rate_5d',
// 		'required': false,
// 		'value': -5,
// 		'inequality_sign': '<=',
// 	},
// 	{
// 		'indicator': 'dv_rate_5d',
// 		'required': false,
// 		'value': -7.5,
// 		'inequality_sign': '<=',
// 	},
// 	{
// 		'indicator': 'dv_rate_5d',
// 		'required': false,
// 		'value': -10,
// 		'inequality_sign': '<=',
// 	},
// 	{
// 		'indicator': 'dv_rate_5d',
// 		'required': false,
// 		'value': -15,
// 		'inequality_sign': '<=',
// 	},
// 	{
// 		'indicator': 'dv_rate_20d',
// 		'required': false,
// 		'value': -5,
// 		'inequality_sign': '<=',
// 	},
// 	{
// 		'indicator': 'dv_rate_20d',
// 		'required': false,
// 		'value': -7.5,
// 		'inequality_sign': '<=',
// 	},
// 	{
// 		'indicator': 'dv_rate_20d',
// 		'required': false,
// 		'value': -10,
// 		'inequality_sign': '<=',
// 	},
// 	{
// 		'indicator': 'dv_rate_20d',
// 		'required': false,
// 		'value': -15,
// 		'inequality_sign': '<=',
// 	},

// 	/* RSI */
// 	{
// 		'indicator': 'rsi_5d',
// 		'required': false,
// 		'value': 0.3,
// 		'inequality_sign': '<=',
// 	},
// 	{
// 		'indicator': 'rsi_5d',
// 		'required': false,
// 		'value': 0.2,
// 		'inequality_sign': '<=',
// 	},
// 	{
// 		'indicator': 'rsi_5d',
// 		'required': false,
// 		'value': 0.1,
// 		'inequality_sign': '<=',
// 	},
// 	{
// 		'indicator': 'rsi_20d',
// 		'required': false,
// 		'value': 0.3,
// 		'inequality_sign': '<=',
// 	},
// 	{
// 		'indicator': 'rsi_20d',
// 		'required': false,
// 		'value': 0.2,
// 		'inequality_sign': '<=',
// 	},
// 	{
// 		'indicator': 'rsi_20d',
// 		'required': false,
// 		'value': 0.1,
// 		'inequality_sign': '<=',
// 	},

// 	/* ボリンジャーバンド */
// 	{
// 		'indicator': 'bri_5d',
// 		'required': false,
// 		'value': -1,
// 		'inequality_sign': '<=',
// 	},
// 	{
// 		'indicator': 'bri_5d',
// 		'required': false,
// 		'value': -2,
// 		'inequality_sign': '<=',
// 	},
// 	{
// 		'indicator': 'bri_20d',
// 		'required': false,
// 		'value': -1,
// 		'inequality_sign': '<=',
// 	},
// 	{
// 		'indicator': 'bri_20d',
// 		'required': false,
// 		'value': -2,
// 		'inequality_sign': '<=',
// 	},
// ];
