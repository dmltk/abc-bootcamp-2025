  let multiDayTasks = JSON.parse(localStorage.getItem('multiDayTasks')||'[]');
  // 통계/피드백/알림
  const statsBar = document.getElementById('statsBar');
  const statsText = document.getElementById('statsText');
  const alertText = document.getElementById('alertText');

  // 날짜 유틸
  function getDateStr(date) {
    return date.toISOString().slice(0, 10);
  }
  function getWeekDates(date) {
    // 일~토
    const d = new Date(date);
    const day = d.getDay();
    const start = new Date(d); start.setDate(d.getDate() - day);
    return Array.from({length:7}, (_,i)=>{
      const dt = new Date(start); dt.setDate(start.getDate()+i);
      return getDateStr(dt);
    });
  }
  function getMonthDates(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = d.getMonth();
    const days = new Date(year, month+1, 0).getDate();
    return Array.from({length:days}, (_,i)=>{
      return `${year}-${String(month+1).padStart(2,'0')}-${String(i+1).padStart(2,'0')}`;
    });
  }

  // 통계/피드백 계산
  function updateStatsAndAlerts() {
    const todayStr = getDateStr(new Date());
    const weekDates = getWeekDates(new Date());
    const monthDates = getMonthDates(new Date());
    // 주간
    let weekTotal = 0, weekDone = 0, weekSet = 0;
    weekDates.forEach(ds => {
      if (todoData[ds]) {
        weekSet++;
        weekTotal += todoData[ds].length;
        weekDone += todoData[ds].filter(t=>t.done).length;
      }
    });
    // 월간
    let monthTotal = 0, monthDone = 0, monthSet = 0;
    monthDates.forEach(ds => {
      if (todoData[ds]) {
        monthSet++;
        monthTotal += todoData[ds].length;
        monthDone += todoData[ds].filter(t=>t.done).length;
      }
    });
    // 피드백
    let weekRate = weekTotal ? Math.round(weekDone/weekTotal*100) : 0;
    let monthRate = monthTotal ? Math.round(monthDone/monthTotal*100) : 0;
    let feedback = `이번주 완료율: <b>${weekRate}%</b> (${weekDone}/${weekTotal}), 이번달 완료율: <b>${monthRate}%</b> (${monthDone}/${monthTotal})`;
    statsText.innerHTML = feedback;

    // 미설정/미완료/1시간 이내 알림
    let alerts = [];
    // 오늘 할 일 미설정
    if (!todoData[todayStr] || todoData[todayStr].length === 0) {
      alerts.push('오늘 할 일이 없습니다!');
    }
    // 오늘 할 일 중 미완료
    if (todoData[todayStr] && todoData[todayStr].some(t=>!t.done)) {
      alerts.push('오늘 할 일이 남아있어요!');
    }
    // 1시간 이내 할 일
    const now = new Date();
    if (todoData[todayStr]) {
      todoData[todayStr].forEach(t => {
        if (!t.done && t.start) {
          const [h,m] = t.start.split(':');
          const taskTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), +h, +m);
          const diff = (taskTime - now)/60000;
          if (diff >= 0 && diff <= 60) {
            alerts.push(`곧 시작: ${t.title} (${t.start})`);
          }
        }
      });
    }
    alertText.innerHTML = alerts.join('<br>');
  }

  // 달력에 미완료/미설정 표시(점 색상)
  // (이미 renderCalendar에서 점 표시, 색상만 보강)
  // 캐릭터 성장 현황 모달
  const charModal = document.getElementById('charModal');
  const charModalEmoji = document.getElementById('charModalEmoji');
  const charModalLevel = document.getElementById('charModalLevel');
  const charModalExp = document.getElementById('charModalExp');
  const charModalDesc = document.getElementById('charModalDesc');
  const characterTab = document.getElementById('characterTab');
  const closeCharModal = document.getElementById('closeCharModal');

  function openCharModal() {
    charModalEmoji.textContent = charEmojis[Math.min(charData.level-1, charEmojis.length-1)];
    charModalLevel.textContent = `Lv.${charData.level}`;
    charModalExp.textContent = `${charData.exp%100} / ${charData.level*100} EXP`;
    charModalDesc.textContent = '할 일을 완료할수록 캐릭터가 성장해요!';
    charModal.classList.remove('hidden');
  }
  function closeCharModalFn() {
    charModal.classList.add('hidden');
  }
  characterTab.addEventListener('click', openCharModal);
  closeCharModal.addEventListener('click', closeCharModalFn);
  charModal.addEventListener('click', (e) => { if (e.target === charModal) closeCharModalFn(); });
