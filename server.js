require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { google } = require('googleapis');

const app = express();
app.use(cors());
app.use(express.json());

// app.use(express.static(path.join(__dirname)));

// Autenticación automática usando tu archivo credentials.json
let authConfig = {
    scopes: [
        'https://www.googleapis.com/auth/calendar.events',
        'https://www.googleapis.com/auth/calendar.readonly'
    ]
};

// Si existe la variable en Vercel, la parsea. Si no, usa el archivo local.
if (process.env.GOOGLE_CREDENTIALS) {
    authConfig.credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
} else {
    authConfig.keyFile = './credentials.json';
}

const auth = new google.auth.GoogleAuth(authConfig);

const calendar = google.calendar({ version: 'v3', auth });
const CALENDAR_ID = process.env.CALENDAR_ID;

app.post('/api/agendar', async (req, res) => {
    const { name, email, phone, service, date, time } = req.body;

    if (!name || !date || !time || !service) {
        return res.status(400).json({ error: 'Faltan datos obligatorios para el turno.' });
    }

    const startDateTime = new Date(`${date}T${time}:00`); 
    const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000); // 1 hora de duración

    try {
        // 1. Verificar si ya hay un evento o bloqueo en ese horario exacto
        const freeBusyCheck = await calendar.freebusy.query({
            requestBody: {
                timeMin: startDateTime.toISOString(),
                timeMax: endDateTime.toISOString(),
                items: [{ id: CALENDAR_ID }],
            },
        });

        const eventsOnTime = freeBusyCheck.data.calendars[CALENDAR_ID].busy;

        if (eventsOnTime.length > 0) {
            return res.status(400).json({ success: false, error: 'Lo siento, ese horario ya está ocupado o no disponible.' });
        }

        // 2. Si está libre, creamos el turno
        const event = {
            summary: `Turno: ${service} - ${name}`,
            description: `Cliente: ${name}\nTeléfono: ${phone}\nEmail: ${email}`,
            start: { dateTime: startDateTime.toISOString() },
            end: { dateTime: endDateTime.toISOString() },
        };

        const response = await calendar.events.insert({
            calendarId: CALENDAR_ID,
            resource: event,
        });
        
        res.status(200).json({ 
            success: true, 
            message: '¡Turno agendado con éxito!',
            link: response.data.htmlLink 
        });

    } catch (error) {
        console.error('Error al gestionar el calendario:', error);
        res.status(500).json({ error: 'Hubo un problema al procesar el turno con Google Calendar.' });
    }
});

app.get('/api/disponibilidad', async (req, res) => {
    const { date } = req.query; // Formato YYYY-MM-DD
    if (!date) return res.status(400).json({ error: 'Falta la fecha' });

    try {
        // Determinamos qué día de la semana es (0 = Domingo, 1 = Lunes, ..., 6 = Sábado)
        const fechaLocal = new Date(`${date}T00:00:00-03:00`);
        const diaSemana = fechaLocal.getDay();

        let horariosPosibles = [];

        if (diaSemana === 0) {
            // Domingos: NO trabaja
            return res.json({ success: true, horarios: [] });
        } else if (diaSemana >= 1 && diaSemana <= 5) {
            // Lunes a Viernes: 8hs a 12hs
            horariosPosibles = ["08:00", "09:00", "10:00", "11:00"];
        } else if (diaSemana === 6) {
            // Sábados: 9hs a 17hs
            horariosPosibles = ["09:00", "10:30", "12:00", "13:30", "15:00", "16:00"];
        }

        const timeMin = new Date(`${date}T00:00:00.000-03:00`).toISOString();
        const timeMax = new Date(`${date}T23:59:59.999-03:00`).toISOString();

        const freeBusyCheck = await calendar.freebusy.query({
            requestBody: {
                timeMin,
                timeMax,
                items: [{ id: CALENDAR_ID }],
            },
        });

        const busySlots = freeBusyCheck.data.calendars[CALENDAR_ID].busy || [];

        // Evaluamos cada horario posible contra los bloqueos del calendario
        const horariosFinales = horariosPosibles.map(hora => {
            const inicioSlot = new Date(`${date}T${hora}:00-03:00`).getTime();
            const finSlot = inicioSlot + (60 * 60 * 1000); // 1 hora de duración por turno

            const estaOcupado = busySlots.some(slot => {
                const inicioBusy = new Date(slot.start).getTime();
                const finBusy = new Date(slot.end).getTime();

                if (slot.start.length === 10) {
                    return slot.start === date;
                }

                return (inicioSlot < finBusy && finSlot > inicioBusy);
            });

            return { time: hora, available: !estaOcupado };
        });

        res.json({ success: true, horarios: horariosFinales });
    } catch (error) {
        console.error('Error al consultar disponibilidad:', error);
        res.status(500).json({ error: 'Error al obtener horarios' });
    }
});

const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
}

module.exports = app;

