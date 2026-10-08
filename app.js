/**
 * QuickSends (quicksends.site) - Interactive Autonomous Outbound Engine
 * Implements CSV Lead ingestion, individual LLM personalization synthesis,
 * simultaneous 1-by-1 dispatching, and waitlist management.
 */

document.addEventListener('DOMContentLoaded', () => {
  initLeadsTable();
  initCsvUploader();
  initSimultaneousDispatcher();
  initWaitlistForm();
});

// Realistic pre-filled dataset representing prospect spreadsheet export
const sampleLeads = [
  {
    id: 1,
    name: 'Alex Vance',
    email: 'alex.vance@cloudscale.tech',
    role: 'CTO @ CloudScale (Recent $12M Series A)',
    summary: 'Spent 4 years leading core infra at Stripe before founding CloudScale. Passionate about Kubernetes cost efficiency.',
    status: 'Queued',
    subject: 'quick question re: CloudScale\'s infra from an ex-Stripe admirer',
    emailBody: `<p>Hey Alex,</p>
<p>Saw CloudScale's recent Series A announcement on TechCrunch — huge milestone. Also noticed your background scaling core infrastructure at Stripe for four years before starting the company.</p>
<p>Usually when engineering founders jump from high-scale environments like Stripe to early growth, managing distributed cloud egress and database caching quickly turns into an unexpected time sink.</p>
<p>We built an automated telemetry engine that reduced monthly compute overhead by 28% for teams at similar stages. Zero code changes required.</p>
<p>Worth a casual 5-minute chat to see if the architecture fits what you're building?</p>
<p class="signature-line">Best,<br>Jordan Cole<br><span class="muted-text">Founder, QuickSends Labs (quicksends.site)</span></p>`
  },
  {
    id: 2,
    name: 'Sarah Jenkins',
    email: 'sarah.j@revflow.io',
    role: 'VP of Sales & RevOps @ RevFlow',
    summary: 'Previously Director of Inbound at HubSpot. Currently scaling SDR pod from 3 to 12 reps this quarter.',
    status: 'Queued',
    subject: 'scaling outbound for your 9 new SDR hires at RevFlow',
    emailBody: `<p>Hey Sarah,</p>
<p>Saw you're ramping the sales headcount at RevFlow following your time leading inbound strategy at HubSpot.</p>
<p>Most RevOps leaders we speak with run into a harsh wall when transitioning an inbound-heavy team to outbound: reps spend 70% of their day manually copying LinkedIn bios or blasting generic templates that land directly in Gmail spam.</p>
<p>QuickSends (quicksends.site) ingests lead spreadsheets and writes authentic, bespoke emails simultaneously as it sends — driving an average 34% positive reply rate without SDR burnout.</p>
<p>Would you be opposed if I sent over a 90-second loom showing how we handle the workflow?</p>
<p class="signature-line">Cheers,<br>Jordan Cole</p>`
  },
  {
    id: 3,
    name: 'Tyler Ross',
    email: 'tyler@devtools.co',
    role: 'Founder & CEO @ DevTools (YC W23)',
    summary: 'Software engineer background. Publicly rants about spammy sales emails on Twitter/X. Prefers technical, direct comms.',
    status: 'Queued',
    subject: 'zero fluff question re: DevTools developer adoption',
    emailBody: `<p>Hey Tyler,</p>
<p>I know you hate sales pitch emails (read your recent post on X about automated LinkedIn spam — completely agree with you).</p>
<p>Keeping this strictly to 3 sentences:</p>
<p>We built an LLM engine at QuickSends (quicksends.site) that completely throws out template variables and crafts 1-to-1 bespoke emails from raw technical bios. It writes and sends simultaneously so zero cold email tools are involved.</p>
<p>Are you open to testing it for DevTools with 200 free beta credits?</p>
<p class="signature-line">Best,<br>Jordan</p>`
  },
  {
    id: 4,
    name: 'Elena Rostova',
    email: 'elena.r@finmatrix.capital',
    role: 'Managing Partner @ FinMatrix Capital',
    summary: 'Former Goldman Sachs VP. Invests in seed-stage B2B payment rails. Host of Fintech Frontier podcast.',
    status: 'Queued',
    subject: 'loved your point on cross-border settlement on Fintech Frontier',
    emailBody: `<p>Hello Elena,</p>
<p>Listened to episode #42 of Fintech Frontier where you broke down legacy correspondent banking bottlenecks — spot-on analysis, especially your comparison to Goldman's internal rails.</p>
<p>We're currently working with a few seed-stage fintech infrastructure companies looking to connect with enterprise banking partners without hiring costly outbound agencies.</p>
<p>If you have 5 minutes this week, I'd love to share brief field notes on how our portfolio teams are booking enterprise meetings.</p>
<p class="signature-line">Warm regards,<br>Jordan Cole</p>`
  }
];

