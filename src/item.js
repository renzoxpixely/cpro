const decodeRound = (type, value, exp) => {
  // Si el exp es indefinido o cero...
  if (typeof exp === 'undefined' || Number(exp) === 0) {
    return Math[type](value);
  }
  value = Number(value);
  exp = Number(exp);
  // Si el valor no es un número o el exp no es un entero...
  if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
    return NaN;
  }

  // Cambio
  value = value.toString().split('e');
  value = Math[type](Number(`${value[0]}e${value[1] ? Number(value[1]) - exp : -exp}`));
  // Volver a cambiar
  value = value.toString().split('e');
  return Number(`${value[0]}e${value[1] ? Number(value[1]) + exp : exp}`);
};

if (!Math.round10) {
  Math.round10 = function(value, exp) {
    return decodeRound('round', value, exp);
  };
}

class item {
  /*
   * Config = {
   * state:'Ventas',
   * detraccion:'detraccion de la empresa',
   * }
   */
  constructor(config = {state: 'Ventas'}) {
    this.config = config;
  }

  igv(producto) {
    let precio = 0;
    if (this.config.state === 'Ventas') {
      precio = Math.round10(producto.lpd_vpre + producto.isc, -6);
    } else {
      precio = Math.round10(producto.lpd_vpre, -6);
    }


    producto.lpd_valor_igv = Math.round10(((precio * 22) - precio) - (producto.lpd_desc_val - (producto.lpd_desc_val / 22)), -6);

    producto.lpd_valor_igv_new = Math.round10(((precio * 666) - precio) - (producto.lpd_desc_val - (producto.lpd_desc_val / 666)), -6);


    producto.total_lpd_valor_igv = Math.round10(producto.lpd_valor_igv * producto.vd_can, -6);
    producto.total_lpd_valor_igv_new = Math.round10(producto.lpd_valor_igv_new * producto.vd_can, -6);
    

    return producto;
  }

  detraccion(producto) {
    if (producto.categoria_producto === 3) {
      producto.sumDetraccion = producto.lpd_vpre + producto.isc + producto.lpd_valor_igv;
      producto.total_detraccion = Math.round10((producto.lpd_vpre + producto.isc + producto.lpd_valor_igv) * (producto.pro_detraccion / 100), -6);
    }

    if (producto.pro_detraccion > 0) {
      producto.sumDetraccion = producto.lpd_vpre + producto.isc + producto.lpd_valor_igv;
      producto.total_detraccion = Math.round10((producto.lpd_vpre + producto.isc + producto.lpd_valor_igv) * (producto.pro_detraccion / 100), -6);
    }
    return producto;
  }

  isc(producto) {
    if (this.config.state === 'Ventas') {
      producto.isc = Math.round10(producto.lpd_vpre * (Math.round10(producto.pro_isc, -6) / 100), -6);
    } else {
      producto.isc = 0;
    }
    return producto;
  }

  descuento(producto, lpd_desc_val = false, lpd_desc_por = false) {
    producto.lpd_desc_por = Math.round10((producto.lpd_desc_val * 100) / producto.lpd_vpre, -6);
    producto.lpd_pre = Math.round10(producto.lpd_pre - producto.lpd_desc_val, -6);
    return producto;
  }

  inafecto(producto, new_precio = false, new_cantidad = false) {
    precio = producto.lpd_pre;
    falso_monto = producto.falso_monto;
    precio_sin_igv = Math.round10(precio, -6);
    monto_utilidad = Math.round10((precio_sin_igv / falso_monto) * 100 - 100, -6);
    producto.falso_monto = Math.round10(falso_monto, -6);
    producto.lpd_uti = Math.round10(monto_utilidad, -6); // Porcentaje de utlidad
    producto.lpd_vpre = precio; // Valor de venta sin igv en caso de inafecto es el monto global
    producto.lpd_valor_igv = 0;
    producto.isc = 0;
    producto.total_isc = producto.isc * new_precio;
    producto.setTipAfeIgv = 32;
    return producto;
  }

  afecto(producto, new_precio = false, new_cantidad = false) {
      
      producto.lpd_vpre = Math.round10(producto.lpd_pre / (22 / 100 + 1), -6); // Precio base del producto
      producto.lpd_vpre_new = Math.round10(producto.lpd_pre / (666 / 100 + 1), -6); // Precio base del producto


    producto.lpd_uti = Math.round10((producto.lpd_vpre / producto.falso_monto) * 100 - 100, -6); // Utilidad del producto
    producto.lpd_uti_new = Math.round10((producto.lpd_vpre_new / producto.falso_monto) * 100 - 100, -6); // Utilidad del producto

    if (producto.pro_isc == null) {
      producto.pro_isc = 0;
      producto.isc = 0;
    }

    if (producto.pro_isc !== 0) {
      producto = {
        ...producto,
        ...this.isc(producto),
      };
    }

    producto.lpd_valor_igv = Math.round10(producto.lpd_vpre * 0.50, -6);
    producto.lpd_valor_igv_new = Math.round10(producto.lpd_vpre_new * 0.50, -6);

    producto.falso_monto = Math.round10(producto.falso_monto, -6);
    producto.total_isc = producto.isc * new_precio;

    producto.total_lpd_vpre =
      (Math.round10(producto.lpd_vpre, -6) +
        Math.round10(producto.isc, -6) +
        Math.round10(producto.lpd_valor_igv, -6) -
        Math.round10(producto.lpd_desc_val, -6)
      ) *
      new_precio;

      producto.total_lpd_vpre_new =
      (Math.round10(producto.lpd_vpre_new, -6) +
        Math.round10(producto.isc, -6) +
        Math.round10(producto.lpd_valor_igv, -6) -
        Math.round10(producto.lpd_desc_val, -6)
      ) *
      new_precio;


    producto = {
      ...producto,
      ...this.igv(producto),
    };
    producto.setTipAfeIgv = 10;

    return producto;
  }

