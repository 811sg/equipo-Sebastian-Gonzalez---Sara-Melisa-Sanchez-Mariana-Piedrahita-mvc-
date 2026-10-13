/**
 * MODELO · Notas del semestre                                            (PARTE 2 de la guía)
 *
 * SABE: qué es una evaluación, las reglas (pesos, rangos, nota mínima) y cómo se calcula el resumen.
 * NO SABE: que existe una pantalla, el DOM, localStorage, alert()... Por eso se prueba sin navegador.
 *
 * Se comunica con el resto SIN conocerlo: avisa de sus cambios con el patrón Observer (suscribir).
 *
 * Tu trabajo: reemplazar cada "TODO" por código real hasta que `npm run test:modelo` quede en verde.
 * Las reglas exactas y los mensajes de error están en la guía (Parte 2) y en pruebas/modelo.pruebas.js.
 */

export const NOTA_MINIMA = 3.0; // para aprobar
export const NOTA_MAXIMA = 5.0;
export const UMBRAL_RIESGO = 4.0;
export const MAX_NOMBRE = 40;

const EPS = 1e-9;

export class ErrorDeReglas extends Error {
  constructor(mensaje) {
    super(mensaje);
    this.name = 'ErrorDeReglas';
  }
}

const redondearArriba = (valor, decimales = 2) => {
  const f = 10 ** decimales;
  return Math.ceil(valor * f - EPS) / f;
};

export class NotasModelo {
  #almacen;
  #evaluaciones;
  #siguienteId;
  #suscriptores = new Set();

  constructor(almacen) {
    this.#almacen = almacen;
    this.#evaluaciones = almacen.cargar();
    this.#siguienteId = this.#evaluaciones.reduce((max, e) => Math.max(max, e.id), 0) + 1;
  }

  get evaluaciones() {
    return this.#evaluaciones.map((e) => ({ ...e }));
  }

  // ---------------------------------------------------------------- 2A · Agregar y validar
  agregar({ nombre, peso, nota = null }) {
    const limpio = String(nombre ?? '').trim();
    if (limpio === '') throw new ErrorDeReglas('El nombre es obligatorio.');
    if (limpio.length > MAX_NOMBRE) {
      throw new ErrorDeReglas('El nombre no puede superar 40 caracteres.');
    }
    if (!Number.isFinite(peso) || peso < 1 || peso > 100) {
      throw new ErrorDeReglas('El peso debe estar entre 1 y 100.');
    }
    this.#validarNota(nota);

    const total = this.#evaluaciones.reduce((suma, e) => suma + e.peso, 0);
    if (total + peso > 100 + EPS) {
      const quedan = Math.round((100 - total) * 100) / 100;
      throw new ErrorDeReglas(`Los pesos no pueden sumar más de 100 % (te quedan ${quedan} %).`);
    }

    this.#evaluaciones.push({ id: this.#siguienteId++, nombre: limpio, peso, nota });
    this.#cambio();
  }

  // ---------------------------------------------------------------- 2B · Calificar y eliminar
  calificar(id, nota) {
    const evaluacion = this.#buscar(id);
    this.#validarNota(nota);
    evaluacion.nota = nota;
    this.#cambio();
  }

  eliminar(id) {
    const evaluacion = this.#buscar(id);
    this.#evaluaciones.splice(this.#evaluaciones.indexOf(evaluacion), 1);
    this.#cambio();
  }

  // ---------------------------------------------------------------- 2C · Resumen
  resumen() {
    let acumulado = 0;
    let pesoCalificado = 0;
    for (const e of this.#evaluaciones) {
      if (e.nota !== null) {
        acumulado += (e.peso * e.nota) / 100;
        pesoCalificado += e.peso;
      }
    }

    const pesoPendiente = 100 - pesoCalificado;

    let notaNecesaria = null;
    if (pesoPendiente > EPS) {
      const cruda = Math.max(0, (NOTA_MINIMA - acumulado) / (pesoPendiente / 100));
      notaNecesaria = redondearArriba(cruda);
    }

    let estado;
    if (acumulado + EPS >= NOTA_MINIMA) estado = 'aprobado';
    else if (notaNecesaria === null || notaNecesaria > NOTA_MAXIMA) estado = 'imposible';
    else if (notaNecesaria > UMBRAL_RIESGO) estado = 'en-riesgo';
    else estado = 'en-camino';

    return { acumulado, pesoCalificado, pesoPendiente, notaNecesaria, estado };
  }

  // ---------------------------------------------------------------- 2D · Observer y persistencia
  suscribir(suscriptor) {
    this.#suscriptores.add(suscriptor);
    return () => this.#suscriptores.delete(suscriptor);
  }

  #cambio() {
    this.#almacen.guardar(this.#evaluaciones.map((e) => ({ ...e })));
    for (const suscriptor of this.#suscriptores) suscriptor();
  }

  // ---------------------------------------------------------------- privados
  #buscar(id) {
    const evaluacion = this.#evaluaciones.find((e) => e.id === id);
    if (!evaluacion) throw new ErrorDeReglas('No existe la evaluación.');
    return evaluacion;
  }

  #validarNota(nota) {
    if (nota === null) return;
    if (!Number.isFinite(nota) || nota < 0 || nota > NOTA_MAXIMA) {
      throw new ErrorDeReglas('La nota debe estar entre 0 y 5.');
    }
  }
}