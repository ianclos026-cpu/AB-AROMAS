let productos = JSON.parse(localStorage.getItem("productos")) || [];

let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

const numero = "5493434518207"; // 👉 poné tu número real

let editandoId = null;

// 🧴 Render productos
function renderProductos() {
    const cont = document.getElementById("productos");
    cont.innerHTML = "";

    productos.forEach(p => {
        cont.innerHTML += `
        <div class="product">
            <img src="${p.imagenes ? p.imagenes[0] : p.imagen}">
            <h3>${p.nombre}</h3>
            <p>${p.descripcion}</p>
            <p><b>$${p.precio}</b></p>

            <select id="frag-${p.id}">
                ${p.fragancias.map(f => `<option>${f}</option>`).join("")}
            </select>

            <button onclick="agregarAlCarrito(${p.id})">Agregar</button>
        </div>
        `;
    });
}

// ➕ Carrito
function agregarAlCarrito(id) {
    const producto = productos.find(p => p.id === id);
    const fragancia = document.getElementById(`frag-${id}`).value;

    const item = carrito.find(i => i.id === id && i.fragancia === fragancia);

    if (item) {
        item.cantidad++;
    } else {
        carrito.push({
            id: producto.id,
            nombre: producto.nombre,
            precio: producto.precio,
            imagen: producto.imagenes ? producto.imagenes[0] : producto.imagen,
            fragancia,
            cantidad: 1
        });
    }

    renderCarrito();
}

// 🛒 Render carrito
// 🛒 Render carrito
function renderCarrito() {

    const cont = document.getElementById("carrito");
    const totalDiv = document.getElementById("total");

    let total = 0;

    cont.innerHTML = "";


    carrito.forEach((item, index) => {

        total += item.precio * item.cantidad;


        cont.innerHTML += `

        <div class="cart-item">

            <img src="${item.imagen}" class="cart-img">


            <div class="cart-info">

                <strong>${item.nombre}</strong>

                <span>
                    Fragancia: ${item.fragancia}
                </span>


                <span class="price">
                    $${item.precio}
                </span>


                <div class="cart-controls">

                    <button onclick="cambiarCantidad(${index}, -1)">
                        -
                    </button>


                    <span>
                        ${item.cantidad}
                    </span>


                    <button onclick="cambiarCantidad(${index}, 1)">
                        +
                    </button>


                    <button class="delete-btn" onclick="eliminarDelCarrito(${index})">
                        🗑
                    </button>

                </div>


            </div>


        </div>

        `;

    });



    totalDiv.innerHTML = `
        <h3>Total: $${total}</h3>
    `;


    guardarCarrito();

}
function guardarCarrito() {
    localStorage.setItem("carrito", JSON.stringify(carrito));
}

function eliminarDelCarrito(index) {
    carrito.splice(index, 1);
    renderCarrito();
}
function cambiarCantidad(index, cambio) {
    carrito[index].cantidad += cambio;

    if (carrito[index].cantidad <= 0) {
        carrito.splice(index, 1);
    }

    renderCarrito();
}

// 📲 WhatsApp
function enviarWhatsApp() {

    if (carrito.length === 0) {
        alert("El carrito está vacío");
        return;
    }

    let mensaje = "Hola AB AROMAS! 👋\n\n";
    mensaje += "Quiero realizar el siguiente pedido:\n\n";

    let totalGeneral = 0;

    let productosAgrupados = {};


    // Agrupar por producto
    carrito.forEach(item => {

        if (!productosAgrupados[item.nombre]) {

            productosAgrupados[item.nombre] = {
                cantidad: 0,
                precio: item.precio,
                fragancias: {}
            };
        }


        productosAgrupados[item.nombre].cantidad += item.cantidad;


        // Solo guardar fragancias si existen
        if (item.fragancia && item.fragancia.trim() !== "") {

            if (!productosAgrupados[item.nombre].fragancias[item.fragancia]) {
                productosAgrupados[item.nombre].fragancias[item.fragancia] = 0;
            }

            productosAgrupados[item.nombre].fragancias[item.fragancia] += item.cantidad;
        }

    });


    let contador = 1;


    Object.keys(productosAgrupados).forEach(nombre => {

        let producto = productosAgrupados[nombre];

        totalGeneral += producto.cantidad * producto.precio;


        mensaje += `${contador}) ${nombre}\n`;
        mensaje += `   Cantidad: ${producto.cantidad}\n`;


        // Mostrar fragancias solo si tiene
        let listaFragancias = Object.keys(producto.fragancias);


        if (listaFragancias.length > 0) {

            mensaje += `   Fragancias:\n`;

            listaFragancias.forEach(fragancia => {

                mensaje += `   - ${fragancia} x${producto.fragancias[fragancia]}\n`;

            });
        }


        mensaje += "\n";

        contador++;

    });


    mensaje += `TOTAL DEL PEDIDO: $${totalGeneral}\n\n`;
    mensaje += "Muchas gracias! 😊";


    const url =
        "https://wa.me/" +
        numero +
        "?text=" +
        encodeURIComponent(mensaje);


    window.open(url, "_blank");
}

