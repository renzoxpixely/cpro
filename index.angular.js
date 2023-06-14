
angular.module('productos-calculos', []).info({version: '1.1.7'}).factory('productosCalculos', ()=>{
  const Item=require('./src/item');
  const Total=require('./src/totales');
  return {
    Item, Total,
  };
});


