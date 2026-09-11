# 🏢 CondoTrack

CondoTrack es una plataforma *PropTech* centralizada diseñada para optimizar la gestión, comunicación y trazabilidad de la operación cotidiana en edificios y condominios. 

El sistema elimina la dependencia de múltiples canales informales (como WhatsApp o planillas de Excel) proporcionando una fuente única de verdad para la administración, el personal de recepción y los residentes.

---

## 🚀 Tecnologías Utilizadas

Este proyecto utiliza una arquitectura cliente-servidor separada, empleando tecnologías modernas y robustas para garantizar escalabilidad y rendimiento.

### 💻 Frontend (Interfaz de Usuario)
* **[React](https://react.dev/)** + **[Vite](https://vitejs.dev/)**: Librería principal y entorno de desarrollo ultra rápido.
* **TypeScript**: Tipado estático para un código más seguro y predecible.
* **[Tailwind CSS v4](https://tailwindcss.com/)**: Framework de CSS utilitario para un diseño ágil y moderno.
* **[React Router DOM](https://reactrouter.com/)**: Manejo de rutas y navegación (SPA).
* **[TanStack Query](https://tanstack.com/query/latest)**: Gestión avanzada de estado asíncrono y consumo de la API REST.
* **[Lucide React](https://lucide.dev/)**: Sistema de íconos SVG limpios y consistentes.

### ⚙️ Backend (API RESTful)
* **[Java 17](https://www.oracle.com/java/)** + **[Spring Boot 3](https://spring.io/projects/spring-boot)**: Framework principal para el servidor.
* **Spring Security & JWT**: Protección de rutas y autenticación basada en JSON Web Tokens.
* **Spring Data JPA**: Abstracción de base de datos y mapeo objeto-relacional (ORM) usando Hibernate.
* **PostgreSQL / MySQL**: Sistema de gestión de bases de datos relacionales.
* **Lombok**: Reducción de código repetitivo (Getters, Setters, Constructores).
* **Spring Mail**: Envío automático de correos y notificaciones.
* **ZXing (Zebra Crossing)**: Generación y lectura de códigos QR para el control de acceso.
* **Swagger / OpenAPI**: Documentación interactiva de los endpoints del backend.

---

## 🧩 Módulos Principales

El sistema está diseñado pensando en el ciclo de vida completo de la operación de un edificio: `Edificio → Unidad → Residente → Acciones`.

1. **Gestión de Propiedades y Usuarios**: Administración de edificios, unidades, propietarios, inquilinos y personal.
2. **Control de Accesos**: Registro de visitantes, personal temporal y generación de autorizaciones vía Código QR.
3. **Paquetería (Deliveries)**: Trazabilidad en la recepción y entrega de correspondencia con notificaciones automáticas.
4. **Espacios Comunes (Amenities)**: Sistema de calendario y reservas (SUM, parrillas, coworking) evitando duplicidades.
5. **Mantenimiento e Incidentes**: Creación de tickets de mantenimiento con seguimiento de responsables, estados y resoluciones.
6. **Mudanzas**: Solicitudes formales de mudanza con validación de administración.

---

## 🛠️ Instalación y Uso Local

Para levantar el proyecto en tu entorno local, necesitas tener instalado **Node.js**, **Java 17** y **Maven**.

### 1. Iniciar el Backend
```bash
cd backend
./mvnw spring-boot:run
```
La API estará disponible en `http://localhost:8080`.

### 2. Iniciar el Frontend
En una nueva terminal:
```bash
cd frontend
npm install
npm run dev
```
La aplicación web estará disponible en `http://localhost:5173`.