// 🔐 ADMIN

function toggleAdmin() {
    document.getElementById("adminPanel").classList.toggle("hidden");
    renderAdmin();
}

// Guardar producto
function guardarProducto() {
    const nombre = document.getElementById("nombre").value;
    const precio = Number(document.getElementById("precio").value);
    const descripcion = document.getElementById("descripcion").value;
    const fragancias = document.getElementById("fragancias").value.split(",");

    const fileInput = document.getElementById("imagenFile");
    const file = fileInput.files[0];

    // 👉 SI ESTAMOS EDITANDO
    if (editandoId) {
        const index = productos.findIndex(p => p.id === editandoId);

        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                productos[index] = {
                    ...productos[index],
                    nombre,
                    precio,
                    descripcion,
                    fragancias,
                    imagen: e.target.result
                };

                finalizarGuardado();
            };
            reader.readAsDataURL(file);
        } else {
            // 👈 mantiene la imagen anterior
            productos[index] = {
                ...productos[index],
                nombre,
                precio,
                descripcion,
                fragancias
            };

            finalizarGuardado();
        }

    } else {
        // 👉 NUEVO PRODUCTO
        if (!file) {
            alert("Subí una imagen");
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            productos.push({
                id: Date.now(),
                nombre,
                precio,
                descripcion,
                fragancias,
                imagen: e.target.result
            });

            finalizarGuardado();
        };
        reader.readAsDataURL(file);
    }
}

// Lista admin
function renderAdmin() {
    const lista = document.getElementById("listaProductos");
    lista.innerHTML = "";

    productos.forEach(p => {
        lista.innerHTML += `
            <div class="admin-item">
                <strong>${p.nombre}</strong><br>
                $${p.precio}

                <div class="admin-actions">
                    <button onclick="editarProducto(${p.id})">✏️</button>
                    <button onclick="eliminarProducto(${p.id})">🗑</button>
                </div>
            </div>
        `;
    });
}

// Eliminar
function eliminarProducto(id) {
    if (!confirm("¿Seguro que querés eliminar este producto?")) return;

    productos = productos.filter(p => p.id !== id);

    localStorage.setItem("productos", JSON.stringify(productos));

    renderProductos();
    renderAdmin();
}


// iniciar
renderProductos();


function editarProducto(id) {
    const p = productos.find(prod => prod.id === id);

    document.getElementById("nombre").value = p.nombre;
    document.getElementById("precio").value = p.precio;
    document.getElementById("descripcion").value = p.descripcion;
    document.getElementById("fragancias").value = p.fragancias.join(",");

    editandoId = id;

    document.getElementById("adminPanel").classList.remove("hidden");
}

function finalizarGuardado() {
    localStorage.setItem("productos", JSON.stringify(productos));

    editandoId = null;

    document.getElementById("nombre").value = "";
    document.getElementById("precio").value = "";
    document.getElementById("descripcion").value = "";
    document.getElementById("fragancias").value = "";
    document.getElementById("imagenFile").value = "";

    renderProductos();
    renderAdmin();
}

function limpiarFormulario() {
    document.getElementById("nombre").value = "";
    document.getElementById("precio").value = "";
    document.getElementById("descripcion").value = "";
    document.getElementById("fragancias").value = "";
    document.getElementById("imagenFile").value = "";

    editandoId = null;
}

const ADMIN_PASSWORD = "1234"; // 👉 CAMBIALA

function toggleAdmin() {
    const pass = prompt("Ingrese contraseña de administrador:");

    if (pass === ADMIN_PASSWORD) {
        document.getElementById("adminPanel").classList.toggle("hidden");
    } else {
        alert("Contraseña incorrecta");
    }
}
function toggleAdmin() {

    const yaLogueado = localStorage.getItem("admin");

    if (yaLogueado === "true") {
        document.getElementById("adminPanel").classList.toggle("hidden");
        return;
    }

    const pass = prompt("Ingrese contraseña de administrador:");

    if (pass === ADMIN_PASSWORD) {
        localStorage.setItem("admin", "true");
        document.getElementById("adminPanel").classList.toggle("hidden");
    } else {
        alert("Contraseña incorrecta");
    }
}
// 🔐 LOGIN SIMPLE
function login() {
    const pass = prompt("Ingresá la contraseña de admin:");

    if (pass === "1234") { // 👈 cambiá esto
        localStorage.setItem("admin", "true");
        alert("Bienvenido admin");
        mostrarAdmin();
        renderAdmin();
    } else {
        alert("Contraseña incorrecta");
    }
}

// Mostrar botón admin si está logueado
function mostrarAdmin() {
    if (localStorage.getItem("admin") === "true") {
        document.getElementById("btnAdmin").classList.remove("hidden");
    }
}

// Logout
function logout() {
    localStorage.removeItem("admin");
    location.reload();
}