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
1. usuario: llena nombre, peso y nota y presiona Agregar (index.html, #form)
        |
        v
2. src/vista.js · alAgregar()
   escucha el submit, evita que la página se recargue y llama al manejador del controlador
        |
        v
3. src/vista.js · leerFormulario()
   devuelve { nombre, peso, nota } tal cual, como texto
        |
        v
4. src/controlador.js · manejador de alAgregar (constructor)
   convierte el peso con Number() y la nota con aNota() (vacía = null)
        |
        v
5. src/controlador.js · #intentar(orden)
   le da la orden al modelo: modelo.agregar({ nombre, peso, nota })
        |
        v
6. src/modelo.js · agregar()
   valida nombre, nombre repetido, peso, nota y que los pesos no pasen de 100
   - si algo falla lanza ErrorDeReglas -> vuelve a #intentar -> vista.mostrarError() y vista.render()
   - si todo esta bien agrega la evaluacion con su id nuevo
        |
        v
7. src/modelo.js · #cambio()
        |
        +--> 8. src/almacen.js · AlmacenSesion.guardar()
        |       guarda la lista en sessionStorage
        |
        +--> 9. avisa a los suscriptores (observer)
                 |
                 +--> 10. src/vista.js · render()
                 |        redibuja la tabla con la fila nueva y el resumen
                 |
                 +--> 11. src/termometro-vista.js · render()
                          mueve la barra y cambia la leyenda
        |
        v
12. src/controlador.js · #intentar(orden)
    como no hubo error: vista.limpiarError() y vista.limpiarFormulario()
    -> el usuario ve la fila nueva y el formulario vacío

```

## 4. Evidencias (Partes 2, 3, 4 y 6)

**Salida de `npm test`** (pega el final, donde dice cuántas pruebas pasan):

```
MODELO
  ✓ A · Agregar y validar ......................... 11/11
  ✓ B · Calificar y eliminar ...................... 7/7
  ✓ C · Resumen ................................... 10/10
  ✓ D · Observador y persistencia ................. 8/8
  ✓ E · Parte 5A · Nombres únicos ................. 3/3

ARQUITECTURA
  ✓ Modelo puro ................................... 4/4
  ✓ Vista pasiva .................................. 5/5
  ✓ Controlador delgado ........................... 6/6

✓ 54 de 54 pruebas pasan.
```

**Salida de `npm run arquitectura`:**

```ARQUITECTURA
  ✓ Modelo puro ................................... 4/4
  ✓ Vista pasiva .................................. 5/5
  ✓ Controlador delgado ........................... 6/6

✓ 15 de 15 pruebas pasan.

```

**Captura de pantalla** de la app con las dos vistas (la tabla/resumen y el termómetro):
<img width="861" height="597" alt="image" src="https://github.com/user-attachments/assets/dabcd7a1-4039-4d46-9b75-35365b5a66b3" />
<img width="499" height="102" alt="image" src="https://github.com/user-attachments/assets/89780777-74d1-4b0f-870d-1fcaa9ec904b" />



## 5. Tres cambios, tres lugares (Parte 5)

Después de cada cambio ejecuta `git diff --stat HEAD~1` (o `git show --stat`) y pega el resultado.
La idea: **cada cambio debía tocar solo las piezas que le corresponden**.

| Cambio | Archivos que tocaste | ¿Era lo esperado? ¿Por qué? |
|---|---|---|
| 5A · Nombres únicos | src/modelo.js | sí, porque no repetir nombres es una regla del negocio y las reglas viven en el modelo. la vista y el controlador no se tocaron y el error igual sale en pantalla |
| 5B · Segunda vista (termómetro) | src/termometro-vista.js (nuevo) y src/main.js | sí, es otra forma de mostrar los mismos datos entonces es una vista nueva, y main.js solo la conecta. el modelo no cambió, solo avisa a quien esté suscrito |
| 5C · Otro almacén | src/almacen.js y src/main.js | sí, solo cambió dónde se guardan los datos. el modelo no se tocó porque solo necesita que el almacén tenga cargar() y guardar() |

"text 
commit e5099bb319b23aa0569fea8e77fca88d0ac8906e (HEAD -> main, origin/main, origin/HEAD)
Author: Mariana Piedrahita <mpiedrahita546@gmail.com>
Date:   Fri Oct 16 21:11:38 2026 -0500

    Parte 5C: Almacen de sesion

 src/almacen.js | 22 ++++++++++++++++++++++
 src/main.js    |  4 ++--
 2 files changed, 24 insertions(+), 2 deletions(-)

commit dd12d5adce9662aa21e5bfbc6351d809ce46f5f4
Author: Mariana Piedrahita <mpiedrahita546@gmail.com>
Date:   Fri Oct 16 21:05:25 2026 -0500

    Parte 5B: Termometro

 src/main.js             |  2 ++
 src/termometro-vista.js | 40 ++++++++++++++++++++++++++++++++++++++++
 2 files changed, 42 insertions(+)

commit 111ed8ff69bd291c8921a26b689cfc45a308606f
Author: Mariana Piedrahita <mpiedrahita546@gmail.com>
Date:   Fri Oct 16 20:49:49 2026 -0500

    Parte 5A: Nombres unicos

 src/modelo.js | 2 ++
 1 file changed, 2 insertions(+)
 "

## 6. Reflexión (Parte 6)

1. En la versión espagueti, ¿qué tuviste que leer o tocar para entender dónde se decide si el estudiante aprobó? ¿Y en la versión MVC?

   **R:** en el espagueti tocaba leer la función pintar(), que es la que arma el html, porque ahí adentro estaba el if que compara el acumulado con 3.0 escrito a mano, todo mezclado con los textos y las clases. en la versión mvc solo hay que mirar resumen() en modelo.js, que usa la constante NOTA_MINIMA. la vista no decide nada, solo muestra el texto que le toca según el estado.

2. ¿Por qué el Modelo **no** debe llamar a alert() ni a document? ¿Qué pasaría con las pruebas del Modelo si lo hiciera?

   **R:** porque el modelo es solo de datos y reglas, no sabe que existe una pantalla. si usara document o alert solo funcionaría dentro del navegador, y las pruebas del modelo corren con node sin navegador, entonces fallarían con "document is not defined". además la prueba de arquitectura "Modelo puro" lo detecta.

3. El Modelo avisa de sus cambios sin saber quién escucha (Observer). ¿Qué ganamos con eso frente a que el Modelo llame directamente a vista.render()?

   **R:** que el modelo no depende de ninguna vista. lo vimos en la parte 5B: agregamos el termómetro sin tocar modelo.js, solo se suscribió y ya. si el modelo llamara a vista.render() tocaría editarlo cada vez que se agrega una vista, y no se podría probar sin tener una vista creada.

4. Elige un olor de MVC (controlador gordo, lógica en la Vista, Modelo que toca la pantalla, Modelo anémico) que te hubiera sido fácil cometer hoy. ¿Cuál y cómo lo evitaron?

   **R:** el controlador gordo. cuando convertimos el texto del formulario a número era fácil aprovechar y validar ahí mismo que la nota esté entre 0 y 5 o que el peso no pase de 100. lo evitamos dejando que el controlador solo convierta el texto (y la nota vacía a null) y le pase la orden al modelo, que es el que valida y lanza ErrorDeReglas. el controlador solo atrapa el error y le pide a la vista que lo muestre.

5. ¿Para qué tipo de aplicación **no** usarías MVC? Justifica con lo que viste en el laboratorio.

   **R:** para algo muy pequeño que no va a cambiar, como un script que hace una sola cosa o una página con un botón. en el laboratorio el espagueti hacía todo en un solo archivo y el mvc necesitó cinco, así que para algo chiquito es más trabajo que beneficio. vale la pena cuando la app crece o cambia seguido, como en la parte 5 donde cada cambio tocó solo uno o dos archivos.
