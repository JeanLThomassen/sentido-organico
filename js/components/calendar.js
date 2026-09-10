export function initCalendar(root) {
    const monthNames = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    let currentDate = new Date();
    let selectedDate = null;
    let selectedTime = null;
    
    const todayMonth = new Date().getMonth();
    const todayYear = new Date().getFullYear();
    
    const trigger = root.querySelector('#dateTimeSelect');
    const triggerLabel = root.querySelector('#dateTimeSelectLabel');
    const popover = root.querySelector('#calendarPopover');
    const daysView = root.querySelector('#calendarDaysView');
    const timesView = root.querySelector('#calendarTimesView');
    const grid = root.querySelector('#calendarGrid');
    const monthYearLabel = root.querySelector('#monthYearLabel');
    const selectedDayLabel = root.querySelector('#selectedDayLabel');
    const timesContainer = root.querySelector('#calendarTimes');
    const nextMonthBtn = root.querySelector('#nextMonth');
    const prevMonthBtn = root.querySelector('#prevMonth');
    const backToDaysBtn = root.querySelector('#backToDays');
    const hiddenInput = root.querySelector('#appointmentDateTime');

    function openPopover() {
        popover.hidden = false;
        showDaysView();
    }
    function closePopover() {
        popover.hidden = true;
    }
    function togglePopover() {
        popover.hidden ? openPopover() : closePopover();
    }
    function showDaysView() {
        daysView.hidden = false;
        timesView.hidden = true;
    }
    function showTimesView() {
        daysView.hidden = true;
        timesView.hidden = false;
    }

    function renderDays() {
        const month = currentDate.getMonth();
        const year = currentDate.getFullYear();
        const totalDays = new Date(year, month + 1, 0).getDate();
        const firstDayWeekday = new Date(year, month, 1).getDay();

        monthYearLabel.textContent = `${monthNames[month]} ${year}`;
        grid.innerHTML = '';

        for (let i = 0; i < firstDayWeekday; i++) {
            grid.appendChild(document.createElement('div'));
        }

        // Fecha actual sin horas para comparar días pasados
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let day = 1; day <= totalDays; day++) {
            const dayBtn = document.createElement('button');
            dayBtn.type = 'button';
            dayBtn.textContent = day;
            dayBtn.classList.add('btn_day');

            const cellDate = new Date(year, month, day);
            cellDate.setHours(0, 0, 0, 0);

            // Si el día es anterior a hoy, lo deshabilitamos y estilizamos distinto
            if (cellDate < today) {
                dayBtn.disabled = true;
                dayBtn.style.opacity = '0.3';
                dayBtn.style.cursor = 'not-allowed';
            } else {
                dayBtn.addEventListener('click', () => {
                    selectedDate = new Date(year, month, day);
                    renderTimes();
                    showTimesView();
                });
            }

            grid.appendChild(dayBtn);
        }
    }

    async function renderTimes() {
        const dayNumber = selectedDate.getDate();
        const monthName = monthNames[selectedDate.getMonth()].toLowerCase();
        selectedDayLabel.textContent = `${dayNumber} de ${monthName}`;
        timesContainer.innerHTML = '<small style="padding: 10px;">Cargando horarios...</small>';

        const isoDate = selectedDate.toISOString().split('T')[0];

        try {
            const response = await fetch(`http://localhost:3000/api/disponibilidad?date=${isoDate}`);
            const data = await response.json();

            timesContainer.innerHTML = '';

            if (!data.success || data.horarios.length === 0) {
                timesContainer.innerHTML = '<small style="padding: 10px; color: red;">No hay horarios configurados.</small>';
                return;
            }

            data.horarios.forEach(slot => {
                const timeBtn = document.createElement('button');
                timeBtn.type = 'button';
                timeBtn.textContent = slot.time; // Asegura que muestre la hora (ej: "10:00")
                timeBtn.classList.add('btn_time');

                if (!slot.available) {
                    // Estilo para horarios ocupados (rojos, bloqueados y texto visible)
                    timeBtn.disabled = true;
                    timeBtn.style.backgroundColor = '#ffe6e6';
                    timeBtn.style.color = '#a94442'; // Color de texto oscuro para que se lea la hora
                    timeBtn.style.borderColor = '#d9534f';
                    timeBtn.style.textDecoration = 'line-through'; // Opcional: tacha la hora ocupada
                    timeBtn.style.cursor = 'not-allowed';
                    timeBtn.title = 'Horario ocupado';
                } else {
                    // Estilo para horarios libres
                    timeBtn.style.backgroundColor = '';
                    timeBtn.style.color = '';
                    timeBtn.style.borderColor = '';
                    timeBtn.addEventListener('click', () => {
                        selectedTime = slot.time;
                        confirmSelection();
                    });
                }

                timesContainer.appendChild(timeBtn);
            });

        } catch (error) {
            console.error('Error al obtener la disponibilidad:', error);
            timesContainer.innerHTML = '<small style="padding: 10px; color: red;">Error al cargar horarios.</small>';
        }
    }

    function confirmSelection() {
        const dayNumber = selectedDate.getDate();
        const monthName = monthNames[selectedDate.getMonth()].toLowerCase();
        triggerLabel.textContent = `${dayNumber} de ${monthName}, ${selectedTime}`;
        if (hiddenInput) {
            const isoDate = selectedDate.toISOString().split('T')[0];
            hiddenInput.value = `${isoDate} ${selectedTime}`;
        }
        closePopover();
    }

    trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        togglePopover();
    });

    backToDaysBtn.addEventListener('click', showDaysView);

    nextMonthBtn.addEventListener('click', () => {
        const monthsDiff = (currentDate.getFullYear() - todayYear) * 12 + (currentDate.getMonth() - todayMonth);
        if (monthsDiff === 1) return;
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderDays();
    });

    prevMonthBtn.addEventListener('click', () => {
        const monthsDiff = (currentDate.getFullYear() - todayYear) * 12 + (currentDate.getMonth() - todayMonth);
        if (monthsDiff === 0) return;
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderDays();
    });

    document.addEventListener('click', (e) => {
        if (!root.contains(e.target)) closePopover();
    });

    renderDays();

    return {
        getSelection: () => ({ selectedDate, selectedTime })
    };
}