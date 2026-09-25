require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { google } = require('googleapis');

const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

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

    const safeName = name ? name.trim() : '';
    const safeEmail = email ? email.trim().toLowerCase() : '';
    const safePhone = phone ? phone.replace(/[\s\-\(\)]/g, '') : '';
    const safeDate = date ? date.trim() : '';
    const safeTime = time ? time.trim() : '';

    const errores = [];

    if (safeName.length < 2) errores.push('El nombre es obligatorio y debe ser válido.');
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!safeEmail || !emailRegex.test(safeEmail)) errores.push('El email no tiene un formato válido.');
    
    const phoneRegex = /^\+?[0-9]{8,15}$/;
    if (!safePhone || !phoneRegex.test(safePhone)) errores.push('El teléfono debe contener entre 8 y 15 números.');
    
    const serviciosValidos = Object.keys(duraciones);
    if (!service || !serviciosValidos.includes(service)) errores.push('El servicio seleccionado no existe o fue manipulado.');
    
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!safeDate || !dateRegex.test(safeDate)) {
        errores.push('La fecha no tiene un formato válido.');
    } else {
        const turnoDate = new Date(`${safeDate}T00:00:00-03:00`);
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        if (turnoDate < hoy) errores.push('No podés agendar turnos en fechas pasadas.');
    }

    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!safeTime || !timeRegex.test(safeTime)) errores.push('La hora no tiene un formato válido.');

    if (errores.length > 0) {
        return res.status(400).json({ success: false, error: 'Por favor, revisá los datos ingresados.', detalles: errores });
    }

    const duracionMinutos = duraciones[service] || 60;
    const startDateTime = new Date(`${safeDate}T${safeTime}:00-03:00`); 
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
            summary: `Turno: ${service} - ${safeName}`,
            description: `Cliente: ${safeName}\nTeléfono: ${safePhone}\nEmail: ${safeEmail}`,
            start: { 
                dateTime: startDateTime.toISOString(),
                timeZone: 'America/Argentina/Buenos_Aires'
            },
            end: { 
                dateTime: endDateTime.toISOString(),
                timeZone: 'America/Argentina/Buenos_Aires'
            },
        };

        const googleResponse = await calendar.events.insert({
            calendarId: CALENDAR_ID,
            resource: event,
        });
        
        try {
            const mailOptions = {
                from: `"Sentido Orgánico" <${process.env.EMAIL_USER}>`,
                to: safeEmail, 
                subject: '¡Tu turno está confirmado! 🌿',
                html: `
                    <div style="font-family: Arial, sans-serif; color: #f4f6f0; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden;">
                        <div style="background-color: #7aa769; color: white; padding: 20px; text-align: center;">
                            <h2 style="margin: 0;">Sentido Orgánico</h2>
                        </div>
                        <div style="padding: 20px;">
                            <p style="font-size: 16px;">¡Hola <strong>${safeName}</strong>!</p>
                            <p style="font-size: 16px;">Tu turno con Lucrecia ha sido agendado exitosamente.</p>
                            
                            <div style="background-color: #4A3F35; padding: 15px; border-radius: 8px; margin: 20px 0;">
                                <p style="margin: 5px 0;"><strong>Servicio:</strong> ${service}</p>
                                <p style="margin: 5px 0;"><strong>Fecha:</strong> ${safeDate}</p>
                                <p style="margin: 5px 0;"><strong>Hora:</strong> ${safeTime} hs</p>
                            </div>
                            
                            <p style="font-size: 14px; color: #f4f6f0;">Te esperamos para priorizar tu salud capilar. Si necesitas cancelar o reprogramar, por favor contáctanos con anticipación.</p>
                        </div>
                    </div>
                `
            };
            
            await transporter.sendMail(mailOptions);
            console.log('Email enviado correctamente a:', safeEmail);
        } catch (mailError) {
            console.error('Error al enviar el email:', mailError);
        }

        try {
            const mailLucrecia = {
                from: `"Sistema de Reservas" <${process.env.EMAIL_USER}>`,
                to: process.env.EMAIL_USER,
                subject: `🔔 NUEVO TURNO: ${service} - ${safeName}`,
                html: `
                    <div style="font-family: Arial, sans-serif; color: #f4f6f0;">
                        <h2 style="color: #4A3F35;">¡Tenés una nueva reserva!</h2>
                        <div style="background-color: #7aa769; padding: 15px; border-radius: 8px;">
                            <p><strong>Cliente:</strong> ${safeName}</p>
                            <p><strong>Teléfono:</strong> <a href="https://wa.me/549${safePhone}">${safePhone}</a></p>
                            <p><strong>Email:</strong> ${safeEmail}</p>
                            <hr style="border: 1px solid #ddd; margin: 15px 0;">
                            <p><strong>Servicio:</strong> ${service}</p>
                            <p><strong>Día:</strong> ${safeDate}</p>
                            <p><strong>Hora:</strong> ${safeTime} hs</p>
                        </div>
                        <p><small>Este turno ya se guardó automáticamente en tu Google Calendar.</small></p>
                    </div>
                `
            };
            
            await transporter.sendMail(mailLucrecia);
            console.log('Aviso interno enviado a Lucrecia.');
        } catch (avisoError) {
            console.error('Error al avisar a Lucrecia:', avisoError);
        }

        res.status(200).json({ 
            success: true, 
            message: '¡Turno agendado con éxito!',
            link: googleResponse.data.htmlLink 
        });

    } catch (error) {
        console.error('Error general al procesar el turno:', error);
        res.status(500).json({ error: 'Hubo un problema al procesar el turno con Google Calendar.' });
    }
});

app.get('/api/disponibilidad', async (req, res) => {
    const { date, service } = req.query;
    if (!date) return res.status(400).json({ error: 'Falta la fecha' });

    try {
        const duracionMinutos = duraciones[service] || 60;
        const [year, month, dayStr] = date.split('-');
        const diaSemana = new Date(Date.UTC(year, month - 1, dayStr)).getUTCDay();

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