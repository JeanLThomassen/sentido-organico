export function initCalendar(root) {
    let currentDate = new Date();
    let selectedDate = null;
    const schedule = ["10:00", "11:30", "13:00", "14:30"];

    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();

    const totalDays = new Date(year, month + 1, 0).getDate(); 
    const firstDayWeekday = new Date(year, month, 1).getDay();

    function renderDays(){
        const grid = root.querySelector('#calendarGrid');

        grid.innerHTML = '';

        for (let i = 0; i < firstDayWeekday; i++){
            const emptyCell = document.createElement('div');
            grid.appendChild(emptyCell);
        }

        for (let day = 1; day <= totalDays; day++){
            const dayBtn = document.createElement('button');
            dayBtn.textContent = day;
            dayBtn.classList.add('btn_day');
            grid.appendChild(dayBtn);
        }
    }

    renderDays();
}