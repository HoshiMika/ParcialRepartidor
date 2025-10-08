/*
  Actividad: Repartidor a domicilio
  - Datos: nombre, pedidosCompletados (inicia 0), calificacionPromedio (inicia 5), activo (true/false)
  - Métodos: presentarse(), completarPedido(completado, calificacion), toggleActivo()
*/

// Clase Repartidor (modelo simple)
class Repartidor {
  constructor(nombre = 'Repartidor', pedidosCompletados = 0, calificacionPromedio = 5.0, activo = true) {
    this.nombre = nombre;
    this.pedidosCompletados = pedidosCompletados;
    this.calificacionPromedio = calificacionPromedio;
    this.activo = activo;
    // Nota: si pedidosCompletados = 0, la calificación promedio la dejamos en 5.0 como valor inicial.
  }

  // Método 1: presentarse -> devuelve un objeto con la info (y puede usarse para renderizar)
  presentarse() {
    return {
      nombre: this.nombre,
      pedidosCompletados: this.pedidosCompletados,
      calificacionPromedio: Number(this.calificacionPromedio.toFixed(2)),
      activo: this.activo
    };
  }

  // Método 2: completarPedido -> recibe si el pedido se completó (booleano) y una calificación (1..5)
  // Si completado === true: actualiza pedidosCompletados y recalcula la calificación promedio.
  // Si completado === false: NO contabiliza en estadísticas, pero devuelve el resultado (pedido no completado).
  completarPedido(completado, calificacion) {
    const resultado = { completado: Boolean(completado), calificacion: null, mensaje: '' };

    // Validar calificación si existe
    if (typeof calificacion === 'number') {
      // Limitar calificación al rango 1..5
      if (calificacion < 1) calificacion = 1;
      if (calificacion > 5) calificacion = 5;
      resultado.calificacion = Math.round(calificacion * 100) / 100;
    } else {
      resultado.calificacion = null;
    }

    if (resultado.completado) {
      // Nuevo promedio = (promedioActual * numPedidos + nuevaCalificacion) / (numPedidos + 1)
      // Si pedidosCompletados es 0 y calificacion no es null -> asignamos la nueva calificación
      if (this.pedidosCompletados === 0 && (resultado.calificacion === null)) {
        // si no se entrega calificación, asumimos 5 por defecto para no distorsionar (opcional)
        resultado.calificacion = 5;
      }

      const viejaCantidad = this.pedidosCompletados;
      const viejaMedia = this.calificacionPromedio;

      // Si no hay calificación numérica, no afectamos la media (pero si se completa sin calificación, se cuenta el pedido)
      if (resultado.calificacion !== null) {
        const sumaTotal = (viejaMedia * viejaCantidad) + resultado.calificacion;
        this.pedidosCompletados += 1;
        this.calificacionPromedio = sumaTotal / this.pedidosCompletados;
      } else {
        // contamos el pedido pero no alteramos la media si no hubo calificación dada
        this.pedidosCompletados += 1;
      }

      resultado.mensaje = `Pedido completado ✅. Calificación recibida: ${resultado.calificacion}`;
    } else {
      resultado.mensaje = `Pedido NO completado ❌. Calificación registrada (no contable): ${resultado.calificacion}`;
      // No cambiamos pedidosCompletados ni calificacionPromedio
    }

    return resultado;
  }

  // Método 3: activar / desactivar reparto
  toggleActivo() {
    this.activo = !this.activo;
    return this.activo;
  }

  // Método auxiliar: reiniciar a valores iniciales
  reiniciar(nombre = 'Juan Pérez') {
    this.nombre = nombre;
    this.pedidosCompletados = 0;
    this.calificacionPromedio = 5.0;
    this.activo = true;
  }
}

/* ---------- Lógica de la UI y enlazado ---------- */

const repartidor = new Repartidor('Juan Pérez', 0, 5.0, true);

// Elementos UI
const nombreValor = document.getElementById('nombreValor');
const pedidosValor = document.getElementById('pedidosValor');
const clasificacionValor = document.getElementById('clasificacionValor');
const activoBadge = document.getElementById('activoBadge');

const btnPresentarse = document.getElementById('btnPresentarse');
const btnToggleActivo = document.getElementById('btnToggleActivo');
const btnCompletar = document.getElementById('btnCompletar');
const btnReset = document.getElementById('btnReset');

const inputNombre = document.getElementById('inputNombre');
const inputCalificacion = document.getElementById('inputCalificacion');
const selectCompletado = document.getElementById('selectCompletado');
const logArea = document.getElementById('logArea');

