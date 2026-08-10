let workoutDays = [];

const menu = document.querySelector('.menu');
const dayView = document.getElementById('day-view');
const dayViewTitle = document.getElementById('day-view-title');
const exerciseList = document.getElementById('exercise-list');
const backButton = document.getElementById('back-button');
const resetButton = document.getElementById('reset-button');
const dayProgressFill = document.getElementById('day-progress-fill');
const dayProgressText = document.getElementById('day-progress-text');
const confettiCanvas = document.getElementById('confetti-canvas');
const celebrationMessage = document.getElementById('celebration-message');

fetch('data/workout-data.json')
  .then(res => res.json())
  .then(data => {
    workoutDays = data.days;
    updateDayCardProgress();
  });

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js');
  });
}

document.querySelectorAll('.day-card').forEach(card => {
  card.addEventListener('click', () => {
    const dayId = card.dataset.dayId;
    const day = workoutDays.find(d => d.id === dayId);
    if (!day) return;
    showDayView(day);
  });
});

backButton.addEventListener('click', () => {
  dayView.classList.add('hidden');
  menu.classList.remove('hidden');
  updateDayCardProgress();
});

resetButton.addEventListener('click', () => {
  if (!confirm('Reset all progress?')) return;

  const setKeyPattern = /^workout:.+:set\d+$/;
  Object.keys(localStorage)
    .filter(key => setKeyPattern.test(key))
    .forEach(key => localStorage.removeItem(key));

  updateDayCardProgress();
});

function showDayView(day) {
  dayViewTitle.textContent = `${day.name} — ${day.dayLabel}`;

  exerciseList.innerHTML = '';
  day.exercises.forEach(exercise => {
    exerciseList.appendChild(buildExerciseItem(exercise, day));
  });

  menu.classList.add('hidden');
  dayView.classList.remove('hidden');
  updateDayProgressBar(day);
}

function getCheckKey(dayId, exerciseId, setIndex) {
  return `workout:${dayId}:${exerciseId}:set${setIndex}`;
}

function getFieldKey(dayId, exerciseId, field) {
  return `workout:${dayId}:${exerciseId}:${field}`;
}

function buildExerciseItem(exercise, day) {
  const dayId = day.id;
  const li = document.createElement('li');
  li.className = 'exercise-item';

  const header = document.createElement('button');
  header.className = 'exercise-header';
  header.type = 'button';

  const name = document.createElement('span');
  name.className = 'exercise-name';
  name.textContent = exercise.name;

  const check = document.createElement('span');
  check.className = 'exercise-check';
  check.textContent = '✓';

  header.appendChild(name);
  header.appendChild(check);

  const weightKey = getFieldKey(dayId, exercise.id, 'weight');
  const repsKey = getFieldKey(dayId, exercise.id, 'reps');
  const storedWeight = localStorage.getItem(weightKey);
  const storedReps = localStorage.getItem(repsKey);
  let currentReps = storedReps !== null ? Number(storedReps) : exercise.repsTarget;

  const controls = document.createElement('div');
  controls.className = 'exercise-controls hidden';

  let weightInput = null;
  if (exercise.unit !== 'none') {
    const weightField = document.createElement('label');
    weightField.className = 'field';
    weightField.textContent = 'Weight (kg)';

    weightInput = document.createElement('input');
    weightInput.type = 'number';
    weightInput.step = '0.5';
    weightInput.min = '0';
    weightInput.value = storedWeight !== null ? Number(storedWeight) : exercise.weight;

    weightField.appendChild(weightInput);
    controls.appendChild(weightField);

    weightInput.addEventListener('change', () => {
      localStorage.setItem(weightKey, weightInput.value);
    });
  }

  const repsField = document.createElement('label');
  repsField.className = 'field';
  repsField.textContent = 'Reps';

  const repsInput = document.createElement('input');
  repsInput.type = 'number';
  repsInput.step = '1';
  repsInput.min = '0';
  repsInput.value = currentReps;

  repsField.appendChild(repsInput);
  controls.appendChild(repsField);

  const setSection = document.createElement('div');
  setSection.className = 'set-section hidden';

  const setList = document.createElement('div');
  setList.className = 'set-list';
  const repsTextSpans = [];

  for (let i = 0; i < exercise.sets; i++) {
    const row = document.createElement('label');
    row.className = 'set-row';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    const checkKey = getCheckKey(dayId, exercise.id, i);
    checkbox.checked = localStorage.getItem(checkKey) === 'true';

    const label = document.createElement('span');
    label.textContent = `Set ${i + 1} x ${currentReps}`;
    repsTextSpans.push({ span: label, setNumber: i + 1 });

    row.appendChild(checkbox);
    row.appendChild(label);
    setList.appendChild(row);

    checkbox.addEventListener('change', () => {
      if (checkbox.checked) {
        localStorage.setItem(checkKey, 'true');
      } else {
        localStorage.removeItem(checkKey);
      }
      updateCompletedState(li);

      const { completed, total } = updateDayProgressBar(day);
      if (checkbox.checked && total > 0 && completed === total) {
        celebrateDayComplete();
      }
    });
  }

  repsInput.addEventListener('change', () => {
    localStorage.setItem(repsKey, repsInput.value);
    repsTextSpans.forEach(({ span, setNumber }) => {
      span.textContent = `Set ${setNumber} x ${repsInput.value}`;
    });
  });

  setSection.appendChild(setList);

  if (exercise.image) {
    const imageCard = document.createElement('div');
    imageCard.className = 'exercise-image';

    const img = document.createElement('img');
    img.src = exercise.image;
    img.alt = `${exercise.name} diagram`;
    img.loading = 'lazy';

    imageCard.appendChild(img);
    setSection.appendChild(imageCard);
  }

  header.addEventListener('click', () => {
    li.classList.toggle('expanded');
    controls.classList.toggle('hidden');
    setSection.classList.toggle('hidden');
  });

  li.appendChild(header);
  li.appendChild(controls);
  li.appendChild(setSection);
  updateCompletedState(li);
  return li;
}

