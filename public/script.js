const ALL_COURSES = [
  { name: "BCSE203E - Web Programming (Theory)", venue: "PRP124", total: 40 },
  { name: "BCSE203E - Web Programming (Lab)", venue: "PRP232", total: 35 },
  { name: "BCSE204L - Analysis of Algorithms", venue: "PRP221", total: 20 },
  { name: "BCSE204P - Algorithms Lab", venue: "PRP234", total: 30 },
  { name: "BCSE205L - Computer Architecture", venue: "PRP411", total: 45 },
  { name: "BCSE304L - Theory of Computation", venue: "PRPG31", total: 38 },
  { name: "BECE204L - Microprocessors", venue: "PRP223", total: 42 },
  { name: "BECE204P - Microprocessors Lab", venue: "PRP136", total: 28 },
  { name: "BMAT202L - Probability and Statistics", venue: "PRP204", total: 50 },
  { name: "BMAT202P - Statistics Lab", venue: "PRP450", total: 24 },
  { name: "BSTS102P - Soft Skill Practice", venue: "PRP214", total: 30 },
];

const GRADE_POINTS = { S: 10, A: 9, B: 8, C: 7, D: 6 };
const GRADE_POOL = ["S", "S", "A", "A", "A", "B", "B", "C", "D"];

function generateUserData(id, name, attendanceFactor) {
  let totalCredits = 0;
  let earnedPoints = 0;
  const targetCredits = 160;

  const courses = ALL_COURSES.map((course) => {
    const credits = Math.floor(Math.random() * 2) + 3;
    const grade = GRADE_POOL[Math.floor(Math.random() * GRADE_POOL.length)];

    totalCredits += credits;
    earnedPoints += credits * GRADE_POINTS[grade];

    return {
      ...course,
      attended: Math.floor(course.total * attendanceFactor),
      credits: credits,
      grade: grade,
    };
  });

  const cgpa = (earnedPoints / totalCredits).toFixed(2);
  return { id, name, courses, totalCredits, targetCredits, cgpa };
}

let USERS = {};
const cachedDB = localStorage.getItem("varden_users_db");

if (cachedDB) {
  USERS = JSON.parse(cachedDB);
} else {
  USERS = {
    user1: {
      ...generateUserData("user1", "User alpha", 0.92),
      regNo: "25BCE0001",
      symbol: "α",
    },
    user2: {
      ...generateUserData("user2", "User beta", 0.89),
      regNo: "25BCE0002",
      symbol: "β",
    },
    user3: {
      ...generateUserData("user3", "User gamma", 0.94),
      regNo: "25BCE0003",
      symbol: "γ",
    },
    user4: {
      ...generateUserData("user4", "User delta", 0.91),
      regNo: "25BCE0004",
      symbol: "δ",
    },
  };
  localStorage.setItem("varden_users_db", JSON.stringify(USERS));
}

let currentUser = null;
let currentDetailCourse = null;
let simAttended = 0;
let simMissed = 0;

function getHistoryKey() {
  return `vardenHistory_${currentUser.id}`;
}

function showModal(title, message, isConfirm, onConfirm) {
  document.getElementById("modal-title").textContent = title;
  document.getElementById("modal-message").textContent = message;
  const actions = document.getElementById("modal-actions");

  if (isConfirm) {
    actions.innerHTML = `
      <button class="submit-btn" id="modal-btn-yes" style="flex: 1;">Yes, Logout</button>
      <button class="submit-btn outline-btn" id="modal-btn-no" style="flex: 1;">Cancel</button>
    `;
    requestAnimationFrame(() => {
      document.getElementById("modal-btn-yes").onclick = () => {
        closeModal();
        if (onConfirm) onConfirm();
      };
      document.getElementById("modal-btn-no").onclick = closeModal;
    });
  } else {
    actions.innerHTML = `<button class="submit-btn" id="modal-btn-ok" style="width: 100%;">Acknowledge</button>`;
    requestAnimationFrame(() => {
      document.getElementById("modal-btn-ok").onclick = closeModal;
    });
  }
  document.getElementById("custom-modal").style.display = "flex";
}

function closeModal() {
  document.getElementById("custom-modal").style.display = "none";
}

function promptLogout() {
  closeAccountCard();
  showModal(
    "End Session?",
    "Are you sure you want to log out of Varden?",
    true,
    confirmLogout,
  );
}