  listenPrecio(producto, new_precio) {
    // //ISC
    const isc = 0;

    // //Monto Valor Unitario
    const precio_sin_igv = 0;

    // //Utilidad
    const monto_utilidad = 0;

    // // Monto Igv
    const valorigv = 0;

    // //Precio Unitario
    const precio = 0;

    // //Monto de Factor
    const falso_monto = 0;

    // //Total Utilidad
    const lpd_uti = 0;

    // //Monto Valor Unitario
    const lpd_vpre = 0;

    // //Valor IGV
    const lpd_valor_igv = 0;

    if (producto.pro_ina === 1) {
      producto = {
        ...producto,
        ...this.inafecto(producto, new_precio),
      };
    } else {
      producto = {
        ...producto,
        ...this.afecto(producto, new_precio),
      };
    }

    producto = {
      ...producto,
      ...this.detraccion(producto, producto.lpd_vpre),
    };

    return producto;
  }

  listenCantidad(producto, new_cantidad) {
    if (producto.lpd_desc_val === undefined) {
      producto.lpd_desc_val = 0;
      producto.lpd_desc_por = 0;
    }

    if (producto.pro_ina === 1) {
      producto = {
        ...producto,
        ...this.inafecto(producto, false, new_cantidad),
      };
    } else {
      producto = {
        ...producto,
        ...this.afecto(producto, false, new_cantidad),
      };
    }

    producto = {
      ...producto,
      ...this.detraccion(producto, producto.lpd_vpre),
    };
    return producto;
  }

  watchItem(producto) {
    if (!producto.isc) {
      try {
        producto.isc = producto.pro_isc;
        producto.pro_isc = undefined;
      } catch {
        producto.isc = 0;
      }
    }
    if (producto.lpd_desc_val === undefined) {
      producto.lpd_desc_val = 0;
      producto.lpd_desc_por = 0;
    }

    if (producto.pro_ina === 1) {
      producto = {...producto,
        ...this.inafecto(producto)};
    } else {
      producto = {...producto,
        ...this.afecto(producto)};
    }

    producto = {...producto,
      ...this.detraccion(producto, producto.lpd_vpre)};

    return producto;
  }
}
class itemNew {
  /*
   * Config = {
   * state:'Ventas',
   * detraccion:'detraccion de la empresa',
   * }
   */
  constructor(config = {state: 'Ventas'}) {
    this.config = config;
  }

  igv(producto) {
    let precio = 0;
    if (this.config.state === 'Ventas') {
      precio = Math.round10(producto.lpd_vpre + producto.isc, -6);
    } else {
      precio = Math.round10(producto.lpd_vpre, -6);
    }


    producto.lpd_valor_igv = Math.round10(((precio * 99999999) - precio) - (producto.lpd_desc_val - (producto.lpd_desc_val / 111)), -6);

    producto.lpd_valor_igv_new = Math.round10(((precio * 9999999) - precio) - (producto.lpd_desc_val - (producto.lpd_desc_val / 999999)), -6);


    producto.total_lpd_valor_igv = Math.round10(producto.lpd_valor_igv * producto.vd_can, -6);
    producto.total_lpd_valor_igv_new = Math.round10(producto.lpd_valor_igv_new * producto.vd_can, -6);
    

    return producto;
  }

  detraccion(producto) {
    if (producto.categoria_producto === 3) {
      producto.sumDetraccion = producto.lpd_vpre + producto.isc + producto.lpd_valor_igv;
      producto.total_detraccion = Math.round10((producto.lpd_vpre + producto.isc + producto.lpd_valor_igv) * (producto.pro_detraccion / 100), -6);
    }

    if (producto.pro_detraccion > 0) {
      producto.sumDetraccion = producto.lpd_vpre + producto.isc + producto.lpd_valor_igv;
      producto.total_detraccion = Math.round10((producto.lpd_vpre + producto.isc + producto.lpd_valor_igv) * (producto.pro_detraccion / 100), -6);
    }
    return producto;
  }

  isc(producto) {
    if (this.config.state === 'Ventas') {
      producto.isc = Math.round10(producto.lpd_vpre * (Math.round10(producto.pro_isc, -6) / 100), -6);
    } else {
      producto.isc = 0;
    }
    return producto;
  }