const btnCompletarSinCal = document.getElementById('btnCompletarSinCal');
const inputSimularN = document.getElementById('inputSimularN');
const selectSimularCal = document.getElementById('selectSimularCal');
const btnSimular = document.getElementById('btnSimular');

// Función para renderizar la tarjeta del repartidor
function renderTarjeta() {
  const info = repartidor.presentarse();
  nombreValor.textContent = info.nombre;
  pedidosValor.textContent = info.pedidosCompletados;
  clasificacionValor.textContent = info.clasificacionPromedio.toFixed(2);
  if (info.activo) {
    activoBadge.textContent = 'ACTIVO';
    activoBadge.classList.remove('activo-false');
    activoBadge.classList.add('activo-true');
  } else {
    activoBadge.textContent = 'INACTIVO';
    activoBadge.classList.remove('activo-true');
    activoBadge.classList.add('activo-false');
  }
}

// Función para añadir línea al log
function escribirLog(texto) {
  const tiempo = new Date().toLocaleTimeString();
  logArea.textContent = `[${tiempo}] ${texto}\n` + logArea.textContent;
}

// Presentarse: toma el nombre del input y muestra la tarjeta
btnPresentarse.addEventListener('click', () => {
  const nombre = inputNombre.value.trim() || 'Juan Pérez';
  repartidor.nombre = nombre;
  renderTarjeta();
  escribirLog(`Se presentó: ${nombre}`);
});

// Toggle activo
btnToggleActivo.addEventListener('click', () => {
  const nuevo = repartidor.toggleActivo();
  renderTarjeta();
  escribirLog(`Estado activo cambiado a: ${nuevo ? 'ACTIVO' : 'INACTIVO'}`);
});

// Registrar pedido: lee si se completo y la calificacion
btnCompletar.addEventListener('click', () => {
  const completado = selectCompletado.value === 'true';
  const cal = parseFloat(inputCalificacion.value);
  const calificacionValida = Number.isFinite(cal) ? cal : null;

  const resultado = repartidor.completarPedido(completado, calificacionValida);
  renderTarjeta();

  // Mostrar resultado al usuario en el log y en alert (breve)
  escribirLog(resultado.mensaje + ` → pedidos: ${repartidor.pedidosCompletados}, promedio: ${repartidor.calificacionPromedio.toFixed(2)}`);
  // Pequeño popup informativo (no obligatorio)
  alert(resultado.mensaje);
});

// Reset / inicializar al estado base (Nombre del input)
btnReset.addEventListener('click', () => {
  const nombre = inputNombre.value.trim() || 'Juan Pérez';
  repartidor.reiniciar(nombre);
  renderTarjeta();
  escribirLog('Sistema reiniciado e inicializado.');
});

// Inicializar al cargar
renderTarjeta();
escribirLog('Actividad cargada. Usa "Presentarse" para actualizar el nombre o "Registrar pedido" para simular pedidos.');

btnCompletarSinCal.addEventListener('click', () => {
  // Simula completar un pedido sin calificación numérica: cuenta el pedido pero no altera la media
  repartidor.pedidosCompletados += 1;
  renderTarjeta();
  escribirLog(`Pedido completado sin calificación → pedidos: ${repartidor.pedidosCompletados}, promedio: ${repartidor.calificacionPromedio.toFixed(2)}`);
});
btnSimular.addEventListener('click', () => {
  const n = Math.max(1, parseInt(inputSimularN.value) || 1);
  const modo = selectSimularCal.value; // 'none', 'aleatorio', 'fija'
  let contadorNuevos = 0;

  for (let i = 0; i < n; i++) {
    if (modo === 'none') {
      // completar sin calificación
      repartidor.pedidosCompletados += 1;
      contadorNuevos++;
    } else if (modo === 'aleatorio') {
      // calificación aleatoria entre 1 y 5
      const cal = Math.floor(Math.random() * 5) + 1;
      const res = repartidor.completarPedido(true, cal);
      if (res.completado) contadorNuevos++;
    } else { // 'fija'
      const cal = parseFloat(inputCalificacion.value) || null;
      const res = repartidor.completarPedido(true, cal);
      if (res.completado) contadorNuevos++;
    }
  }

  renderTarjeta();
  escribirLog(`Simulados ${contadorNuevos} pedidos (${modo === 'none' ? 'sin calificación' : modo === 'aleatorio' ? 'con calificaciones aleatorias' : 'con calificación fija'}) — pedidos totales: ${repartidor.pedidosCompletados}, promedio: ${repartidor.calificacionPromedio.toFixed(2)}`);
});
