export function initCalendar(root) {
    let currentDate = new Date();
    let selectedDate = null;
    let selectedTime = null;
    
    const todayMonth = new Date().getMonth();
    const todayYear = new Date().getFullYear();

    const schedule = ["09:00", "10:00", "11:30", "13:00", "14:30", "16:00"];

    
    // let currentMonth = month;
    // const maxIndex = month + 1;
    
    function renderDays(){
        const grid = root.querySelector('#calendarGrid');
        
        let month = currentDate.getMonth();
        let year = currentDate.getFullYear();
        let totalDays = new Date(year, month + 1, 0).getDate(); 
        let firstDayWeekday = new Date(year, month, 1).getDay();

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

            dayBtn.addEventListener('click', () => {
                selectedDate = new Date(year, month, day);

                const allDayButtons = grid.querySelectorAll('.btn_day');
                allDayButtons.forEach(btn => {
                    btn.classList.remove('btn_day--selected');
                    
                });
                
                dayBtn.classList.add('btn_day--selected');

                const timesContainer = root.querySelector('#calendarTimes');
                timesContainer.innerHTML = '';

                schedule.forEach(time => {
                    const timeBtn = document.createElement('button');
                    timeBtn.textContent = time;
                    timeBtn.classList.add('btn_time');
                    timesContainer.appendChild(timeBtn);

                    timeBtn.addEventListener('click', () => {
                        selectedTime = time;

                        const allTimeButtons = timesContainer.querySelectorAll('.btn_time');
                        allTimeButtons.forEach(btnTime => {
                            btnTime.classList.remove('btn_time--selected');
                        })

                        timeBtn.classList.add('btn_time--selected');
                    })
                })


            });
        }

        
    }

    const nextMonthBtn = root.querySelector('#nextMonth');
    const prevMonthBtn = root.querySelector('#prevMonth');

    nextMonthBtn.addEventListener('click', () => {
        // if(){

        // }
    })

    prevMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
    })

    renderDays();
}