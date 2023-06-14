const {Item, Total} = require('../dist/react');

const producto = {
  'pro_nom': 'Agua cielo',
  'pro_id': 1,
  'pro_tip': 1,
  'categoria_producto': 1,
  'pro_fac': 1,
  'pro_cod': 'pro013',
  'pro_bar': '2154521564',
  'pst_id': {
    'id': 49,
    'pst_id': 'UND',
    'pst_nom': 'UNIDAD',
    'pst_snt': 'NIU',
  },
  'lpd_com': '2.8',
  'peso': '1.0000',
  'pro_ina': 0,
  'pro_igv': 0,
  'isc': 0,
  'pro_isc': 0,
  'pro_sal': '45.00',
  'pro_detraccion': 0,
  'pro_importacion': 0,
  'pro_cuenta_contable': {
    'id': 56,
    'descripcion': 'Mercaderia',
  },
  'presentacion_id': {
    'id': 49,
    'pst_id': 'UND',
    'pst_nom': 'UNIDAD',
    'pst_snt': 'NIU',
  },
  'lpd_fac': '1',
  'falso_monto': '2.8',
  'lpd_uti': 51.33,
  'lpd_vpre': 4.24,
  'lpd_porcentaje_igv': '18',
  'lpd_valor_igv': 0.76,
  'lpd_pre': 5,
  'ubicacion': null,
  'marca_id': null,
  'pro_peso': 1,
  'vd_can': 1,
  'aplicacion_id': null,
  'componentes': null,
  'cargasIniciales': null,
  'categoria_id': null,
  'funcion_medica': null,
  'producto_id': 1,
  'nombrePresentacion': 'UNIDADx1',
};

const servicio = {
  'pro_nom': 'Honorario Directivo',
  'pro_bar': null,
  'id': 23,
  'pro_cod': '9090',
  'lpd_fac': null,
  'pst_id': {
    'id': 49,
    'pst_id': 'UND',
    'pst_nom': 'UNIDAD',
    'pst_snt': 'NIU',
  },
  'peso': '0.0010',
  'marca_id': null,
  'funcion_medica': null,
  'categoria_id': null,
  'componentes': null,
  'aplicacion_id': null,
  'categoria_producto': 3,
  'pro_receta': 0,
  'pro_isc': 0,
  'pro_detraccion': 1,
  'pro_ina': 0,
  'cargasIniciales': null,
  'lpd_porcentaje_igv': 18,
  '$$hashKey': 'object:197',
  'producto_id': 23,
  'vd_can': 1,
  'lpd_pre': 59,
  'cc_id': {
    'id': 11,
    'local_id': 13,
    'empresa_id': 1,
    'description': 'Cuenta de Prueba',
    'cuenta_centro_costo': '{"d_h": "D", "cta_id": 101, "cta_nom": "Caja"}',
    'cuenta_cargos_imputable': '{"d_h": "H", "cta_id": 10111, "cta_nom": "Caja"}',
    'created_at': '2021-08-25 16:00:46',
    'updated_at': '2021-08-25 16:00:46',
    '$$hashKey': 'object:208',
  },
  'lpd_desc_val': 0,
  'lpd_desc_por': 0,
  'lpd_vpre': 1006.779661,
  'lpd_uti': null,
  'isc': 0,
  'lpd_valor_igv': 181.22033897999995,
  'falso_monto': null,
  'total_isc': 0,
  'total_lpd_vpre': 0,
  'total_lpd_valor_igv': 11.22033897999995,
};

const producto2 = {
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

const calculo = new Item({
  state: 'Ventas',
  detraccion: 1, // Porcentaje de detraccion de la empresa //solo ventas
});


producto.lpd_pre = 118;
producto.vd_can = 1;

const producto1 = calculo.watchItem(producto);
const producto3 = calculo.watchItem(producto);
const producto_test = calculo.watchItem(producto);


servicio.lpd_pre = 10;
const servicio1 = calculo.watchItem(servicio);
servicio.lpd_pre = 600;

const servicio2 = calculo.watchItem(servicio);

const total = new Total([servicio1, servicio2], {state: 'Compras', limite_detraccion: 700, descuento_global: 10}).handleItemList();


producto_test.lpd_pre = 118;

const total_descuento =
 new Total([producto_test],
     {
       state: 'Compras',
       limite_detraccion: 700,
       descuento_global: 1,
     }).handleItemList();

// console.log(servicio1);
console.log(total);
