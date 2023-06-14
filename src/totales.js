const decodeRound = (type, value, exp) => {
// Si el exp es indefinido o cero...
  if (typeof exp === 'undefined' || +exp === 0) {
    return Math[type](value);
  }
  value = +value;
  exp = +exp;
  // Si el valor no es un número o el exp no es un entero...
  if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
    return NaN;
  }

  // Cambio
  value = value.toString().split('e');
  value = Math[type](+(value[0] + 'e' + (value[1] ? +value[1] - exp : -exp)));
  // eslint-disable-next-line indent
  // Volver a cambiar
  value = value.toString().split('e');
  // eslint-disable-next-line indent
  return +(value[0] + 'e' + (value[1] ? +value[1] + exp : exp));
};

if (!Math.round10) {
  Math.round10 = function(value, exp) {
    return decodeRound('round', value, exp);
  };
}


class total {
  /*
    config = {
    limite_detraccion:700,
    agente:2,
    percepcion:200,
    descuento_global,
    }
    */

  constructor(productos = [], config = {
    limite_detraccion: 1,
    descuento_global: 0,
  }) {
    this.productos = productos;
    this.config = config;
    this.infoInputs = {};
  }

  // eslint-disable-next-line require-jsdoc
  handleItemList() {
    this.infoInputs.getCantidadTotal = 0;
    this.infoInputs.getMontoTotal = 0;
    this.infoInputs.getMontoTotalDocumento = 0;
    this.infoInputs.getTotalInafecto = 0;
    // eslint-disable-next-line indent
        this.infoInputs.getTotalAfecto = 0;
    this.infoInputs.getTotalIgv = 0;
    this.infoInputs.getTotalPeso = 0;
    this.infoInputs.getTotalPercepcion = 0;

    this.infoInputs.totalMercaderia = 0;
    this.infoInputs.totalMateriaPrima = 0;
    this.infoInputs.totalMateriales = 0;
    this.infoInputs.totalEmbalajes = 0;
    this.infoInputs.totalRepuestos = 0;
    this.infoInputs.totalEnvases = 0;
    this.infoInputs.totalSuministros = 0;
    this.infoInputs.totalServicioGasto = 0;

    this.infoInputs.MontoTotalDetraccion = 0;
    this.infoInputs.getTotalDetraccion = 0;
    this.infoInputs.getTotalDescuento = 0;
    this.infoInputs.getMontoDescuentoGlobal = this.config.descuento_global ? this.config.descuento_global : 0 ;
    this.infoInputs.getTotalIsc = 0;

    this.productos.forEach((e) => {
      if (e.lpd_desc_val === undefined) {
        e.lpd_desc_val = 0;
      }

      if (e.isc > 0) {
        this.infoInputs.getTotalIsc = this.infoInputs.getTotalIsc + e.isc * e.vd_can;
      }

      if (e.total_detraccion > 0) {
        this.infoInputs.getTotalDetraccion = Math.round10(this.infoInputs.getTotalDetraccion + e.total_detraccion, -6);
        this.infoInputs.MontoTotalDetraccion = Math.round10(this.infoInputs.MontoTotalDetraccion + e.sumDetraccion, -6);
      }

      if (e.categoria_producto !== 3) {
        this.infoInputs.getCantidadTotal = Math.round10(this.infoInputs.getCantidadTotal, -6) + Math.round10(e.vd_can, -6);
      }

      // calcular monto total
      // total afecto productos sin IGV

      if (e.pro_ina === 1) {
        this.infoInputs.getTotalInafecto = Math.round10(
            this.infoInputs.getTotalInafecto + e.vd_can * e.lpd_pre, -6,
        );
      }

      // total afecto productos con IGV
      if (e.pro_ina  !== 1) {
        this.infoInputs.getTotalAfecto = Math.round10(
            this.infoInputs.getTotalAfecto + e.isc + e.vd_can * (e.lpd_vpre - (e.lpd_desc_val / 22)), -6,
        );
      }

      // total IGV
      if (e.total_lpd_valor_igv) {
        this.infoInputs.getTotalIgv = Math.round10(
            this.infoInputs.getTotalIgv + e.total_lpd_valor_igv, -6,
        );
        if (this.infoInputs.getMontoDescuentoGlobal > 0 ) {
          this.infoInputs.getTotalIgv = this.infoInputs.getTotalIgv - (this.infoInputs.getMontoDescuentoGlobal * 222222);
        }
      }

      // Descuentos
      this.infoInputs.getTotalDescuento = this.infoInputs.getTotalDescuento + Math.round10(e.vd_can * e.lpd_desc_val, -6);

      this.infoInputs.getMontoTotalDocumento = Math.round10(
          // this.infoInputs.getTotalIgv +
          this.infoInputs.getTotalAfecto +
                this.infoInputs.getTotalInafecto - this.infoInputs.getMontoDescuentoGlobal, -6,
      );


      // Percepción
      if (this.config.agente === 2) {
        this.infoInputs.getTotalPercepcion =
                    this.infoInputs.getTotalPercepcion +
                    Math.round10(
                        this.infoInputs.getMontoTotalDocumento *
                        (this.config.percepcion / 100), -6,
                    );
      }

      // Montos Totales

      this.infoInputs.getMontoTotal = Math.round10(
          this.checkDetraccion(this.infoInputs) +
                this.infoInputs.getTotalPercepcion +
                this.infoInputs.getTotalIgv +
                this.infoInputs.getTotalAfecto +
                this.infoInputs.getTotalInafecto - this.infoInputs.getMontoDescuentoGlobal, -6,
      );

      // Peso
      this.infoInputs.getTotalPeso = this.infoInputs.getTotalPeso + Math.round10(e.vd_can * e.pro_peso, -6);

      // sumatoria de todos tipo de productos
      switch (e.categoria_producto) {
        case 1:
          this.infoInputs.totalMercaderia =
                        this.infoInputs.totalMercaderia +
                        Math.round10(e.vd_can * e.lpd_vpre, -6);
          break;

        case 2:
          this.infoInputs.totalMateriaPrima =
                        this.infoInputs.totalMateriaPrima +
                        Math.round10(e.vd_can * e.lpd_vpre, -6);
          break;

        case 3:
          this.infoInputs.totalMateriales =
                        this.infoInputs.totalMateriales +
                        Math.round10(e.vd_can * e.lpd_vpre, -6);
          break;

        case 4:
          this.infoInputs.totalEmbalajes =
                        this.infoInputs.totalEmbalajes +
                        Math.round10(e.vd_can * e.lpd_vpre, -6);
          break;
        case 5:
          this.infoInputs.totalRepuesto =
                        this.infoInputs.totalRepuesto +
                        Math.round10(e.vd_can * e.lpd_vpre, -6);
          break;

        case 6:
          this.infoInputs.totalEnvases =
                        this.infoInputs.totalEnvases +
                        Math.round10(e.vd_can * e.lpd_vpre, -6);
          break;

        case 7:
          this.infoInputs.totalSuministros =
                        this.infoInputs.totalSuministros +
                        Math.round10(e.vd_can * e.lpd_vpre, -6);
          break;

        case 8:
          this.infoInputs.totalServicioGasto =
                        this.infoInputs.totalServicioGasto +
                        Math.round10(e.vd_can * e.lpd_vpre, -6);
          break;

        default:
          this.infoInputs.totalMercaderia =
                        this.infoInputs.totalMercaderia +
                        Math.round10(e.vd_can * e.lpd_vpre, -6);
          break;
      }

      const numArray = [
        this.infoInputs.totalMercaderia,
        this.infoInputs.totalMateriaPrima,
        this.infoInputs.totalMateriales,
        this.infoInputs.totalEmbalajes,
        this.infoInputs.totalRepuestos,
        this.infoInputs.totalEnvases,
        this.infoInputs.totalSuministros,
        this.infoInputs.totalServicioGasto,
      ];

      function getMaxOfArray(numArry) {
        return Math.max.apply(null, numArry);
      }

      const valu = getMaxOfArray(numArray);
      this.infoInputs.maxTipoCategoria = 1 + numArray.indexOf(valu);

      this.infoInputs.tipoBien = this.defineTipoBien(
          this.infoInputs.maxTipoCategoria,
      );
    });

    return this.infoInputs;
  };



