/**
 * VISTA · Notas del semestre                                             (PARTE 3 de la guía)
 *
 * SABE: dibujar el estado del Modelo en el DOM y avisar qué hizo el usuario (clics, formularios).
 * NO SABE: ninguna regla de negocio, ni cambiar el Modelo, ni guardar datos.
 *
 * Lee del Modelo (solo lectura) y se suscribe a sus cambios para redibujarse sola.
 * El HTML estático (formulario, tabla, resumen) ya está en index.html: aquí solo se rellena y se escucha.
 */

// Cómo se presenta cada estado que entrega el Modelo (solo textos y clases, ninguna regla).
const PRESENTACION = {
  aprobado: { clase: 'estado ok', texto: () => '¡Aprobado! Ya aseguraste la nota mínima.' },
  'en-camino': { clase: 'estado en-camino', texto: (n) => `En camino: necesitas ${n.toFixed(2)} en lo que falta.` },
  'en-riesgo': { clase: 'estado riesgo', texto: (n) => `En riesgo: necesitas ${n.toFixed(2)} en lo que falta.` },
  imposible: { clase: 'estado imposible', texto: () => 'Imposible aprobar con las notas actuales.' },
};

const porcentaje = (n) => `${Math.round(n * 100) / 100} %`;

export class NotasVista {
  #modelo;
  #el;

  constructor(raiz, modelo) {
    this.#modelo = modelo;
    // TODO 3A: busca en `raiz` los elementos que vas a usar (#form, #nombre, #peso, #nota, #error, #tabla,
    //          #vacio, #acumulado, #pesoCalificado, #pesoPendiente, #necesaria, #estado) y guárdalos en this.#el.
    //          Luego: suscríbete al Modelo para redibujarte sola y dibuja una primera vez.
    const ids = [
      'form', 'nombre', 'peso', 'nota', 'error', 'tabla', 'vacio',
      'acumulado', 'pesoCalificado', 'pesoPendiente', 'necesaria', 'estado',
    ];
    this.#el = {};
    for (const id of ids) this.#el[id] = raiz.querySelector(`#${id}`);

    this.#modelo.suscribir(() => this.render());
    this.render();
  }

  // ---------------------------------------------------------- 3B · Eventos que la Vista ofrece
  // El Controlador se registra aquí. La Vista no decide qué hacer: solo avisa "el usuario hizo esto".

  alAgregar(manejador) {
    // TODO 3B: cuando se envíe el formulario (submit, sin recargar la página) llama a manejador(this.leerFormulario()).
    this.#el.form.addEventListener('submit', (evento) => {
      evento.preventDefault();
      manejador(this.leerFormulario());
    });
  }

  // EJEMPLO RESUELTO (para que hagas alAgregar y alCalificar igual): un solo escuchador en la tabla
  // sirve para todas las filas (delegación de eventos); el id viaja en el atributo data-eliminar.
  // Funciona cuando termines 3A (this.#el.tabla) y 3D (los botones "Eliminar" con data-eliminar).
  alEliminar(manejador) {
    this.#el.tabla.addEventListener('click', (evento) => {
      const boton = evento.target.closest('button[data-eliminar]');
      if (boton) manejador(Number(boton.dataset.eliminar));
    });
  }

  alCalificar(manejador) {
    // TODO 3B: cuando cambie una nota de la tabla, llama a manejador(id, textoEscrito).
    //          Pista: igual que alEliminar, pero con el evento "change" y el id guardado en data-nota
    //          (el <input> de la nota; textoEscrito es su .value).
    this.#el.tabla.addEventListener('change', (evento) => {
      const campo = evento.target.closest('input[data-nota]');
      if (campo) manejador(Number(campo.dataset.nota), campo.value);
    });
  }

  // ---------------------------------------------------------- 3C · Órdenes que la Vista obedece

  leerFormulario() {
    // TODO 3C: devuelve { nombre, peso, nota } con lo que el usuario escribió, TAL CUAL (texto).
    return {
      nombre: this.#el.nombre.value,
      peso: this.#el.peso.value,
      nota: this.#el.nota.value,
    };
  }

  limpiarFormulario() {
    // TODO 3C: vacía los tres campos.
    this.#el.nombre.value = '';
    this.#el.peso.value = '';
    this.#el.nota.value = '';
  }

  mostrarError(mensaje) {
    // TODO 3C: muestra el mensaje en #error.
    this.#el.error.textContent = mensaje;
  }

  limpiarError() {
    // TODO 3C: borra el mensaje de #error.
    this.#el.error.textContent = '';
  }

  // ---------------------------------------------------------- 3D · Dibujar

  /** Dibuja TODO a partir del Modelo. No decide nada: solo presenta. */
  render() {
    // TODO 3D: lee this.#modelo.evaluaciones y this.#modelo.resumen() y actualiza la tabla y el resumen.
    //          · Tabla: una fila por evaluación (nombre, peso, un <input> con la nota, aporte, botón Eliminar).
    //            Usa textContent/createElement: el nombre lo escribió el usuario y NO debe interpretarse como HTML.
    //          · #vacio solo se ve si no hay evaluaciones.
    //          · Resumen: acumulado (2 decimales), pesos con " %", nota necesaria (o "—"), y #estado con su texto y clase
    //            (ok / en-camino / riesgo / imposible). Los textos exactos están en la guía y en espagueti.html.
    const evaluaciones = this.#modelo.evaluaciones;
    const resumen = this.#modelo.resumen();

    const filas = evaluaciones.map((e) => {
      const fila = document.createElement('tr');

      const celda = (texto) => {
        const td = document.createElement('td');
        td.textContent = texto;
        fila.append(td);
        return td;
      };

      celda(e.nombre);
      celda(`${e.peso} %`);

      const tdNota = document.createElement('td');
      const campo = document.createElement('input');
      campo.type = 'number';
      campo.step = 'any';
      campo.value = e.nota === null ? '' : e.nota;
      campo.dataset.nota = e.id;
      tdNota.append(campo);
      fila.append(tdNota);

      celda(e.nota === null ? '—' : ((e.peso * e.nota) / 100).toFixed(2));

      const tdBoton = document.createElement('td');
      const boton = document.createElement('button');
      boton.type = 'button';
      boton.textContent = 'Eliminar';
      boton.dataset.eliminar = e.id;
      tdBoton.append(boton);
      fila.append(tdBoton);

      return fila;
    });

    this.#el.tabla.replaceChildren(...filas);
    this.#el.vacio.hidden = evaluaciones.length > 0;

    this.#el.acumulado.textContent = resumen.acumulado.toFixed(2);
    this.#el.pesoCalificado.textContent = porcentaje(resumen.pesoCalificado);
    this.#el.pesoPendiente.textContent = porcentaje(resumen.pesoPendiente);
    this.#el.necesaria.textContent = resumen.notaNecesaria === null ? '—' : resumen.notaNecesaria.toFixed(2);

    const vista = PRESENTACION[resumen.estado];
    this.#el.estado.textContent = vista.texto(resumen.notaNecesaria);
    this.#el.estado.className = vista.clase;
  }
}