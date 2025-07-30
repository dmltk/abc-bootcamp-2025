// 카테고리별 색상 매핑
const CATEGORY_COLORS = {
    work: '#1976d2',
    study: '#43a047',
    life: '#fbc02d',
    etc: '#8e24aa'
};

let todos = [];

// DOM 요소 참조
const todoInput = document.getElementById('todo-input');
const addBtn = document.getElementById('add-btn');
const todoList = document.getElementById('todo-list');
const startTimeInput = document.getElementById('start-time');
const endTimeInput = document.getElementById('end-time');
const categoryInput = document.getElementById('category-input');

// FullCalendar 인스턴스
let calendar;

// 로컬 스토리지에서 할 일 목록 불러오기
function loadTodos() {
    const saved = localStorage.getItem('todos');
    if (saved) {
        todos = JSON.parse(saved);
    }
}

// 로컬 스토리지에 할 일 목록 저장
function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

// 할 일 목록 렌더링
function renderTodos() {
    todoList.innerHTML = '';
    todos.forEach((todo, idx) => {
        const li = document.createElement('li');
        li.className = 'todo-item' + (todo.completed ? ' completed' : '');
        li.innerHTML = `
            <span>${todo.text}<br><small>${todo.start ? `(${formatDateTime(todo.start)} ~ ${formatDateTime(todo.end)})` : ''} <span style="color:${CATEGORY_COLORS[todo.category]};font-weight:bold;">${categoryLabel(todo.category)}</span></small></span>
            <div class="todo-actions">
                <button class="complete-btn">${todo.completed ? '취소' : '완료'}</button>
                <button class="delete-btn">삭제</button>
            </div>
        `;
        // 완료 버튼 이벤트
        li.querySelector('.complete-btn').onclick = () => {
            todos[idx].completed = !todos[idx].completed;
            saveTodos();
            renderTodos();
            renderCalendarTodos();
        };
        // 삭제 버튼 이벤트
        li.querySelector('.delete-btn').onclick = () => {
            todos.splice(idx, 1);
            saveTodos();
            renderTodos();
            renderCalendarTodos();
        };
        todoList.appendChild(li);
    });
    renderCalendarTodos();
}

function formatDateTime(dt) {
    if (!dt) return '';
    const d = new Date(dt);
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}

function categoryLabel(cat) {
    switch(cat) {
        case 'work': return '업무';
        case 'study': return '공부';
        case 'life': return '생활';
        case 'etc': return '기타';
        default: return cat;
    }
}

// 할 일 추가 함수
function addTodo() {
    const text = todoInput.value.trim();
    const start = startTimeInput.value;
    const end = endTimeInput.value;
    const category = categoryInput.value;
    if (!text) return;
    if (!start || !end) {
        alert('시작 시각과 종료 시각을 모두 입력하세요.');
        return;
    }
    if (new Date(start) > new Date(end)) {
        alert('시작 시각이 종료 시각보다 늦을 수 없습니다.');
        return;
    }
    todos.push({ text, start, end, category, completed: false });
    saveTodos();
    renderTodos();
    todoInput.value = '';
    startTimeInput.value = '';
    endTimeInput.value = '';
    todoInput.focus();
}

// FullCalendar에 할 일 표시
function renderCalendarTodos() {
    if (!calendar) return;
    calendar.removeAllEvents();
    todos.forEach((todo, idx) => {
        calendar.addEvent({
            id: String(idx),
            title: todo.text,
            start: todo.start,
            end: todo.end,
            backgroundColor: CATEGORY_COLORS[todo.category] || '#888',
            borderColor: CATEGORY_COLORS[todo.category] || '#888',
            textColor: '#fff',
            display: 'block',
            extendedProps: { completed: todo.completed }
        });
    });
}

// 1시간 이내 할 일 알림
function checkUpcomingTodos() {
    const now = new Date();
    todos.forEach(todo => {
        if (!todo.completed) {
            const start = new Date(todo.start);
            const diff = (start - now) / (1000*60*60); // 시간 단위
            if (diff > 0 && diff <= 1) {
                alert(`곧 시작할 할 일: ${todo.text}\n시작: ${formatDateTime(todo.start)}`);
            }
        }
    });
}

// 이벤트 리스너 등록
addBtn.addEventListener('click', addTodo);
todoInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addTodo();
});
startTimeInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addTodo();
});
endTimeInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addTodo();
});

// FullCalendar 초기화
document.addEventListener('DOMContentLoaded', function() {
    const calendarEl = document.getElementById('calendar');
    const calendarHeader = document.getElementById('calendar-header');
    calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        locale: 'ko',
        height: 600,
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: ''
        },
        eventDidMount: function(info) {
            if (info.event.extendedProps.completed) {
                info.el.style.opacity = '0.5';
                info.el.style.textDecoration = 'line-through';
            }
        },
        eventClick: function(info) {
            // 클릭 시 완료/미완료 토글
            const idx = parseInt(info.event.id);
            todos[idx].completed = !todos[idx].completed;
            saveTodos();
            renderTodos();
        },
        datesSet: function(arg) {
            // 달력 월/연도 정보 갱신
            const date = arg.start;
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            calendarHeader.innerHTML = `<button id="cal-prev" style="margin-right:10px;">◀</button> ${year}년 ${month}월 <button id="cal-next" style="margin-left:10px;">▶</button>`;
            document.getElementById('cal-prev').onclick = () => calendar.prev();
            document.getElementById('cal-next').onclick = () => calendar.next();
        }
    });
    calendar.render();
    renderCalendarTodos();
    // 최초 헤더 표시
    const view = calendar.view;
    const date = view.currentStart;
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    calendarHeader.innerHTML = `<button id="cal-prev" style="margin-right:10px;">◀</button> ${year}년 ${month}월 <button id="cal-next" style="margin-left:10px;">▶</button>`;
    document.getElementById('cal-prev').onclick = () => calendar.prev();
    document.getElementById('cal-next').onclick = () => calendar.next();
});

// 초기화
loadTodos();
renderTodos();
setInterval(checkUpcomingTodos, 60*1000); // 1분마다 체크