function confirmLogout() {
  currentUser = null;
  localStorage.removeItem("varden_user");
  window.location.href = "/";
}

function toggleAccountCard() {
  document.getElementById("account-card").classList.toggle("visible");
}
function closeAccountCard() {
  const card = document.getElementById("account-card");
  if (card) card.classList.remove("visible");
}

function showPanel(panelId) {
  document
    .querySelectorAll(".panel")
    .forEach((p) => p.classList.remove("active"));
  const targetPanel = document.getElementById(`panel-${panelId}`);
  if (targetPanel) targetPanel.classList.add("active");

  const headerLogo = document.querySelector(".header-logo");
  const homeIcon = document.querySelector(".home-nav-icon");
  const navIcons = document.querySelector(".menu-icons");
  const mainNav = document.getElementById("main-nav");
  const userDisplay = document.querySelector(".user-nav-display");

  if (panelId === "home") {
    mainNav.style.display = "flex";
    headerLogo.style.display = "flex";
    headerLogo.classList.add("visible");
    homeIcon.style.display = "none";
    navIcons.classList.remove("visible");
    userDisplay.style.display = "flex";
  } else {
    mainNav.style.display = "flex";
    headerLogo.style.display = "none";
    homeIcon.style.display = "flex";
    navIcons.classList.add("visible");
    userDisplay.style.display = "flex";
  }
}

function goToHome() {
  showPanel("home");
}

function switchPanel(panelId) {
  showPanel(panelId);
  document
    .querySelectorAll(".menu-item")
    .forEach((i) => i.classList.remove("active"));
  const navItem = document.getElementById(`nav-${panelId}`);
  if (navItem) navItem.classList.add("active");

  document.getElementById("attendance-main-view").style.display = "block";
  document.getElementById("course-detail-view").style.display = "none";

  const data = calculateAttendance(currentUser.courses);

  if (panelId === "attendance") {
    renderDashboard(data.summary);
    renderCourses(data.courses);
  } else if (panelId === "leave") {
    updateBanner(data.summary.overallPercentage);
    renderHistory();
  } else if (panelId === "calendar") {
    renderCalendar();
  } else if (panelId === "cgpa") {
    renderCGPA();
  } else if (panelId === "profile") {
    document.getElementById("prof-name").textContent = currentUser.name;
    document.getElementById("prof-regno").textContent = currentUser.regNo;
    document.getElementById("prof-email").textContent =
      `${currentUser.name.replace(" ", ".").toLowerCase()}@varden.ac.in`;
  }
}

function renderCGPA() {
  const remainingCredits = currentUser.targetCredits - currentUser.totalCredits;
  document.getElementById("cgpa-overall").textContent = currentUser.cgpa;
  document.getElementById("cgpa-target").textContent =
    currentUser.targetCredits;
  document.getElementById("cgpa-fraction").textContent =
    `${currentUser.totalCredits}/${currentUser.targetCredits}`;
  document.getElementById("cgpa-remaining").textContent = remainingCredits;

  const list = document.getElementById("cgpa-list");
  list.innerHTML = currentUser.courses
    .map(
      (c) => `
    <div class="course-card" style="display: flex; justify-content: space-between; align-items: center; padding: 24px 32px; margin-bottom: 0;">
      <div>
        <div class="c-name" style="margin-bottom: 12px; font-size: 18px;">${c.name}</div>
        <div class="c-venue" style="display: inline-block;">${c.credits} Credits Earned</div>
      </div>
      <div class="grade-badge grade-${c.grade}">${c.grade}</div>
    </div>
  `,
    )
    .join("");
}

function calculateAttendance(courses) {
  let summary = {
    totalCourses: courses.length,
    totalClasses: 0,
    totalAttended: 0,
    totalMissed: 0,
    overallPercentage: 0,
  };
  let coursesData = courses.map((c) => {
    const missed = c.total - c.attended;
    summary.totalClasses += c.total;
    summary.totalAttended += c.attended;
    summary.totalMissed += missed;
    return {
      ...c,
      missed,
      percentage: parseFloat(((c.attended / c.total) * 100).toFixed(1)),
    };
  });
  summary.overallPercentage = (
    (summary.totalAttended / summary.totalClasses) *
    100
  ).toFixed(1);
  return { summary, courses: coursesData };
}