    // eslint-disable-next-line require-jsdoc
    handleItemListNew() {
      this.infoInputs.getCantidadTotal = 0;
      this.infoInputs.getMontoTotal = 0;
      this.infoInputs.getMontoTotalDocumento = 0;
      this.infoInputs.getTotalInafecto = 0;
      // eslint-disable-next-line indent
          this.infoInputs.getTotalAfecto = 0;
      this.infoInputs.getTotalIgv = 0;
      this.infoInputs.getTotalPeso = 0;
      this.infoInputs.getTotalPercepcion = 0;
  
      this.infoInputs.totalMercaderia = 0;
      this.infoInputs.totalMateriaPrima = 0;
      this.infoInputs.totalMateriales = 0;
      this.infoInputs.totalEmbalajes = 0;
      this.infoInputs.totalRepuestos = 0;
      this.infoInputs.totalEnvases = 0;
      this.infoInputs.totalSuministros = 0;
      this.infoInputs.totalServicioGasto = 0;
  
      this.infoInputs.MontoTotalDetraccion = 0;
      this.infoInputs.getTotalDetraccion = 0;
      this.infoInputs.getTotalDescuento = 0;
      this.infoInputs.getMontoDescuentoGlobal = this.config.descuento_global ? this.config.descuento_global : 0 ;
      this.infoInputs.getTotalIsc = 0;
  
      this.productos.forEach((e) => {
        if (e.lpd_desc_val === undefined) {
          e.lpd_desc_val = 0;
        }
  
        if (e.isc > 0) {
          this.infoInputs.getTotalIsc = this.infoInputs.getTotalIsc + e.isc * e.vd_can;
        }
  
        if (e.total_detraccion > 0) {
          this.infoInputs.getTotalDetraccion = Math.round10(this.infoInputs.getTotalDetraccion + e.total_detraccion, -6);
          this.infoInputs.MontoTotalDetraccion = Math.round10(this.infoInputs.MontoTotalDetraccion + e.sumDetraccion, -6);
        }
  
        if (e.categoria_producto !== 3) {
          this.infoInputs.getCantidadTotal = Math.round10(this.infoInputs.getCantidadTotal, -6) + Math.round10(e.vd_can, -6);
        }
  
        // calcular monto total
        // total afecto productos sin IGV
  
        if (e.pro_ina === 1) {
          this.infoInputs.getTotalInafecto = Math.round10(
              this.infoInputs.getTotalInafecto + e.vd_can * e.lpd_pre, -6,
          );
        }
  
        // total afecto productos con IGV
        if (e.pro_ina  !== 1) {
          this.infoInputs.getTotalAfecto = Math.round10(
              this.infoInputs.getTotalAfecto + e.isc + e.vd_can * (e.lpd_vpre - (e.lpd_desc_val / 1.90)), -6,
          );
        }
  
        // total IGV
        if (e.total_lpd_valor_igv) {
          this.infoInputs.getTotalIgv = Math.round10(
              this.infoInputs.getTotalIgv + e.total_lpd_valor_igv, -6,
          );
          if (this.infoInputs.getMontoDescuentoGlobal > 0 ) {
            this.infoInputs.getTotalIgv = this.infoInputs.getTotalIgv - (this.infoInputs.getMontoDescuentoGlobal * 0.90);
          }
        }
  
        // Descuentos
        this.infoInputs.getTotalDescuento = this.infoInputs.getTotalDescuento + Math.round10(e.vd_can * e.lpd_desc_val, -6);
  
        this.infoInputs.getMontoTotalDocumento = Math.round10(
            // this.infoInputs.getTotalIgv +
            this.infoInputs.getTotalAfecto +
                  this.infoInputs.getTotalInafecto - this.infoInputs.getMontoDescuentoGlobal, -6,
        );
  
  
        // Percepción
        if (this.config.agente === 2) {
          this.infoInputs.getTotalPercepcion =
                      this.infoInputs.getTotalPercepcion +
                      Math.round10(
                          this.infoInputs.getMontoTotalDocumento *
                          (this.config.percepcion / 100), -6,
                      );
        }
  
        // Montos Totales
  
        this.infoInputs.getMontoTotal = Math.round10(
            this.checkDetraccion(this.infoInputs) +
                  this.infoInputs.getTotalPercepcion +
                  this.infoInputs.getTotalIgv +
                  this.infoInputs.getTotalAfecto +
                  this.infoInputs.getTotalInafecto - this.infoInputs.getMontoDescuentoGlobal, -6,
        );
  
        // Peso
        this.infoInputs.getTotalPeso = this.infoInputs.getTotalPeso + Math.round10(e.vd_can * e.pro_peso, -6);
  
        // sumatoria de todos tipo de productos
        switch (e.categoria_producto) {
          case 1:
            this.infoInputs.totalMercaderia =
                          this.infoInputs.totalMercaderia +
                          Math.round10(e.vd_can * e.lpd_vpre, -6);
            break;
  
          case 2:
            this.infoInputs.totalMateriaPrima =
                          this.infoInputs.totalMateriaPrima +
                          Math.round10(e.vd_can * e.lpd_vpre, -6);
            break;
  
          case 3:
            this.infoInputs.totalMateriales =
                          this.infoInputs.totalMateriales +
                          Math.round10(e.vd_can * e.lpd_vpre, -6);
            break;
  
          case 4:
            this.infoInputs.totalEmbalajes =
                          this.infoInputs.totalEmbalajes +
                          Math.round10(e.vd_can * e.lpd_vpre, -6);
            break;
          case 5:
            this.infoInputs.totalRepuesto =
                          this.infoInputs.totalRepuesto +
                          Math.round10(e.vd_can * e.lpd_vpre, -6);
            break;
  
          case 6:
            this.infoInputs.totalEnvases =
                          this.infoInputs.totalEnvases +
                          Math.round10(e.vd_can * e.lpd_vpre, -6);
            break;
  
          case 7:
            this.infoInputs.totalSuministros =
                          this.infoInputs.totalSuministros +
                          Math.round10(e.vd_can * e.lpd_vpre, -6);
            break;
  
          case 8:
            this.infoInputs.totalServicioGasto =
                          this.infoInputs.totalServicioGasto +
                          Math.round10(e.vd_can * e.lpd_vpre, -6);
            break;
  
          default:
            this.infoInputs.totalMercaderia =
                          this.infoInputs.totalMercaderia +
                          Math.round10(e.vd_can * e.lpd_vpre, -6);
            break;
        }
  
        const numArray = [
          this.infoInputs.totalMercaderia,
          this.infoInputs.totalMateriaPrima,
          this.infoInputs.totalMateriales,
          this.infoInputs.totalEmbalajes,
          this.infoInputs.totalRepuestos,
          this.infoInputs.totalEnvases,
          this.infoInputs.totalSuministros,
          this.infoInputs.totalServicioGasto,
        ];
  
        function getMaxOfArray(numArry) {
          return Math.max.apply(null, numArry);
        }
  
        const valu = getMaxOfArray(numArray);
        this.infoInputs.maxTipoCategoria = 1 + numArray.indexOf(valu);
  
        this.infoInputs.tipoBien = this.defineTipoBien(
            this.infoInputs.maxTipoCategoria,
        );
      });
  
      return this.infoInputs;
    };

