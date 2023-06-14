
# ☁️ Librerias de Nubefa
# Como usar
## Importa
```
const {Item, Total} = require('../dist/react');
```

## Producto de Ejemplo
```
producto = {
  'cargasIniciales': null,
  'componentes': null,
  'categoria_producto': 1,
  'falso_monto': 2,
  'lpd_com': '2',
  'lpd_fac': '1',
  'lpd_porcentaje_igv': null,
  'lpd_pre': 30,
  'lpd_desc_por': 0,
  'lpd_uti': 1171.18645,
  'lpd_valor_igv': 4.576271,
  'lpd_vpre': 25.423729,
  'pro_peso': 0.66,
  'presentacion_id': {
    'id': 28,
    'pst_id': 'LT',
    'pst_nom': 'LITRO',
    'pst_snt': 'LTR',
    'presentacionFactor': 'LITROx1',
  },
  'pro_cod': '123323',
  'pro_bar': null,
  'pro_cuenta_contable': null,
  'pro_detraccion': null,
  'pro_fac': 1,
  'producto_id': 2390,
  'pro_igv': null,
  'pro_importacion': null,
  'pro_ina': null,
  'pro_isc': null,
  'pro_nom': 'Agua Mineral',
  'pro_sal': null,
  'pro_tip': null,
  '$$hashKey': 'object:268',
  'lpd_desc_val': 0,
  'isc': 0,
  'total_isc': 0,
  'total_lpd_vpre': 30,
  'total_lpd_valor_igv': 4.576271,
  'setTipAfeIgv': 10,
  'vd_can': 1,
  'ven_position_obj': 1,
};
```
## Instanciar El Objeto Item
```
const calculo = new Item({
  state: 'Ventas',
  detraccion: 7, //porcentaje de detraccion de la empresa
});
```

## Al Cambiar los montos del Producto
```
producto.lpd_pre = 118;
producto.vd_can = 1;
```
## function watchItem(producto)
```
const producto1 = calculo.watchItem(producto);
```

## Caso de Varios Productos
```
producto.lpd_pre = 59;
producto.vd_can = 1;
```
## function watchItem(producto) del segundo producto
```
const producto2 = calculo.watchItem(producto);
```

## Los Valores Totales 
##### instanciar el objeto Total
```
const total = new Total([producto1, producto2]).handleItemList();
```
```
console.log(total);
```
```

total = {
  getCantidadTotal: 2,
  getMontoTotal: 177,
  getMontoTotalDocumento: 150,
  getTotalInafecto: 0,
  getTotalAfecto: 150,
  getTotalIgv: 27,
  getTotalPeso: 1.32,
  getTotalPercepcion: 0,
  totalMercaderia: 150,
  totalMateriaPrima: 0,
  totalMateriales: 0,
  totalEmbalajes: 0,
  totalRepuestos: 0,
  totalEnvases: 0,
  totalSuministros: 0,
  totalServicioGasto: 0,
  MontoTotalDetraccion: 0,
  getTotalDetraccion: 0,
  getTotalDescuento: 0,
  getMontoDescuentoGlobal: 0,
  getTotalIsc: 0,
  showDetraccion: false,
  maxTipoCategoria: 1,
  tipoBien: 1
}
