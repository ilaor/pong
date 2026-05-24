# PONG Online Multiplayer

Proyecto desarrollado como un sencillo juego PONG en 2D orientado a demostrar el uso de comunicaciones en tiempo real mediante tecnología WebSocket.

<p align="center">
  <img src="./pong.png" width="400" height="350">
</p>

El backend de la aplicación utiliza un servidor desarrollado con Node.js junto a la librería Socket.IO, encargado de gestionar toda la comunicación entre jugadores y sincronizar las partidas en tiempo real.

La parte frontend se compone de una interfaz web ligera desarrollada con HTML, CSS y JavaScript.

La versión multijugador incorpora un servidor HTTP encargado de servir el contenido estático del juego y un servidor WebSocket que actúa como motor principal de red, permitiendo que dos usuarios conectados desde diferentes dispositivos puedan disputar partidas online.

En el apartado de versiones se describen las distintas fases del proyecto, incluyendo una modalidad local contra la máquina y una versión completa multijugador en red.

---

# Inicio del Proyecto

Estas instrucciones permiten ejecutar el proyecto en un entorno local para desarrollo y pruebas.

## Requisitos Previos

Es necesario disponer de Node.js y npm instalados en el sistema. En Ubuntu 22.04 se puede realizar la instalación mediante los siguientes comandos:

```bash
sudo apt update
sudo apt install nodejs npm
sudo npm install -g n
sudo n stable
```

Para visualizar correctamente el diseño original del juego se recomienda instalar la fuente Impact en el sistema.

### Instalación de la fuente Impact

1. Descargar la fuente desde una página de confianza.

2. Acceder a la carpeta de descargas:

```bash
cd ~/Descargas
```

3. Descomprimir el archivo descargado:

```bash
unzip Impact-Font.zip
```

4. Copiar la fuente al directorio global del sistema:

```bash
sudo cp impact.ttf /usr/local/share/fonts
```

---

# Instalación

Clonar el repositorio del proyecto:

```bash
git clone https://tu-repositorio/pong.git
```

Entrar en la carpeta del proyecto e instalar todas las dependencias necesarias:

```bash
cd pong
npm install
```

Iniciar la aplicación:

```bash
npm start
```

---

# Despliegue

Durante el desarrollo, la aplicación funciona mediante un único servidor Node.js que proporciona tanto el contenido web como el servidor WebSocket utilizado para las partidas.

Es importante configurar correctamente la URL del servidor de juego para permitir la conexión entre clientes.

Para un entorno de producción se recomienda utilizar un servidor web como Apache2 o Nginx y servir el contenido de la carpeta `public`.

El servidor Node.js encargado de las conexiones WebSocket deberá mantenerse activo y correctamente configurado, incluyendo las políticas CORS necesarias para aceptar conexiones externas.

---

# Tecnologías Utilizadas

Las principales herramientas y librerías empleadas en el proyecto son las siguientes:

- Socket.IO  
  Librería utilizada para implementar comunicación bidireccional en tiempo real entre cliente y servidor.

- Express  
  Framework minimalista para Node.js utilizado para crear el servidor web.

- Nodemon  
  Utilidad que reinicia automáticamente el servidor durante el desarrollo cuando detecta cambios en los archivos.

---

# Control de Versiones

El proyecto sigue el sistema de versionado SemVer.

Versiones disponibles del proyecto:

| Versión | Descripción |
|----------|-------------|
| v1.0.0 | Juego PONG local contra la máquina |
| v2.0.0 | Juego servido desde un servidor web |
| v3.0.0 | Implementación multijugador online |

---

# Autores

Proyecto desarrollado con la colaboración de:

- Paco Maciá — Desarrollo inicial
- Ivan Lara — Desarrollo académico y mejoras