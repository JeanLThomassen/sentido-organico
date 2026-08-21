export function initCalendar(root) {
    const monthNames = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    let currentDate = new Date();
    let selectedDate = null;
    let selectedTime = null;

    const schedule = ["10:00", "11:30", "13:00", "14:30"];

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

        for (let day = 1; day <= totalDays; day++) {
            const dayBtn = document.createElement('button');
            dayBtn.type = 'button';
            dayBtn.textContent = day;
            dayBtn.classList.add('btn_day');

            dayBtn.addEventListener('click', () => {
                selectedDate = new Date(year, month, day);
                renderTimes();
                showTimesView();
            });

            grid.appendChild(dayBtn);
        }
    }

    function renderTimes() {
        const dayNumber = selectedDate.getDate();
        const monthName = monthNames[selectedDate.getMonth()].toLowerCase();
        selectedDayLabel.textContent = `${dayNumber} de ${monthName}`;

        timesContainer.innerHTML = '';

        schedule.forEach(time => {
            const timeBtn = document.createElement('button');
            timeBtn.type = 'button';
            timeBtn.textContent = time;
            timeBtn.classList.add('btn_time');

            timeBtn.addEventListener('click', () => {
                selectedTime = time;
                confirmSelection();
            });

            timesContainer.appendChild(timeBtn);
        });
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