function updateCompletedState(exerciseItem) {
  const checkboxes = exerciseItem.querySelectorAll('.set-row input[type="checkbox"]');
  const allChecked = Array.from(checkboxes).every(cb => cb.checked);
  const header = exerciseItem.querySelector('.exercise-header');
  header.classList.toggle('completed', allChecked);
}

function isExerciseComplete(dayId, exercise) {
  for (let i = 0; i < exercise.sets; i++) {
    if (localStorage.getItem(getCheckKey(dayId, exercise.id, i)) !== 'true') {
      return false;
    }
  }
  return true;
}

function getDayProgress(day) {
  const total = day.exercises.length;
  const completed = day.exercises.filter(ex => isExerciseComplete(day.id, ex)).length;
  return { completed, total };
}

function updateDayCardProgress() {
  workoutDays.forEach(day => {
    const card = document.querySelector(`.day-card[data-day-id="${day.id}"]`);
    if (!card) return;

    const { completed, total } = getDayProgress(day);
    const ring = card.querySelector('.ring-progress');
    const radius = ring.r.baseVal.value;
    const circumference = 2 * Math.PI * radius;
    const fraction = total === 0 ? 0 : completed / total;

    ring.style.strokeDasharray = `${circumference}`;
    ring.style.strokeDashoffset = `${circumference * (1 - fraction)}`;
    card.querySelector('.progress-text').textContent = `${completed}/${total}`;
  });
}

function updateDayProgressBar(day) {
  const { completed, total } = getDayProgress(day);
  const fraction = total === 0 ? 0 : completed / total;

  dayProgressFill.style.width = `${fraction * 100}%`;
  dayProgressText.textContent = `${completed}/${total} exercises complete`;

  return { completed, total };
}

function celebrateDayComplete() {
  celebrationMessage.classList.add('visible');
  setTimeout(() => celebrationMessage.classList.remove('visible'), 2200);

  const ctx = confettiCanvas.getContext('2d');
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;

  const colors = ['#8B5CF6', '#22D3EE', '#f2f2f2', '#5B93FF'];
  const particles = Array.from({ length: 100 }, () => ({
    x: Math.random() * confettiCanvas.width,
    y: -20 - Math.random() * confettiCanvas.height * 0.3,
    size: 4 + Math.random() * 5,
    color: colors[Math.floor(Math.random() * colors.length)],
    vx: (Math.random() - 0.5) * 3,
    vy: 2 + Math.random() * 3,
    rotation: Math.random() * 360,
    rotationSpeed: (Math.random() - 0.5) * 12,
  }));

  const duration = 2800;
  const start = performance.now();

  function frame(now) {
    const elapsed = now - start;
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

    const fadeOut = elapsed > duration - 500 ? Math.max(0, (duration - elapsed) / 500) : 1;

    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.03;
      p.rotation += p.rotationSpeed;

      ctx.save();
      ctx.globalAlpha = fadeOut;
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      ctx.restore();
    });

    if (elapsed < duration) {
      requestAnimationFrame(frame);
    } else {
      ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    }
  }

  requestAnimationFrame(frame);
}
