const path = window.location.pathname;

// --- Lógica para index.html ---
if (path.includes("index.html")) {
    const btnRegistro = document.getElementById("btnRegistro");
    if (btnRegistro) {
        btnRegistro.addEventListener("click", function(event) {
            event.preventDefault();
            window.location.href = "pages/registro.html";
        });
    }
}

// --- Lógica para registro.html ---
if (path.includes("registro.html")) {
    const formRegistro = document.querySelector("form");
    if (formRegistro) {
        formRegistro.addEventListener("submit", function(event) {
            event.preventDefault();
            const usuario = formRegistro.querySelector("input[type='text']").value;
            const pass1 = formRegistro.querySelectorAll("input[type='password']")[0].value;
            const pass2 = formRegistro.querySelectorAll("input[type='password']")[1].value;

            if (!usuario || !pass1 || !pass2) {
                alert("Todos los campos son obligatorios");
                return;
            }
            if (pass1 !== pass2) {
                alert("Las contraseñas no coinciden");
                return;
            }

            alert("Registro válido. Enviando datos...");
            window.location.href = "index.html"; // vuelve al login
        });
    }
}

const userIcon = document.getElementById("userIcon");
const menuUsuario = document.getElementById("menuUsuario");
const cerrarSesion = document.getElementById("cerrarSesion");

// Mostrar/ocultar menú al hacer clic en el icono
if (userIcon && menuUsuario) {
    userIcon.addEventListener("click", function(event) {
        event.stopPropagation();
        menuUsuario.style.display =
            menuUsuario.style.display === "none" || menuUsuario.style.display === ""
            ? "block"
            : "none";
    });

    document.addEventListener("click", function(event) {
        if (!userIcon.contains(event.target)) {
            menuUsuario.style.display = "none";
        }
    });
}

// Acción de cerrar sesión
if (cerrarSesion) {
    cerrarSesion.addEventListener("click", function(event) {
        event.preventDefault();
        alert("Sesión cerrada");

        // Detectar si estamos en inicio.html o en un área
        if (window.location.pathname.includes("pages/inicio/inicio.html")) {
            window.location.href = "../../index.html"; // inicio → sube 1 nivel
        } else {
            window.location.href = "../../../index.html"; // áreas → suben 2 niveles
        }
    });
}

function agregarFila() {
    const tabla = document.getElementById("tabla-cuerpo");
    const nuevaFila = document.createElement("tr");
    const numeroFila = tabla.rows.length + 1;

    nuevaFila.innerHTML = `
        <td>${numeroFila}</td>
        <td contenteditable="true">Nuevo Item</td>
        <td contenteditable="true">-</td>
        <td contenteditable="true">0</td>
        <td contenteditable="true">0</td>
        <td contenteditable="true">...</td>
        <td><img src="alert.png" class="alert-icon" style="width: 20px;"></td>
        <td>
            <button class="btn-borrar" onclick="borrarFila(this)">🗑️</button>
        </td>
    `;

    tabla.appendChild(nuevaFila);
}

const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", async function(event) {
        event.preventDefault();

        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        const response = await fetch("http://localhost:8080/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({ username, password })
        });

        if (response.ok) {
            alert("Login exitoso");
            window.location.href = "pages/inicio/inicio.html";
        } else {
            alert("Credenciales inválidas");
        }
    });
}

async function cargarBarra() {

    const res = await fetch("http://localhost:8080/barra");
    const data = await res.json();

    const tabla = document.getElementById("tabla-cuerpo");
    tabla.innerHTML = "";

    let contador = 1;

    data.forEach(item => {

        let alerta = "";

        if (item.unidad < item.minimo_id) {
            alerta = '<img src="alert.png" style="width:20px">';
        } else {
            alerta = '<img src="alert-gray.png" style="width:20px">';
        }

        tabla.innerHTML += `
            <tr data-id="${item.id}">
                <td>${contador++}</td>
                <td contenteditable="true">${item.nombre}</td>
                <td contenteditable="true">${item.tipo}</td>
                <td contenteditable="true">${item.unidad}</td>
                <td contenteditable="true">${item.minimo_id}</td>
                <td contenteditable="true">${item.observacion || ""}</td>
                <td>${alerta}</td>
                <td>
                    <button onclick="borrarRegistro('barra', ${item.id}, this)">🗑️</button>
                </td>
            </tr>
        `;
    });
}

if (path.includes("barra.html")) {
    window.onload = cargarBarra;
}

async function borrarRegistro(area, id, boton) {

    if (!confirm("¿Seguro que quieres eliminar este producto?")) {
        return;
    }

    try {
        const response = await fetch(`http://localhost:8080/${area}/${id}`, {
            method: "DELETE"
        });

        if (response.ok) {
            // eliminar visualmente
            const fila = boton.closest("tr");
            fila.remove();

            alert("Producto eliminado ✅");
        } else {
            alert("Error al eliminar ❌");
        }

    } catch (error) {
        console.error("Error:", error);
        alert("Error de conexión ❌");
    }
}

