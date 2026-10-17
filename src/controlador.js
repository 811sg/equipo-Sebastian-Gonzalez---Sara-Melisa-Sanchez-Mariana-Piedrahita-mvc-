import { ErrorDeReglas } from './modelo.js';

// La Vista entrega texto; el Modelo espera número o null (sin nota).
const aNota = (texto) => (String(texto).trim() === '' ? null : Number(texto));

export class NotasControlador {
  #modelo;
  #vista;

  constructor(modelo, vista) {
    this.#modelo = modelo;
    this.#vista = vista;

    // 4A: registrarse en la Vista
    this.#vista.alAgregar(({ nombre, peso, nota }) => {
      this.#intentar(
        () => this.#modelo.agregar({ nombre, peso: Number(peso), nota: aNota(nota) }),
        true,
      );
    });

    this.#vista.alEliminar((id) => {
      this.#intentar(() => this.#modelo.eliminar(id));
    });

    this.#vista.alCalificar((id, texto) => {
      this.#intentar(() => this.#modelo.calificar(id, aNota(texto)));
    });
  }

  // 4B: ejecutar la orden y reaccionar
  #intentar(orden, esAgregar = false) {
    try {
      orden();
    } catch (error) {
      if (!(error instanceof ErrorDeReglas)) throw error;
      this.#vista.mostrarError(error.message);
      this.#vista.render();
      return;
    }
    this.#vista.limpiarError();
    if (esAgregar) this.#vista.limpiarFormulario();
  }
}