function renderDashboard(summary) {
  document.getElementById("overall-percentage").textContent =
    `${summary.overallPercentage}%`;
  document.getElementById("total-courses").textContent = summary.totalCourses;
  document.getElementById("attendance-fraction").textContent =
    `${summary.totalAttended}/${summary.totalClasses}`;
  document.getElementById("total-missed").textContent = summary.totalMissed;
  document.getElementById("overall-percentage").style.color =
    summary.overallPercentage > 75
      ? "var(--success-green)"
      : "var(--error-red)";
}

function renderCourses(courses) {
  const container = document.getElementById("course-list");
  container.innerHTML = courses
    .map(
      (c, index) => `
    <div class="course-card" onclick="openCourseDetail(${index})">
      <div class="c-header"><span class="c-name">${c.name}</span><span class="c-venue">${c.venue}</span></div>
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <span style="font-size:11px; font-weight:1000; color:var(--text-muted); text-transform:uppercase;">${c.attended}/${c.total} Attended</span>
        <span style="font-size:20px; font-weight:1000; color: ${c.percentage > 75 ? "var(--success-green)" : "var(--error-red)"}">${c.percentage}%</span>
      </div>
      <div class="progress-track"><div class="progress-bar ${c.percentage > 75 ? "good" : "bad"}" style="width: 0%;" data-w="${c.percentage}%"></div></div>
    </div>
  `,
    )
    .join("");
  setTimeout(
    () =>
      document
        .querySelectorAll(".progress-bar")
        .forEach((b) => (b.style.width = b.dataset.w)),
    150,
  );
}

function openCourseDetail(index) {
  currentDetailCourse = currentUser.courses[index];
  simAttended = 0;
  simMissed = 0;
  document.getElementById("attendance-main-view").style.display = "none";
  document.getElementById("course-detail-view").style.display = "block";
  renderCourseDetail();
}

function closeCourseDetail() {
  document.getElementById("attendance-main-view").style.display = "block";
  document.getElementById("course-detail-view").style.display = "none";
}

function renderCourseDetail() {
  const container = document.getElementById("course-detail-content");
  const currentPct = (
    (currentDetailCourse.attended / currentDetailCourse.total) *
    100
  ).toFixed(1);
  let logHtml = "";
  for (let i = 0; i < 5; i++) {
    const isAttended = i < 4;
    logHtml += `<div class="log-entry"><span style="font-weight: 800; font-size: 14px;">SESSION ${10 - i}</span><span class="log-tag ${isAttended ? "attended" : "missed"}">${isAttended ? "Attended" : "Missed"}</span></div>`;
  }
  container.innerHTML = `
    <h2 class="section-title" style="margin-bottom: 8px;">${currentDetailCourse.name}</h2>
    <p class="overall-label" style="margin-bottom: 32px;">Venue: ${currentDetailCourse.venue}</p>
    <div class="course-detail-grid">
      <div class="log-container"><span class="overall-label">Recent Activity Log</span>${logHtml}</div>
      <div class="card-outline predictor-card">
        <div class="predictor-values">
          <span class="overall-label">Current Attendance</span>
          <div class="overall-value" style="font-size: 32px; margin-bottom: 24px; color: var(--text-muted); opacity: 0.7;">${currentPct}%</div>
          <span class="overall-label">Predicted Attendance</span>
          <div id="predict-pct" class="overall-value" style="font-size: 64px;">0%</div>
        </div>
        <div class="sim-controls-group">
          <div class="sim-row"><span class="sim-label">Attend Future</span><div class="sim-actions"><button class="mini-calc-btn" onclick="updateSim('attended', -1)">-</button><span class="sim-value" id="sim-att-val">0</span><button class="mini-calc-btn" onclick="updateSim('attended', 1)">+</button></div></div>
          <div class="sim-row"><span class="sim-label">Miss Future</span><div class="sim-actions"><button class="mini-calc-btn" onclick="updateSim('missed', -1)">-</button><span class="sim-value" id="sim-miss-val">0</span><button class="mini-calc-btn" onclick="updateSim('missed', 1)">+</button></div></div>
        </div>
        <div class="remaining-tag" id="remaining-count">Remaining classes: 10/10</div>
      </div>
    </div>`;
  refreshPredictor();
}

