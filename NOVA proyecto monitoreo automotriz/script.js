/* =========================================================
   NOVA MONITORING
   Frontend demo - Maquinaria industrial automotriz
   20 máquinas / 6 familias
   ========================================================= */
document.addEventListener("DOMContentLoaded", () => {
    /* =====================================================
       1. CONFIGURACIÓN GENERAL
       ===================================================== */


    const NOVA_AUTH_KEY = "novaActiveSession";

    const USUARIOS_NOVA = {
        operativo: {
            password: "nova123",
            rol: "operativo",
            inicial: "O",
            nombre: "Usuario operativo",
            etiqueta: "Operativo"
        },
        // Alias de compatibilidad con la versión anterior del prototipo.
        trabajador: {
            password: "nova123",
            rol: "operativo",
            inicial: "O",
            nombre: "Usuario operativo",
            etiqueta: "Operativo"
        },
        gerencial: {
            password: "nova123",
            rol: "gerencial",
            inicial: "G",
            nombre: "Usuario gerencial",
            etiqueta: "Gerencial"
        },
        admin: {
            password: "nova123",
            rol: "administrador",
            inicial: "A",
            nombre: "Usuario administrador",
            etiqueta: "Administrador"
        }
    };

    const PERMISOS_NOVA = {
        operativo: ["ver", "monitorear", "agregar", "alertas", "historial"],
        gerencial: ["ver", "monitorear", "alertas", "historial", "reportes"],
        administrador: ["ver", "monitorear", "agregar", "editar", "actualizar", "mantenimiento", "eliminar", "sensores", "administracion", "alertas", "historial", "reportes"]
    };

    let sesionNOVA = null;

    function obtenerSesionNOVA() {
        try {
            const guardada = localStorage.getItem(NOVA_AUTH_KEY);
            if (!guardada) return null;
            const sesion = JSON.parse(guardada);
            if (!sesion || !sesion.usuario || !sesion.rol) return null;
            const cuenta = USUARIOS_NOVA[sesion.usuario];
            if (!cuenta || cuenta.rol !== sesion.rol) return null;
            return sesion;
        } catch (error) {
            console.warn("No fue posible recuperar la sesión de NOVA.", error);
            return null;
        }
    }

    function guardarSesionNOVA(usuario) {
        const datos = USUARIOS_NOVA[usuario];
        if (!datos) return;
        sesionNOVA = {
            usuario,
            rol: datos.rol,
            inicial: datos.inicial,
            nombre: datos.nombre,
            etiqueta: datos.etiqueta
        };
        try {
            localStorage.setItem(NOVA_AUTH_KEY, JSON.stringify(sesionNOVA));
        } catch (error) {
            console.warn("La sesión no pudo guardarse en el navegador.", error);
        }
    }

    function esAdministrador() {
        return sesionNOVA?.rol === "administrador";
    }

    function esOperativo() {
        return sesionNOVA?.rol === "operativo";
    }

    function esGerencial() {
        return sesionNOVA?.rol === "gerencial";
    }

    function tienePermiso(permiso) {
        return !!sesionNOVA && (PERMISOS_NOVA[sesionNOVA.rol] || []).includes(permiso);
    }

    function requerirPermiso(permiso) {
        if (tienePermiso(permiso)) return true;
        mostrarAviso("Tu perfil no tiene permiso para realizar esta acción.", "warning");
        return false;
    }

    /* =====================================================
       AUTENTICACIÓN Y ROLES
       Operativo: consultar, monitorear y registrar/agregar.
       Gerencial: consultar, monitorear y analizar indicadores.
       Administrador: acceso completo.
    ====================================================== */

    function actualizarPerfilNOVA() {
        if (!sesionNOVA) return;

        const avatar = $("#userAvatar") || $(".user-avatar");
        const nombre = $("#userName") || $(".user-info strong");
        const etiqueta = $("#userRole") || $(".user-info span");

        if (avatar) avatar.textContent = sesionNOVA.inicial;
        if (nombre) nombre.textContent = sesionNOVA.nombre;
        if (etiqueta) etiqueta.textContent = sesionNOVA.etiqueta;
    }

    function aplicarPermisosNOVA() {
        const admin = esAdministrador();
        const operativo = esOperativo();
        const gerencial = esGerencial();

        // Acciones administrativas: únicamente Administrador.
        [
            $("#adminEditMachine"),
            $("#adminDeleteMachine"),
            $("#adminSensorManagement"),
            $("#maintenanceButton")
        ].forEach(elemento => {
            if (elemento) {
                elemento.style.display = admin ? "" : "none";
            }
        });

        // Agregar activos: Administrador y Operativo.
        [$("#adminAddMachine"), $("#addMachineButton")].forEach(elemento => {
            if (elemento) {
                elemento.style.display = (admin || operativo) ? "" : "none";
            }
        });

        // Secciones de configuración reservadas al Administrador.
        const adminSection = $("#admin");
        const adminNav = document.querySelector('[data-section="admin"]');
        if (adminSection) adminSection.style.display = admin ? "" : "none";
        if (adminNav) adminNav.style.display = admin ? "" : "none";

        const maintenanceNav = document.querySelector('[data-section="maintenance"]');
        if (maintenanceNav) maintenanceNav.style.display = admin ? "" : "none";

        const kicker = adminSection?.querySelector(".panel-kicker");
        const title = adminSection?.querySelector("h2");
        const tag = adminSection?.querySelector(".panel-tag");

        if (admin) {
            if (kicker) kicker.textContent = "GESTIÓN DE ACTIVOS";
            if (title) title.textContent = "Administración de máquinas";
            if (tag) {
                tag.textContent = "ADMIN";
                tag.classList.add("purple-tag");
            }
        } else if (operativo) {
            if (kicker) kicker.textContent = "OPERACIÓN";
            if (title) title.textContent = "Registro y monitoreo";
            if (tag) {
                tag.textContent = "OPERATIVO";
                tag.classList.remove("purple-tag");
            }
        } else if (gerencial) {
            if (kicker) kicker.textContent = "SUPERVISIÓN";
            if (title) title.textContent = "Indicadores y monitoreo";
            if (tag) {
                tag.textContent = "GERENCIAL";
                tag.classList.remove("purple-tag");
            }
        }
    }

    function mostrarLoginNOVA() {
        const app = $("#novaApp") || document.querySelector(".nova-app");
        const login = $("#novaLoginScreen");

        if (app) app.style.display = "none";
        if (login) {
            login.style.display = "flex";
            login.hidden = false;
        }

        const form = $("#novaLoginForm");
        const error = $("#novaLoginError");
        if (error) {
            error.textContent = "";
            error.classList.remove("show");
        }

        const usuario = $("#novaUsername");
        if (usuario) setTimeout(() => usuario.focus(), 100);
    }

    function mostrarAplicacionNOVA() {
        const login = $("#novaLoginScreen");
        const app = $("#novaApp") || document.querySelector(".nova-app");

        if (login) {
            login.style.display = "none";
            login.hidden = true;
        }

        if (app) app.style.display = "flex";

        actualizarPerfilNOVA();
        aplicarPermisosNOVA();
    }

    function procesarLoginNOVA(event) {
        event.preventDefault();

        const usuarioInput = $("#novaUsername");
        const passwordInput = $("#novaPassword");
        const error = $("#novaLoginError");

        if (!usuarioInput || !passwordInput) return;

        const usuario = usuarioInput.value.trim().toLowerCase();
        const password = passwordInput.value;
        const cuenta = USUARIOS_NOVA[usuario];

        if (!cuenta || cuenta.password !== password) {
            if (error) {
                error.textContent = "Usuario o contraseña incorrectos.";
                error.classList.add("show");
            }
            passwordInput.value = "";
            passwordInput.focus();
            return;
        }

        guardarSesionNOVA(usuario);

        if (error) {
            error.textContent = "";
            error.classList.remove("show");
        }

        mostrarAplicacionNOVA();

        // Al autenticarse, el monitoreo continuo comienza automáticamente.
        if (!simulacionActiva && typeof iniciarSimulacion === "function") {
            iniciarSimulacion();
        }
    }

    function cerrarSesionNOVA() {
        if (typeof simulacionActiva !== "undefined" && simulacionActiva) {
            detenerSimulacion();
        }

        sesionNOVA = null;

        try {
            localStorage.removeItem(NOVA_AUTH_KEY);
        } catch (error) {
            console.warn("No fue posible borrar la sesión guardada.", error);
        }

        $("#novaLoginForm")?.reset();
        mostrarLoginNOVA();
    }

    function inicializarAutenticacionNOVA() {
        sesionNOVA = obtenerSesionNOVA();

        const formulario = $("#novaLoginForm");
        if (formulario) {
            formulario.addEventListener("submit", procesarLoginNOVA);
        }

        const botonLogout = $("#logoutButton");
        if (botonLogout) {
            botonLogout.addEventListener("click", cerrarSesionNOVA);
        }

        if (sesionNOVA) {
            mostrarAplicacionNOVA();
        } else {
            mostrarLoginNOVA();
        }
    }

    const NOVA_LIVE_ENDPOINT = ""; // Cuando exista backend/API se puede conectar aquí.

    const estados = {
        normal: {
            etiqueta: "Normal",
            clase: "normal",
            color: "#35d07f"
        },
        alerta: {
            etiqueta: "Advertencia",
            clase: "warning",
            color: "#f4c95d"
        },
        anomalia: {
            etiqueta: "Anomalía",
            clase: "anomaly",
            color: "#ff2d3d"
        },
        mantenimiento: {
            etiqueta: "En mantenimiento",
            clase: "maintenance",
            color: "#38bdf8"
        }
    };

    const familias = [
        {
            id: "LOG",
            nombre: "Recepción y logística",
            descripcion: "Ingreso, movimiento y transporte interno de materiales."
        },
        {
            id: "EST",
            nombre: "Estampado y conformado",
            descripcion: "Procesos de transformación y conformado de componentes."
        },
        {
            id: "CAR",
            nombre: "Carrocería y soldadura",
            descripcion: "Unión, manipulación y posicionamiento de componentes estructurales."
        },
        {
            id: "PIN",
            nombre: "Pintura y tratamiento",
            descripcion: "Aplicación de pintura, ventilación y procesos térmicos."
        },
        {
            id: "ENS",
            nombre: "Ensamblaje",
            descripcion: "Montaje y unión automatizada de componentes."
        },
        {
            id: "MOT",
            nombre: "Motor / sistemas y pruebas",
            descripcion: "Acoplamiento, pruebas, inspección y validación final."
        }
    ];

    /* =====================================================
       2. CATÁLOGO DE LAS 20 MÁQUINAS
       ===================================================== */

    let machines = [
        {
            id: "EQ-LOG-01",
            nombre: "Montacargas industrial",
            familia: "LOG",
            funcion: "Trasladar materias primas y componentes dentro de la planta.",
            variables: [
                "Temperatura",
                "Batería",
                "Corriente",
                "Horas de operación"
            ],
            sensores: [
                "Sensor de temperatura",
                "Sensor de batería",
                "Transductor de corriente",
                "Contador de horas"
            ],
            estado: "normal",
            riesgo: 18
        },

        {
            id: "EQ-LOG-02",
            nombre: "AGV / vehículo guiado automático",
            familia: "LOG",
            funcion: "Transportar materiales de forma automatizada entre estaciones.",
            variables: [
                "Batería",
                "Posición",
                "Velocidad",
                "Distancia"
            ],
            sensores: [
                "Sensor de batería",
                "LiDAR / posicionamiento",
                "Encoder",
                "Sistema de odometría"
            ],
            estado: "normal",
            riesgo: 22
        },

        {
            id: "EQ-LOG-03",
            nombre: "Transportador industrial",
            familia: "LOG",
            funcion: "Mover piezas y materiales entre diferentes etapas del proceso.",
            variables: [
                "Velocidad",
                "Vibración",
                "Temperatura",
                "Corriente"
            ],
            sensores: [
                "Encoder",
                "Acelerómetro",
                "Sensor de temperatura",
                "Transductor de corriente"
            ],
            estado: "normal",
            riesgo: 20
        },

        {
            id: "EQ-EST-04",
            nombre: "Prensa hidráulica",
            familia: "EST",
            funcion: "Ejecutar operaciones de conformado mediante presión hidráulica.",
            variables: [
                "Presión hidráulica",
                "Temperatura",
                "Vibración",
                "Estado del aceite"
            ],
            sensores: [
                "Sensor de presión",
                "RTD / termocupla",
                "Acelerómetro",
                "Sensor de condición"
            ],
            estado: "normal",
            riesgo: 27
        },

        {
            id: "EQ-EST-05",
            nombre: "Prensa mecánica",
            familia: "EST",
            funcion: "Realizar operaciones mecánicas de estampado y conformado.",
            variables: [
                "Fuerza",
                "Velocidad",
                "Vibración",
                "Corriente"
            ],
            sensores: [
                "Celda de carga",
                "Encoder",
                "Acelerómetro",
                "Transductor de corriente"
            ],
            estado: "normal",
            riesgo: 24
        },

        {
            id: "EQ-EST-06",
            nombre: "Máquina de corte CNC",
            familia: "EST",
            funcion: "Realizar cortes automatizados sobre componentes y piezas.",
            variables: [
                "Velocidad de corte",
                "Corriente",
                "Vibración",
                "Temperatura"
            ],
            sensores: [
                "Encoder",
                "Transductor de corriente",
                "Acelerómetro",
                "Sensor de temperatura"
            ],
            estado: "normal",
            riesgo: 31
        },

        {
            id: "EQ-CAR-07",
            nombre: "Robot de soldadura por puntos",
            familia: "CAR",
            funcion: "Ejecutar puntos de soldadura en componentes de carrocería.",
            variables: [
                "Corriente de soldadura",
                "Temperatura",
                "Ciclos",
                "Presión"
            ],
            sensores: [
                "Transductor de corriente",
                "Sensor de temperatura",
                "Contador de ciclos",
                "Sensor de presión"
            ],
            estado: "alerta",
            riesgo: 64
        },

        {
            id: "EQ-CAR-08",
            nombre: "Robot de soldadura por arco",
            familia: "CAR",
            funcion: "Realizar soldadura automatizada por arco.",
            variables: [
                "Corriente",
                "Temperatura",
                "Velocidad",
                "Ciclos"
            ],
            sensores: [
                "Transductor de corriente",
                "Sensor de temperatura",
                "Encoder",
                "Contador de ciclos"
            ],
            estado: "normal",
            riesgo: 29
        },

        {
            id: "EQ-CAR-09",
            nombre: "Sistema de sujeción / Clamp",
            familia: "CAR",
            funcion: "Fijar y posicionar piezas durante el proceso de fabricación.",
            variables: [
                "Presión",
                "Posición",
                "Ciclos",
                "Fuerza"
            ],
            sensores: [
                "Sensor de presión",
                "Sensor lineal",
                "Contador de ciclos",
                "Celda de carga"
            ],
            estado: "normal",
            riesgo: 19
        },

        {
            id: "EQ-CAR-10",
            nombre: "Robot de manipulación",
            familia: "CAR",
            funcion: "Manipular y posicionar componentes entre estaciones.",
            variables: [
                "Posición",
                "Velocidad",
                "Torque",
                "Corriente"
            ],
            sensores: [
                "Encoder",
                "Encoder de velocidad",
                "Sensor de torque",
                "Transductor de corriente"
            ],
            estado: "normal",
            riesgo: 23
        },

        {
            id: "EQ-PIN-11",
            nombre: "Robot de pintura",
            familia: "PIN",
            funcion: "Aplicar recubrimientos de forma automatizada.",
            variables: [
                "Presión",
                "Velocidad",
                "Temperatura",
                "Caudal"
            ],
            sensores: [
                "Sensor de presión",
                "Encoder",
                "Sensor de temperatura",
                "Sensor de flujo"
            ],
            estado: "normal",
            riesgo: 26
        },

        {
            id: "EQ-PIN-12",
            nombre: "Cabina de pintura / ventilación",
            familia: "PIN",
            funcion: "Controlar condiciones de ventilación durante el proceso de pintura.",
            variables: [
                "Temperatura",
                "Presión",
                "Flujo de aire",
                "Velocidad del ventilador"
            ],
            sensores: [
                "Sensor de temperatura",
                "Sensor de presión diferencial",
                "Sensor de flujo de aire",
                "Encoder / sensor de velocidad"
            ],
            estado: "normal",
            riesgo: 21
        },

        {
            id: "EQ-PIN-13",
            nombre: "Horno de curado",
            familia: "PIN",
            funcion: "Realizar el curado térmico de recubrimientos.",
            variables: [
                "Temperatura",
                "Tiempo de curado",
                "Flujo de aire",
                "Presión"
            ],
            sensores: [
                "Termocupla / RTD",
                "Temporizador de proceso",
                "Sensor de flujo",
                "Sensor de presión"
            ],
            estado: "anomalia",
            riesgo: 86
        },

        {
            id: "EQ-ENS-14",
            nombre: "Brazo robótico de ensamblaje",
            familia: "ENS",
            funcion: "Realizar operaciones automatizadas de montaje.",
            variables: [
                "Posición",
                "Torque",
                "Velocidad",
                "Corriente"
            ],
            sensores: [
                "Encoder",
                "Sensor de torque",
                "Encoder",
                "Transductor de corriente"
            ],
            estado: "normal",
            riesgo: 18
        },

        {
            id: "EQ-ENS-15",
            nombre: "Atornillador automático",
            familia: "ENS",
            funcion: "Realizar aprietes automatizados y controlados.",
            variables: [
                "Torque",
                "Velocidad",
                "Corriente",
                "Ciclos"
            ],
            sensores: [
                "Sensor de torque",
                "Encoder",
                "Transductor de corriente",
                "Contador de ciclos"
            ],
            estado: "normal",
            riesgo: 28
        },

        {
            id: "EQ-ENS-16",
            nombre: "Prensa de ensamblaje",
            familia: "ENS",
            funcion: "Ejecutar operaciones de presión y acoplamiento de componentes.",
            variables: [
                "Fuerza",
                "Presión",
                "Posición",
                "Velocidad"
            ],
            sensores: [
                "Celda de carga",
                "Sensor de presión",
                "Sensor lineal",
                "Encoder"
            ],
            estado: "normal",
            riesgo: 25
        },

        {
            id: "EQ-MOT-17",
            nombre: "Estación automatizada de acoplamiento / montaje del tren motriz",
            familia: "MOT",
            funcion: "Ejecutar operaciones automatizadas de acoplamiento y montaje.",
            variables: [
                "Torque",
                "Temperatura",
                "Corriente",
                "Posición"
            ],
            sensores: [
                "Sensor de torque",
                "Sensor de temperatura",
                "Transductor de corriente",
                "Encoder"
            ],
            estado: "normal",
            riesgo: 24
        },

        {
            id: "EQ-MOT-18",
            nombre: "Banco de pruebas dinamométrico",
            familia: "MOT",
            funcion: "Evaluar el comportamiento del motor y del tren motriz.",
            variables: [
                "Temperatura",
                "RPM",
                "Vibración",
                "Presión"
            ],
            sensores: [
                "Sensor de temperatura",
                "Encoder / tacómetro",
                "Acelerómetro",
                "Sensor de presión"
            ],
            estado: "normal",
            riesgo: 34
        },

        {
            id: "EQ-MOT-19",
            nombre: "Sistema de inspección visual",
            familia: "MOT",
            funcion: "Detectar condiciones y posibles defectos mediante inspección automatizada.",
            variables: [
                "Imágenes",
                "Posición",
                "Dimensiones",
                "Defectos"
            ],
            sensores: [
                "Sistema de visión",
                "Sensor de posición",
                "Sistema de medición",
                "Inspección visual automatizada"
            ],
            estado: "normal",
            riesgo: 17
        },

        {
            id: "EQ-MOT-20",
            nombre: "Banco de pruebas final del vehículo",
            familia: "MOT",
            funcion: "Validar variables del vehículo antes de finalizar el proceso.",
            variables: [
                "Velocidad",
                "Temperatura",
                "Presión",
                "Corriente"
            ],
            sensores: [
                "Sensor de velocidad",
                "Sensor de temperatura",
                "Sensor de presión",
                "Transductor de corriente"
            ],
            estado: "normal",
            riesgo: 30
        }
    ];

    /* =====================================================
       3. VARIABLES DE TRABAJO
       ===================================================== */

    let maquinaSeleccionada = machines[0]?.id || null;
    let simulacionActiva = false;
    let intervaloSimulacion = null;
    let indiceSimulacion = 0;
    let mantenimientoEnCurso = false;
    let cicloSimulacion = 0;


    const historialRiesgo = [];
    const historialEventos = [];

    /* =====================================================
       4. FUNCIONES DOM
       ===================================================== */

    const $ = (selector, parent = document) => parent.querySelector(selector);
    const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];

    function obtenerMaquina(id) {
        return machines.find(machine => machine.id === id);
    }

    function obtenerFamilia(id) {
        return familias.find(familia => familia.id === id);
    }

    function escaparHTML(texto = "") {
        return String(texto)
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    function capitalizar(texto = "") {
        return texto.charAt(0).toUpperCase() + texto.slice(1);
    }

    /* =====================================================
       5. DATOS DEMOSTRATIVOS
       ===================================================== */

    function valorBaseVariable(nombre, riesgo, machineId, posicion = 0) {
        const n = nombre.toLowerCase();

        const semilla =
            [...machineId].reduce((sum, char) => sum + char.charCodeAt(0), 0) +
            riesgo * 7 +
            posicion * 11 +
            cicloSimulacion * 3;

        const variacion = semilla % 17;

        if (n.includes("temperatura")) {
            return {
                numero: Math.round(48 + riesgo * 0.32 + variacion * 0.7),
                unidad: "°C",
                nivel: Math.min(100, Math.round(riesgo + 25 + variacion))
            };
        }

        if (n.includes("batería")) {
            const porcentaje = Math.max(18, 96 - Math.round(riesgo * 0.65) - variacion);
            return {
                numero: porcentaje,
                unidad: "%",
                nivel: 100 - porcentaje
            };
        }

        if (n.includes("corriente")) {
            return {
                numero: Math.max(4, Math.round(18 + riesgo * 0.28 + variacion)),
                unidad: "A",
                nivel: Math.min(100, Math.round(25 + riesgo * 0.7))
            };
        }

        if (n.includes("presión")) {
            return {
                numero: Math.max(1, Math.round((4 + riesgo * 0.045 + variacion / 20) * 10) / 10),
                unidad: "bar",
                nivel: Math.min(100, Math.round(30 + riesgo * 0.72))
            };
        }

        if (n.includes("vibración")) {
            return {
                numero: Math.max(0.4, Math.round((1 + riesgo * 0.035 + variacion / 35) * 10) / 10),
                unidad: "mm/s",
                nivel: Math.min(100, Math.round(20 + riesgo * 0.8))
            };
        }

        if (n.includes("velocidad") || n.includes("rpm")) {
            return {
                numero: Math.round(600 + variacion * 70 + riesgo * 9),
                unidad: "rpm",
                nivel: Math.min(100, Math.round(30 + riesgo * 0.7))
            };
        }

        if (n.includes("fuerza")) {
            return {
                numero: Math.round(18 + riesgo * 0.35 + variacion),
                unidad: "kN",
                nivel: Math.min(100, Math.round(25 + riesgo * 0.74))
            };
        }

        if (n.includes("torque")) {
            return {
                numero: Math.round(28 + riesgo * 0.48 + variacion),
                unidad: "Nm",
                nivel: Math.min(100, Math.round(25 + riesgo * 0.7))
            };
        }

        if (n.includes("posición")) {
            return {
                numero: Math.round(40 + variacion + riesgo * 0.28),
                unidad: "%",
                nivel: Math.min(100, Math.round(30 + riesgo * 0.6))
            };
        }

        if (n.includes("distancia")) {
            return {
                numero: Math.round(80 + variacion * 4 + riesgo * 3),
                unidad: "m",
                nivel: Math.min(100, Math.round(25 + riesgo * 0.55))
            };
        }

        if (n.includes("ciclos")) {
            return {
                numero: Math.round(1200 + variacion * 150 + riesgo * 35),
                unidad: "ciclos",
                nivel: Math.min(100, Math.round(25 + riesgo * 0.7))
            };
        }

        if (n.includes("horas")) {
            return {
                numero: Math.round(1800 + variacion * 120 + riesgo * 28),
                unidad: "h",
                nivel: Math.min(100, Math.round(25 + riesgo * 0.5))
            };
        }

        if (n.includes("tiempo")) {
            return {
                numero: Math.round(14 + variacion / 4 + riesgo * 0.05),
                unidad: "min",
                nivel: Math.min(100, Math.round(25 + riesgo * 0.68))
            };
        }

        if (n.includes("flujo") || n.includes("caudal")) {
            return {
                numero: Math.round(40 + riesgo * 0.8 + variacion),
                unidad: "L/min",
                nivel: Math.min(100, Math.round(25 + riesgo * 0.72))
            };
        }

        if (n.includes("dimensiones")) {
            return {
                numero: Math.round(90 + variacion / 2),
                unidad: "%",
                nivel: Math.min(100, Math.round(20 + riesgo * 0.55))
            };
        }

        if (n.includes("defectos")) {
            return {
                numero: riesgo >= 70 ? 3 : riesgo >= 45 ? 1 : 0,
                unidad: "detectados",
                nivel: Math.min(100, Math.round(riesgo * 0.8))
            };
        }

        if (n.includes("imágenes")) {
            return {
                numero: Math.max(70, 100 - Math.round(riesgo * 0.25) - variacion),
                unidad: "%",
                nivel: Math.min(100, Math.round(15 + riesgo * 0.55))
            };
        }

        if (n.includes("aceite")) {
            return {
                numero: Math.max(25, 96 - Math.round(riesgo * 0.7) - variacion),
                unidad: "%",
                nivel: Math.min(100, Math.round(riesgo * 0.8))
            };
        }

        return {
            numero: Math.round(20 + riesgo * 0.6 + variacion),
            unidad: "%",
            nivel: Math.min(100, Math.round(20 + riesgo * 0.75))
        };
    }

    function obtenerVariablesDemo(maquina) {
        if (!maquina) return [];

        return maquina.variables.slice(0, 4).map((variable, index) => ({
            nombre: variable,
            ...valorBaseVariable(
                variable,
                maquina.riesgo,
                maquina.id,
                index
            )
        }));
    }

    /* =====================================================
       6. ESTADOS Y RIESGO
       ===================================================== */

    function calcularEstadoDesdeRiesgo(riesgo) {
        if (riesgo >= 75) return "anomalia";
        if (riesgo >= 45) return "alerta";
        return "normal";
    }

    function obtenerTextoRiesgo(riesgo) {
        if (riesgo >= 75) {
            return "Nivel de riesgo alto. Se recomienda revisar la máquina.";
        }

        if (riesgo >= 45) {
            return "Nivel de riesgo moderado. Se recomienda seguimiento preventivo.";
        }

        return "Nivel de riesgo bajo. La máquina se encuentra dentro del estado esperado.";
    }

    function obtenerRecomendacion(maquina) {
        if (!maquina) {
            return "Seleccione una máquina para consultar la recomendación.";
        }

        if (maquina.estado === "anomalia") {
            return `Revisar ${maquina.nombre}. Se recomienda inspección prioritaria de las variables que presentan mayor desviación.`;
        }

        if (maquina.estado === "alerta") {
            return `Programar revisión preventiva de ${maquina.nombre} y realizar seguimiento de sus variables monitoreadas.`;
        }

        if (maquina.estado === "mantenimiento") {
            return `Mantenimiento en curso para ${maquina.nombre}. Registrar actividades y validar nuevamente las variables al finalizar.`;
        }

        return `${maquina.nombre} no presenta una condición crítica en la demostración. Se mantiene seguimiento preventivo.`;
    }

    /* =====================================================
       7. RENDERIZADO DE PROCESOS / FAMILIAS
       ===================================================== */

    function encontrarContenedorProcesos() {
        return $(".process-area") ||
            $(".process-grid") ||
            $("#processArea") ||
            $(".families-container");
    }

    function renderizarFamilias() {
        const contenedor = encontrarContenedorProcesos();

        if (!contenedor) return;

        contenedor.innerHTML = familias.map(familia => {
            const maquinasFamilia = machines.filter(
                machine => machine.familia === familia.id
            );

            return `
                <section class="family-block" data-family-block="${familia.id}">
                    <div class="family-header">
                        <div>
                            <span class="family-kicker">FAMILIA ${familia.id}</span>
                            <h3>${escaparHTML(familia.nombre)}</h3>
                            <p>${escaparHTML(familia.descripcion)}</p>
                        </div>

                        <span class="family-count">
                            ${maquinasFamilia.length} máquina${maquinasFamilia.length === 1 ? "" : "s"}
                        </span>
                    </div>

                    <div class="family-machines">
                        ${
                            maquinasFamilia.length
                                ? maquinasFamilia.map(renderizarMaquinaProceso).join("")
                                : `
                                    <div class="empty-state">
                                        No hay máquinas registradas en esta familia.
                                    </div>
                                `
                        }
                    </div>
                </section>
            `;
        }).join("");
    }

    function renderizarMaquinaProceso(maquina) {
        const estado = estados[maquina.estado] || estados.normal;
        const seleccionado =
            maquina.id === maquinaSeleccionada ? "selected" : "";

        return `
            <article
                class="process-machine ${seleccionado}"
                data-machine="${escaparHTML(maquina.id)}"
                data-family="${escaparHTML(maquina.familia)}"
            >
                <div class="process-machine-top">
                    <span class="machine-code">${escaparHTML(maquina.id)}</span>

                    <span class="machine-state ${estado.clase}">
                        ${escaparHTML(estado.etiqueta)}
                    </span>
                </div>

                <h4>${escaparHTML(maquina.nombre)}</h4>

                <p>
                    ${escaparHTML(maquina.variables.slice(0, 3).join(" · "))}
                </p>

                <div class="process-machine-bottom">
                    <span>Riesgo ${maquina.riesgo}%</span>
                    <button
                        type="button"
                        class="machine-action-btn"
                        data-action="ver-machine"
                        data-id="${escaparHTML(maquina.id)}"
                    >
                        Ver
                    </button>
                </div>
            </article>
        `;
    }

    /* =====================================================
       8. RENDERIZADO DE LISTA DE MÁQUINAS
       ===================================================== */

    function encontrarContenedorMaquinas() {
        return $(".machine-table-wrap") ||
            $(".device-list") ||
            $("#machineList");
    }

    function renderizarListaMaquinas() {
        const contenedor = encontrarContenedorMaquinas();

        if (!contenedor) return;

        const filtroEstado = $("#deviceFilter")?.value || "all";
        const filtroFamilia = $("#familyFilter")?.value || "all";

        const maquinasFiltradas = machines.filter(maquina => {
            const coincideEstado =
                filtroEstado === "all" ||
                filtroEstado === "" ||
                maquina.estado === filtroEstado;

            const coincideFamilia =
                filtroFamilia === "all" ||
                filtroFamilia === "" ||
                maquina.familia === filtroFamilia;

            return coincideEstado && coincideFamilia;
        });

        const contenido = maquinasFiltradas.length
            ? maquinasFiltradas.map(renderizarTarjetaMaquina).join("")
            : `
                <div class="empty-state">
                    <strong>No hay máquinas que coincidan con los filtros.</strong>
                    <span>Modifica los filtros para consultar nuevamente el listado.</span>
                </div>
            `;

        contenedor.innerHTML = `
            <div class="machine-list-header">
                <div>
                    <span>INVENTARIO DE PLANTA</span>
                    <strong>${maquinasFiltradas.length} resultado${maquinasFiltradas.length === 1 ? "" : "s"}</strong>
                </div>

                <button
                    type="button"
                    class="secondary-button"
                    id="listAddMachineButton"
                    data-action="agregar-machine"
                >
                    + Agregar máquina
                </button>
            </div>

            <div class="device-list-generated">
                ${contenido}
            </div>
        `;
    }

    function renderizarTarjetaMaquina(maquina) {
        const estado = estados[maquina.estado] || estados.normal;
        const familia = obtenerFamilia(maquina.familia);

        return `
            <article
                class="device-card ${estado.clase}"
                data-device="${escaparHTML(maquina.id)}"
                data-family="${escaparHTML(maquina.familia)}"
            >
                <div class="device-card-main">
                    <div class="device-icon">
                        <span>⚙</span>
                    </div>

                    <div class="device-info">
                        <div class="device-title-line">
                            <span class="machine-code">
                                ${escaparHTML(maquina.id)}
                            </span>

                            <span class="machine-state ${estado.clase}">
                                ${escaparHTML(estado.etiqueta)}
                            </span>
                        </div>

                        <h3>${escaparHTML(maquina.nombre)}</h3>

                        <p>
                            ${escaparHTML(familia?.nombre || "Sin familia")}
                        </p>

                        <small>
                            ${escaparHTML(maquina.variables.join(" · "))}
                        </small>
                    </div>
                </div>

                <div class="device-card-risk">
                    <span>Riesgo</span>
                    <strong>${maquina.riesgo}%</strong>
                </div>

                <div class="device-card-action">
                    <button
                        type="button"
                        class="outline-button"
                        data-action="ver-machine"
                        data-id="${escaparHTML(maquina.id)}"
                    >
                        Ver
                    </button>
                </div>
            </article>
        `;
    }

    /* =====================================================
       9. SELECT DE FAMILIAS Y MÁQUINAS
       ===================================================== */

    function cargarFiltrosFamilia() {
        const select = $("#familyFilter");

        if (!select) return;

        const valorActual = select.value;

        select.innerHTML = `
            <option value="all">Todas las familias</option>
            ${familias.map(familia => `
                <option value="${familia.id}">
                    ${escaparHTML(familia.nombre)}
                </option>
            `).join("")}
        `;

        if (
            valorActual &&
            (
                valorActual === "all" ||
                familias.some(familia => familia.id === valorActual)
            )
        ) {
            select.value = valorActual;
        }
    }

    function cargarSelectMaquinas() {
        const select = $("#scanDevice");

        if (!select) return;

        const valorActual =
            maquinaSeleccionada &&
            machines.some(machine => machine.id === maquinaSeleccionada)
                ? maquinaSeleccionada
                : machines[0]?.id;

        select.innerHTML = `
            <option value="">Seleccionar máquina</option>
            ${machines.map(machine => `
                <option value="${escaparHTML(machine.id)}">
                    ${escaparHTML(machine.id)} — ${escaparHTML(machine.nombre)}
                </option>
            `).join("")}
        `;

        if (valorActual) {
            select.value = valorActual;
        }
    }

    /* =====================================================
       10. KPIs
       ===================================================== */

    function actualizarKPIs() {
        const total = machines.length;

        const normales = machines.filter(
            machine => machine.estado === "normal"
        ).length;

        const advertencias = machines.filter(
            machine => machine.estado === "alerta"
        ).length;

        const anomalias = machines.filter(
            machine => machine.estado === "anomalia"
        ).length;

        const mantenimiento = machines.filter(
            machine => machine.estado === "mantenimiento"
        ).length;

        setText("#totalDevices", total);
        setText("#normalDevices", String(normales).padStart(2, "0"));
        setText("#warningDevices", String(advertencias).padStart(2, "0"));
        setText("#anomalyDevices", String(anomalias).padStart(2, "0"));

        const maintenanceKpi = $("#maintenanceDevices");
        if (maintenanceKpi) {
            maintenanceKpi.textContent = String(mantenimiento).padStart(2, "0");
        }

        const plantStatus = $("#plantStatus");
        if (plantStatus) {
            if (anomalias > 0) {
                plantStatus.textContent = "Atención requerida";
            } else if (advertencias > 0) {
                plantStatus.textContent = "Seguimiento preventivo";
            } else {
                plantStatus.textContent = "Operación estable";
            }
        }
    }

    function setText(selector, value) {
        const element = $(selector);
        if (element) element.textContent = value;
    }

    /* =====================================================
       11. PANEL DE RIESGO
       ===================================================== */

    function actualizarPanelRiesgo(maquina) {
        if (!maquina) return;

        const estado = estados[maquina.estado] || estados.normal;

        setText("#riskValue", `${maquina.riesgo}%`);
        setText("#riskDeviceLabel", maquina.id);
        setText("#riskStatusText", estado.etiqueta);
        setText("#riskDescription", obtenerTextoRiesgo(maquina.riesgo));

        const riskValue = $("#riskValue");
        const riskCircle = document.querySelector(".risk-circle");

        if (riskValue) {
            riskValue.dataset.state = estado.clase;
            riskValue.style.setProperty("--risk-color", estado.color);
        }

        if (riskCircle) {
            riskCircle.style.setProperty("--risk-color", estado.color);
            riskCircle.style.setProperty("--risk-percent", `${Math.max(0, Math.min(100, maquina.riesgo))}%`);
            riskCircle.dataset.state = maquina.estado;
        }

        const riskStatusDot = document.querySelector(".risk-status .status-dot");
        if (riskStatusDot) {
            riskStatusDot.classList.remove("green", "yellow", "red");
            if (maquina.estado === "normal") riskStatusDot.classList.add("green");
            else if (maquina.estado === "alerta") riskStatusDot.classList.add("yellow");
            else riskStatusDot.classList.add("red");
        }

        const riskBar = $("#riskProgressBar") || $("#riskBar");

        if (riskBar) {
            riskBar.style.width = `${Math.max(
                0,
                Math.min(100, maquina.riesgo)
            )}%`;
        }
    }

    /* =====================================================
       12. PANEL DE VARIABLES
       ===================================================== */

    function actualizarPanelVariables(maquina) {
        if (!maquina) return;

        const variables = obtenerVariablesDemo(maquina);

        const ids = [
            {
                value: "#cpuValue",
                bar: "#cpuBar"
            },
            {
                value: "#ramValue",
                bar: "#ramBar"
            },
            {
                value: "#diskValue",
                bar: "#diskBar"
            },
            {
                value: "#temperatureValue",
                bar: "#temperatureBar"
            }
        ];

        variables.forEach((variable, index) => {
            const destino = ids[index];

            if (!destino) return;

            setText(
                destino.value,
                `${variable.numero}${variable.unidad ? ` ${variable.unidad}` : ""}`
            );

            const bar = $(destino.bar);

            if (bar) {
                bar.style.width = `${Math.max(
                    0,
                    Math.min(100, variable.nivel)
                )}%`;
            }

            const valueElement = $(destino.value);
            const card = valueElement?.closest(
                ".metric-card, .metric-item, .metric-box, .variable-card, .metric"
            );

            if (card) {
                const etiqueta =
                    $(".metric-label", card) ||
                    $(".variable-name", card) ||
                    $("label", card) ||
                    $("h4", card);

                if (etiqueta) {
                    etiqueta.textContent = variable.nombre;
                }

                const descripcion =
                    $(".metric-description", card) ||
                    $(".variable-description", card);

                if (descripcion) {
                    descripcion.textContent = "Valor simulado de demostración";
                }
            }
        });

        setText("#selectedMachineName", maquina.nombre);
        setText("#selectedMachineId", maquina.id);
    }

    /* =====================================================
       13. RECOMENDACIONES
       ===================================================== */

    function actualizarRecomendacion(maquina) {
        if (!maquina) return;

        const texto = obtenerRecomendacion(maquina);

        [
            "#recommendationText",
            "#maintenanceRecommendation",
            "#maintenanceText",
            "#recommendationDescription"
        ].forEach(selector => {
            const element = $(selector);

            if (element) {
                element.textContent = texto;
            }
        });

        const recCards = $$(".recommendation-card, .maintenance-recommendation");

        recCards.forEach(card => {
            if (
                card.textContent.includes("Seleccione una máquina") ||
                card.dataset.dynamic === "true"
            ) {
                const paragraph = $("p", card);

                if (paragraph) {
                    paragraph.textContent = texto;
                }
            }
        });
    }

    /* =====================================================
       14. SELECCIÓN DE MÁQUINA
       ===================================================== */

    function seleccionarMaquina(id, hacerScroll = false) {
        const maquina = obtenerMaquina(id);

        if (!maquina) return;

        maquinaSeleccionada = id;

        const select = $("#scanDevice");
        if (select) {
            select.value = id;
        }

        renderizarFamilias();
        actualizarPanelRiesgo(maquina);
        actualizarPanelVariables(maquina);
        actualizarRecomendacion(maquina);
        renderizarAlertas();
        renderizarHistorial();

        $$(".device-card").forEach(card => {
            card.classList.toggle(
                "selected",
                card.dataset.device === id
            );
        });

        $$(".process-machine").forEach(card => {
            card.classList.toggle(
                "selected",
                card.dataset.machine === id
            );
        });

        if (hacerScroll) {
            const destino =
                $("#machineMonitoring") ||
                $("#monitoring") ||
                $(".risk-panel") ||
                $("#monitoring-control");

            if (destino) {
                destino.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }
        }
    }

    /* =====================================================
       15. ALERTAS
       ===================================================== */

    function renderizarAlertas() {
        const alertContainer =
            $(".alerts-grid") ||
            $(".alert-list") ||
            $("#alertList");

        if (!alertContainer) return;

        const criticas = machines
            .filter(machine =>
                machine.estado === "anomalia" ||
                machine.estado === "alerta"
            )
            .sort((a, b) => b.riesgo - a.riesgo);

        if (!criticas.length) {
            alertContainer.innerHTML = `
                <div class="empty-state">
                    <strong>No hay alertas activas.</strong>
                    <span>Las máquinas se encuentran en seguimiento normal.</span>
                </div>
            `;
            return;
        }

        alertContainer.innerHTML = criticas
            .slice(0, 6)
            .map(machine => {
                const estado = estados[machine.estado];

                return `
                    <article
                        class="alert-card ${estado.clase}"
                        data-alert-machine="${escaparHTML(machine.id)}"
                    >
                        <div class="alert-card-top">
                            <span class="alert-severity">
                                ${escaparHTML(estado.etiqueta)}
                            </span>

                            <span>${machine.riesgo}% riesgo</span>
                        </div>

                        <h4>${escaparHTML(machine.nombre)}</h4>

                        <p>
                            ${escaparHTML(
                                machine.estado === "anomalia"
                                    ? "Se requiere revisión prioritaria."
                                    : "Se recomienda seguimiento preventivo."
                            )}
                        </p>

                        <button
                            type="button"
                            class="outline-button"
                            data-action="ver-machine"
                            data-id="${escaparHTML(machine.id)}"
                        >
                            Revisar
                        </button>
                    </article>
                `;
            })
            .join("");
    }

    /* =====================================================
       16. HISTORIAL
       ===================================================== */

    function registrarEvento(tipo, maquina, detalle) {
        historialEventos.unshift({
            fecha: new Date(),
            tipo,
            maquinaId: maquina?.id || "NOVA",
            maquinaNombre: maquina?.nombre || "Sistema",
            detalle
        });

        if (historialEventos.length > 30) {
            historialEventos.pop();
        }
    }

    function registrarRiesgo(maquina) {
        if (!maquina) return;

        historialRiesgo.push({
            fecha: new Date(),
            maquinaId: maquina.id,
            riesgo: maquina.riesgo
        });

        if (historialRiesgo.length > 30) {
            historialRiesgo.shift();
        }

        actualizarGraficaRiesgo();
    }

    function renderizarHistorial() {
        const contenedor =
            $(".history-list") ||
            $("#historyList");

        if (!contenedor) return;

        if (!historialEventos.length) {
            contenedor.innerHTML = `
                <div class="empty-state">
                    <strong>Sin eventos registrados.</strong>
                    <span>Los movimientos de demostración aparecerán aquí.</span>
                </div>
            `;
            return;
        }

        contenedor.innerHTML = historialEventos
            .slice(0, 10)
            .map(evento => `
                <article class="history-item">
                    <div class="history-item-marker"></div>

                    <div class="history-item-content">
                        <span>
                            ${formatearHora(evento.fecha)}
                        </span>

                        <strong>
                            ${escaparHTML(evento.tipo)}
                        </strong>

                        <p>
                            ${escaparHTML(evento.maquinaId)}
                            ·
                            ${escaparHTML(evento.detalle)}
                        </p>
                    </div>
                </article>
            `)
            .join("");
    }

    function formatearHora(fecha) {
        try {
            return new Intl.DateTimeFormat("es-CO", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit"
            }).format(fecha);
        } catch {
            return fecha.toLocaleTimeString();
        }
    }

    /* =====================================================
       17. GRÁFICA DE RIESGO
       ===================================================== */

    function actualizarGraficaRiesgo() {
        const grafica = $("#riskChart");
        const lineaDashboard = document.querySelector(".chart-line");

        const datos = historialRiesgo.slice(-12);

        // La gráfica principal del dashboard es una línea CSS; actualizamos sus
        // puntos con las últimas lecturas para que suba, baje o se mantenga.
        if (lineaDashboard && datos.length) {
            const valores = datos.map(dato => Math.max(0, Math.min(100, dato.riesgo)));
            const puntos = valores.map((valor, index) => {
                const x = (index / Math.max(valores.length - 1, 1)) * 100;
                const y = 100 - valor;
                return `${x.toFixed(1)}% ${y.toFixed(1)}%`;
            });
            lineaDashboard.style.clipPath = `polygon(${puntos.join(", ")})`;
            lineaDashboard.style.webkitClipPath = `polygon(${puntos.join(", ")})`;
        }

        actualizarIndicadorTendencia(datos);

        if (!grafica) return;

        if (!datos.length) {
            const maquina = obtenerMaquina(maquinaSeleccionada);

            if (maquina) {
                datos.push({
                    fecha: new Date(),
                    maquinaId: maquina.id,
                    riesgo: maquina.riesgo
                });
            }
        }

        if (grafica.tagName.toLowerCase() === "svg") {
            dibujarGraficaSVG(grafica, datos);
            return;
        }

        if (grafica.tagName.toLowerCase() === "canvas") {
            dibujarGraficaCanvas(grafica, datos);
        }
    }

    function actualizarIndicadorTendencia(datos) {
        const meta = document.querySelector(".chart-meta span:last-child");
        if (!meta || !datos.length) return;

        if (datos.length < 2) {
            meta.textContent = "Sin cambio suficiente";
            return;
        }

        const actual = datos[datos.length - 1].riesgo;
        const anterior = datos[datos.length - 2].riesgo;
        const diferencia = actual - anterior;

        if (diferencia > 0) {
            meta.textContent = "↑ Subiendo · el riesgo aumentó";
        } else if (diferencia < 0) {
            meta.textContent = "↓ Bajando · el riesgo disminuyó";
        } else {
            meta.textContent = "→ Estable · el riesgo se mantiene";
        }
    }

    function dibujarGraficaSVG(svg, datos) {
        const width = svg.clientWidth || 700;
        const height = svg.clientHeight || 240;

        svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
        svg.innerHTML = "";

        const margen = {
            izquierda: 42,
            derecha: 15,
            superior: 15,
            inferior: 28
        };

        const areaW =
            width -
            margen.izquierda -
            margen.derecha;

        const areaH =
            height -
            margen.superior -
            margen.inferior;

        for (let i = 0; i <= 4; i++) {
            const y =
                margen.superior +
                (areaH / 4) * i;

            const linea = document.createElementNS(
                "http://www.w3.org/2000/svg",
                "line"
            );

            linea.setAttribute("x1", margen.izquierda);
            linea.setAttribute("x2", width - margen.derecha);
            linea.setAttribute("y1", y);
            linea.setAttribute("y2", y);
            linea.setAttribute("stroke", "rgba(167,139,250,0.15)");
            linea.setAttribute("stroke-width", "1");

            svg.appendChild(linea);

            const texto = document.createElementNS(
                "http://www.w3.org/2000/svg",
                "text"
            );

            texto.setAttribute("x", "8");
            texto.setAttribute("y", y + 4);
            texto.setAttribute("fill", "#8f8fa8");
            texto.setAttribute("font-size", "10");
            texto.textContent = `${100 - i * 25}%`;

            svg.appendChild(texto);
        }

        if (datos.length === 1) {
            datos.push({
                ...datos[0],
                riesgo: Math.max(
                    0,
                    datos[0].riesgo - 5
                )
            });
        }

        const puntos = datos.map((dato, index) => {
            const x =
                margen.izquierda +
                (index / Math.max(datos.length - 1, 1)) *
                    areaW;

            const y =
                margen.superior +
                areaH -
                (Math.max(0, Math.min(100, dato.riesgo)) / 100) *
                    areaH;

            return `${x},${y}`;
        });

        const area = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "polyline"
        );

        area.setAttribute("points", puntos.join(" "));
        area.setAttribute("fill", "none");
        area.setAttribute("stroke", "#8b5cf6");
        area.setAttribute("stroke-width", "3");
        area.setAttribute("stroke-linecap", "round");
        area.setAttribute("stroke-linejoin", "round");

        svg.appendChild(area);

        datos.forEach((dato, index) => {
            const x =
                margen.izquierda +
                (index / Math.max(datos.length - 1, 1)) *
                    areaW;

            const y =
                margen.superior +
                areaH -
                (Math.max(0, Math.min(100, dato.riesgo)) / 100) *
                    areaH;

            const punto = document.createElementNS(
                "http://www.w3.org/2000/svg",
                "circle"
            );

            punto.setAttribute("cx", x);
            punto.setAttribute("cy", y);
            punto.setAttribute("r", "4");
            punto.setAttribute("fill", "#a78bfa");

            svg.appendChild(punto);
        });
    }

    function dibujarGraficaCanvas(canvas, datos) {
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();

        const width = Math.max(320, rect.width);
        const height = Math.max(180, rect.height);

        canvas.width = width * dpr;
        canvas.height = height * dpr;

        const ctx = canvas.getContext("2d");

        ctx.scale(dpr, dpr);

        ctx.clearRect(0, 0, width, height);

        const left = 35;
        const right = 12;
        const top = 15;
        const bottom = 25;

        const chartWidth = width - left - right;
        const chartHeight = height - top - bottom;

        ctx.strokeStyle = "rgba(167,139,250,.15)";
        ctx.lineWidth = 1;

        for (let i = 0; i <= 4; i++) {
            const y = top + (chartHeight / 4) * i;

            ctx.beginPath();
            ctx.moveTo(left, y);
            ctx.lineTo(width - right, y);
            ctx.stroke();

            ctx.fillStyle = "#8f8fa8";
            ctx.font = "10px Inter, sans-serif";
            ctx.fillText(`${100 - i * 25}%`, 4, y + 4);
        }

        if (datos.length === 1) {
            datos.push({
                ...datos[0],
                riesgo: Math.max(0, datos[0].riesgo - 5)
            });
        }

        ctx.beginPath();

        datos.forEach((dato, index) => {
            const x =
                left +
                (index / Math.max(1, datos.length - 1)) *
                    chartWidth;

            const y =
                top +
                chartHeight -
                (dato.riesgo / 100) * chartHeight;

            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });

        ctx.strokeStyle = "#8b5cf6";
        ctx.lineWidth = 3;
        ctx.stroke();

        datos.forEach((dato, index) => {
            const x =
                left +
                (index / Math.max(1, datos.length - 1)) *
                    chartWidth;

            const y =
                top +
                chartHeight -
                (dato.riesgo / 100) * chartHeight;

            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2);

            ctx.fillStyle = "#a78bfa";
            ctx.fill();
        });
    }

    /* =====================================================
       18. MODAL GENERAL
       ===================================================== */

    function obtenerModal() {
        return $("#novaModal");
    }

    function abrirModal({
        titulo,
        kicker = "NOVA",
        contenido = "",
        clase = ""
    }) {
        const modal = obtenerModal();

        if (!modal) return;

        const title = $("#novaModalTitle");
        const kickerElement = $("#novaModalKicker");
        const content = $("#novaModalContent");

        if (title) title.textContent = titulo;
        if (kickerElement) kickerElement.textContent = kicker;
        if (content) {
            content.innerHTML = contenido;
            content.className = `nova-modal-content ${clase}`.trim();
        }

        modal.classList.add("open");
        modal.setAttribute("aria-hidden", "false");

        document.body.classList.add("modal-open");
    }

    function cerrarModal() {
        const modal = obtenerModal();

        if (!modal) return;

        modal.classList.remove("open");
        modal.setAttribute("aria-hidden", "true");

        document.body.classList.remove("modal-open");
    }

    function modalBotones({
        cancelarTexto = "Cancelar",
        confirmarTexto = "Guardar",
        confirmarClase = "primary-button"
    } = {}) {
        return `
            <div class="nova-form-actions">
                <button
                    type="button"
                    class="secondary-button"
                    data-action="cerrar-modal"
                >
                    ${cancelarTexto}
                </button>

                <button
                    type="submit"
                    class="${confirmarClase}"
                >
                    ${confirmarTexto}
                </button>
            </div>
        `;
    }

    /* =====================================================
       19. AGREGAR MÁQUINA
       ===================================================== */

    function abrirFormularioAgregar() {
        if (!requerirPermiso("agregar")) return;
        abrirModal({
            titulo: "Agregar máquina",
            kicker: "ADMINISTRACIÓN · NUEVO REGISTRO",
            contenido: `
                <form id="formAgregarMaquina" class="nova-form">

                    <div class="nova-form-grid">

                        <div class="nova-form-group">
                            <label for="nuevaMaquinaNombre">
                                Nombre de la máquina
                            </label>

                            <input
                                id="nuevaMaquinaNombre"
                                name="nombre"
                                type="text"
                                placeholder="Ej. Robot de inspección"
                                required
                            >
                        </div>

                        <div class="nova-form-group">
                            <label for="nuevaMaquinaFamilia">
                                Familia
                            </label>

                            <select
                                id="nuevaMaquinaFamilia"
                                name="familia"
                                required
                            >
                                ${familias.map(familia => `
                                    <option value="${familia.id}">
                                        ${escaparHTML(familia.nombre)}
                                    </option>
                                `).join("")}
                            </select>
                        </div>

                        <div class="nova-form-group full">
                            <label for="nuevaMaquinaFuncion">
                                Función principal
                            </label>

                            <textarea
                                id="nuevaMaquinaFuncion"
                                name="funcion"
                                rows="3"
                                placeholder="Describe la función principal de la máquina"
                                required
                            ></textarea>
                        </div>

                        <div class="nova-form-group full">
                            <label for="nuevaMaquinaVariables">
                                Variables monitoreadas
                            </label>

                            <textarea
                                id="nuevaMaquinaVariables"
                                name="variables"
                                rows="3"
                                placeholder="Temperatura, Corriente, Vibración, Presión"
                                required
                            ></textarea>

                            <small>
                                Sepáralas por comas.
                            </small>
                        </div>

                        <div class="nova-form-group full">
                            <label for="nuevaMaquinaSensores">
                                Sensores / fuentes de datos
                            </label>

                            <textarea
                                id="nuevaMaquinaSensores"
                                name="sensores"
                                rows="3"
                                placeholder="Sensor de temperatura, acelerómetro..."
                            ></textarea>

                            <small>
                                Este registro corresponde al prototipo local.
                            </small>
                        </div>

                    </div>

                    ${modalBotones({
                        confirmarTexto: "Agregar máquina"
                    })}
                </form>
            `
        });
    }

    function generarIdNuevaMaquina() {
        const usados = new Set(
            machines.map(machine => machine.id)
        );

        let contador = 21;

        while (usados.has(`EQ-NOV-${String(contador).padStart(2, "0")}`)) {
            contador++;
        }

        return `EQ-NOV-${String(contador).padStart(2, "0")}`;
    }

    function procesarAgregarMaquina(form) {
        if (!requerirPermiso("agregar")) return;
        const datos = new FormData(form);

        const nombre = String(
            datos.get("nombre") || ""
        ).trim();

        const familia = String(
            datos.get("familia") || ""
        ).trim();

        const funcion = String(
            datos.get("funcion") || ""
        ).trim();

        const variables = String(
            datos.get("variables") || ""
        )
            .split(",")
            .map(item => item.trim())
            .filter(Boolean);

        const sensores = String(
            datos.get("sensores") || ""
        )
            .split(",")
            .map(item => item.trim())
            .filter(Boolean);

        if (!nombre || !familia || !funcion || !variables.length) {
            mostrarAviso(
                "Completa los campos obligatorios antes de guardar.",
                "warning"
            );
            return;
        }

        const nuevaMaquina = {
            id: generarIdNuevaMaquina(),
            nombre,
            familia,
            funcion,
            variables: variables.slice(0, 4),
            sensores: sensores.length
                ? sensores.slice(0, 8)
                : ["Fuente de datos de demostración"],
            estado: "normal",
            riesgo: 15
        };

        machines.push(nuevaMaquina);

        maquinaSeleccionada = nuevaMaquina.id;

        registrarEvento(
            "Máquina agregada",
            nuevaMaquina,
            "Registro local incorporado al prototipo."
        );

        cerrarModal();

        actualizarTodo();

        seleccionarMaquina(nuevaMaquina.id, false);

        mostrarAviso(
            `${nuevaMaquina.id} fue agregada correctamente al prototipo.`,
            "success"
        );
    }

    /* =====================================================
       20. EDITAR MÁQUINA
       ===================================================== */

    function abrirFormularioEditar() {
        if (!requerirPermiso("editar")) return;
        const maquina =
            obtenerMaquina(maquinaSeleccionada) ||
            machines[0];

        if (!maquina) {
            mostrarAviso(
                "No hay máquinas registradas para editar.",
                "warning"
            );
            return;
        }

        abrirModal({
            titulo: "Editar máquina",
            kicker: "ADMINISTRACIÓN · MODIFICAR REGISTRO",
            contenido: `
                <form id="formEditarMaquina" class="nova-form">

                    <div class="nova-form-grid">

                        <div class="nova-form-group">
                            <label for="editarMaquinaId">
                                Máquina
                            </label>

                            <select
                                id="editarMaquinaId"
                                name="id"
                            >
                                ${machines.map(item => `
                                    <option
                                        value="${escaparHTML(item.id)}"
                                        ${item.id === maquina.id ? "selected" : ""}
                                    >
                                        ${escaparHTML(item.id)} — ${escaparHTML(item.nombre)}
                                    </option>
                                `).join("")}
                            </select>
                        </div>

                        <div class="nova-form-group">
                            <label for="editarMaquinaFamilia">
                                Familia
                            </label>

                            <select
                                id="editarMaquinaFamilia"
                                name="familia"
                                required
                            >
                                ${familias.map(familia => `
                                    <option
                                        value="${familia.id}"
                                        ${familia.id === maquina.familia ? "selected" : ""}
                                    >
                                        ${escaparHTML(familia.nombre)}
                                    </option>
                                `).join("")}
                            </select>
                        </div>

                        <div class="nova-form-group full">
                            <label for="editarMaquinaNombre">
                                Nombre
                            </label>

                            <input
                                id="editarMaquinaNombre"
                                name="nombre"
                                type="text"
                                value="${escaparHTML(maquina.nombre)}"
                                required
                            >
                        </div>

                        <div class="nova-form-group full">
                            <label for="editarMaquinaFuncion">
                                Función principal
                            </label>

                            <textarea
                                id="editarMaquinaFuncion"
                                name="funcion"
                                rows="3"
                                required
                            >${escaparHTML(maquina.funcion)}</textarea>
                        </div>

                    </div>

                    ${modalBotones({
                        confirmarTexto: "Guardar cambios"
                    })}
                </form>
            `
        });

        const selector = $("#editarMaquinaId");

        selector?.addEventListener("change", () => {
            const seleccion = obtenerMaquina(selector.value);

            if (!seleccion) return;

            setInputValue(
                "#editarMaquinaNombre",
                seleccion.nombre
            );

            setInputValue(
                "#editarMaquinaFamilia",
                seleccion.familia
            );

            setInputValue(
                "#editarMaquinaFuncion",
                seleccion.funcion
            );
        });
    }

    function setInputValue(selector, value) {
        const element = $(selector);

        if (element) {
            element.value = value;
        }
    }

    function procesarEditarMaquina(form) {
        if (!requerirPermiso("editar")) return;
        const datos = new FormData(form);

        const id = String(
            datos.get("id") || ""
        ).trim();

        const maquina = obtenerMaquina(id);

        if (!maquina) return;

        maquina.nombre = String(
            datos.get("nombre") || ""
        ).trim();

        maquina.familia = String(
            datos.get("familia") || ""
        ).trim();

        maquina.funcion = String(
            datos.get("funcion") || ""
        ).trim();

        if (!maquina.nombre || !maquina.funcion) {
            mostrarAviso(
                "El nombre y la función son obligatorios.",
                "warning"
            );
            return;
        }

        maquinaSeleccionada = maquina.id;

        registrarEvento(
            "Máquina actualizada",
            maquina,
            "Información principal modificada desde Administración."
        );

        cerrarModal();

        actualizarTodo();

        mostrarAviso(
            `${maquina.id} fue actualizada correctamente.`,
            "success"
        );
    }

    /* =====================================================
       21. ELIMINAR MÁQUINA
       ===================================================== */

    function abrirFormularioEliminar() {
        if (!requerirPermiso("eliminar")) return;
        const maquina = obtenerMaquina(maquinaSeleccionada);

        if (!maquina) {
            mostrarAviso(
                "Selecciona primero una máquina.",
                "warning"
            );
            return;
        }

        abrirModal({
            titulo: "Eliminar máquina",
            kicker: "ADMINISTRACIÓN · ELIMINACIÓN",
            contenido: `
                <div class="delete-warning">
                    <div class="delete-warning-icon">!</div>

                    <div>
                        <h3>
                            ¿Eliminar ${escaparHTML(maquina.id)}?
                        </h3>

                        <p>
                            Se quitará <strong>${escaparHTML(maquina.nombre)}</strong>
                            del prototipo local. Esta acción no elimina
                            información de una base de datos porque esta
                            versión todavía funciona en frontend.
                        </p>
                    </div>
                </div>

                <div class="nova-form-actions">
                    <button
                        type="button"
                        class="secondary-button"
                        data-action="cerrar-modal"
                    >
                        Cancelar
                    </button>

                    <button
                        type="button"
                        class="danger-button"
                        data-action="confirmar-eliminar"
                    >
                        Eliminar máquina
                    </button>
                </div>
            `
        });
    }

    function eliminarMaquinaSeleccionada() {
        if (!requerirPermiso("eliminar")) return;
        const maquina = obtenerMaquina(maquinaSeleccionada);

        if (!maquina) {
            cerrarModal();
            return;
        }

        if (machines.length <= 1) {
            mostrarAviso(
                "NOVA debe conservar al menos una máquina registrada.",
                "warning"
            );
            return;
        }

        machines = machines.filter(
            item => item.id !== maquina.id
        );

        registrarEvento(
            "Máquina eliminada",
            maquina,
            "Registro retirado del prototipo local."
        );

        maquinaSeleccionada =
            machines[0]?.id || null;

        cerrarModal();

        actualizarTodo();

        if (maquinaSeleccionada) {
            seleccionarMaquina(
                maquinaSeleccionada,
                false
            );
        }

        mostrarAviso(
            `${maquina.id} fue eliminada del prototipo.`,
            "success"
        );
    }

    /* =====================================================
       22. ADMINISTRACIÓN DE SENSORES
       ===================================================== */

    function abrirGestionSensores() {
        if (!requerirPermiso("sensores")) return;
        const maquina = obtenerMaquina(maquinaSeleccionada);

        if (!maquina) {
            mostrarAviso(
                "Selecciona una máquina antes de administrar sus variables.",
                "warning"
            );
            return;
        }

        abrirModal({
            titulo: "Variables y sensores",
            kicker: "ADMINISTRACIÓN · MONITOREO",
            contenido: `
                <form id="formSensores" class="nova-form">

                    <div class="sensor-machine-summary">
                        <span>${escaparHTML(maquina.id)}</span>
                        <strong>${escaparHTML(maquina.nombre)}</strong>
                    </div>

                    <div class="nova-form-grid">

                        <div class="nova-form-group full">
                            <label for="editarVariables">
                                Variables monitoreadas
                            </label>

                            <textarea
                                id="editarVariables"
                                name="variables"
                                rows="4"
                                required
                            >${escaparHTML(maquina.variables.join(", "))}</textarea>

                            <small>
                                Puedes registrar hasta 4 variables visibles
                                en el panel de monitoreo.
                            </small>
                        </div>

                        <div class="nova-form-group full">
                            <label for="editarSensores">
                                Sensores / fuentes de datos
                            </label>

                            <textarea
                                id="editarSensores"
                                name="sensores"
                                rows="4"
                            >${escaparHTML(maquina.sensores.join(", "))}</textarea>

                            <small>
                                Esta información describe la fuente de
                                la variable dentro del prototipo.
                            </small>
                        </div>

                    </div>

                    ${modalBotones({
                        confirmarTexto: "Guardar variables"
                    })}
                </form>
            `
        });
    }

    function procesarSensores(form) {
        if (!requerirPermiso("sensores")) return;
        const datos = new FormData(form);
        const maquina = obtenerMaquina(maquinaSeleccionada);

        if (!maquina) return;

        const variables = String(
            datos.get("variables") || ""
        )
            .split(",")
            .map(item => item.trim())
            .filter(Boolean);

        const sensores = String(
            datos.get("sensores") || ""
        )
            .split(",")
            .map(item => item.trim())
            .filter(Boolean);

        if (!variables.length) {
            mostrarAviso(
                "Debe existir al menos una variable monitoreada.",
                "warning"
            );
            return;
        }

        maquina.variables = variables.slice(0, 4);

        maquina.sensores = sensores.length
            ? sensores.slice(0, 8)
            : ["Fuente de datos de demostración"];

        registrarEvento(
            "Variables actualizadas",
            maquina,
            "Se modificaron las variables y fuentes de datos."
        );

        cerrarModal();

        actualizarTodo();
        seleccionarMaquina(
            maquina.id,
            false
        );

        mostrarAviso(
            "Las variables y sensores fueron actualizados.",
            "success"
        );
    }

    /* =====================================================
       23. DETALLE DE MÁQUINA
       ===================================================== */

    function abrirDetalleMaquina(id) {
        const maquina = obtenerMaquina(id);

        if (!maquina) return;

        const familia = obtenerFamilia(maquina.familia);
        const estado = estados[maquina.estado] || estados.normal;
        const variables = obtenerVariablesDemo(maquina);

        abrirModal({
            titulo: maquina.nombre,
            kicker: `${maquina.id} · DETALLE DE MONITOREO`,
            contenido: `
                <div class="machine-detail">

                    <div class="detail-header">
                        <div>
                            <span>${escaparHTML(familia?.nombre || "Sin familia")}</span>

                            <h3>
                                ${escaparHTML(maquina.id)}
                            </h3>
                        </div>

                        <span class="machine-state ${estado.clase}">
                            ${escaparHTML(estado.etiqueta)}
                        </span>
                    </div>

                    <div class="detail-risk">
                        <span>Riesgo estimado de demostración</span>
                        <strong>${maquina.riesgo}%</strong>
                    </div>

                    <div class="detail-section">
                        <h4>Función principal</h4>
                        <p>
                            ${escaparHTML(maquina.funcion)}
                        </p>
                    </div>

                    <div class="detail-section">
                        <h4>Variables monitoreadas</h4>

                        <div class="detail-variable-list">
                            ${variables.map(variable => `
                                <div class="detail-variable">
                                    <span>${escaparHTML(variable.nombre)}</span>
                                    <strong>
                                        ${variable.numero}
                                        ${variable.unidad}
                                    </strong>
                                </div>
                            `).join("")}
                        </div>
                    </div>

                    <div class="detail-section">
                        <h4>Fuentes / sensores considerados</h4>

                        <div class="sensor-tag-list">
                            ${maquina.sensores.map(sensor => `
                                <span class="sensor-tag">
                                    ${escaparHTML(sensor)}
                                </span>
                            `).join("")}
                        </div>
                    </div>

                    <div class="detail-note">
                        Los valores mostrados corresponden a una
                        <strong>demostración del prototipo</strong>.
                        No representan lecturas reales de sensores.
                    </div>

                    <div class="nova-form-actions">
                        <button
                            type="button"
                            class="secondary-button"
                            data-action="cerrar-modal"
                        >
                            Cerrar
                        </button>

                        <button
                            type="button"
                            class="primary-button"
                            data-action="seleccionar-desde-modal"
                            data-id="${escaparHTML(maquina.id)}"
                        >
                            Abrir monitoreo
                        </button>
                    </div>

                </div>
            `
        });
    }

    /* =====================================================
       24. ESCANEO
       ===================================================== */

    async function escanearMaquina() {
        if (!requerirPermiso("monitorear")) return;
        const select = $("#scanDevice");

        const id = select?.value;

        if (!id) {
            mostrarAviso(
                "Selecciona una máquina para realizar el escaneo.",
                "warning"
            );
            return;
        }

        const maquina = obtenerMaquina(id);

        if (!maquina) return;

        seleccionarMaquina(id, false);

        actualizarTextoEscaneo(
            "Analizando variables..."
        );

        const boton = $("#scanButton");

        if (boton) {
            boton.disabled = true;
            boton.textContent = "Analizando...";
        }

        const progreso = $("#scanProgress");
        if (progreso) {
            progreso.style.width = "20%";
        }

        await esperar(850);

        if (progreso) {
            progreso.style.width = "45%";
        }

        actualizarTextoEscaneo("Comparando presión, velocidad y demás variables...");
        await esperar(850);

        if (progreso) {
            progreso.style.width = "72%";
        }

        await esperar(650);

        if (NOVA_LIVE_ENDPOINT) {
            try {
                const respuesta = await fetch(
                    `${NOVA_LIVE_ENDPOINT}/${encodeURIComponent(id)}`
                );

                if (!respuesta.ok) {
                    throw new Error(
                        "No fue posible consultar la API."
                    );
                }

                const datos = await respuesta.json();

                aplicarDatosAPI(maquina, datos);
            } catch (error) {
                console.warn(
                    "NOVA API no disponible. Se utilizará la demostración local.",
                    error
                );

                aplicarDatosDemo(maquina);
            }
        } else {
            aplicarDatosDemo(maquina);
        }

        if (progreso) {
            progreso.style.width = "100%";
        }

        await esperar(350);

        registrarEvento(
            "Escaneo realizado",
            maquina,
            "Escaneo de demostración completado."
        );

        registrarRiesgo(maquina);

        actualizarTodo();

        seleccionarMaquina(
            maquina.id,
            false
        );

        actualizarTextoEscaneo(
            "Escaneo de demostración completado"
        );

        if (boton) {
            boton.disabled = false;
            boton.textContent = "Escanear máquina";
        }

        mostrarAviso(
            `${maquina.id}: escaneo completado en modo demostración.`,
            "success"
        );

        setTimeout(() => {
            if (progreso) {
                progreso.style.width = "0%";
            }
        }, 1000);
    }

    function aplicarDatosDemo(maquina) {
        // El escaneo individual también cambia el riesgo de forma gradual.
        const variacion =
            Math.random() < 0.12 ? 2 :
            Math.random() < 0.55 ? 1 :
            Math.random() < 0.82 ? 0 : -1;

        maquina.riesgo = Math.max(
            5,
            Math.min(95, maquina.riesgo + variacion)
        );

        maquina.estado =
            calcularEstadoDesdeRiesgo(maquina.riesgo);
    }

    function aplicarDatosAPI(maquina, datos) {
        if (
            typeof datos?.riesgo === "number" &&
            Number.isFinite(datos.riesgo)
        ) {
            maquina.riesgo = Math.max(
                0,
                Math.min(100, Math.round(datos.riesgo))
            );
        }

        maquina.estado =
            datos?.estado ||
            calcularEstadoDesdeRiesgo(maquina.riesgo);
    }

    function actualizarTextoEscaneo(texto) {
        setText("#scanStatus", texto);
        setText("#simulationStatus", texto);
    }

    /* =====================================================
       25. SIMULACIÓN
       ===================================================== */

    function iniciarDetenerSimulacion() {
        if (!requerirPermiso("monitorear")) return;
        if (simulacionActiva) {
            detenerSimulacion();
        } else {
            iniciarSimulacion();
        }
    }

    function iniciarSimulacion() {
        if (!requerirPermiso("monitorear")) return;
        if (!machines.length) {
            mostrarAviso(
                "No hay máquinas disponibles para simular.",
                "warning"
            );
            return;
        }

        simulacionActiva = true;
        indiceSimulacion = 0;
        cicloSimulacion = 0;

        const boton = $("#simulationButton");

        if (boton) {
            boton.textContent = "Detener monitoreo";
            boton.classList.add("active");
        }

        setText(
            "#simulationStatus",
            "Monitoreo continuo activo sobre la planta"
        );

        actualizarTextoEscaneo(
            "Monitoreo continuo activo"
        );

        ejecutarPasoSimulacion();

        intervaloSimulacion = setInterval(
            ejecutarPasoSimulacion,
            2900
        );
    }

    function detenerSimulacion() {
        simulacionActiva = false;

        if (intervaloSimulacion) {
            clearInterval(intervaloSimulacion);
            intervaloSimulacion = null;
        }

        const boton = $("#simulationButton");

        if (boton) {
            boton.textContent = "Iniciar monitoreo";
            boton.classList.remove("active");
        }

        setText(
            "#simulationStatus",
            "Monitoreo detenido"
        );
    }

    function ejecutarPasoSimulacion() {
        if (!machines.length) {
            detenerSimulacion();
            return;
        }

        const maquina = machines[indiceSimulacion];

        // Cada ciclo representa una nueva recepción de datos. Si el backend/API
        // está conectado, se procesa el dato recibido; mientras tanto el prototipo
        // genera una lectura gradual para mantener el monitoreo continuo.
        if (NOVA_LIVE_ENDPOINT) {
            consultarDatosContinuos(maquina).catch(error => {
                console.warn("No fue posible consultar la fuente de datos. Se mantiene la lectura local.", error);
                aplicarDatosDemo(maquina);
                finalizarPasoMonitoreo(maquina);
            });
            return;
        }

        aplicarDatosDemo(maquina);
        finalizarPasoMonitoreo(maquina);
    }

    async function consultarDatosContinuos(maquina) {
        const respuesta = await fetch(
            `${NOVA_LIVE_ENDPOINT}/${encodeURIComponent(maquina.id)}`
        );

        if (!respuesta.ok) {
            throw new Error("No fue posible recibir datos de la fuente configurada.");
        }

        const datos = await respuesta.json();
        aplicarDatosAPI(maquina, datos);
        finalizarPasoMonitoreo(maquina);
    }

    function finalizarPasoMonitoreo(maquina) {
        maquinaSeleccionada = maquina.id;
        cicloSimulacion++;

        setText(
            "#simulationStatus",
            `Monitoreo continuo · ${indiceSimulacion + 1} de ${machines.length}: ${maquina.id}`
        );
        actualizarTextoEscaneo(
            `Dato procesado · ${maquina.id} · variables monitoreadas`
        );

        registrarRiesgo(maquina);

        if (Math.random() > 0.55) {
            registrarEvento(
                "Actualización de monitoreo",
                maquina,
                `Dato recibido y riesgo actualizado a ${maquina.riesgo}%.`
            );
        }

        actualizarTodo();
        seleccionarMaquina(
            maquina.id,
            false
        );

        indiceSimulacion++;

        if (indiceSimulacion >= machines.length) {
            indiceSimulacion = 0;
        }

    }

    /* =====================================================
       26. MANTENIMIENTO
       ===================================================== */

    async function ejecutarMantenimiento() {
        if (!requerirPermiso("mantenimiento")) return;
        const maquina = obtenerMaquina(maquinaSeleccionada);

        if (!maquina) {
            mostrarAviso(
                "Selecciona una máquina antes de iniciar mantenimiento.",
                "warning"
            );
            return;
        }

        if (mantenimientoEnCurso) return;

        mantenimientoEnCurso = true;

        maquina.estado = "mantenimiento";

        registrarEvento(
            "Mantenimiento iniciado",
            maquina,
            "Proceso de mantenimiento de demostración."
        );

        actualizarTodo();
        seleccionarMaquina(
            maquina.id,
            false
        );

        const boton = $("#maintenanceButton");

        if (boton) {
            boton.disabled = true;
            boton.textContent = "Mantenimiento en curso...";
        }

        const barra =
            $("#maintenanceProgress");

        if (barra) {
            barra.style.width = "10%";
        }

        setText(
            "#maintenanceProgressText",
            "Preparando mantenimiento..."
        );

        await esperar(700);

        if (barra) {
            barra.style.width = "35%";
        }

        setText(
            "#maintenanceProgressText",
            "Verificando variables..."
        );

        await esperar(700);

        if (barra) {
            barra.style.width = "65%";
        }

        setText(
            "#maintenanceProgressText",
            "Ejecutando mantenimiento..."
        );

        await esperar(700);

        if (barra) {
            barra.style.width = "100%";
        }

        maquina.riesgo = Math.max(
            10,
            Math.round(
                maquina.riesgo * 0.35
            )
        );

        maquina.estado = "normal";

        registrarEvento(
            "Mantenimiento finalizado",
            maquina,
            "La condición de demostración regresó a estado normal."
        );

        registrarRiesgo(maquina);

        actualizarTodo();
        seleccionarMaquina(
            maquina.id,
            false
        );

        mantenimientoEnCurso = false;

        if (boton) {
            boton.disabled = false;
            boton.textContent = "Ejecutar mantenimiento";
        }

        setText(
            "#maintenanceProgressText",
            "Mantenimiento finalizado"
        );

        mostrarAviso(
            `${maquina.id}: mantenimiento de demostración finalizado.`,
            "success"
        );

        setTimeout(() => {
            if (barra) {
                barra.style.width = "0%";
            }
        }, 1200);
    }

    /* =====================================================
       27. NAVEGACIÓN LATERAL
       ===================================================== */

    const mapaNavegacion = {
        inicio: "#dashboard",
        máquinas: "#machines",
        maquinas: "#machines",
        monitoreo: "#machineMonitoring",
        alertas: "#alerts",
        historial: "#historyPanel",
        mantenimiento: "#maintenance",
        administrar: "#admin"
    };

    function navegarASeccion(item) {
        const dataSection =
            item.dataset.section ||
            item.dataset.target;

        let destinoSelector =
            dataSection
                ? mapaNavegacion[
                    String(dataSection).toLowerCase()
                ] || dataSection
                : null;

        if (!destinoSelector) {
            const texto =
                item.textContent
                    .trim()
                    .toLowerCase();

            destinoSelector =
                mapaNavegacion[texto];
        }

        let destino =
            destinoSelector
                ? $(destinoSelector)
                : null;

        if (!destino && destinoSelector === "#machineMonitoring") {
            destino =
                $(".metrics-panel") ||
                $("#riskValue")?.closest("section") ||
                $(".risk-panel");
        }

        if (!destino && destinoSelector === "#historyPanel") {
            destino =
                $("#history") ||
                $(".history-panel");
        }

        if (destino) {
            destino.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }

        $$(".nav-item").forEach(navItem => {
            navItem.classList.remove("active");
        });

        item.classList.add("active");
    }

    /* =====================================================
       28. TOAST / AVISOS
       ===================================================== */

    function mostrarAviso(mensaje, tipo = "success") {
        let container = $("#novaToastContainer");

        if (!container) {
            container = document.createElement("div");
            container.id = "novaToastContainer";

            Object.assign(container.style, {
                position: "fixed",
                right: "20px",
                bottom: "20px",
                zIndex: "99999",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                pointerEvents: "none"
            });

            document.body.appendChild(container);
        }

        const toast = document.createElement("div");

        const colores = {
            success: "#35d07f",
            warning: "#f4c95d",
            danger: "#f25f67",
            info: "#38bdf8"
        };

        Object.assign(toast.style, {
            pointerEvents: "auto",
            minWidth: "280px",
            maxWidth: "380px",
            padding: "14px 16px",
            borderRadius: "14px",
            border: "1px solid rgba(255,255,255,.08)",
            background: "#12121f",
            color: "#f4f4f8",
            boxShadow: "0 15px 40px rgba(0,0,0,.35)",
            fontSize: "14px",
            lineHeight: "1.45",
            borderLeft: `4px solid ${colores[tipo] || colores.info}`,
            opacity: "0",
            transform: "translateY(10px)",
            transition: "opacity .2s ease, transform .2s ease"
        });

        toast.textContent = mensaje;

        container.appendChild(toast);

        requestAnimationFrame(() => {
            toast.style.opacity = "1";
            toast.style.transform = "translateY(0)";
        });

        setTimeout(() => {
            toast.style.opacity = "0";
            toast.style.transform = "translateY(10px)";

            setTimeout(() => {
                toast.remove();
            }, 250);
        }, 3200);
    }

    /* =====================================================
       29. BOTONES Y EVENTOS
       ===================================================== */

    document.addEventListener("click", event => {
        const actionElement =
            event.target.closest("[data-action]");

        if (actionElement) {
            const action =
                actionElement.dataset.action;

            switch (action) {
                case "ver-machine":
                    event.preventDefault();

                    if (actionElement.dataset.id) {
                        seleccionarMaquina(
                            actionElement.dataset.id,
                            true
                        );
                    }

                    break;

                case "agregar-machine":
                    event.preventDefault();
                    abrirFormularioAgregar();
                    break;

                case "cerrar-modal":
                    event.preventDefault();
                    cerrarModal();
                    break;

                case "confirmar-eliminar":
                    event.preventDefault();
                    eliminarMaquinaSeleccionada();
                    break;

                case "seleccionar-desde-modal":
                    event.preventDefault();

                    if (actionElement.dataset.id) {
                        cerrarModal();

                        seleccionarMaquina(
                            actionElement.dataset.id,
                            true
                        );
                    }

                    break;

                default:
                    break;
            }

            return;
        }

        const processMachine =
            event.target.closest(".process-machine");

        if (
            processMachine &&
            !event.target.closest("button")
        ) {
            seleccionarMaquina(
                processMachine.dataset.machine,
                true
            );

            return;
        }

        const deviceCard =
            event.target.closest(".device-card");

        if (
            deviceCard &&
            !event.target.closest("button")
        ) {
            seleccionarMaquina(
                deviceCard.dataset.device,
                true
            );
        }
    });

    /* =====================================================
       30. NAVEGACIÓN
       ===================================================== */

    $$(".nav-item").forEach(item => {
        item.addEventListener("click", () => {
            $$(".nav-item").forEach(navItem => {
                navItem.classList.remove("active");
            });
            item.classList.add("active");
        });
    });

    /* =====================================================
       31. FILTROS
       ===================================================== */

    $("#deviceFilter")?.addEventListener(
        "change",
        () => {
            renderizarListaMaquinas();
        }
    );

    $("#familyFilter")?.addEventListener(
        "change",
        () => {
            renderizarListaMaquinas();
        }
    );

    /* =====================================================
       32. BOTÓN SIMULACIÓN
       ===================================================== */

    $("#simulationButton")?.addEventListener(
        "click",
        iniciarDetenerSimulacion
    );

    /* =====================================================
       33. BOTÓN ESCANEO
       ===================================================== */

    $("#scanButton")?.addEventListener(
        "click",
        escanearMaquina
    );

    $("#scanDevice")?.addEventListener(
        "change",
        event => {
            if (event.target.value) {
                seleccionarMaquina(
                    event.target.value,
                    false
                );
            }
        }
    );

    /* =====================================================
       34. BOTÓN MANTENIMIENTO
       ===================================================== */

    $("#maintenanceButton")?.addEventListener(
        "click",
        ejecutarMantenimiento
    );

    /* =====================================================
       35. ADMINISTRACIÓN
       ===================================================== */

    $("#addMachineButton")?.addEventListener(
        "click",
        abrirFormularioAgregar
    );

    $("#adminAddMachine")?.addEventListener(
        "click",
        abrirFormularioAgregar
    );

    $("#adminEditMachine")?.addEventListener(
        "click",
        abrirFormularioEditar
    );

    $("#adminDeleteMachine")?.addEventListener(
        "click",
        abrirFormularioEliminar
    );

    $("#adminSensorManagement")?.addEventListener(
        "click",
        abrirGestionSensores
    );

    /* =====================================================
       36. FORMULARIOS DEL MODAL
       ===================================================== */

    document.addEventListener("submit", event => {
        const form = event.target;

        if (!(form instanceof HTMLFormElement)) {
            return;
        }

        if (form.id === "formAgregarMaquina") {
            event.preventDefault();
            procesarAgregarMaquina(form);
        }

        if (form.id === "formEditarMaquina") {
            event.preventDefault();
            procesarEditarMaquina(form);
        }

        if (form.id === "formSensores") {
            event.preventDefault();
            procesarSensores(form);
        }
    });

    /* =====================================================
       37. CIERRE DEL MODAL
       ===================================================== */

    $("#novaModalClose")?.addEventListener(
        "click",
        cerrarModal
    );

    $("#novaModal")?.addEventListener(
        "click",
        event => {
            if (
                event.target === event.currentTarget
            ) {
                cerrarModal();
            }
        }
    );

    document.addEventListener(
        "keydown",
        event => {
            if (event.key === "Escape") {
                cerrarModal();
            }
        }
    );

    /* =====================================================
       38. BOTÓN DE INICIO / DASHBOARD
       ===================================================== */

    $("#dashboardLink")?.addEventListener(
        "click",
        event => {
            event.preventDefault();

            const dashboard =
                $("#dashboard");

            dashboard?.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }
    );

    /* =====================================================
       39. TECLADO EN MÁQUINAS
       ===================================================== */

    document.addEventListener(
        "keydown",
        event => {
            if (
                event.key !== "Enter" &&
                event.key !== " "
            ) {
                return;
            }

            const machine =
                event.target.closest(
                    ".process-machine, .device-card"
                );

            if (!machine) return;

            event.preventDefault();

            const id =
                machine.dataset.machine ||
                machine.dataset.device;

            if (id) {
                seleccionarMaquina(
                    id,
                    true
                );
            }
        }
    );

    /* =====================================================
       40. ACTUALIZACIÓN GENERAL
       ===================================================== */

    function actualizarTodo() {
        cargarFiltrosFamilia();
        cargarSelectMaquinas();

        actualizarKPIs();

        renderizarFamilias();
        renderizarListaMaquinas();
        renderizarAlertas();
        renderizarHistorial();

        const maquina =
            obtenerMaquina(maquinaSeleccionada) ||
            machines[0];

        if (maquina) {
            maquinaSeleccionada = maquina.id;

            actualizarPanelRiesgo(maquina);
            actualizarPanelVariables(maquina);
            actualizarRecomendacion(maquina);
        }

        actualizarGraficaRiesgo();
    }

    /* =====================================================
       41. UTILIDADES
       ===================================================== */

    function esperar(ms) {
        return new Promise(resolve => {
            setTimeout(resolve, ms);
        });
    }

    /* =====================================================
       42. DATOS INICIALES
       ===================================================== */

    function inicializar() {
        machines.forEach(machine => {
            if (
                typeof machine.riesgo !== "number" ||
                Number.isNaN(machine.riesgo)
            ) {
                machine.riesgo = 20;
            }

            if (
                !machine.estado ||
                !estados[machine.estado]
            ) {
                machine.estado =
                    calcularEstadoDesdeRiesgo(
                        machine.riesgo
                    );
            }
        });

        // Generar puntos iniciales para la gráfica.
        const maquinaInicial =
            obtenerMaquina(maquinaSeleccionada);

        if (maquinaInicial) {
            for (let i = 0; i < 6; i++) {
                historialRiesgo.push({
                    fecha: new Date(
                        Date.now() -
                        (5 - i) * 60000
                    ),
                    maquinaId: maquinaInicial.id,
                    riesgo: Math.max(
                        5,
                        maquinaInicial.riesgo +
                        (i - 3) * 2
                    )
                });
            }
        }

        registrarEvento(
            "Sistema iniciado",
            maquinaInicial,
            "NOVA Monitoring cargó el inventario industrial del prototipo."
        );

        actualizarTodo();

        if (maquinaInicial) {
            seleccionarMaquina(
                maquinaInicial.id,
                false
            );
        }

        // El prototipo mantiene un ciclo continuo de monitoreo.
        // Cuando exista backend, el mismo ciclo podrá consultar la BD/API.
        if (sesionNOVA && !simulacionActiva) {
            iniciarSimulacion();
        }

        console.log(
            "%cNOVA Monitoring",
            "font-size:18px;font-weight:bold;color:#a78bfa"
        );

        console.log(
            `NOVA cargó ${machines.length} máquinas en ${familias.length} familias.`
        );
    }

    /* =====================================================
       43. EXPOSICIÓN OPCIONAL PARA DEPURACIÓN
       ===================================================== */

    window.NOVA = {
        machines,
        familias,
        seleccionarMaquina,
        iniciarSimulacion,
        detenerSimulacion,
        escanearMaquina,
        ejecutarMantenimiento,
        actualizarTodo,
        tienePermiso,
        esAdministrador,
        esOperativo,
        esGerencial,
        cerrarSesion: cerrarSesionNOVA
    };

    /* =====================================================
       44. INICIAR NOVA
       ===================================================== */

    inicializarAutenticacionNOVA();
    inicializar();
});