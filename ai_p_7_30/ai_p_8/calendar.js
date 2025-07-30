// 달력 렌더링 및 할 일 표시, 알림 기능
const calendarEl = document.getElementById('calendar');
const today = new Date();
let currentMonth = today.getMonth();
let currentYear = today.getFullYear();

function getMonthDays(year, month) {
    return new Date(year, month + 1, 0).getDate();
}

function renderCalendar() {
    calendarEl.innerHTML = '';
    const monthDays = getMonthDays(currentYear, currentMonth);
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const monthTitle = document.createElement('div');
    monthTitle.className = 'calendar-title';
    monthTitle.innerHTML = `<button id="prev-month">◀</button> ${currentYear}년 ${currentMonth+1}월 <button id="next-month">▶</button>`;
    calendarEl.appendChild(monthTitle);
    const table = document.createElement('table');
    table.className = 'calendar-table';
    const days = ['일','월','화','수','목','금','토'];
    let thead = '<tr>';
    days.forEach(d=>{thead+=`<th>${d}</th>`});
    thead+='</tr>';
    table.innerHTML = thead;
    let tr = document.createElement('tr');
    for(let i=0;i<firstDay;i++){
        tr.appendChild(document.createElement('td'));
    }
    for(let d=1;d<=monthDays;d++){
        if((tr.children.length)%7===0){
            table.appendChild(tr);
            tr = document.createElement('tr');
        }
        const td = document.createElement('td');
        td.className = 'calendar-day';
        td.dataset.date = `${currentYear}-${String(currentMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
        td.innerHTML = `<div class="date-label">${d}</div><div class="calendar-todos"></div>`;
        tr.appendChild(td);
    }
    table.appendChild(tr);
    calendarEl.appendChild(table);
    document.getElementById('prev-month').onclick = ()=>{currentMonth--;if(currentMonth<0){currentMonth=11;currentYear--;}renderCalendar();renderCalendarTodos();};
    document.getElementById('next-month').onclick = ()=>{currentMonth++;if(currentMonth>11){currentMonth=0;currentYear++;}renderCalendar();renderCalendarTodos();};
}

function renderCalendarTodos() {
    document.querySelectorAll('.calendar-todos').forEach(el=>el.innerHTML='');
    todos.forEach((todo, idx) => {
        const start = new Date(todo.start);
        const end = new Date(todo.end);
        let d = new Date(start);
        while (d <= end) {
            if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
                const dateStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
                const dayCell = document.querySelector(`.calendar-day[data-date='${dateStr}'] .calendar-todos`);
                if(dayCell){
                    const todoDiv = document.createElement('div');
                    todoDiv.className = 'calendar-todo' + (todo.completed ? ' completed' : '');
                    todoDiv.innerText = todo.text;
                    // 긴 막대 표시
                    if (start.toDateString() !== end.toDateString()) {
                        todoDiv.style.background = '#ffe082';
                        todoDiv.style.borderRadius = '8px';
                        todoDiv.style.margin = '2px 0';
                        todoDiv.style.fontSize = '12px';
                    }
                    dayCell.appendChild(todoDiv);
                }
            }
            d.setDate(d.getDate()+1);
        }
    });
}

function checkUpcomingTodos() {
    const now = new Date();
    todos.forEach(todo => {
        if (!todo.completed) {
            const start = new Date(todo.start);
            const diff = (start - now) / (1000*60*60); // 시간 단위
            if (diff > 0 && diff <= 1) {
                alert(`곧 시작할 할 일: ${todo.text}\n시작: ${todo.start}`);
            }
        }
    });
}

setInterval(checkUpcomingTodos, 60*1000); // 1분마다 체크

renderCalendar();
renderCalendarTodos();