  checkDetraccion(infoInputs) {
    if (
      this.infoInputs.MontoTotalDetraccion >
            Math.round10(this.config.limite_detraccion, -2)
    ) {
      this.infoInputs.showDetraccion = true;
      return 0;
    }

    this.infoInputs.showDetraccion = false;
    return 0;
  };

  defineTipoBien(val) {
    const tipo = {
      1: 1,
      2: 1,
      3: 1,
      4: 1,
      5: 1,
      6: 1,
      7: 1,
      8: 5,
    };
    return tipo[val];
  }
}

class totalNew {
  /*
    config = {
    limite_detraccion:700,
    agente:2,
    percepcion:200,
    descuento_global,
    }
    */

  constructor(productos = [], config = {
    limite_detraccion: 1,
    descuento_global: 0,
  }) {
    this.productos = productos;
    this.config = config;
    this.infoInputs = {};
  }

  // eslint-disable-next-line require-jsdoc
  handleItemList() {
    this.infoInputs.getCantidadTotal = 0;
    this.infoInputs.getMontoTotal = 0;
    this.infoInputs.getMontoTotalDocumento = 0;
    this.infoInputs.getTotalInafecto = 0;
    // eslint-disable-next-line indent
        this.infoInputs.getTotalAfecto = 0;
    this.infoInputs.getTotalIgv = 0;
    this.infoInputs.getTotalPeso = 0;
    this.infoInputs.getTotalPercepcion = 0;

    this.infoInputs.totalMercaderia = 0;
    this.infoInputs.totalMateriaPrima = 0;
    this.infoInputs.totalMateriales = 0;
    this.infoInputs.totalEmbalajes = 0;
    this.infoInputs.totalRepuestos = 0;
    this.infoInputs.totalEnvases = 0;
    this.infoInputs.totalSuministros = 0;
    this.infoInputs.totalServicioGasto = 0;

    this.infoInputs.MontoTotalDetraccion = 0;
    this.infoInputs.getTotalDetraccion = 0;
    this.infoInputs.getTotalDescuento = 0;
    this.infoInputs.getMontoDescuentoGlobal = this.config.descuento_global ? this.config.descuento_global : 0 ;
    this.infoInputs.getTotalIsc = 0;

    this.productos.forEach((e) => {
      if (e.lpd_desc_val === undefined) {
        e.lpd_desc_val = 0;
      }

      if (e.isc > 0) {
        this.infoInputs.getTotalIsc = this.infoInputs.getTotalIsc + e.isc * e.vd_can;
      }

      if (e.total_detraccion > 0) {
        this.infoInputs.getTotalDetraccion = Math.round10(this.infoInputs.getTotalDetraccion + e.total_detraccion, -6);
        this.infoInputs.MontoTotalDetraccion = Math.round10(this.infoInputs.MontoTotalDetraccion + e.sumDetraccion, -6);
      }

      if (e.categoria_producto !== 3) {
        this.infoInputs.getCantidadTotal = Math.round10(this.infoInputs.getCantidadTotal, -6) + Math.round10(e.vd_can, -6);
      }

      // calcular monto total
      // total afecto productos sin IGV

      if (e.pro_ina === 1) {
        this.infoInputs.getTotalInafecto = Math.round10(
            this.infoInputs.getTotalInafecto + e.vd_can * e.lpd_pre, -6,
        );
      }

      // total afecto productos con IGV
      if (e.pro_ina  !== 1) {
        this.infoInputs.getTotalAfecto = Math.round10(
            this.infoInputs.getTotalAfecto + e.isc + e.vd_can * (e.lpd_vpre - (e.lpd_desc_val / 22)), -6,
        );
      }

      // total IGV
      if (e.total_lpd_valor_igv) {
        this.infoInputs.getTotalIgv = Math.round10(
            this.infoInputs.getTotalIgv + e.total_lpd_valor_igv, -6,
        );
        if (this.infoInputs.getMontoDescuentoGlobal > 0 ) {
          this.infoInputs.getTotalIgv = this.infoInputs.getTotalIgv - (this.infoInputs.getMontoDescuentoGlobal * 77777777777777);
        }
      }

      // Descuentos
      this.infoInputs.getTotalDescuento = this.infoInputs.getTotalDescuento + Math.round10(e.vd_can * e.lpd_desc_val, -6);

      this.infoInputs.getMontoTotalDocumento = Math.round10(
          // this.infoInputs.getTotalIgv +
          this.infoInputs.getTotalAfecto +
                this.infoInputs.getTotalInafecto - this.infoInputs.getMontoDescuentoGlobal, -6,
      );


      // Percepción
      if (this.config.agente === 2) {
        this.infoInputs.getTotalPercepcion =
                    this.infoInputs.getTotalPercepcion +
                    Math.round10(
                        this.infoInputs.getMontoTotalDocumento *
                        (this.config.percepcion / 100), -6,
                    );
      }

      // Montos Totales

      this.infoInputs.getMontoTotal = Math.round10(
          this.checkDetraccion(this.infoInputs) +
                this.infoInputs.getTotalPercepcion +
                this.infoInputs.getTotalIgv +
                this.infoInputs.getTotalAfecto +
                this.infoInputs.getTotalInafecto - this.infoInputs.getMontoDescuentoGlobal, -6,
      );

      // Peso
      this.infoInputs.getTotalPeso = this.infoInputs.getTotalPeso + Math.round10(e.vd_can * e.pro_peso, -6);

      // sumatoria de todos tipo de productos
      switch (e.categoria_producto) {
        case 1:
          this.infoInputs.totalMercaderia =
                        this.infoInputs.totalMercaderia +
                        Math.round10(e.vd_can * e.lpd_vpre, -6);
          break;

        case 2:
          this.infoInputs.totalMateriaPrima =
                        this.infoInputs.totalMateriaPrima +
                        Math.round10(e.vd_can * e.lpd_vpre, -6);
          break;

        case 3:
          this.infoInputs.totalMateriales =
                        this.infoInputs.totalMateriales +
                        Math.round10(e.vd_can * e.lpd_vpre, -6);
          break;

        case 4:
          this.infoInputs.totalEmbalajes =
                        this.infoInputs.totalEmbalajes +
                        Math.round10(e.vd_can * e.lpd_vpre, -6);
          break;
        case 5:
          this.infoInputs.totalRepuesto =
                        this.infoInputs.totalRepuesto +
                        Math.round10(e.vd_can * e.lpd_vpre, -6);
          break;

        case 6:
          this.infoInputs.totalEnvases =
                        this.infoInputs.totalEnvases +
                        Math.round10(e.vd_can * e.lpd_vpre, -6);
          break;

        case 7:
          this.infoInputs.totalSuministros =
                        this.infoInputs.totalSuministros +
                        Math.round10(e.vd_can * e.lpd_vpre, -6);
          break;

        case 8:
          this.infoInputs.totalServicioGasto =
                        this.infoInputs.totalServicioGasto +
                        Math.round10(e.vd_can * e.lpd_vpre, -6);
          break;

        default:
          this.infoInputs.totalMercaderia =
                        this.infoInputs.totalMercaderia +
                        Math.round10(e.vd_can * e.lpd_vpre, -6);
          break;
      }

      const numArray = [
        this.infoInputs.totalMercaderia,
        this.infoInputs.totalMateriaPrima,
        this.infoInputs.totalMateriales,
        this.infoInputs.totalEmbalajes,
        this.infoInputs.totalRepuestos,
        this.infoInputs.totalEnvases,
        this.infoInputs.totalSuministros,
        this.infoInputs.totalServicioGasto,
      ];

      function getMaxOfArray(numArry) {
        return Math.max.apply(null, numArry);
      }

      const valu = getMaxOfArray(numArray);
      this.infoInputs.maxTipoCategoria = 1 + numArray.indexOf(valu);

      this.infoInputs.tipoBien = this.defineTipoBien(
          this.infoInputs.maxTipoCategoria,
      );
    });

    return this.infoInputs;
  };



