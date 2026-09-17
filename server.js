require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { google } = require('googleapis');

const app = express();
app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname)));

let authConfig = {
    scopes: [
        'https://www.googleapis.com/auth/calendar.events',
        'https://www.googleapis.com/auth/calendar.readonly'
    ]
};

if (process.env.GOOGLE_CREDENTIALS) {
    authConfig.credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
} else {
    authConfig.keyFile = './credentials.json';
}

const auth = new google.auth.GoogleAuth(authConfig);
const calendar = google.calendar({ version: 'v3', auth });
const CALENDAR_ID = process.env.CALENDAR_ID;

const duraciones = {
    'corte': 60,
    'color-barro': 90,
    'color-raiz': 120,
    'color-completo': 120,
    'mechas': 180,
    'balayage': 180,
    'tratamiento-ayur': 90,
    'tratamiento-ldf': 90,
    'peinado-maquillaje': 60
};

app.post('/api/agendar', async (req, res) => {
    const { name, email, phone, service, date, time } = req.body;

    if (!name || !date || !time || !service) {
        return res.status(400).json({ error: 'Faltan datos obligatorios para el turno.' });
    }

    const duracionMinutos = duraciones[service] || 60;
    const startDateTime = new Date(`${date}T${time}:00-03:00`); 
    const endDateTime = new Date(startDateTime.getTime() + (duracionMinutos * 60 * 1000));

    try {
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

        const event = {
            summary: `Turno: ${service} - ${name}`,
            description: `Cliente: ${name}\nTeléfono: ${phone}\nEmail: ${email}`,
            start: { 
                dateTime: startDateTime.toISOString(),
                timeZone: 'America/Argentina/Buenos_Aires'
            },
            end: { 
                dateTime: endDateTime.toISOString(),
                timeZone: 'America/Argentina/Buenos_Aires'
            },
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
        console.error(error);
        res.status(500).json({ error: 'Hubo un problema al procesar el turno con Google Calendar.' });
    }
});

app.get('/api/disponibilidad', async (req, res) => {
    const { date, service } = req.query;
    if (!date) return res.status(400).json({ error: 'Falta la fecha' });

    try {
        const duracionMinutos = duraciones[service] || 60;
        const fechaLocal = new Date(`${date}T00:00:00-03:00`);
        const diaSemana = fechaLocal.getDay();

        let horariosPosibles = [];
        let cierreMinutos = 0;

        if (diaSemana === 0) {
            return res.json({ success: true, horarios: [] });
        } else if (diaSemana >= 1 && diaSemana <= 5) {
            cierreMinutos = 12 * 60;
            let actual = 8 * 60;
            while (actual < cierreMinutos) {
                let h = Math.floor(actual / 60).toString().padStart(2, '0');
                let m = (actual % 60).toString().padStart(2, '0');
                horariosPosibles.push(`${h}:${m}`);
                actual += 30;
            }
        } else if (diaSemana === 6) {
            cierreMinutos = 17 * 60;
            let actual = 9 * 60;
            while (actual < cierreMinutos) {
                let h = Math.floor(actual / 60).toString().padStart(2, '0');
                let m = (actual % 60).toString().padStart(2, '0');
                horariosPosibles.push(`${h}:${m}`);
                actual += 30;
            }
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

        const horariosFinales = horariosPosibles.map(hora => {
            const [horas, minutos] = hora.split(':').map(Number);
            const inicioSlotMin = (horas * 60) + minutos;
            const finSlotMin = inicioSlotMin + duracionMinutos;

            if (finSlotMin > cierreMinutos) {
                return { time: hora, available: false };
            }

            const inicioSlotMs = new Date(`${date}T${hora}:00-03:00`).getTime();
            const finSlotMs = inicioSlotMs + (duracionMinutos * 60 * 1000);

            const estaOcupado = busySlots.some(slot => {
                if (slot.start.length === 10) return slot.start === date;
                const inicioBusy = new Date(slot.start).getTime();
                const finBusy = new Date(slot.end).getTime();
                return (inicioSlotMs < finBusy && finSlotMs > inicioBusy);
            });

            return { time: hora, available: !estaOcupado };
        });

        res.json({ success: true, horarios: horariosFinales });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener horarios' });
    }
});

const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`http://localhost:${PORT}`);
    });
}

module.exports = app;