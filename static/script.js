  const app = document.getElementById('app');
  const menuToggle = document.getElementById('menu-toggle');
  const sidebarMenuToggle = document.getElementById('sidebar-menu-toggle');
  const backdrop = document.getElementById('backdrop');
  const navItems = document.querySelectorAll('.nav-item[data-view]');
  const crumbLabel = document.getElementById('crumb-label');

  function openSidebar(){
    app.classList.add('sidebar-open');
    menuToggle.setAttribute('aria-expanded','true');
  }
  function closeSidebar(){
    app.classList.remove('sidebar-open');
    menuToggle.setAttribute('aria-expanded','false');
  }
  menuToggle.addEventListener('click', () => {
    app.classList.contains('sidebar-open') ? closeSidebar() : openSidebar();
  });
  sidebarMenuToggle.addEventListener('click', closeSidebar);
  backdrop.addEventListener('click', closeSidebar);
  document.addEventListener('keydown', e => { if(e.key === 'Escape') closeSidebar(); });

  document.querySelectorAll('[data-group-toggle]').forEach(label => {
    function toggleGroup(){
      const group = label.closest('.nav-group');
      const isCollapsed = group.classList.toggle('collapsed');
      label.setAttribute('aria-expanded', String(!isCollapsed));
    }
    label.addEventListener('click', toggleGroup);
    label.addEventListener('keydown', e => {
      if(e.key === 'Enter' || e.key === ' '){
        e.preventDefault();
        toggleGroup();
      }
    });
  });

  
    const notificationsData = [];

    const candidatesData = [];

    const statsData = {
    resumes: { value: 0, delta: 'No data yet' },
    shortlisted: { value: 0, delta: 'No data yet' },
    interviews: { value: 0, delta: 'No data yet' },
    openPositions: { value: 0, delta: 'No data yet' }
  };

    const tasksData = [];
  const interviewsData = [];

  function matchTier(percent){
    if(percent >= 85) return { cls:'match-high', ring:'background:#e4f6ec;color:#17824c;' };
    if(percent >= 60) return { cls:'match-mid', ring:'background:#fdf1e0;color:#c98a1c;' };
    return { cls:'match-low', ring:'background:#fbe9e6;color:#c94f3d;' };
  }

  function renderNotifications(){
    const fullEl = document.getElementById('notif-list-full');
    const previewEl = document.getElementById('cm-notif-list');

    if(!notificationsData.length){
      if(fullEl) fullEl.innerHTML = '<div class="cm-empty">No notifications yet</div>';
      if(previewEl) previewEl.innerHTML = '<div class="cm-empty">No notifications yet</div>';
      return;
    }

    if(fullEl){
      fullEl.innerHTML = notificationsData.map(n => `
        <div class="notif-row">
          <div class="notif-dot${n.read ? ' read' : ''}"></div>
          <div><div class="notif-title">${n.title}</div><div class="notif-time">${n.time}</div></div>
        </div>
      `).join('');
    }

    if(previewEl){
      const preview = notificationsData.slice(0, 3);
      previewEl.innerHTML = preview.map(n => `
        <div class="cm-notif-preview-row">
          <div class="notif-dot${n.read ? ' read' : ''}"></div>
          <div><div class="notif-title">${n.title}</div><div class="notif-time">${n.time}</div></div>
        </div>
      `).join('');
    }
  }

  function renderStats(){
    const map = {
      resumes: 'stat-resumes', shortlisted: 'stat-shortlisted',
      interviews: 'stat-interviews', openPositions: 'stat-openpositions'
    };
    Object.keys(map).forEach(key => {
      const numEl = document.getElementById(map[key]);
      const deltaEl = document.getElementById(map[key] + '-delta');
      if(numEl) numEl.textContent = statsData[key].value;
      if(deltaEl) deltaEl.textContent = statsData[key].delta;
    });
  }

  function renderHomeMatches(){
    const el = document.getElementById('home-matches-list');
    if(!el) return;
    if(!candidatesData.length){
      el.innerHTML = '<div class="cm-empty">No candidates yet — upload resumes to see AI matches here.</div>';
      return;
    }
    const top = [...candidatesData].sort((a, b) => b.matchPercent - a.matchPercent).slice(0, 5);
    el.innerHTML = top.map(c => `
      <div class="quick-row">
        <div><div class="qr-name">${c.name}</div><div class="qr-role">${c.role}</div></div>
        <span class="tag-pill ${matchTier(c.matchPercent).cls}">${c.matchPercent}% match</span>
      </div>
    `).join('');
  }

  function renderAnalysisGrid(){
    const el = document.getElementById('analysis-grid');
    if(!el) return;
    if(!candidatesData.length){
      el.innerHTML = '<div class="cm-empty">No candidates yet — upload resumes to see AI analysis here.</div>';
      return;
    }
    el.innerHTML = candidatesData.map(c => `
      <div class="cand-card">
        <div class="cand-card-top">
          <div><div class="c-name">${c.name}</div><div class="c-role">${c.role}</div></div>
          <div class="match-ring" style="${matchTier(c.matchPercent).ring}">${c.matchPercent}%</div>
        </div>
        <div class="skill-bars">
          ${(c.skills || []).slice(0, 3).map(s => `
            <div class="skill-row"><span class="lbl">${s.name}</span><div class="skill-track"><div class="skill-fill" style="width:${s.percent}%;"></div></div></div>
          `).join('')}
        </div>
      </div>
    `).join('');
  }

  function renderCandidatesTable(){
    const tbody = document.getElementById('candidates-tbody');
    const countText = document.getElementById('candidates-count-text');
    if(tbody){
      if(!candidatesData.length){
        tbody.innerHTML = '<tr class="table-empty"><td colspan="7">No candidates yet — upload resumes to populate this list.</td></tr>';
      } else {
        tbody.innerHTML = candidatesData.map(c => `
          <tr>
            <td>${c.name}</td>
            <td>${c.role}</td>
            <td>${(c.skills || []).map(s => s.name).join(', ')}</td>
            <td>${c.matchPercent}%</td>
            <td>${c.status || '—'}</td>
            <td>${c.interviewDate || '—'}</td>
            <td>—</td>
          </tr>
        `).join('');
      }
    }
    if(countText){
      countText.textContent = `Showing ${candidatesData.length} of ${candidatesData.length} candidates`;
    }
  }

  function renderManagementStats(){
    const activeEl = document.getElementById('cm-stat-active');
    const avgMatchEl = document.getElementById('cm-stat-avgmatch');
    const openRolesEl = document.getElementById('cm-stat-openroles');
    if(activeEl) activeEl.textContent = candidatesData.length;
    if(avgMatchEl){
      avgMatchEl.textContent = candidatesData.length
        ? Math.round(candidatesData.reduce((sum, c) => sum + c.matchPercent, 0) / candidatesData.length) + '%'
        : '—';
    }
    if(openRolesEl) openRolesEl.textContent = statsData.openPositions.value;
  }

  function renderTasksAndInterviews(){
    const tasksEl = document.getElementById('cm-tasks-list');
    const interviewsEl = document.getElementById('cm-interviews-list');
    if(tasksEl){
      tasksEl.innerHTML = tasksData.length
        ? tasksData.map(t => `<div class="notif-row"><div><div class="notif-title">${t.title}</div></div></div>`).join('')
        : 'No tasks yet';
    }
    if(interviewsEl){
      interviewsEl.innerHTML = interviewsData.length
        ? interviewsData.map(i => `<div class="notif-row"><div><div class="notif-title">${i.title}</div></div></div>`).join('')
        : 'No interviews scheduled';
    }
  }

  function renderAll(){
    renderNotifications();
    renderStats();
    renderHomeMatches();
    renderAnalysisGrid();
    renderCandidatesTable();
    renderManagementStats();
    renderTasksAndInterviews();
  }

  const viewLabels = {
    home:'Home', upload:'Upload', analysis:'Candidate Analysis',
    management:'Candidate Management', askai:'Ask AI',
    notifications:'Notifications', account:'Account Settings'
  };

  function showView(name){
    document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
    const target = document.getElementById('view-' + name);
    if(target) target.classList.remove('hidden');
    navItems.forEach(n => n.classList.toggle('active', n.dataset.view === name));
    crumbLabel.textContent = viewLabels[name] || 'Home';
    const activeItem = document.querySelector('.nav-item[data-view="' + name + '"]');
    const parentGroup = activeItem && activeItem.closest('.nav-group');
    if(parentGroup){
      parentGroup.classList.remove('collapsed');
      const label = parentGroup.querySelector('[data-group-toggle]');
      if(label) label.setAttribute('aria-expanded', 'true');
    }
  }

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      showView(item.dataset.view);
      closeSidebar();
    });
  });

  document.getElementById('sidebar-user-btn').addEventListener('click', () => {
    showView('account');
    closeSidebar();
  });

  document.querySelectorAll('.action-tile[data-goto]').forEach(tile => {
    tile.addEventListener('click', () => showView(tile.dataset.goto));
  });

    const cmNotifPanel = document.getElementById('cm-notif-panel');
  if(cmNotifPanel){
    cmNotifPanel.addEventListener('click', () => { showView('notifications'); closeSidebar(); });
    cmNotifPanel.addEventListener('keydown', e => {
      if(e.key === 'Enter' || e.key === ' '){
        e.preventDefault();
        showView('notifications');
        closeSidebar();
      }
    });
  }

  renderAll();

    const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('file-input');
  document.getElementById('select-files-btn').addEventListener('click', () => fileInput.click());
  ['dragenter','dragover'].forEach(evt => dropZone.addEventListener(evt, e => { e.preventDefault(); dropZone.classList.add('drag'); }));
  ['dragleave','drop'].forEach(evt => dropZone.addEventListener(evt, e => { e.preventDefault(); dropZone.classList.remove('drag'); }));

    const demoAccounts = [];
  let currentUser = null;

  const authOverlay = document.getElementById('authOverlay');
  const authTabs = document.querySelectorAll('.auth-tab');
  const authPanels = { login: document.getElementById('loginPanel'), signup: document.getElementById('signupPanel') };
  const loginError = document.getElementById('loginError');
  const signupError = document.getElementById('signupError');

  function openAuth(tab){
    authOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    setAuthTab(tab || 'login');
    loginError.classList.remove('show');
    signupError.classList.remove('show');
  }
  function closeAuthGate(){
    authOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }
  function setAuthTab(tab){
    authTabs.forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
    Object.entries(authPanels).forEach(([key, panel]) => panel.classList.toggle('active', key === tab));
  }
  function showError(el, msg){
    el.textContent = msg;
    el.classList.add('show');
  }
  function initials(name){
    return name.trim().split(/\s+/).slice(0,2).map(w => w[0].toUpperCase()).join('') || 'U';
  }
  function setLoggedIn(user){
    currentUser = user;
    document.getElementById('userChipName').textContent = user.name;
    document.getElementById('userAvatar').textContent = initials(user.name);
    document.getElementById('userChip').classList.add('show');
    document.getElementById('login-btn').style.display = 'none';
    document.getElementById('signup-btn').style.display = 'none';
    document.getElementById('logout-btn').style.display = 'inline-flex';
    document.getElementById('sidebar-username').textContent = user.name;
    const acctName = document.getElementById('acct-fullname');
    if(acctName) acctName.value = user.name;
    const acctEmail = document.getElementById('acct-email');
    if(acctEmail) acctEmail.value = user.email || '';
    closeAuthGate();
  }
  function logOut(){
    currentUser = null;
    document.getElementById('userChip').classList.remove('show');
    document.getElementById('login-btn').style.display = 'inline-flex';
    document.getElementById('signup-btn').style.display = 'inline-flex';
    document.getElementById('logout-btn').style.display = 'none';
    document.getElementById('sidebar-username').textContent = 'Guest user';
    const acctName = document.getElementById('acct-fullname');
    if(acctName) acctName.value = '';
    const acctEmail = document.getElementById('acct-email');
    if(acctEmail) acctEmail.value = '';
    openAuth('login');
  }

  document.getElementById('login-btn').addEventListener('click', () => openAuth('login'));
  document.getElementById('signup-btn').addEventListener('click', () => openAuth('signup'));
  document.getElementById('logout-btn').addEventListener('click', logOut);
  document.getElementById('authClose').addEventListener('click', closeAuthGate);
  authOverlay.addEventListener('click', e => { if(e.target === authOverlay) closeAuthGate(); });
  authTabs.forEach(t => t.addEventListener('click', () => setAuthTab(t.dataset.tab)));
  document.querySelectorAll('.auth-switch a').forEach(a => {
    a.addEventListener('click', e => { e.preventDefault(); setAuthTab(a.dataset.tab); });
  });

    document.getElementById('loginSubmit').addEventListener('click', () => {
    const email = document.getElementById('loginEmail').value.trim().toLowerCase();
    const password = document.getElementById('loginPassword').value;
    loginError.classList.remove('show');

    if(!email || !password){
      showError(loginError, 'Enter both your email and password.');
      return;
    }
    const match = demoAccounts.find(a => a.email.toLowerCase() === email && a.password === password);
    if(!match){
      showError(loginError, 'No account matches that email and password.');
      return;
    }
    setLoggedIn(match);
  });

    document.getElementById('signupSubmit').addEventListener('click', async () => {
    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim().toLowerCase();
    const password = document.getElementById('signupPassword').value;
    signupError.classList.remove('show');

    if(!name || !email || !password){
      showError(signupError, 'Fill in your name, email, and password.');
      return;
    }
    if(!/^\S+@\S+\.\S+$/.test(email)){
      showError(signupError, 'Enter a valid email address.');
      return;
    }
    if(password.length < 6){
      showError(signupError, 'Password must be at least 6 characters.');
      return;
    }

    const response = await fetch("/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name,
            email,
            password
        })
    });

     const data = await response.json();

    if (!response.ok) {
        showError(signupError, data.detail || "Registration failed.");
        return;
    }

    setLoggedIn({ name, email });

  });

    document.getElementById('loginPassword').addEventListener('keydown', e => { if(e.key === 'Enter') document.getElementById('loginSubmit').click(); });
  document.getElementById('signupPassword').addEventListener('keydown', e => { if(e.key === 'Enter') document.getElementById('signupSubmit').click(); });

    const chatScroll = document.getElementById('chat-scroll');
  const chatInput = document.getElementById('chat-input');
  function sendChat(){
    const val = chatInput.value.trim();
    if(!val) return;
    const u = document.createElement('div');
    u.className = 'msg user';
    u.textContent = val;
    chatScroll.appendChild(u);
    chatInput.value = '';
    setTimeout(() => {
      const a = document.createElement('div');
      a.className = 'msg ai';
      a.textContent = "I'll cross-reference that against the candidate pool and job requirements — this is a static demo response.";
      chatScroll.appendChild(a);
      chatScroll.scrollTop = chatScroll.scrollHeight;
    }, 500);
    chatScroll.scrollTop = chatScroll.scrollHeight;
  }
  document.getElementById('chat-send').addEventListener('click', sendChat);
  chatInput.addEventListener('keydown', e => { if(e.key === 'Enter') sendChat(); });
  document.querySelectorAll('.ask-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      chatInput.value = chip.dataset.prompt;
      sendChat();
    });
  });

    openAuth('login');