async function guardarCambios(area) {

    const filas = document.querySelectorAll("#tabla-cuerpo tr");

    for (const fila of filas) {

        const id = fila.getAttribute("data-id");
        const celdas = fila.querySelectorAll("td");

        const producto = {
            nombre: celdas[1].innerText,
            tipo: celdas[2].innerText,
            unidad: parseInt(celdas[3].innerText),
            minimo_id: parseInt(celdas[4].innerText),
            observacion: celdas[5].innerText
        };

        try {

            // ✅ UPDATE
            if (id) {
                await fetch(`http://localhost:8080/${area}/${id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(producto)
                });

            } else {
                // ✅ CREATE
                await fetch(`http://localhost:8080/${area}`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(producto)
                });
            }

        } catch (error) {
            console.error("Error:", error);
        }
    }

    alert("Cambios guardados ✅");

    // 🔥 RECARGA SEGÚN ÁREA
    cargarArea(area);
}
``

async function cargarCocina() {

    const res = await fetch("http://localhost:8080/cocina");
    const data = await res.json();

    const tabla = document.getElementById("tabla-cuerpo");
    tabla.innerHTML = "";

    let contador = 1;

    data.forEach(item => {

        let alerta = "";

        if (item.unidad < item.minimo_id) {
            alerta = '<img src="alert.png" style="width:20px">';
        } else {
            alerta = '<img src="alert-gray.png" style="width:20px">';
        }

        tabla.innerHTML += `
            <tr data-id="${item.id}">
                <td>${contador++}</td>
                <td contenteditable="true">${item.nombre}</td>
                <td contenteditable="true">${item.tipo}</td>
                <td contenteditable="true">${item.unidad}</td>
                <td contenteditable="true">${item.minimo_id}</td>
                <td contenteditable="true">${item.observacion || ""}</td>
                <td>${alerta}</td>
                <td>
                    <button onclick="borrarRegistro('cocina', ${item.id}, this)">🗑️</button>
                </td>
            </tr>
        `;
    });
}


if (path.includes("cocina.html")) {
    window.onload = cargarCocina;
}


function cargarArea(area) {

    if (area === "barra") {
        cargarBarra();
    } else if (area === "cocina") {
        cargarCocina();
    } else if (area === "servicio") {
        cargarServicio();
    } else if (area === "requisicion") {
        cargarRequisicion();
    }
}

async function cargarServicio() {

    const res = await fetch("http://localhost:8080/servicio");
    const data = await res.json();

    const tabla = document.getElementById("tabla-cuerpo");
    tabla.innerHTML = "";

    let contador = 1;

    data.forEach(item => {


            let alerta = item.unidad < item.minimo_id
                ? '<img src="alert.png" style="width:20px">'
                : '<img src="alert-gray.png" style="width:20px">';


        tabla.innerHTML += `
            <tr data-id="${item.id}">
                <td>${contador++}</td>
                <td contenteditable="true">${item.nombre}</td>
                <td contenteditable="true">${item.tipo}</td>
                <td contenteditable="true">${item.unidad}</td>
                <td contenteditable="true">${item.minimo_id}</td>
                <td contenteditable="true">${item.observacion || ""}</td>
                <td>${alerta}</td>
                <td>
                    <button onclick="borrarRegistro('servicio', ${item.id}, this)">🗑️</button>
                </td>
            </tr>
        `;
    });
}

if (path.includes("servicio.html")) {
    window.onload = () => cargarArea("servicio");
}

async function cargarRequisicion() {

    const res = await fetch("http://localhost:8080/requisicion");
    const data = await res.json();

    const tabla = document.getElementById("tabla-cuerpo");
    tabla.innerHTML = "";

    let contador = 1;

    data.forEach(item => {

        let alerta = item.unidad < item.minimo_id
            ? '<img src="alert.png" style="width:20px">'
            : '<img src="alert-gray.png" style="width:20px">';

        tabla.innerHTML += `
            <tr data-id="${item.id}">
                <td>${contador++}</td>
                <td contenteditable="true">${item.nombre}</td>
                <td contenteditable="true">${item.tipo}</td>
                <td contenteditable="true">${item.unidad}</td>
                <td contenteditable="true">${item.minimo_id}</td>
                <td contenteditable="true">${item.observacion || ""}</td>
                <td>${alerta}</td>
                <td>
                    <button onclick="borrarRegistro('requisicion', ${item.id}, this)">🗑️</button>
                </td>
            </tr>
        `;
    });
}

if (path.includes("requisicion.html")) {
    window.onload = () => cargarArea("requisicion");
}