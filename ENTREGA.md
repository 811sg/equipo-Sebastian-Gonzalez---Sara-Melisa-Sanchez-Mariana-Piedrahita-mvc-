# Entrega · Laboratorio MVC · Notas del semestre

**Equipo:** ______________________  
**Integrantes:** ______________________  
**Repositorio:** ______________________

> Completa este archivo a medida que avanzas (cada sección dice en qué parte de la guía se llena).
> Escribe con tus palabras: las respuestas copiadas de la guía o de otro equipo no cuentan.

---

## 1. Mapa de responsabilidades (Parte 1)

Clasifica cada fragmento de `espagueti.html`: **M** (Modelo), **V** (Vista), **C** (Controlador) o **Mezcla**
(en ese caso, escribe qué roles se mezclan). En "¿Por qué?" justifica en una frase.


| # | Fragmento | Rol(es) | ¿Por qué? |
|---|---|---|---|
| 1 | `var n = document.getElementById('nombre').value.trim();` | v | lee lo que la persona escribió en la pantalla y no toca los datos todavía |

| 2 | `if (isNaN(p) \|\| p < 1 \|\| p > 100) { err.textContent = 'El peso debe estar entre 1 y 100.'; return; }` | mezcla m y v | la regla de que el peso va de 1 a 100 es del modelo pero el mensaje de error es de la vista y están pegados |

| 3 | `if (total + p > 100) { err.textContent = '...'; return; }` | mezcla m y v | la regla de que los pesos no pasen de 100 es del modelo pero el mensaje que se muestra es de la vista |

| 4 | `evals.push({ id: sig++, nombre: n, peso: p, nota: nota });` | m | agrega una evaluación a la lista de datos y le da su id sin tocar la pantalla |

| 5 | `localStorage.setItem('notas.v1', JSON.stringify(evals));` | m | guarda los datos en el almacenamiento y no tiene nada que ver con lo que se ve |

| 6 | `document.getElementById('nombre').value = '';` | v | solo limpia un campo de la pantalla |

| 7 | `'<input ... onchange="ponerNota(' + e.id + ', this.value)">'` | mezcla v y c | es un campo que se dibuja en el html pero el onchange lo conecta con la función que cambia la nota |

| 8 | `nec = Math.ceil(nec * 100 - 1e-9) / 100;` | m | redondea hacia arriba la nota que se necesita y eso es un cálculo de la regla del negocio |

| 9 | `if (acum + 1e-9 >= 3.0) { txt = '¡Aprobado! ...'; cls = 'ok'; }` | mezcla m y v | decidir si ya aprobó es una regla del modelo pero el texto y la clase que se muestran son de la vista |

| 10 | `document.getElementById('tabla').innerHTML = filas;` | v | pone en la pantalla las filas ya armadas y nada más |

| 11 | `function borrar(id) { ...splice...; localStorage.setItem(...); pintar(); }` | mezcla c m y v | responde al clic que es c quita el dato y guarda que es m y repinta la pantalla que es v todo junto |

| 12 | `(e.peso * e.nota / 100).toFixed(2)` | m | calcula cuánto aporta cada nota a la definitiva que es lógica pura aunque aquí está metida dentro del html de la fila |

## 2. Olores del espagueti (Parte 1)

Lista **al menos 5** problemas de diseño de `espagueti.html`. Para cada uno, escribe qué consecuencia tiene
cuando el proyecto crece y en qué pieza de MVC viviría la solución.

| Olor | Consecuencia | Dónde se arregla (M, V o C) |
|---|---|---|
| variables globales como evals y sig | cualquier función puede cambiarlas y cuando hay más código nadie sabe quién dañó los datos | M |

| una misma regla en dos funciones como la nota entre 0 y 5 en agregar y en ponerNota | si la regla cambia hay que acordarse de tocar los dos sitios y casi siempre se olvida uno | M |

| valor mágico 3.0 repetido | pasar a 3.5 obliga a buscar en varios lugares y si se olvida uno la app se contradice sin dar error | M |

| html armado con texto | es difícil de leer y un nombre como hola en negrita rompe la tabla y deja meter código malicioso | V |

| funciones que hacen tres cosas a la vez como agregar que lee valida guarda y pinta | no se puede cambiar una parte sin tocar las otras y cada función crece más y más | C |

## 3. El flujo de «agregar una evaluación» (Parte 6)

Dibuja (a mano y pega una foto, o con texto/Mermaid) el recorrido completo desde que el usuario presiona
**Agregar** hasta que ve la fila nueva en la tabla. Marca en cada paso **el archivo y el método** que actúa.

```text
(tu diagrama aquí)
```

## 4. Evidencias (Partes 2, 3, 4 y 6)

**Salida de `npm test`** (pega el final, donde dice cuántas pruebas pasan):

```text

```

**Salida de `npm run arquitectura`:**

```text

```

**Captura de pantalla** de la app con las dos vistas (la tabla/resumen y el termómetro): _(pega la imagen o su enlace)_

## 5. Tres cambios, tres lugares (Parte 5)

Después de cada cambio ejecuta `git diff --stat HEAD~1` (o `git show --stat`) y pega el resultado.
La idea: **cada cambio debía tocar solo las piezas que le corresponden**.

| Cambio | Archivos que tocaste | ¿Era lo esperado? ¿Por qué? |
|---|---|---|
| 5A · Nombres únicos | | |
| 5B · Segunda vista (termómetro) | | |
| 5C · Otro almacén | | |

## 6. Reflexión (Parte 6)

1. En la versión espagueti, ¿qué tuviste que leer o tocar para entender dónde se decide si el estudiante aprobó? ¿Y en la versión MVC?
2. ¿Por qué el Modelo **no** debe llamar a `alert()` ni a `document`? ¿Qué pasaría con las pruebas del Modelo si lo hiciera?
3. El Modelo avisa de sus cambios sin saber quién escucha (Observer). ¿Qué ganamos con eso frente a que el Modelo llame directamente a `vista.render()`?
4. Elige un olor de MVC (controlador gordo, lógica en la Vista, Modelo que toca la pantalla, Modelo anémico) que te hubiera sido fácil cometer hoy. ¿Cuál y cómo lo evitaron?
5. ¿Para qué tipo de aplicación **no** usarías MVC? Justifica con lo que viste en el laboratorio.