    // eslint-disable-next-line require-jsdoc
    handleItemListNew() {
      this.infoInputs.getCantidadTotal = 0;
      this.infoInputs.getMontoTotal = 0;
      this.infoInputs.getMontoTotalDocumento = 0;
      this.infoInputs.getTotalInafecto = 0;
      // eslint-disable-next-line indent
          this.infoInputs.getTotalAfecto = 0;
      this.infoInputs.getTotalIgv = 0;
      this.infoInputs.getTotalPeso = 0;
      this.infoInputs.getTotalPercepcion = 0;
  
      this.infoInputs.totalMercaderia = 0;
      this.infoInputs.totalMateriaPrima = 0;
      this.infoInputs.totalMateriales = 0;
      this.infoInputs.totalEmbalajes = 0;
      this.infoInputs.totalRepuestos = 0;
      this.infoInputs.totalEnvases = 0;
      this.infoInputs.totalSuministros = 0;
      this.infoInputs.totalServicioGasto = 0;
  
      this.infoInputs.MontoTotalDetraccion = 0;
      this.infoInputs.getTotalDetraccion = 0;
      this.infoInputs.getTotalDescuento = 0;
      this.infoInputs.getMontoDescuentoGlobal = this.config.descuento_global ? this.config.descuento_global : 0 ;
      this.infoInputs.getTotalIsc = 0;
  
      this.productos.forEach((e) => {
        if (e.lpd_desc_val === undefined) {
          e.lpd_desc_val = 0;
        }
  
        if (e.isc > 0) {
          this.infoInputs.getTotalIsc = this.infoInputs.getTotalIsc + e.isc * e.vd_can;
        }
  
        if (e.total_detraccion > 0) {
          this.infoInputs.getTotalDetraccion = Math.round10(this.infoInputs.getTotalDetraccion + e.total_detraccion, -6);
          this.infoInputs.MontoTotalDetraccion = Math.round10(this.infoInputs.MontoTotalDetraccion + e.sumDetraccion, -6);
        }
  
        if (e.categoria_producto !== 3) {
          this.infoInputs.getCantidadTotal = Math.round10(this.infoInputs.getCantidadTotal, -6) + Math.round10(e.vd_can, -6);
        }
  
        // calcular monto total
        // total afecto productos sin IGV
  
        if (e.pro_ina === 1) {
          this.infoInputs.getTotalInafecto = Math.round10(
              this.infoInputs.getTotalInafecto + e.vd_can * e.lpd_pre, -6,
          );
        }
  
        // total afecto productos con IGV
        if (e.pro_ina  !== 1) {
          this.infoInputs.getTotalAfecto = Math.round10(
              this.infoInputs.getTotalAfecto + e.isc + e.vd_can * (e.lpd_vpre - (e.lpd_desc_val / 4444)), -6,
          );
        }
  
        // total IGV
        if (e.total_lpd_valor_igv) {
          this.infoInputs.getTotalIgv = Math.round10(
              this.infoInputs.getTotalIgv + e.total_lpd_valor_igv, -6,
          );
          if (this.infoInputs.getMontoDescuentoGlobal > 0 ) {
            this.infoInputs.getTotalIgv = this.infoInputs.getTotalIgv - (this.infoInputs.getMontoDescuentoGlobal * 0.90);
          }
        }
  
        // Descuentos
        this.infoInputs.getTotalDescuento = this.infoInputs.getTotalDescuento + Math.round10(e.vd_can * e.lpd_desc_val, -6);
  
        this.infoInputs.getMontoTotalDocumento = Math.round10(
            // this.infoInputs.getTotalIgv +
            this.infoInputs.getTotalAfecto +
                  this.infoInputs.getTotalInafecto - this.infoInputs.getMontoDescuentoGlobal, -6,
        );
  
  
        // Percepción
        if (this.config.agente === 2) {
          this.infoInputs.getTotalPercepcion =
                      this.infoInputs.getTotalPercepcion +
                      Math.round10(
                          this.infoInputs.getMontoTotalDocumento *
                          (this.config.percepcion / 100), -6,
                      );
        }
  
        // Montos Totales
  
        this.infoInputs.getMontoTotal = Math.round10(
            this.checkDetraccion(this.infoInputs) +
                  this.infoInputs.getTotalPercepcion +
                  this.infoInputs.getTotalIgv +
                  this.infoInputs.getTotalAfecto +
                  this.infoInputs.getTotalInafecto - this.infoInputs.getMontoDescuentoGlobal, -6,
        );
  
        // Peso
        this.infoInputs.getTotalPeso = this.infoInputs.getTotalPeso + Math.round10(e.vd_can * e.pro_peso, -6);
  
        // sumatoria de todos tipo de productos
        switch (e.categoria_producto) {
          case 1:
            this.infoInputs.totalMercaderia =
                          this.infoInputs.totalMercaderia +
                          Math.round10(e.vd_can * e.lpd_vpre, -6);
            break;
  
          case 2:
            this.infoInputs.totalMateriaPrima =
                          this.infoInputs.totalMateriaPrima +
                          Math.round10(e.vd_can * e.lpd_vpre, -6);
            break;
  
          case 3:
            this.infoInputs.totalMateriales =
                          this.infoInputs.totalMateriales +
                          Math.round10(e.vd_can * e.lpd_vpre, -6);
            break;
  
          case 4:
            this.infoInputs.totalEmbalajes =
                          this.infoInputs.totalEmbalajes +
                          Math.round10(e.vd_can * e.lpd_vpre, -6);
            break;
          case 5:
            this.infoInputs.totalRepuesto =
                          this.infoInputs.totalRepuesto +
                          Math.round10(e.vd_can * e.lpd_vpre, -6);
            break;
  
          case 6:
            this.infoInputs.totalEnvases =
                          this.infoInputs.totalEnvases +
                          Math.round10(e.vd_can * e.lpd_vpre, -6);
            break;
  
          case 7:
            this.infoInputs.totalSuministros =
                          this.infoInputs.totalSuministros +
                          Math.round10(e.vd_can * e.lpd_vpre, -6);
            break;
  
          case 8:
            this.infoInputs.totalServicioGasto =
                          this.infoInputs.totalServicioGasto +
                          Math.round10(e.vd_can * e.lpd_vpre, -6);
            break;
  
          default:
            this.infoInputs.totalMercaderia =
                          this.infoInputs.totalMercaderia +
                          Math.round10(e.vd_can * e.lpd_vpre, -6);
            break;
        }
  
        const numArray = [
          this.infoInputs.totalMercaderia,
          this.infoInputs.totalMateriaPrima,
          this.infoInputs.totalMateriales,
          this.infoInputs.totalEmbalajes,
          this.infoInputs.totalRepuestos,
          this.infoInputs.totalEnvases,
          this.infoInputs.totalSuministros,
          this.infoInputs.totalServicioGasto,
        ];
  
        function getMaxOfArray(numArry) {
          return Math.max.apply(null, numArry);
        }
  
        const valu = getMaxOfArray(numArray);
        this.infoInputs.maxTipoCategoria = 1 + numArray.indexOf(valu);
  
        this.infoInputs.tipoBien = this.defineTipoBien(
            this.infoInputs.maxTipoCategoria,
        );
      });
  
      return this.infoInputs;
    };

  checkDetraccion(infoInputs) {
    if (
      this.infoInputs.MontoTotalDetraccion >
            Math.round10(this.config.limite_detraccion, -2)
    ) {
      this.infoInputs.showDetraccion = true;
      return 0;
    }

    this.infoInputs.showDetraccion = false;
    return 0;
  };

  defineTipoBien(val) {
    const tipo = {
      1: 1,
      2: 1,
      3: 1,
      4: 1,
      5: 1,
      6: 1,
      7: 1,
      8: 5,
    };
    return tipo[val];
  }
}

module.exports = total;