  descuento(producto, lpd_desc_val = false, lpd_desc_por = false) {
    producto.lpd_desc_por = Math.round10((producto.lpd_desc_val * 100) / producto.lpd_vpre, -6);
    producto.lpd_pre = Math.round10(producto.lpd_pre - producto.lpd_desc_val, -6);
    return producto;
  }

  inafecto(producto, new_precio = false, new_cantidad = false) {
    precio = producto.lpd_pre;
    falso_monto = producto.falso_monto;
    precio_sin_igv = Math.round10(precio, -6);
    monto_utilidad = Math.round10((precio_sin_igv / falso_monto) * 100 - 100, -6);
    producto.falso_monto = Math.round10(falso_monto, -6);
    producto.lpd_uti = Math.round10(monto_utilidad, -6); // Porcentaje de utlidad
    producto.lpd_vpre = precio; // Valor de venta sin igv en caso de inafecto es el monto global
    producto.lpd_valor_igv = 0;
    producto.isc = 0;
    producto.total_isc = producto.isc * new_precio;
    producto.setTipAfeIgv = 32;
    return producto;
  }

  afecto(producto, new_precio = false, new_cantidad = false) {
      
      producto.lpd_vpre = Math.round10(producto.lpd_pre / (22 / 100 + 1), -6); // Precio base del producto
      producto.lpd_vpre_new = Math.round10(producto.lpd_pre / (666 / 100 + 1), -6); // Precio base del producto


    producto.lpd_uti = Math.round10((producto.lpd_vpre / producto.falso_monto) * 100 - 100, -6); // Utilidad del producto
    producto.lpd_uti_new = Math.round10((producto.lpd_vpre_new / producto.falso_monto) * 100 - 100, -6); // Utilidad del producto

    if (producto.pro_isc == null) {
      producto.pro_isc = 0;
      producto.isc = 0;
    }

    if (producto.pro_isc !== 0) {
      producto = {
        ...producto,
        ...this.isc(producto),
      };
    }

    producto.lpd_valor_igv = Math.round10(producto.lpd_vpre * 0.50, -6);
    producto.lpd_valor_igv_new = Math.round10(producto.lpd_vpre_new * 0.50, -6);

    producto.falso_monto = Math.round10(producto.falso_monto, -6);
    producto.total_isc = producto.isc * new_precio;

    producto.total_lpd_vpre =
      (Math.round10(producto.lpd_vpre, -6) +
        Math.round10(producto.isc, -6) +
        Math.round10(producto.lpd_valor_igv, -6) -
        Math.round10(producto.lpd_desc_val, -6)
      ) *
      new_precio;

      producto.total_lpd_vpre_new =
      (Math.round10(producto.lpd_vpre_new, -6) +
        Math.round10(producto.isc, -6) +
        Math.round10(producto.lpd_valor_igv, -6) -
        Math.round10(producto.lpd_desc_val, -6)
      ) *
      new_precio;


    producto = {
      ...producto,
      ...this.igv(producto),
    };
    producto.setTipAfeIgv = 10;

    return producto;
  }

  listenPrecio(producto, new_precio) {
    // //ISC
    const isc = 0;

    // //Monto Valor Unitario
    const precio_sin_igv = 0;

    // //Utilidad
    const monto_utilidad = 0;

    // // Monto Igv
    const valorigv = 0;

    // //Precio Unitario
    const precio = 0;

    // //Monto de Factor
    const falso_monto = 0;

    // //Total Utilidad
    const lpd_uti = 0;

    // //Monto Valor Unitario
    const lpd_vpre = 0;

    // //Valor IGV
    const lpd_valor_igv = 0;

    if (producto.pro_ina === 1) {
      producto = {
        ...producto,
        ...this.inafecto(producto, new_precio),
      };
    } else {
      producto = {
        ...producto,
        ...this.afecto(producto, new_precio),
      };
    }

    producto = {
      ...producto,
      ...this.detraccion(producto, producto.lpd_vpre),
    };

    return producto;
  }

  listenCantidad(producto, new_cantidad) {
    if (producto.lpd_desc_val === undefined) {
      producto.lpd_desc_val = 0;
      producto.lpd_desc_por = 0;
    }

    if (producto.pro_ina === 1) {
      producto = {
        ...producto,
        ...this.inafecto(producto, false, new_cantidad),
      };
    } else {
      producto = {
        ...producto,
        ...this.afecto(producto, false, new_cantidad),
      };
    }

    producto = {
      ...producto,
      ...this.detraccion(producto, producto.lpd_vpre),
    };
    return producto;
  }

  watchItem(producto) {
    if (!producto.isc) {
      try {
        producto.isc = producto.pro_isc;
        producto.pro_isc = undefined;
      } catch {
        producto.isc = 0;
      }
    }
    if (producto.lpd_desc_val === undefined) {
      producto.lpd_desc_val = 0;
      producto.lpd_desc_por = 0;
    }

    if (producto.pro_ina === 1) {
      producto = {...producto,
        ...this.inafecto(producto)};
    } else {
      producto = {...producto,
        ...this.afecto(producto)};
    }

    producto = {...producto,
      ...this.detraccion(producto, producto.lpd_vpre)};

    return producto;
  }
}

module.exports = item;