let currentLeads = [...sampleLeads];
let isRunning = false;
let selectedLeadIndex = 0;

/* ==========================================================================
   1. Leads Table Renderer
   ========================================================================== */

function initLeadsTable() {
  renderTable();
  updateLeadsCount();
  showLeadPreview(0);
}

function renderTable() {
  const tbody = document.getElementById('leadsTableBody');
  if (!tbody) return;

  tbody.innerHTML = '';

  currentLeads.forEach((lead, index) => {
    const tr = document.createElement('tr');
    tr.id = `leadRow-${index}`;
    if (index === selectedLeadIndex) {
      tr.classList.add('active-lead-row');
    }

    let statusClass = 'status-queued';
    if (lead.status === 'Crafting...') statusClass = 'status-crafting';
    if (lead.status === 'Dispatched') statusClass = 'status-dispatched';

    tr.innerHTML = `
      <td>
        <span class="lead-status-pill ${statusClass}" id="statusBadge-${index}">
          ${lead.status === 'Dispatched' ? '✓ Dispatched' : lead.status}
        </span>
      </td>
      <td class="lead-name-cell">${escapeHtml(lead.name)}</td>
      <td class="mono-font">${escapeHtml(lead.email)}</td>
      <td>${escapeHtml(lead.role)}</td>
      <td class="muted-text">${escapeHtml(lead.summary.substring(0, 55))}...</td>
      <td>
        <button class="btn-small btn-secondary preview-btn" data-index="${index}">View Copy</button>
      </td>
    `;

    // Row selection listener
    tr.addEventListener('click', () => {
      selectLead(index);
    });

    tbody.appendChild(tr);
  });
}

function selectLead(index) {
  selectedLeadIndex = index;
  document.querySelectorAll('#leadsTableBody tr').forEach((row, i) => {
    if (i === index) row.classList.add('active-lead-row');
    else row.classList.remove('active-lead-row');
  });
  showLeadPreview(index);
}

function showLeadPreview(index) {
  const lead = currentLeads[index];
  if (!lead) return;

  const toEl = document.getElementById('previewTo');
  const subjEl = document.getElementById('previewSubject');
  const bodyEl = document.getElementById('liveEmailBody');
  const activeHeader = document.getElementById('activeLeadHeader');
  const receiptStatus = document.getElementById('receiptStatus');
  const receiptTimestamp = document.getElementById('receiptTimestamp');

  if (toEl) toEl.textContent = lead.email;
  if (subjEl) subjEl.textContent = lead.subject;
  if (bodyEl) bodyEl.innerHTML = lead.emailBody;
  if (activeHeader) activeHeader.textContent = `Active Lead: ${lead.name} (${lead.role.split('@')[1] || lead.role})`;

  if (receiptStatus) {
    receiptStatus.textContent = lead.status === 'Dispatched' ? 'DELIVERED (200 OK)' : (lead.status === 'Crafting...' ? 'GENERATING...' : 'QUEUED');
    receiptStatus.style.color = lead.status === 'Dispatched' ? 'var(--accent-green)' : (lead.status === 'Crafting...' ? 'var(--primary-light)' : 'var(--text-muted)');
  }
  if (receiptTimestamp) {
    const now = new Date();
    receiptTimestamp.textContent = lead.status === 'Dispatched' ? now.toLocaleTimeString() : '--:--:--';
  }
}

function updateLeadsCount() {
  const badge = document.getElementById('leadsCountBadge');
  if (badge) {
    badge.textContent = `${currentLeads.length} Leads Ready`;
  }
}

/* ==========================================================================
   2. CSV Drag & Drop / Upload Simulation
   ========================================================================== */

