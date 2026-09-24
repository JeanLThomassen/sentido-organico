# Sentido Orgánico

Landing page para un salón de belleza, con sistema de reserva de turnos online integrado a Google Calendar.

🔗 **Demo en vivo:** [https://sentido-organico.vercel.app/]

## ¿Qué problema resuelve?

El negocio recibía turnos por teléfono, lo que implicaba atención manual todo el día y riesgo de errores u horarios duplicados. Este sistema permite que los clientes reserven su turno directamente desde la web, viendo en tiempo real qué horarios están disponibles según el servicio elegido, y sincronizando todo automáticamente con el Google Calendar del negocio.

## Funcionalidades

- Calendario interactivo para elegir día y horario disponible.
- Cálculo automático de disponibilidad según la duración de cada servicio (corte, color, mechas, etc.), consultando en tiempo real el calendario del negocio vía la API de Google Calendar (`freebusy`).
- Formulario de reserva en pasos (datos del cliente → servicio → confirmación de fecha y hora).
- Creación automática del evento en Google Calendar al confirmar el turno, con los datos del cliente.
- Diseño responsive, con menú mobile y animaciones de scroll.

## Tecnologías

- **Frontend:** HTML, CSS, JavaScript (vanilla, sin frameworks)
- **Backend:** Node.js + Express
- **Integración:** Google Calendar API (`googleapis`)
- **Deploy:** Vercel

## Estructura del proyecto

```
/
├── server.js           # API: agendar turno y consultar disponibilidad
├── public/
│   ├── index.html
│   ├── components/
│   │   ├── calendar.js  # Lógica del selector de fecha/hora
│   │   ├── form.js       # Lógica del formulario multi-paso
│   │   ├── modal.js
│   │   └── navbar.js
│   └── ...
```

## Cómo correrlo localmente

1. Cloná el repositorio:
   ```bash
   git clone https://github.com/JeanLThomassen/sentido-organico.git
   cd sentido-organico
   npm install
   ```

2. Creá un archivo `.env` en la raíz con:
   ```
   CALENDAR_ID=tu_calendar_id@group.calendar.google.com
   GOOGLE_CREDENTIALS={"type":"service_account", ...}
   ```
   > La cuenta de servicio de Google necesita permisos de lectura/escritura sobre el calendario indicado en `CALENDAR_ID`.

3. Iniciá el servidor:
   ```bash
   node server.js
   ```
   La app va a estar disponible en `http://localhost:3000`.

## Próximas mejoras

- Restringir CORS al dominio de producción.
- Agregar rate limiting a los endpoints de la API para evitar abuso.
- Validación de formato de email/teléfono en el backend, no solo en el frontend.

## Autor

Jean Lucas Thomassen — [GitHub](https://github.com/JeanLThomassen)
