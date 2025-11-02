const contenedoresData = {
  Carnes: [
    { nombre: "Bandeja 1.0 kg", tara: 1.0 },
    { nombre: "Bandeja 0.8 kg", tara: 0.8 },
    { nombre: "Canasta mediana 1.8 kg", tara: 1.8 },
    { nombre: "Canasta grande 2.0 kg", tara: 2.0 }
  ],
  Fruver: [
    { nombre: "Canasta abatible 2.3 kg", tara: 2.3 },
    { nombre: "Canasta grande 2.0 kg", tara: 2.0 },
    { nombre: "Canasta mediana 1.8 kg", tara: 1.8 },
    { nombre: "Canasta pequeña 1.3 kg", tara: 1.3 },
    { nombre: "Bandeja 0.8 kg", tara: 0.8 }
  ]
};

let seccionActual = "";
let tiposSeleccionados = [];

function seleccionarSeccion(seccion) {
  seccionActual = seccion;
  document.getElementById("seccion-select").classList.add("hidden");
  document.getElementById("contenedor-select").classList.remove("hidden");

  const titulo = document.getElementById("titulo-seccion");
  titulo.textContent = `Sección ${seccion}`;

  const lista = document.getElementById("contenedores");
  lista.innerHTML = "";
  contenedoresData[seccion].forEach((c) => {
    const btn = document.createElement("button");
    btn.className = "btn azul";
    btn.textContent = `${c.nombre} (${c.tara} kg)`;
    btn.onclick = () => seleccionarContenedor(c);
    lista.appendChild(btn);
  });
}

function seleccionarContenedor(contenedor) {
  tiposSeleccionados = [{ ...contenedor, cantidad: 1 }];
  mostrarPantallaCalculo();
}

function mostrarPantallaCalculo() {
  // Mostrar pantalla de cálculo
  document.getElementById("contenedor-select").classList.add("hidden");
  const calc = document.getElementById("calculo");
  calc.classList.remove("hidden");

  calc.innerHTML = `
    <h2>Tipos de canastas seleccionadas:</h2>
    <div id="listaCanastas"></div>
    <button class="btn verde" id="addTipo">+ Agregar otro tipo de canasta</button>

    <label>Peso bruto (tal como lo muestra la balanza):</label>
    <input type="number" id="pesoBruto" step="0.01" placeholder="Ej: 32.80">

    <div style="display:flex; gap:10px; flex-wrap:wrap; justify-content:center;">
      <button class="btn azul" id="btnCalcular">Calcular peso neto</button>
      <button class="btn gris" id="btnVolver">⬅ Volver</button>
    </div>
  `;

  // Reasignar eventos
  document.getElementById("addTipo").addEventListener("click", agregarNuevoTipo);
  document.getElementById("btnCalcular").addEventListener("click", calcularPeso);
  document.getElementById("btnVolver").addEventListener("click", () => {
    // Oculta cálculo y regresa a selección de canastas
    calc.classList.add("hidden");
    document.getElementById("contenedor-select").classList.remove("hidden");
  });

  renderizarTipos();
}

function renderizarTipos() {
  const contenedorLista = document.getElementById("listaCanastas");
  contenedorLista.innerHTML = "";

  tiposSeleccionados.forEach((item, index) => {
    const bloque = document.createElement("div");
    bloque.className = "bloque-canasta";
    bloque.innerHTML = `
      <label>Tipo ${index + 1}:</label>
      <select id="tipo${index}">
        ${contenedoresData[seccionActual]
          .map(
            (c) =>
              `<option value="${c.nombre}" ${
                c.nombre === item.nombre ? "selected" : ""
              }>${c.nombre} (${c.tara} kg)</option>`
          )
          .join("")}
      </select>

      <label>Cantidad:</label>
      <input type="number" id="cantidad${index}" min="1" value="${item.cantidad}">
      ${
        index > 0
          ? `<button class="btn rojo eliminar" id="del${index}">Eliminar</button>`
          : ""
      }
    `;
    contenedorLista.appendChild(bloque);

    document.getElementById(`tipo${index}`).addEventListener("change", () => actualizarTipo(index));
    document.getElementById(`cantidad${index}`).addEventListener("input", () => actualizarCantidad(index));
    if (index > 0)
      document.getElementById(`del${index}`).addEventListener("click", () => eliminarTipo(index));
  });
}

function agregarNuevoTipo() {
  tiposSeleccionados.push({ ...contenedoresData[seccionActual][0], cantidad: 1 });
  renderizarTipos();
}

function eliminarTipo(index) {
  tiposSeleccionados.splice(index, 1);
  renderizarTipos();
}

function actualizarTipo(index) {
  const nombreSel = document.getElementById(`tipo${index}`).value;
  const seleccionado = contenedoresData[seccionActual].find((c) => c.nombre === nombreSel);
  tiposSeleccionados[index].nombre = seleccionado.nombre;
  tiposSeleccionados[index].tara = seleccionado.tara;
}

function actualizarCantidad(index) {
  const cantidad = parseFloat(document.getElementById(`cantidad${index}`).value);
  tiposSeleccionados[index].cantidad = cantidad > 0 ? cantidad : 1;
}

function calcularPeso() {
  const pesoBruto = parseFloat(document.getElementById("pesoBruto").value);
  if (isNaN(pesoBruto) || pesoBruto <= 0) {
    alert("Por favor, ingresa un peso bruto válido.");
    return;
  }

  let taraTotal = 0;
  tiposSeleccionados.forEach((item) => (taraTotal += item.cantidad * item.tara));
  const pesoNeto = pesoBruto - taraTotal;

  document.getElementById("calculo").classList.add("hidden");
  document.getElementById("resultado").classList.remove("hidden");

  const detalle = tiposSeleccionados
    .map(
      (t) =>
        `${t.cantidad} x ${t.tara.toFixed(2)} kg (${t.nombre}) = ${(t.cantidad * t.tara).toFixed(2)} kg`
    )
    .join("<br>");

  document.getElementById("detalleTara").innerHTML = `Tara total: ${taraTotal.toFixed(2)} kg<br>${detalle}`;
  document.getElementById("pesoNeto").textContent = `Peso Neto Final: ${pesoNeto.toFixed(2)} kg ✅`;

  if (pesoNeto < 0) {
    alert("⚠️ El peso neto resultó negativo. Revisa los valores ingresados.");
  }
}

function nuevoPesaje() {
  document.getElementById("resultado").classList.add("hidden");
  document.getElementById("seccion-select").classList.remove("hidden");
}

// --- Botón "Volver" desde la segunda pantalla ---
document.addEventListener("DOMContentLoaded", () => {
  const btnVolver = document.getElementById("volverSeccion");
  if (btnVolver) {
    btnVolver.addEventListener("click", () => {
      // Oculta la lista de canastas y vuelve a las secciones
      document.getElementById("contenedor-select").classList.add("hidden");
      document.getElementById("seccion-select").classList.remove("hidden");
    });
  }

});