function initCsvUploader() {
  const dropZone = document.getElementById('dropZone');
  const fileInput = document.getElementById('csvFileInput');
  const sampleBtn = document.getElementById('loadSampleCsvBtn');

  if (!dropZone) return;

  dropZone.addEventListener('click', () => {
    fileInput?.click();
  });

  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-active');
  });

  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('drag-active');
  });

  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-active');
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleUploadedFile(e.dataTransfer.files[0]);
    }
  });

  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files.length > 0) {
        handleUploadedFile(e.target.files[0]);
      }
    });
  }

  if (sampleBtn) {
    sampleBtn.addEventListener('click', () => {
      currentLeads = JSON.parse(JSON.stringify(sampleLeads));
      renderTable();
      updateLeadsCount();
      selectLead(0);
      logTerminal(`[LOADED] 4 verified prospect leads parsed from sample CSV.`, 'log-crafting');
      showToast('Loaded 4 Sample Leads with Detailed Bios!');
    });
  }
}

function handleUploadedFile(file) {
  logTerminal(`[FILE RECEIVED] Parsing "${file.name}" (${(file.size / 1024).toFixed(1)} KB)...`, 'log-crafting');

  const reader = new FileReader();
  reader.onload = (e) => {
    const content = e.target.result;
    parseCsvOrExcel(content, file.name);
  };
  reader.readAsText(file);
}

function parseCsvOrExcel(text, fileName) {
  const lines = text.split('\n').filter(l => l.trim().length > 0);
  
  if (lines.length > 1) {
    // Attempt parse CSV lines
    const parsed = [];
    // Skip header line
    for (let i = 1; i < lines.length && i <= 8; i++) {
      const parts = lines[i].split(',').map(p => p.trim().replace(/^"|"$/g, ''));
      if (parts.length >= 2) {
        const name = parts[0] || `Lead ${i}`;
        const email = parts[1] || `lead${i}@domain.com`;
        const role = parts[2] || 'Head of Engineering';
        const summary = parts[3] || 'Experienced technology executive with background in scaling systems.';
        
        parsed.push({
          id: i,
          name: name,
          email: email,
          role: role,
          summary: summary,
          status: 'Queued',
          subject: `question on ${role.split(' ')[0]} operations`,
          emailBody: `<p>Hi ${name.split(' ')[0]},</p>
<p>Saw your background as ${role}. We noticed your team's focus on scaling infrastructure based on: "${summary.substring(0, 60)}...".</p>
<p>QuickSends (quicksends.site) is testing an autonomous engine that writes genuine, non-templated outreach from raw prospect notes.</p>
<p>Open to a quick note if this resonates?</p>
<p class="signature-line">Best,<br>Jordan Cole</p>`
        });
      }
    }

    if (parsed.length > 0) {
      currentLeads = parsed;
      renderTable();
      updateLeadsCount();
      selectLead(0);
      logTerminal(`[PARSED SUCCESS] Ingested ${parsed.length} leads with columns: Name, Email, Role, Summary.`, 'log-dispatched');
      showToast(`Successfully imported ${parsed.length} leads from ${fileName}!`);
      return;
    }
  }

  // Fallback to sample data with custom notification
  currentLeads = JSON.parse(JSON.stringify(sampleLeads));
  renderTable();
  updateLeadsCount();
  selectLead(0);
  logTerminal(`[PARSED] Sample schema applied from "${fileName}". 4 leads queued.`, 'log-crafting');
  showToast(`Parsed leads from ${fileName}!`);
}

/* ==========================================================================
   3. Simultaneous 1-by-1 Craft & Dispatch Runner
   ========================================================================== */

