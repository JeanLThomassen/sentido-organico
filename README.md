# Sentido Orgánico

Landing page con sistema de reserva de turnos online para Sentido Orgánico, un salón de belleza. Los clientes pueden ver los servicios disponibles y reservar un turno eligiendo día y horario, con verificación de disponibilidad en tiempo real contra Google Calendar.

🔗 **Demo en producción:** [sentido-organico.vercel.app](https://sentido-organico.vercel.app/)

## ¿Qué problema resuelve?

El salón necesitaba una forma de recibir turnos online sin que alguien tenga que atender el teléfono todo el día. Este proyecto automatiza esa gestión: el cliente reserva desde la web, y el turno se sincroniza automáticamente con el Google Calendar del negocio, bloqueando ese horario para que no se pueda superponer con otro turno.

## Funcionalidades

- Calendario interactivo para elegir día y horario disponible.
- Consulta de disponibilidad en tiempo real contra Google Calendar (respeta turnos ya ocupados).
- Formulario de reserva paso a paso (datos del cliente → servicio → confirmación).
- Duración de turno automática según el servicio elegido (corte, color, balayage, tratamientos, etc.).
- Creación automática del evento en Google Calendar al confirmar la reserva.
- Diseño responsive, con menú mobile y animaciones al hacer scroll.

## Tecnologías

- **Frontend:** HTML, CSS, JavaScript (vanilla, sin frameworks)
- **Backend:** Node.js, Express
- **Integración:** Google Calendar API (`googleapis`)
- **Deploy:** Vercel

## Cómo correrlo localmente

```bash
git clone https://github.com/JeanLThomassen/sentido-organico.git
cd sentido-organico
npm install
```

Crear un archivo `.env` en la raíz con las siguientes variables:

```
GOOGLE_CREDENTIALS='{ ...contenido del JSON de la cuenta de servicio de Google... }'
CALENDAR_ID=tu_calendar_id@group.calendar.google.com
PORT=3000
```

> Necesitás una cuenta de servicio de Google Cloud con acceso a la Google Calendar API y compartida con el calendario que quieras usar. El proyecto no incluye `credentials.json` ni ningún dato sensible por seguridad.

Luego:

```bash
npm start
```

Y abrir `http://localhost:3000`.

## Nota

Este es un proyecto de portfolio, desarrollado para un caso real y actualmente en uso activo por el negocio. El código es de libre consulta con fines de aprendizaje; no está pensado para reutilización comercial directa sin adaptación.

---

Desarrollado por [Jean Lucas Thomassen](https://github.com/JeanLThomassen)
