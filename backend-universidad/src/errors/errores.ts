// Errores de aplicación. El controller los traduce a códigos HTTP.

export class StockInsuficienteError extends Error {
  readonly productoId: number;

  constructor(productoId: number, nombreProducto: string) {
    super(`Stock insuficiente para el producto "${nombreProducto}" (id ${productoId})`);
    this.name = "StockInsuficienteError";
    this.productoId = productoId;
  }
}

export class UsuarioNoEncontradoError extends Error {
  constructor(usuarioId: number) {
    super(`No existe el usuario con id ${usuarioId}`);
    this.name = "UsuarioNoEncontradoError";
  }
}

export class ProductoNoEncontradoError extends Error {
  constructor(productoId: number) {
    super(`No existe el producto con id ${productoId}`);
    this.name = "ProductoNoEncontradoError";
  }
}
