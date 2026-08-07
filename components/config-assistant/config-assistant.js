/* =============================================================================
   Config Assistant — behavior (YAML manifest view)
   Project Tensei. Author: (config-assistant feature owner)

   Scenario: Pods Stuck Pending — the untolerated taint.
   A workload is headed for a dedicated GPU node group that the platform team
   tainted (dedicated=gpuGroup:NoSchedule). The manifest has no matching
   toleration, so the pods would land in Pending. The assistant reads the
   manifest, flags the gap inline, and can insert the fix.

   Self-contained and collision-safe:
   - Wrapped in an IIFE, so nothing leaks into the global scope.
   - Finds every .ca-root on the page and wires it up independently, using
     data-ca-* attributes scoped to that root (no global IDs).

   To adjust the scenario, edit CA_MANIFEST / CA_TOLERATION / CA_RECIPES below.
   ============================================================================= */
(function () {
  'use strict';

  // The workload manifest, as lines (indentation preserved). {replicas} is a
  // placeholder so the chat can adjust the replica count.
  var CA_MANIFEST = [
    'apiVersion: apps/v1',
    'kind: Deployment',
    'metadata:',
    '  name: ml-training',
    '  namespace: default',
    'spec:',
    '  replicas: {replicas}',
    '  selector:',
    '    matchLabels:',
    '      app: ml-training',
    '  template:',
    '    metadata:',
    '      labels:',
    '        app: ml-training',
    '    spec:',
    '      nodeSelector:',
    '        eks.amazonaws.com/nodegroup: gpu-nodes',
    '      containers:',
    '        - name: trainer',
    '          image: 123456789.dkr.ecr.us-east-1.amazonaws.com/ml-trainer:latest',
    '          resources:',
    '            limits:',
    '              nvidia.com/gpu: 1'
  ];

  // The block the assistant recommends. Inserted right after this marker line.
  var CA_INSERT_AFTER = 'eks.amazonaws.com/nodegroup';
  var CA_TOLERATION = [
    '      tolerations:',
    '        - key: "dedicated"',
    '          operator: "Equal"',
    '          value: "gpuGroup"',
    '          effect: "NoSchedule"'
  ];

  var CA_TAINT = 'dedicated=gpuGroup:NoSchedule';
  var CA_EVENT = '0/8 nodes are available: 5 node(s) had untolerated taint {dedicated: gpuGroup}, 3 Insufficient cpu.';
  var CA_SRC = 'Detected on your target nodes';

  var CA_RECIPES = {
    training:  { label: 'a GPU training job',           replicas: 2, note: 'Long-running on the GPU nodes — includes the toleration so it can schedule.' },
    inference: { label: 'a GPU inference service',       replicas: 3, note: 'Needs the toleration plus a few replicas for availability.' },
    batch:     { label: 'a batch job on the GPU nodes',  replicas: 1, note: 'A one-shot job still needs the toleration to land on the GPU nodes.' },
    default:   { label: 'that',                          replicas: 3, note: 'For the tainted GPU node group, the toleration is the key piece.' }
  };

  function matchRecipe(text) {
    var t = text.toLowerCase();
    if (/train|training|fine.?tune|learn/.test(t)) return 'training';
    if (/inference|serve|serving|api|endpoint|predict/.test(t)) return 'inference';
    if (/batch|job|one.?shot|cron/.test(t)) return 'batch';
    return 'default';
  }

  function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  // light YAML highlighter
  function hl(line) {
    var s = esc(line);
    var t = line.trim();
    if (t.indexOf('#') === 0) return '<span class="ca-y-com">' + s + '</span>';
    var m = s.match(/^(\s*(?:- )?)([A-Za-z0-9_.\/\-"]+)(:)(.*)$/);
    if (!m) return s;
    var indent = m[1], key = m[2], colon = m[3], rest = m[4], val = rest;
    if (rest.trim().length) {
      var v = rest.trim();
      var lead = rest.slice(0, rest.length - rest.replace(/^\s+/, '').length);
      var cls = /^-?\d+(\.\d+)?$/.test(v) ? 'ca-y-num' : 'ca-y-str';
      val = lead + '<span class="' + cls + '">' + v + '</span>';
    }
    return indent + '<span class="ca-y-key">' + key + '</span><span class="ca-y-punct">' + colon + '</span>' + val;
  }

  function initRoot(root) {
    var state = { inserted: false, replicas: 3 };

    var editor = root.querySelector('[data-ca-editor]');
    var finding = root.querySelector('[data-ca-finding]');
    var deployMsg = root.querySelector('[data-ca-deploy-msg]');

    function renderEditor() {
      var out = '';
      var num = 0;
      for (var i = 0; i < CA_MANIFEST.length; i++) {
        var line = CA_MANIFEST[i].replace('{replicas}', state.replicas);
        num++;
        out += '<div class="ca-ln"><span class="ca-num">' + num + '</span><span class="ca-code">' + hl(line) + '</span></div>';

        if (CA_MANIFEST[i].indexOf(CA_INSERT_AFTER) !== -1) {
          if (state.inserted) {
            for (var j = 0; j < CA_TOLERATION.length; j++) {
              num++;
              out += '<div class="ca-ln ca-added"><span class="ca-num">' + num + '</span><span class="ca-code">' + hl(CA_TOLERATION[j]) + '</span></div>';
            }
          } else {
            out += '<div class="ca-anno"><span class="ca-num">\u26a0</span>'
              + '<div class="ca-box"><span class="ca-txt">Missing <code>tolerations</code> for <code>' + CA_TAINT + '</code> — pods will stay <b>Pending</b> on these nodes.</span>'
              + '<button class="ca-insert" type="button" data-ca-insert>Insert toleration</button></div></div>';
          }
        }
      }
      editor.innerHTML = out;
      if (!state.inserted) {
        editor.querySelector('[data-ca-insert]').addEventListener('click', function () {
          state.inserted = true;
          renderEditor();
          renderFinding();
          setDeploy('');
        });
      }
    }

    function renderFinding() {
      if (!state.inserted) {
        finding.className = 'ca-finding';
        finding.innerHTML =
          '<div class="ca-f-head"><span class="ca-badge">!</span> Pods won\'t schedule</div>'
          + '<div>The target nodes are tainted <code>' + CA_TAINT + '</code>, but this manifest has no matching toleration. '
          + 'After deploy, the scheduler will refuse every GPU node and the pods will stay <b>Pending</b>:</div>'
          + '<div class="ca-event">' + esc(CA_EVENT) + '</div>'
          + '<div>Use <b>Insert toleration</b> in the manifest to add the matching block.</div>'
          + '<div class="ca-src">' + CA_SRC + '</div>';
      } else {
        finding.className = 'ca-finding ca-ok';
        finding.innerHTML =
          '<div class="ca-f-head"><span class="ca-badge">\u2713</span> Pod spec matches the target nodes</div>'
          + '<div>This manifest now tolerates <code>' + CA_TAINT + '</code>, so the scheduler can place these pods on the GPU node group.</div>'
          + '<div class="ca-src">' + CA_SRC + '</div>';
      }
    }

    function setDeploy(mode) {
      if (mode === '') { deployMsg.textContent = ''; return; }
      if (!state.inserted) {
        deployMsg.style.color = '#9c4a34';
        deployMsg.textContent = 'Deploying with 1 recommendation not applied \u2014 pods may not schedule.';
      } else {
        deployMsg.style.color = '#6f8f6a';
        deployMsg.textContent = '\u2713 Ready to deploy \u2014 pod spec matches the target nodes.';
      }
    }

    root.querySelector('.ca-deploy').addEventListener('click', function () { setDeploy('go'); });

    // ---- chat ----
    var assistant = root.querySelector('.ca-assistant');
    root.querySelector('.ca-bar').addEventListener('click', function () {
      assistant.classList.toggle('ca-open');
    });

    var msgs = root.querySelector('.ca-msgs');
    function bubble(cls, html) {
      var b = document.createElement('div');
      b.className = 'ca-bubble ' + cls;
      b.innerHTML = html;
      msgs.appendChild(b);
      msgs.scrollTop = msgs.scrollHeight;
    }
    function respond(userText, recipe) {
      bubble('ca-user', userText);
      bubble('ca-ai',
        'For <b>' + recipe.label + '</b> on this node group, here\'s a safe starting point:'
        + '<ul class="ca-rec">'
        + '<li>Toleration: <b>' + CA_TAINT + '</b></li>'
        + '<li>Node selector: <b>GPU node group</b></li>'
        + '<li>Replicas: <b>' + recipe.replicas + '</b></li>'
        + '</ul>'
        + '<div class="ca-note">' + recipe.note + '</div>'
        + '<button class="ca-apply" type="button" data-ca-replicas="' + recipe.replicas + '">Apply to manifest</button>');
    }

    root.querySelectorAll('.ca-chip').forEach(function (chip) {
      chip.addEventListener('click', function () {
        respond(chip.textContent, CA_RECIPES[chip.getAttribute('data-ca-preset')]);
      });
    });

    var chatText = root.querySelector('.ca-chat-text');
    function send() {
      var text = chatText.value.trim();
      if (!text) return;
      respond(text, CA_RECIPES[matchRecipe(text)]);
      chatText.value = '';
    }
    root.querySelector('.ca-chat-send').addEventListener('click', send);
    chatText.addEventListener('keydown', function (e) { if (e.key === 'Enter') send(); });

    // apply a recommendation to the manifest (inserts toleration + sets replicas)
    msgs.addEventListener('click', function (e) {
      var btn = e.target.closest('.ca-apply');
      if (!btn) return;
      state.replicas = Number(btn.getAttribute('data-ca-replicas'));
      state.inserted = true;
      renderEditor();
      renderFinding();
      setDeploy('');
      btn.textContent = 'Applied \u2713';
      btn.disabled = true;
      root.querySelector('.ca-editor-card').scrollIntoView({ behavior: 'smooth', block: 'center' });
    });

    // initial paint
    renderEditor();
    renderFinding();
  }

  function boot() {
    var roots = document.querySelectorAll('.ca-root');
    for (var i = 0; i < roots.length; i++) {
      if (!roots[i].getAttribute('data-ca-ready')) {
        roots[i].setAttribute('data-ca-ready', '1');
        initRoot(roots[i]);
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