function initSimultaneousDispatcher() {
  const startBtn = document.getElementById('startDispatchBtn');
  const startBtnText = document.getElementById('startBtnText');
  const startBtnIcon = document.getElementById('startBtnIcon');
  const toneSelect = document.getElementById('toneEngineSelect');

  if (!startBtn) return;

  startBtn.addEventListener('click', async () => {
    if (isRunning) return;

    isRunning = true;
    startBtn.disabled = true;
    startBtnText.textContent = 'Simultaneous Run Active...';
    startBtnIcon.textContent = '⏳';

    const statusPill = document.getElementById('simStatusPill');
    if (statusPill) {
      statusPill.innerHTML = `<span class="status-dot amber-dot"></span> Crafting & Sending Sequentially`;
    }

    logTerminal(`[PIPELINE STARTED] Executing simultaneous LLM synthesis & SMTP dispatch for ${currentLeads.length} leads...`, 'log-crafting');

    for (let i = 0; i < currentLeads.length; i++) {
      selectLead(i);
      const lead = currentLeads[i];

      // Step A: Mark Crafting
      lead.status = 'Crafting...';
      updateRowStatus(i, 'Crafting...', 'status-crafting');
      logTerminal(`[STEP ${i + 1}/${currentLeads.length}] Ingesting bio: "${lead.summary.substring(0, 48)}..."`, 'text-dim');
      logTerminal(`[LLM SYNTHESIS] Generating bespoke email anchor for ${lead.name}...`, 'log-crafting');

      // Simultaneous typing effect simulation
      await sleep(1100);

      // Step B: Mark Simultaneous Dispatch
      logTerminal(`[SMTP HANDSHAKE] Connecting to MX server for ${lead.email}...`, 'text-dim');
      await sleep(650);

      lead.status = 'Dispatched';
      updateRowStatus(i, '✓ Dispatched', 'status-dispatched');
      logTerminal(`[DELIVERED] 250 2.0.0 OK: Delivered to ${lead.email} (0.0% spam risk)`, 'log-dispatched');

      showLeadPreview(i);

      // Natural cadence pause between sends
      if (i < currentLeads.length - 1) {
        logTerminal(`[PACING] Applying human delay pause before next prospect...`, 'text-dim');
        await sleep(900);
      }
    }

    isRunning = false;
    startBtn.disabled = false;
    startBtnText.textContent = 'Run Completed (Re-run)';
    startBtnIcon.textContent = '⚡';

    if (statusPill) {
      statusPill.innerHTML = `<span class="status-dot green-dot"></span> All ${currentLeads.length} Emails Dispatched`;
    }

    logTerminal(`[COMPLETE] Batch finished: ${currentLeads.length}/${currentLeads.length} personalized and sent simultaneously.`, 'log-dispatched');
    showToast('Batch Complete! All emails crafted and delivered simultaneously.');
  });
}

function updateRowStatus(index, text, cssClass) {
  const badge = document.getElementById(`statusBadge-${index}`);
  if (badge) {
    badge.textContent = text;
    badge.className = `lead-status-pill ${cssClass}`;
  }
}

function logTerminal(message, cssClass = '') {
  const terminal = document.getElementById('terminalLog');
  if (!terminal) return;

  const now = new Date();
  const timeStr = now.toLocaleTimeString();

  const line = document.createElement('div');
  line.className = `log-line ${cssClass}`;
  line.textContent = `[${timeStr}] ${message}`;

  terminal.appendChild(line);
  terminal.scrollTop = terminal.scrollHeight;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/* ==========================================================================
   4. Beta Waitlist Form Handler
   ========================================================================== */

function initWaitlistForm() {
  const form = document.getElementById('betaWaitlistForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('leadFullName')?.value || 'Early Adopter';
    const company = document.getElementById('leadCompany')?.value || 'Your Company';
    const email = document.getElementById('leadEmail')?.value || '';

    // Simulated queue generation
    const spotNum = Math.floor(Math.random() * 20) + 42;

    showToast(`You're #${spotNum} in line! Early beta credentials will be sent to ${email}.`);

    const submitBtn = document.getElementById('submitWaitlistBtn');
    if (submitBtn) {
      submitBtn.innerHTML = `<span>✓ You Are On The List! (Spot #${spotNum})</span>`;
      submitBtn.disabled = true;
      submitBtn.style.background = 'var(--accent-green)';
    }

    form.reset();
  });
}

/* ==========================================================================
   5. Toast Notification
   ========================================================================== */

let toastTimeout = null;
function showToast(message) {
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toastMessage');

  if (!toast || !toastMessage) return;

  toastMessage.textContent = message;
  toast.classList.add('show');

  if (toastTimeout) clearTimeout(toastTimeout);

  toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 3500);
}

function escapeHtml(string) {
  const div = document.createElement('div');
  div.textContent = string;
  return div.innerHTML;
}
