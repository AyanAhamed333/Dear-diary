document.addEventListener('DOMContentLoaded', () => {
    // --- Elements ---
    const calendarView = document.getElementById('calendarView');
    const diaryView = document.getElementById('diaryView');
    const calendarDays = document.getElementById('calendarDays');
    const monthYearDisplay = document.getElementById('monthYearDisplay');
    const prevMonthBtn = document.getElementById('prevMonth');
    const nextMonthBtn = document.getElementById('nextMonth');
    const backToCalendarBtn = document.getElementById('backToCalendar');
    
    const diaryDateTitle = document.getElementById('diaryDateTitle');
    const moodBtns = document.querySelectorAll('.mood-btn');
    const moodFeedback = document.getElementById('moodFeedback');
    
    const diaryContent = document.getElementById('diaryContent');
    const readOnlyContent = document.getElementById('readOnlyContent');
    
    const saveBtn = document.getElementById('saveBtn');
    const editBtn = document.getElementById('editBtn');
    const saveFeedback = document.getElementById('saveFeedback');
    
    const timerDisplay = document.getElementById('timerDisplay');
    const timerMessage = document.getElementById('timerMessage');
    const resetTimerBtn = document.getElementById('resetTimerBtn');
    const quoteContainer = document.getElementById('quoteContainer');

    // --- State ---
    let currentDate = new Date(); 
    let selectedDate = null;      
    let currentMood = null;
    let isEditing = false;
    
    // Timer State
    let timerInterval = null;
    let typingTimeout = null;
    let secondsElapsed = 0;
    let isTyping = false;

    const moodEmojis = {1: '😢', 2: '😔', 3: '😐', 4: '😊', 5: '😄'};

    const moodMessages = {
        1: "Oh no... 😢 I'm sending you the biggest, warmest virtual hug right now. Tomorrow is a fresh start, be gentle with yourself today. 💛",
        2: "It sounds like a tough day 😔. It's completely okay to feel this way. Take some deep breaths and rest up, you deserve it. 🌸",
        3: "A quiet, okay day 😐. Sometimes neutral days are just what we need to recharge. I hope tomorrow brings a little spark of joy! ✨",
        4: "Yay! 😊 I'm so glad you had a good day. It's beautiful to see you smile. Hold onto this positive energy! 🌻",
        5: "Amazing!! 😄 Your energy is absolutely radiant today! I love this for you. Keep shining so bright! 🌟✨"
    };

    const quotes = [
        "you got this ✨",
        "one day at a time 🌱",
        "be gentle with yourself 💛",
        "breathe in, breathe out 🌬️",
        "your feelings are valid 🌸",
        "you are enough 🎀"
    ];

    // --- Initialization ---
    initQuotes();
    renderCalendar();

    // Auto-select today
    setTimeout(() => {
        const today = new Date();
        const y = today.getFullYear();
        const m = String(today.getMonth() + 1).padStart(2, '0');
        const d = String(today.getDate()).padStart(2, '0');
        openDiary(`${y}-${m}-${d}`);
    }, 1500);

    // --- Quotes Logic ---
    function initQuotes() {
        const q1 = document.createElement('div');
        q1.className = 'quote';
        q1.innerText = quotes[Math.floor(Math.random() * quotes.length)];
        q1.style.top = '15%';
        q1.style.left = '8%';
        q1.style.transform = `rotate(${Math.random() * 20 - 10}deg)`;
        
        const q2 = document.createElement('div');
        q2.className = 'quote';
        q2.innerText = quotes[Math.floor(Math.random() * quotes.length)];
        q2.style.bottom = '25%';
        q2.style.right = '8%';
        q2.style.transform = `rotate(${Math.random() * 20 - 10}deg)`;

        quoteContainer.appendChild(q1);
        quoteContainer.appendChild(q2);
    }

    // --- Calendar Logic ---
    async function renderCalendar() {
        calendarDays.innerHTML = '';
        
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        monthYearDisplay.innerText = `${monthNames[month]} ${year}`;
        
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const today = new Date();
        
        let monthEntries = {};
        try {
            const res = await fetch(`/get_month_entries/${year}/${month + 1}`);
            if (res.ok) {
                monthEntries = await res.json();
            }
        } catch (err) {
            console.error('Error fetching month entries', err);
        }
        
        // Empty cells for previous month
        for (let i = 0; i < firstDay; i++) {
            const emptyBtn = document.createElement('div');
            emptyBtn.className = 'day-btn';
            emptyBtn.disabled = true;
            calendarDays.appendChild(emptyBtn);
        }
        
        for (let i = 1; i <= daysInMonth; i++) {
            const btn = document.createElement('button');
            btn.className = 'day-btn';
            
            const numSpan = document.createElement('span');
            numSpan.className = 'num';
            numSpan.innerText = i;
            btn.appendChild(numSpan);
            
            const cellDate = new Date(year, month, i);
            const dateStr = [
                cellDate.getFullYear(),
                String(cellDate.getMonth() + 1).padStart(2, '0'),
                String(cellDate.getDate()).padStart(2, '0')
            ].join('-');

            btn.dataset.date = dateStr;
            
            if (year === today.getFullYear() && month === today.getMonth() && i === today.getDate()) {
                btn.classList.add('today');
            }
            
            const todayReset = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            
            if (cellDate > todayReset) {
                btn.classList.add('future');
                const lockSpan = document.createElement('span');
                lockSpan.className = 'lock-icon';
                lockSpan.innerText = '🔒';
                btn.appendChild(lockSpan);
            } else {
                if (monthEntries[dateStr]) {
                    btn.classList.add('has-entry');
                    const emojiSpan = document.createElement('span');
                    emojiSpan.className = 'emoji';
                    emojiSpan.innerText = moodEmojis[monthEntries[dateStr]];
                    btn.appendChild(emojiSpan);
                }
                
                btn.addEventListener('click', () => openDiary(dateStr));
            }
            
            calendarDays.appendChild(btn);
        }
    }

    prevMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });

    nextMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });

    // --- View Navigation ---
    async function openDiary(dateStr) {
        selectedDate = dateStr;
        isEditing = false;
        
        // Format title
        const [y, m, d] = dateStr.split('-');
        const dateObj = new Date(y, m - 1, d);
        diaryDateTitle.innerText = dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
        
        // Reset form
        currentMood = null;
        moodBtns.forEach(b => b.classList.remove('selected'));
        moodFeedback.classList.add('hidden');
        diaryContent.value = '';
        readOnlyContent.innerText = '';
        saveFeedback.classList.add('hidden');
        
        // Default View State (Writing mode)
        diaryContent.classList.remove('hidden');
        readOnlyContent.classList.add('hidden');
        saveBtn.classList.remove('hidden');
        editBtn.classList.add('hidden');
        
        resetTimer();
        
        // Fetch existing
        try {
            const res = await fetch(`/get_entry/${selectedDate}`);
            if (res.ok) {
                const data = await res.json();
                diaryContent.value = data.content;
                readOnlyContent.innerText = data.content;
                currentMood = data.mood;
                
                const activeBtn = document.querySelector(`.mood-btn[data-val="${currentMood}"]`);
                if (activeBtn) activeBtn.classList.add('selected');
                updateMoodFeedback(currentMood);
                
                // Switch to Read-only mode
                diaryContent.classList.add('hidden');
                readOnlyContent.classList.remove('hidden');
                saveBtn.classList.add('hidden');
                editBtn.classList.remove('hidden');
            }
        } catch (err) {
            console.error('Error fetching entry:', err);
        }

        // Switch views with smooth transition
        calendarView.classList.remove('active');
        
        setTimeout(() => {
            calendarView.classList.add('hidden');
            diaryView.classList.remove('hidden');
            void diaryView.offsetWidth; // Force reflow
            diaryView.classList.add('active');
        }, 500); // Wait for calendar to fade out
    }

    backToCalendarBtn.addEventListener('click', () => {
        stopTimer();
        diaryView.classList.remove('active');
        setTimeout(() => {
            diaryView.classList.add('hidden');
            calendarView.classList.remove('hidden');
            void calendarView.offsetWidth;
            calendarView.classList.add('active');
            renderCalendar(); // Re-render to show new emojis
        }, 500);
    });

    editBtn.addEventListener('click', () => {
        isEditing = true;
        readOnlyContent.classList.add('hidden');
        diaryContent.classList.remove('hidden');
        editBtn.classList.add('hidden');
        saveBtn.classList.remove('hidden');
        
        diaryContent.focus();
        // Move cursor to the end of the text
        const length = diaryContent.value.length;
        diaryContent.setSelectionRange(length, length);
    });

    // --- Mood Logic ---
    moodBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Only allow changing mood if editing or creating new
            if (readOnlyContent.classList.contains('hidden') === false && !isEditing) {
                return; // Read only mode, can't change mood until 'Edit' is clicked
            }

            moodBtns.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            currentMood = parseInt(btn.dataset.val);
            updateMoodFeedback(currentMood);
        });
    });

    function updateMoodFeedback(val) {
        moodFeedback.innerHTML = moodMessages[val];
        moodFeedback.classList.remove('hidden');
    }

    // --- Timer Logic ---
    function formatTime(totalSec) {
        const m = Math.floor(totalSec / 60);
        const s = totalSec % 60;
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }

    function startTimer() {
        if (!timerInterval) {
            timerInterval = setInterval(() => {
                secondsElapsed++;
                timerDisplay.innerText = formatTime(secondsElapsed);
            }, 1000);
            timerMessage.innerText = "Focusing... 🌟";
        }
    }

    function stopTimer() {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
            timerMessage.innerText = "Paused ⏸️";
        }
    }

    function resetTimer() {
        stopTimer();
        secondsElapsed = 0;
        timerDisplay.innerText = "00:00";
        timerMessage.innerText = "Start typing to begin";
    }

    diaryContent.addEventListener('input', () => {
        if (!isTyping) {
            isTyping = true;
            startTimer();
        }
        
        clearTimeout(typingTimeout);
        typingTimeout = setTimeout(() => {
            isTyping = false;
            stopTimer();
        }, 10000);
    });

    resetTimerBtn.addEventListener('click', resetTimer);

    // --- Save Logic ---
    saveBtn.addEventListener('click', async () => {
        const content = diaryContent.value.trim();
        
        if (!content) {
            alert('Please write something before saving! ✨');
            return;
        }
        
        if (!currentMood) {
            alert('Please select a mood before saving! 💛');
            return;
        }
        
        stopTimer();
        
        try {
            const res = await fetch('/save_entry', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    date: selectedDate,
                    mood: currentMood,
                    content: content
                })
            });
            
            if (res.ok) {
                saveFeedback.innerHTML = `Saved! 💛 You spent ${Math.ceil(secondsElapsed/60)} minutes reflecting today.`;
                saveFeedback.classList.remove('hidden');
                
                // Switch back to read-only mode after save
                readOnlyContent.innerText = content;
                diaryContent.classList.add('hidden');
                readOnlyContent.classList.remove('hidden');
                saveBtn.classList.add('hidden');
                editBtn.classList.remove('hidden');
                isEditing = false;
                
                setTimeout(() => saveFeedback.classList.add('hidden'), 5000);
            } else {
                alert('Oops, something went wrong saving your entry.');
            }
        } catch (err) {
            console.error('Error saving:', err);
            alert('Oops, something went wrong saving your entry.');
        }
    });

    // --- Cute Click Sparkles ---
    document.addEventListener('click', (e) => {
        if (e.target.tagName.toLowerCase() === 'textarea') return;
        
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle';
        sparkle.style.left = e.pageX + 'px';
        sparkle.style.top = e.pageY + 'px';
        sparkle.innerText = ['✨', '💖', '🌸', '🎀', '⭐'][Math.floor(Math.random() * 5)];
        document.body.appendChild(sparkle);
        
        setTimeout(() => {
            sparkle.remove();
        }, 1000);
    });
});