// script.js - To-Do List App Calendar & Modal

document.addEventListener('DOMContentLoaded', () => {
  // 날짜 관련 변수
  let today = new Date();
  let currentYear = today.getFullYear();
  let currentMonth = today.getMonth(); // 0~11

  const calendarTitle = document.getElementById('calendarTitle');
  const calendar = document.getElementById('calendar');
  const prevMonthBtn = document.getElementById('prevMonth');
  const nextMonthBtn = document.getElementById('nextMonth');
  const todoModal = document.getElementById('todoModal');
  const closeModalBtn = document.getElementById('closeModal');
  const modalDate = document.getElementById('modalDate');
  const addTodoBtn = document.getElementById('addTodoBtn');
  const todoForm = document.getElementById('todoForm');
  const todoTitle = document.getElementById('todoTitle');
  const todoStart = document.getElementById('todoStart');
  const todoEnd = document.getElementById('todoEnd');
  const todoPriority = document.getElementById('todoPriority');
  const todoCategory = document.getElementById('todoCategory');
  const todoList = document.getElementById('todoList');
  const taskCount = document.getElementById('taskCount');
  // 여러 날 할 일 추가 관련
  const multiDayTodoBtn = document.getElementById('multiDayTodoBtn');
  const multiDayTodoModal = document.getElementById('multiDayTodoModal');
  const closeMultiDayTodoModal = document.getElementById('closeMultiDayTodoModal');
  const multiDayTodoForm = document.getElementById('multiDayTodoForm');
  const multiStartDate = document.getElementById('multiStartDate');
  const multiEndDate = document.getElementById('multiEndDate');
  const multiTodoTitle = document.getElementById('multiTodoTitle');
  const multiTodoStart = document.getElementById('multiTodoStart');
  const multiTodoEnd = document.getElementById('multiTodoEnd');
  const multiTodoCategory = document.getElementById('multiTodoCategory');
  const multiTodoPriority = document.getElementById('multiTodoPriority');
  // 오늘 할 일 목록 표시
  const todayTodoList = document.getElementById('todayTodoList');

  // localStorage key
  const STORAGE_KEY = 'todoListAppV1';
  const CHAR_KEY = 'todoListCharV1';
  // { '2025-07-30': [ {title, start, end, priority, done, createdAt, id}, ... ] }
  let todoData = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  let charData = JSON.parse(localStorage.getItem(CHAR_KEY) || '{"level":1,"exp":0}');
  let currentModalDate = '';

  // 캐릭터 이모지(레벨별)
  const charEmojis = ["🧙", "🧙‍♂️", "🧙‍♀️", "🦸", "🦸‍♂️", "🦸‍♀️", "🧑‍🚀", "🧑‍🎤", "🧑‍💻", "🦄"];
  const character = document.getElementById('character');
  const characterLevel = document.getElementById('characterLevel');

  function updateCharacterUI() {
    const emoji = charEmojis[Math.min(charData.level-1, charEmojis.length-1)];
    character.textContent = emoji;
    characterLevel.textContent = `Lv.${charData.level} (${charData.exp%100}/100 EXP)`;
  }

  function addExp(amount) {
    charData.exp += amount;
    let leveledUp = false;
    while (charData.exp >= charData.level*100) {
      charData.exp -= charData.level*100;
      charData.level++;
      leveledUp = true;
    }
    saveChar();
    updateCharacterUI();
    if (leveledUp) {
      // 레벨업 효과(간단 애니메이션)
      character.classList.add('animate-bounce');
      setTimeout(()=>character.classList.remove('animate-bounce'), 800);
    }
  }
  function saveChar() {
    localStorage.setItem(CHAR_KEY, JSON.stringify(charData));
  }

  // 달력 렌더링 함수
  function renderCalendar(year, month) {
    calendar.innerHTML = '';
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = firstDay.getDay(); // 0:일~6:토
    const daysInMonth = lastDay.getDate();
    const daysPrevMonth = new Date(year, month, 0).getDate();

    const monthStr = `${year}-${String(month+1).padStart(2,'0')}`;
    const multiTasksInMonth = (multiDayTasks||[]).filter(task => (
      task.startDate.slice(0,7) <= monthStr && task.endDate.slice(0,7) >= monthStr
    ));
    if (multiTasksInMonth.length > 0) {
      let barBox = document.getElementById('multiDayBarBox');
      if (!barBox) {
        barBox = document.createElement('div');
        barBox.id = 'multiDayBarBox';
        barBox.className = 'w-full mt-2 flex flex-col gap-1';
        calendar.parentNode.appendChild(barBox);
      }
      barBox.innerHTML = '';
      multiTasksInMonth.forEach(task => {
        const start = new Date(task.startDate);
        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month+1, 0);
        const barStart = Math.max(1, start > firstDayOfMonth ? start.getDate() : 1);
        const barEnd = Math.min(daysInMonth, end < lastDayOfMonth ? end.getDate() : daysInMonth);
        const totalDays = daysInMonth;
        const left = ((barStart-1)/totalDays)*100;
        const width = ((barEnd-barStart+1)/totalDays)*100;
        const bar = document.createElement('div');
        bar.className = 'absolute h-2 rounded bg-indigo-300 opacity-80';
        bar.style.position = 'relative';
        bar.style.left = left+'%';
        bar.style.width = width+'%';
        bar.style.marginTop = '2px';
        bar.title = `${task.title} (${task.startDate} ~ ${task.endDate})`;
        bar.innerHTML = `<span class='text-xs text-indigo-900 font-bold ml-1'>${task.title}</span>`;
        barBox.appendChild(bar);
      });
    } else {
      const barBox = document.getElementById('multiDayBarBox');
      if (barBox) barBox.innerHTML = '';
      }

    // 요일 헤더
    const weekDays = ['일', '월', '화', '수', '목', '금', '토'];
    weekDays.forEach((d, i) => {
      const th = document.createElement('div');
      th.textContent = d;
      th.className = 'font-bold py-1 ' + (i === 0 ? 'text-red-500' : 'text-gray-500');
      calendar.appendChild(th);
    });

    // 이전 달 빈칸
    for (let i = 0; i < startDay; i++) {
      const empty = document.createElement('div');
      empty.className = 'py-2';
      calendar.appendChild(empty);
    }
    // 이번 달 날짜
    for (let d = 1; d <= daysInMonth; d++) {
      const dateBtn = document.createElement('button');
      dateBtn.textContent = d;
      // 일요일 빨간색
      const weekDay = new Date(year, month, d).getDay();
      dateBtn.className = 'py-3 rounded-lg hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg transition-all';
      if (weekDay === 0) dateBtn.classList.add('text-red-500');
      // 오늘 날짜 강조
      if (
        year === today.getFullYear() &&
        month === today.getMonth() &&
        d === today.getDate()
      ) {
        dateBtn.classList.add('bg-blue-200', 'font-bold');
      }
      // 할 일 있으면 점 표시
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      if (todoData[dateStr] && todoData[dateStr].length > 0) {
        const hasUndone = todoData[dateStr].some(t=>!t.done);
        const dot = document.createElement('span');
        dot.className = 'block w-2 h-2 rounded-full mx-auto mt-1 ' + (hasUndone ? 'bg-red-400' : 'bg-indigo-400');
        dateBtn.appendChild(dot);
      } else {
        // 미설정(오늘 기준만 표시)
        if (dateStr === getDateStr(new Date())) {
          const dot = document.createElement('span');
          dot.className = 'block w-2 h-2 bg-gray-300 rounded-full mx-auto mt-1';
          dateBtn.appendChild(dot);
        }
      }
      dateBtn.addEventListener('click', () => openTodoModal(year, month, d));
      calendar.appendChild(dateBtn);
    }
    // 다음 달 빈칸
    const totalCells = startDay + daysInMonth + 7; // +7 for weekday header
    for (let i = totalCells; i % 7 !== 0; i++) {
      const empty = document.createElement('div');
      empty.className = 'py-2';
      calendar.appendChild(empty);
    }
    // 타이틀
    calendarTitle.textContent = `${year}년 ${month + 1}월`;
  }

  // 월 이동
  prevMonthBtn.addEventListener('click', () => {
    if (currentMonth === 0) {
      currentYear--;
      currentMonth = 11;
    } else {
      currentMonth--;
    }
    renderCalendar(currentYear, currentMonth);
  });
  nextMonthBtn.addEventListener('click', () => {
    if (currentMonth === 11) {
      currentYear++;
      currentMonth = 0;
    } else {
      currentMonth++;
    }
    renderCalendar(currentYear, currentMonth);
  });

  // 팝업 열기/닫기
  function openTodoModal(year, month, day) {
    todoModal.classList.remove('hidden');
    currentModalDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    modalDate.textContent = formatDateHeader(currentModalDate);
    renderTodoList(currentModalDate);
    todoForm.classList.add('hidden');
    addTodoBtn.classList.remove('hidden');
    todoForm.reset && todoForm.reset();
  }
  closeModalBtn.addEventListener('click', () => {
    todoModal.classList.add('hidden');
  });
  // 바깥 클릭 시 닫기
  todoModal.addEventListener('click', (e) => {
    if (e.target === todoModal) todoModal.classList.add('hidden');
  });



  // 할 일 추가 버튼 클릭 시 입력 폼 표시
  addTodoBtn.addEventListener('click', () => {
    addTodoBtn.classList.add('hidden');
    todoForm.classList.remove('hidden');
    todoTitle.focus();
  });

  // 할 일 저장 시 목록에 추가
  todoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = {
      id: Date.now(),
      title: todoTitle.value,
      start: todoStart.value,
      end: todoEnd.value,
      priority: todoPriority.value,
      category: todoCategory ? todoCategory.value : '',
      done: false,
      createdAt: new Date().toISOString()
    };
    if (!todoData[currentModalDate]) todoData[currentModalDate] = [];
    todoData[currentModalDate].push(data);
    saveTodos();
    renderTodoList(currentModalDate);
    todoForm.classList.add('hidden');
    addTodoBtn.classList.remove('hidden');
    todoForm.reset();
    renderCalendar(currentYear, currentMonth);
    renderTodayTodoList();
  });

  // 할 일 목록 렌더링
  function renderTodoList(dateStr) {
    const todos = todoData[dateStr] || [];
    todoList.innerHTML = '';
    if (taskCount) taskCount.textContent = `${todos.length} task${todos.length !== 1 ? 's' : ''}`;
    if (todos.length === 0) {
      todoList.innerHTML = '<div class="text-gray-400 text-center py-8">할 일이 없습니다.</div>';
      return;
    }
    todos.forEach((todo, idx) => {
      const row = document.createElement('div');
      row.className = 'flex items-center gap-3 py-2 group';
      // 체크박스
      const check = document.createElement('button');
      check.className = `w-6 h-6 rounded-full border-2 flex items-center justify-center mr-1 ${todo.done ? 'border-indigo-400 bg-indigo-400' : 'border-gray-300 bg-white'} transition-all`;
      check.innerHTML = todo.done ? '<svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>' : '';
      check.addEventListener('click', () => {
        todo.done = !todo.done;
        saveTodos();
        renderTodoList(dateStr);
        renderCalendar(currentYear, currentMonth);
        if (todo.done) addExp(20); // 할 일 완료 시 경험치 부여
        else addExp(-20); // 체크 해제 시 경험치 차감(최소 0)
        if (charData.exp < 0) charData.exp = 0;
        saveChar();
        updateCharacterUI();
        renderTodayTodoList();
      });
      row.appendChild(check);
      // 할 일 제목/시간/카테고리
      const info = document.createElement('div');
      info.className = 'flex-1 min-w-0';
      info.innerHTML = `<span class="${todo.done ? 'line-through text-gray-400' : 'font-medium text-gray-800'}">${escapeHtml(todo.title)}</span>`;
      if (todo.category) {
        info.innerHTML += `<span class=\"ml-2 px-2 py-0.5 rounded text-xs bg-indigo-100 text-indigo-600\">${escapeHtml(todo.category)}</span>`;
      }
      if (todo.start) {
        info.innerHTML += `<span class=\"ml-2 text-xs text-gray-400 float-right\">${todo.start}${todo.end ? ' ~ ' + todo.end : ''}</span>`;
      }
      row.appendChild(info);
      // 삭제 버튼
      const delBtn = document.createElement('button');
      delBtn.className = 'ml-2 text-gray-300 hover:text-red-400 text-xl opacity-0 group-hover:opacity-100 transition-all';
      delBtn.innerHTML = '&times;';
      delBtn.title = '삭제';
      delBtn.addEventListener('click', () => {
        todoData[dateStr] = todoData[dateStr].filter(t => t.id !== todo.id);
        saveTodos();
        renderTodoList(dateStr);
        renderCalendar(currentYear, currentMonth);
        renderTodayTodoList();
      });
      row.appendChild(delBtn);
      // 중요도 색상 표시
      const priorityColors = { '1': 'bg-gray-300', '2': 'bg-yellow-300', '3': 'bg-red-400' };
      const prio = document.createElement('span');
      prio.className = `inline-block w-2 h-2 rounded-full ml-2 ${priorityColors[todo.priority]}`;
      row.appendChild(prio);
      todoList.appendChild(row);
    });
  }

  // 날짜 헤더 포맷 (예: Wednesday, 22 Nov)
  function formatDateHeader(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { weekday: 'long', day: '2-digit', month: 'short', year: undefined });
  }

  // HTML 이스케이프
  function escapeHtml(str) {
    return str.replace(/[&<>'"]/g, tag => ({'&':'&amp;','<':'&lt;','>':'&gt;','\'':'&#39;','"':'&quot;'}[tag]));
  }

  // 저장
  function saveTodos() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todoData));
  }

  // 오늘 할 일 목록 렌더링 함수
  // 매일 할 일 목록 (예시: 아침 운동, 일기쓰기 등)
  const dailyTodos = [
    { title: '아침 운동', category: '운동' },
    { title: '일기쓰기', category: '일상' }
  ];
  function renderTodayTodoList() {
    const todayStr = getDateStr(new Date());
    const todos = todoData[todayStr] || [];
    if (!todayTodoList) return;
    todayTodoList.innerHTML = '';
    // 매일 할 일 먼저 표시
    dailyTodos.forEach(todo => {
      const row = document.createElement('div');
      row.className = 'flex items-center gap-2';
      row.innerHTML = `<span class="font-medium text-gray-800">${escapeHtml(todo.title)}</span>`;
      if (todo.category) row.innerHTML += `<span class=\"ml-1 px-2 py-0.5 rounded text-xs bg-indigo-100 text-indigo-600\">${escapeHtml(todo.category)}</span>`;
      row.innerHTML += `<span class=\"ml-2 text-xs text-gray-400\">(매일)</span>`;
      todayTodoList.appendChild(row);
    });
    // 오늘 할 일 표시
    if (todos.length === 0) {
      todayTodoList.innerHTML += '<div class="text-gray-400 text-center">할 일이 없습니다.</div>';
      return;
    }
    todos.forEach(todo => {
      const row = document.createElement('div');
      row.className = 'flex items-center gap-2';
      row.innerHTML = `<span class="${todo.done ? 'line-through text-gray-400' : 'font-medium text-gray-800'}">${escapeHtml(todo.title)}</span>`;
      if (todo.category) row.innerHTML += `<span class=\"ml-1 px-2 py-0.5 rounded text-xs bg-indigo-100 text-indigo-600\">${escapeHtml(todo.category)}</span>`;
      if (todo.start) row.innerHTML += `<span class=\"ml-2 text-xs text-gray-400\">${todo.start}${todo.end ? ' ~ ' + todo.end : ''}</span>`;
      todayTodoList.appendChild(row);
    });
  }
  // 최초 및 주요 이벤트마다 오늘 할 일 목록 갱신
  renderTodayTodoList();
  // 최초 렌더링
  renderCalendar(currentYear, currentMonth);
  updateCharacterUI();
  updateStatsAndAlerts();
  [addTodoBtn, todoForm, closeModalBtn, closeCharModal, calendar, prevMonthBtn, nextMonthBtn].forEach(el=>{
    if (!el) return;
    el.addEventListener('click', ()=>setTimeout(()=>{updateStatsAndAlerts();renderTodayTodoList();}, 100));
  });
  // 여러 날 할 일 추가 버튼/모달 동작
  if (multiDayTodoBtn && multiDayTodoModal && closeMultiDayTodoModal && multiDayTodoForm) {
    multiDayTodoBtn.addEventListener('click', ()=>{
      multiDayTodoModal.classList.remove('hidden');
    });
    closeMultiDayTodoModal.addEventListener('click', ()=>{
      multiDayTodoModal.classList.add('hidden');
    });
    multiDayTodoModal.addEventListener('click', (e)=>{
      if (e.target === multiDayTodoModal) multiDayTodoModal.classList.add('hidden');
    });
    multiDayTodoForm.addEventListener('submit', (e)=>{
      e.preventDefault();
      const start = multiStartDate.value;
      const end = multiEndDate.value;
      if (!start || !end || start > end) {
        alert('날짜 범위를 올바르게 선택하세요.');
        return;
      }
      // 여러날에 걸친 할 일 정보 저장 (달력 표시용)
      const multiTaskId = Date.now() + Math.floor(Math.random()*100000);
      multiDayTasks.push({
        id: multiTaskId,
        title: multiTodoTitle.value,
        startDate: start,
        endDate: end,
        startTime: multiTodoStart.value,
        endTime: multiTodoEnd.value,
        priority: multiTodoPriority.value,
        category: multiTodoCategory.value
      });
      localStorage.setItem('multiDayTasks', JSON.stringify(multiDayTasks));
      // 각 날짜별로도 할 일 추가
      let cur = new Date(start);
      const endDate = new Date(end);
      while (cur <= endDate) {
        const dateStr = getDateStr(cur);
        const data = {
          id: Date.now() + Math.floor(Math.random()*100000),
          title: multiTodoTitle.value,
          start: multiTodoStart.value,
          end: multiTodoEnd.value,
          priority: multiTodoPriority.value,
          category: multiTodoCategory.value,
          done: false,
          createdAt: new Date().toISOString(),
          isMultiDay: true,
          multiStart: start,
          multiEnd: end
        };
        if (!todoData[dateStr]) todoData[dateStr] = [];
        todoData[dateStr].push(data);
        cur.setDate(cur.getDate()+1);
      }
      saveTodos();
      renderCalendar(currentYear, currentMonth);
      renderTodayTodoList();
      updateStatsAndAlerts();
      multiDayTodoModal.classList.add('hidden');
      multiDayTodoForm.reset();
    });
  }
// 할 일 체크/삭제 등은 renderTodoList에서 이미 반영됨
});