function updateSim(type, delta) {
  const totalSim = simAttended + simMissed;
  if (type === "attended") {
    if (delta > 0 && totalSim < 10) simAttended++;
    if (delta < 0 && simAttended > 0) simAttended--;
  } else {
    if (delta > 0 && totalSim < 10) simMissed++;
    if (delta < 0 && simMissed > 0) simMissed--;
  }
  refreshPredictor();
}

function refreshPredictor() {
  const total = currentDetailCourse.total + simAttended + simMissed;
  const attended = currentDetailCourse.attended + simAttended;
  const pct = ((attended / total) * 100).toFixed(1);
  const pctEl = document.getElementById("predict-pct");
  pctEl.textContent = `${pct}%`;
  pctEl.style.color = pct > 75 ? "var(--success-green)" : "var(--error-red)";
  document.getElementById("sim-att-val").textContent = simAttended;
  document.getElementById("sim-miss-val").textContent = simMissed;
  document.getElementById("remaining-count").textContent =
    `Remaining classes: ${10 - (simAttended + simMissed)}/10`;
}

const ACADEMIC_EVENTS = {
  "2025-12-25": { type: "special", label: "Christmas Holiday" },
  "2026-02-15": { type: "exam", label: "CAT 1: Assessment" },
  "2026-04-15": { type: "exam", label: "FAT: Final Exams" },
};

function renderCalendar() {
  const container = document.getElementById("calendar-grid-container");
  container.innerHTML = "";
  const months = [
    { m: 11, y: 2025 },
    { m: 0, y: 2026 },
    { m: 1, y: 2026 },
    { m: 2, y: 2026 },
    { m: 3, y: 2026 },
    { m: 4, y: 2026 },
  ];
  months.forEach(({ m, y }) => {
    const monthEl = document.createElement("div");
    monthEl.className = "month-container";
    renderMonthGrid(monthEl, m, y);
    monthEl.addEventListener("mouseleave", () =>
      renderMonthGrid(monthEl, m, y),
    );
    container.appendChild(monthEl);
  });
}

