/**
 * 管理员编辑模式
 *
 * 说明：GitHub Pages 是纯静态托管，没有后端服务器，因此这里的登录只是
 * 前端的“便捷开关”，用于让你在浏览器里直接修改文案并导出。它无法阻止
 * 懂技术的人查看源码，所以不要在此存放任何敏感信息。
 *
 * 编辑后的内容保存在你自己浏览器的 localStorage 中（仅本机可见）。
 * 若要让改动对所有访客生效，请点击“导出 HTML”，把文件替换到仓库后推送。
 */
(function () {
  'use strict';

  var USERNAME = 'zzy420328';
  // 密码的 SHA-256 摘要（默认密码：Zzy@2026）
  var PASSWORD_HASH =
    '96bd90941688aa3dcce074f082e2cab0bc512ccaceab3d5ecc94028600ae79df';

  var PAGE_KEY = 'zzy-site-edits:' + location.pathname;
  var SESSION_KEY = 'zzy-site-admin';

  var isAdmin = sessionStorage.getItem(SESSION_KEY) === '1';
  var editing = false;

  function sha256(text) {
    var data = new TextEncoder().encode(text);
    return crypto.subtle.digest('SHA-256', data).then(function (buf) {
      return Array.prototype.map
        .call(new Uint8Array(buf), function (b) {
          return b.toString(16).padStart(2, '0');
        })
        .join('');
    });
  }

  function editableNodes() {
    return Array.prototype.slice.call(document.querySelectorAll('[data-edit]'));
  }

  function nodeKey(node, index) {
    return index + ':' + node.tagName;
  }

  function applySavedEdits() {
    var raw = localStorage.getItem(PAGE_KEY);
    if (!raw) return;
    var saved;
    try {
      saved = JSON.parse(raw);
    } catch (e) {
      return;
    }
    editableNodes().forEach(function (node, i) {
      var key = nodeKey(node, i);
      if (Object.prototype.hasOwnProperty.call(saved, key)) {
        node.textContent = saved[key];
      }
    });
  }

  function saveEdits() {
    var payload = {};
    editableNodes().forEach(function (node, i) {
      payload[nodeKey(node, i)] = node.textContent.trim();
    });
    localStorage.setItem(PAGE_KEY, JSON.stringify(payload));
  }

  function setEditing(on) {
    editing = on;
    editableNodes().forEach(function (node) {
      node.contentEditable = on ? 'true' : 'false';
      node.classList.toggle('is-editing', on);
    });
    document.body.classList.toggle('editing-mode', on);
    if (toggleBtn) toggleBtn.textContent = on ? '完成编辑' : '开始编辑';
    if (saveBtn) saveBtn.hidden = !on;
    if (resetBtn) resetBtn.hidden = !on;
    if (exportBtn) exportBtn.hidden = !on;
  }

  function exportHtml() {
    var clone = document.documentElement.cloneNode(true);
    clone.querySelectorAll('[contenteditable]').forEach(function (n) {
      n.removeAttribute('contenteditable');
      n.classList.remove('is-editing');
    });
    var bar = clone.querySelector('.admin-bar');
    if (bar) bar.remove();
    clone.querySelector('body').classList.remove('editing-mode');

    var html = '<!DOCTYPE html>\n' + clone.outerHTML;
    var blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = location.pathname.split('/').pop() || 'index.html';
    a.click();
    URL.revokeObjectURL(a.href);
  }

  var bar, toggleBtn, saveBtn, resetBtn, exportBtn;

  function buildBar() {
    bar = document.createElement('div');
    bar.className = 'admin-bar';

    var label = document.createElement('span');
    label.className = 'admin-label';
    label.textContent = '管理员模式';
    bar.appendChild(label);

    toggleBtn = document.createElement('button');
    toggleBtn.type = 'button';
    toggleBtn.textContent = '开始编辑';
    toggleBtn.addEventListener('click', function () {
      setEditing(!editing);
    });
    bar.appendChild(toggleBtn);

    saveBtn = document.createElement('button');
    saveBtn.type = 'button';
    saveBtn.textContent = '保存到本机';
    saveBtn.hidden = true;
    saveBtn.addEventListener('click', function () {
      saveEdits();
      saveBtn.textContent = '已保存';
      setTimeout(function () {
        saveBtn.textContent = '保存到本机';
      }, 1500);
    });
    bar.appendChild(saveBtn);

    exportBtn = document.createElement('button');
    exportBtn.type = 'button';
    exportBtn.textContent = '导出 HTML';
    exportBtn.hidden = true;
    exportBtn.addEventListener('click', exportHtml);
    bar.appendChild(exportBtn);

    resetBtn = document.createElement('button');
    resetBtn.type = 'button';
    resetBtn.className = 'ghost';
    resetBtn.textContent = '还原';
    resetBtn.hidden = true;
    resetBtn.addEventListener('click', function () {
      localStorage.removeItem(PAGE_KEY);
      location.reload();
    });
    bar.appendChild(resetBtn);

    var outBtn = document.createElement('button');
    outBtn.type = 'button';
    outBtn.className = 'ghost';
    outBtn.textContent = '退出';
    outBtn.addEventListener('click', function () {
      sessionStorage.removeItem(SESSION_KEY);
      location.reload();
    });
    bar.appendChild(outBtn);

    document.body.appendChild(bar);
  }

  function promptLogin() {
    var user = window.prompt('管理员账号');
    if (user === null) return;
    var pass = window.prompt('管理员密码');
    if (pass === null) return;

    sha256(pass).then(function (hash) {
      if (user === USERNAME && hash === PASSWORD_HASH) {
        sessionStorage.setItem(SESSION_KEY, '1');
        location.reload();
      } else {
        window.alert('账号或密码不正确');
      }
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.altKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
      e.preventDefault();
      if (isAdmin) {
        sessionStorage.removeItem(SESSION_KEY);
        location.reload();
      } else {
        promptLogin();
      }
    }
  });

  applySavedEdits();
  if (isAdmin) buildBar();
})();