function renderMonthGrid(container, m, y) {
  const date = new Date(y, m, 1);
  const monthName = date.toLocaleString("default", { month: "long" });
  const firstDay = date.getDay();
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const userHistory = JSON.parse(localStorage.getItem(getHistoryKey())) || [];

  let html = `<div class="month-name">${monthName} ${y}</div><div class="calendar-grid">
    <div class="day-name">Sun</div><div class="day-name">Mon</div><div class="day-name">Tue</div>
    <div class="day-name">Wed</div><div class="day-name">Thu</div><div class="day-name">Fri</div><div class="day-name">Sat</div>`;

  for (let i = 0; i < firstDay; i++)
    html += `<div class="calendar-day empty"></div>`;

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${y}-${String(m + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const academicEvent = ACADEMIC_EVENTS[dateStr];
    const privateLeave = userHistory.find(
      (l) =>
        l.status === "APPROVED" && dateStr >= l.fromISO && dateStr <= l.toISO,
    );
    const isWeekend =
      new Date(y, m, day).getDay() === 0 || new Date(y, m, day).getDay() === 6;

    let typeClass = academicEvent
      ? academicEvent.type
      : privateLeave
        ? "special"
        : !isWeekend
          ? "instruction"
          : "";
    html += `<div class="calendar-day ${typeClass}" onclick="showDayDetail(event, ${day}, ${m}, ${y})">${day}</div>`;
  }
  container.innerHTML = html + `</div>`;
}

function showDayDetail(e, day, m, y) {
  e.stopPropagation();
  const container = e.target.closest(".month-container");
  const dateStr = `${y}-${String(m + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  const academicEvent = ACADEMIC_EVENTS[dateStr];
  const userHistory = JSON.parse(localStorage.getItem(getHistoryKey())) || [];

  const privateLeave = userHistory.find(
    (l) =>
      l.status === "APPROVED" && dateStr >= l.fromISO && dateStr <= l.toISO,
  );
  const isWeekend =
    new Date(y, m, day).getDay() === 0 || new Date(y, m, day).getDay() === 6;

  let label = academicEvent
    ? academicEvent.label
    : privateLeave
      ? `YOUR LEAVE: ${privateLeave.reason}`
      : isWeekend
        ? "Weekend / Holiday"
        : "Standard Instructional Day";
  let type = academicEvent
    ? academicEvent.type
    : privateLeave
      ? "special"
      : isWeekend
        ? "weekend"
        : "instruction";

  container.innerHTML = `
    <div class="month-name">${new Date(y, m, day).toLocaleDateString("default", { day: "numeric", month: "long", year: "numeric" })}</div>
    <div class="month-detail-view ${type}"><span class="material-symbols-outlined detail-icon">${type === "exam" ? "edit_document" : type === "special" ? "celebration" : "school"}</span>
    <div class="detail-label">${label}</div><p class="overall-label">Move cursor out to return</p></div>
  `;
}

function renderHistory() {
  const container = document.getElementById("history-list");
  const userHistory = JSON.parse(localStorage.getItem(getHistoryKey())) || [];
  if (userHistory.length === 0) {
    container.innerHTML = '<p class="overall-label">No history available</p>';
    return;
  }
  container.innerHTML = [...userHistory]
    .reverse()
    .map(
      (req) => `
    <div class="history-item ${req.status.toLowerCase()}"><span class="status-tag">${req.status}</span>
    <div style="font-size:15px; font-weight:900; margin-bottom:4px;">${req.reason}</div>
    <div style="font-size:11px; font-weight:800; color:var(--text-muted); text-transform:uppercase;">${req.fromDate} - ${req.toDate} • Attendance ${req.attendanceAtTime}%</div></div>
  `,
    )
    .join("");
}

function updateBanner(pct) {
  const b = document.getElementById("eligibility-banner");
  const isSafe = pct > 75;
  b.textContent = isSafe
    ? "Status: Eligible for Leave"
    : "Status: Attendance Critical";
  b.style.color = isSafe ? "var(--success-green)" : "var(--error-red)";
}

document.addEventListener("click", function (e) {
  if (e.target === document.getElementById("custom-modal")) closeModal();
  const accountCard = document.getElementById("account-card");
  if (
    accountCard &&
    accountCard.classList.contains("visible") &&
    !accountCard.contains(e.target) &&
    !e.target.closest(".user-nav-display")
  ) {
    closeAccountCard();
  }
});

function init() {
  const storedUserId = localStorage.getItem("varden_user");

  if (!storedUserId || !USERS[storedUserId]) {
    window.location.href = "/";
    return;
  }

  currentUser = USERS[storedUserId];

  document.getElementById("home-user-symbol").textContent = currentUser.symbol;
  document.getElementById("home-user-name").textContent = currentUser.name;
  document.getElementById("home-user-regno").textContent = currentUser.regNo;
  document.getElementById("nav-user-symbol").textContent = currentUser.symbol;
  document.getElementById("nav-user-regno").textContent = currentUser.regNo;
  document.getElementById("card-user-name").textContent = currentUser.name;
  document.getElementById("card-user-regno").textContent = currentUser.regNo;
  document.getElementById("card-user-symbol").textContent = currentUser.symbol;

  showPanel("home");

  document
    .getElementById("leave-form")
    .addEventListener("submit", function (e) {
      e.preventDefault();
      const from = document.getElementById("req-from").value;
      const to = document.getElementById("req-to").value;
      if (new Date(from) >= new Date(to)) {
        showModal(
          "Invalid Request",
          "End date must be after the start date.",
          false,
        );
        return;
      }
      const pct = calculateAttendance(currentUser.courses).summary
        .overallPercentage;
      const status = pct > 75 ? "APPROVED" : "REJECTED";
      const userHistory =
        JSON.parse(localStorage.getItem(getHistoryKey())) || [];

      userHistory.push({
        id: Date.now(),
        fromISO: from.split("T")[0],
        toISO: to.split("T")[0],
        fromDate: new Date(from)
          .toLocaleDateString([], { month: "short", day: "numeric" })
          .toUpperCase(),
        toDate: new Date(to)
          .toLocaleDateString([], { month: "short", day: "numeric" })
          .toUpperCase(),
        reason: document.getElementById("req-reason").value.toUpperCase(),
        attendanceAtTime: pct,
        status: status,
      });
      localStorage.setItem(getHistoryKey(), JSON.stringify(userHistory));
      this.reset();
      renderHistory();
      showModal(
        `Request ${status}`,
        `Your leave request has been processed and is ${status}.`,
        false,
      );
    });
}

document.addEventListener("DOMContentLoaded", init);
