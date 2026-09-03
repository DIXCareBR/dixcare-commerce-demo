/* Conta leve do cliente — client-side, sem backend.
   Guarda o perfil (nome, WhatsApp, clínica, CNPJ) e o histórico de pedidos no navegador.
   O carrinho (cart.js) inclui esses dados no pedido do WhatsApp e registra o pedido aqui.
   Expõe window.Cliente. */
(function () {
  const KEY = 'dixcliente.v1', PED = 'dixpedidos.v1';
  const soDig = s => (s || '').replace(/\D/g, '');
  const get = () => { try { return JSON.parse(localStorage.getItem(KEY)) || null; } catch (e) { return null; } };
  const setP = p => { try { localStorage.setItem(KEY, JSON.stringify(p)); } catch (e) {} };
  const pedidos = () => { try { return JSON.parse(localStorage.getItem(PED)) || []; } catch (e) { return []; } };
  const brl = n => 'R$ ' + Number(n || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const primeiro = n => {
    const toks = (n || '').trim().split(/\s+/).filter(Boolean);
    const titulo = /^(dr|dra|sr|sra|srta|prof|profa)\.?$/i;
    return toks.find(t => !titulo.test(t)) || toks[0] || '';
  };

  window.Cliente = {
    perfil: get,
    salvar: setP,
    pedidos,
    registrarPedido(o) {
      const l = pedidos(); l.unshift(Object.assign({ data: new Date().toISOString() }, o));
      try { localStorage.setItem(PED, JSON.stringify(l.slice(0, 50))); } catch (e) {}
    },
    // texto do cliente pra colar no pedido do WhatsApp
    blocoPedido() {
      const p = get(); if (!p) return '';
      let b = `Cliente: ${p.nome}`;
      if (p.clinica) b += `%0AClínica: ${p.clinica}`;
      if (p.cnpj) b += `%0ACNPJ: ${p.cnpj}`;
      if (p.whatsapp) b += `%0AWhatsApp: ${p.whatsapp}`;
      if (p.email) b += `%0AE-mail: ${p.email}`;
      return b + '%0A%0A';
    },
    abrir: () => abrir(),
    logado: () => !!get()
  };

  // ---------- UI ----------
  const css = `
    .cl-ov{position:fixed;inset:0;background:rgba(9,18,30,.5);z-index:120;opacity:0;pointer-events:none;transition:opacity .2s}
    .cl-ov.on{opacity:1;pointer-events:auto}
    .cl-modal{position:fixed;top:50%;left:50%;transform:translate(-50%,-46%);z-index:121;width:min(420px,94vw);max-height:90vh;overflow:auto;
      background:var(--surface,#fff);color:var(--ink,#16222F);border:1px solid var(--line,#E6ECF4);border-radius:16px;
      box-shadow:0 30px 70px -25px rgba(9,18,30,.5);opacity:0;pointer-events:none;transition:opacity .2s,transform .2s;
      font-family:"IBM Plex Sans",system-ui,sans-serif}
    .cl-modal.on{opacity:1;pointer-events:auto;transform:translate(-50%,-50%)}
    .cl-hd{display:flex;align-items:center;justify-content:space-between;padding:1.1rem 1.3rem;border-bottom:1px solid var(--line,#E6ECF4)}
    .cl-hd h3{font-family:Archivo,sans-serif;font-weight:800;font-size:1.2rem;margin:0}
    .cl-x{border:0;background:none;font-size:1.5rem;line-height:1;cursor:pointer;color:var(--ink-soft,#51627A)}
    .cl-bd{padding:1.2rem 1.3rem}
    .cl-bd p.sub{margin:0 0 1rem;color:var(--ink-soft,#51627A);font-size:.9rem}
    .cl-f{display:flex;flex-direction:column;gap:.7rem}
    .cl-f label{font-size:.78rem;font-weight:600;color:var(--ink-soft,#51627A);margin-bottom:.2rem;display:block}
    .cl-f input{width:100%;border:1px solid var(--line,#E6ECF4);border-radius:9px;padding:.6rem .7rem;font:inherit;background:var(--bg,#F5F8FC);color:var(--ink,#16222F)}
    .cl-f .req{color:var(--sale,#E0393B)}
    .cl-go{width:100%;border:0;border-radius:11px;padding:.8rem;background:var(--accent,#3DC04E);color:#fff;font:inherit;font-weight:700;cursor:pointer;margin-top:.4rem}
    .cl-go:hover{filter:brightness(.97)}
    .cl-erro{color:var(--sale,#E0393B);font-size:.82rem;min-height:1rem;margin:.1rem 0 0}
    .cl-nota{font-size:.75rem;color:var(--ink-faint,#8593A4);margin-top:.7rem;line-height:1.5}
    .cl-ola{font-family:Archivo,sans-serif;font-weight:800;font-size:1.25rem;margin:0 0 .1rem}
    .cl-meta{color:var(--ink-soft,#51627A);font-size:.9rem;margin:0 0 1rem}
    .cl-linha{display:flex;gap:.6rem;margin:.2rem 0 1rem}
    .cl-linha button{flex:1;border:1px solid var(--line,#E6ECF4);background:var(--surface,#fff);color:var(--ink,#16222F);border-radius:9px;padding:.55rem;font:inherit;font-weight:600;cursor:pointer}
    .cl-linha button.sair{color:var(--sale,#E0393B)}
    .cl-ped h4{font-family:Archivo,sans-serif;font-size:.95rem;margin:0 0 .5rem}
    .cl-ped-vazio{color:var(--ink-faint,#8593A4);font-size:.88rem;background:var(--bg,#F5F8FC);border:1px dashed var(--line,#E6ECF4);border-radius:11px;padding:1rem;text-align:center}
    .cl-ped-item{border:1px solid var(--line,#E6ECF4);border-radius:11px;padding:.7rem .85rem;margin-bottom:.55rem}
    .cl-ped-item .top{display:flex;justify-content:space-between;font-size:.82rem;color:var(--ink-soft,#51627A)}
    .cl-ped-item .tot{font-family:Archivo;font-weight:800}
    .cl-ped-item .re{border:0;background:none;color:var(--primary-2,#0A5AA8);font-weight:600;font-size:.8rem;cursor:pointer;padding:.3rem 0 0;margin-top:.2rem}
    .cl-badge{cursor:pointer}
  `;

  let ov, modal, body;
  function montar() {
    const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    ov = document.createElement('div'); ov.className = 'cl-ov'; ov.addEventListener('click', fechar); document.body.appendChild(ov);
    modal = document.createElement('div'); modal.className = 'cl-modal'; modal.setAttribute('role', 'dialog'); modal.setAttribute('aria-label', 'Minha conta');
    document.body.appendChild(modal);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') fechar(); });
    // liga gatilhos [data-conta]
    document.querySelectorAll('[data-conta]').forEach(el => el.addEventListener('click', e => { e.preventDefault(); abrir(); }));
    atualizarSaudacao();
    if (location.hash === '#conta' || /[?&]conta=1/.test(location.search)) setTimeout(abrir, 60);
  }
  function atualizarSaudacao() {
    const p = get();
    document.querySelectorAll('[data-conta]').forEach(el => {
      if (!el.dataset.contaLabel) el.dataset.contaLabel = el.textContent;
      el.textContent = p ? ('Olá, ' + primeiro(p.nome)) : el.dataset.contaLabel;
    });
  }
  function abrir() { render(); ov.classList.add('on'); modal.classList.add('on'); }
  function fechar() { ov.classList.remove('on'); modal.classList.remove('on'); }

  function render() {
    const p = get();
    modal.innerHTML = `<div class="cl-hd"><h3>${p ? 'Minha conta' : 'Entrar / criar conta'}</h3><button class="cl-x" aria-label="Fechar">×</button></div><div class="cl-bd"></div>`;
    modal.querySelector('.cl-x').addEventListener('click', fechar);
    body = modal.querySelector('.cl-bd');
    if (p) renderConta(p); else renderForm();
  }

  function renderForm(dados) {
    dados = dados || {};
    body.innerHTML = `
      <p class="sub">Identifique-se uma vez. Seus pedidos passam a sair já com seus dados, e você acompanha o histórico aqui. Nada é cobrado.</p>
      <div class="cl-f">
        <div><label>Seu nome <span class="req">*</span></label><input id="cl-nome" value="${esc(dados.nome)}" placeholder="Nome e sobrenome"></div>
        <div><label>WhatsApp <span class="req">*</span></label><input id="cl-wa" inputmode="tel" value="${esc(dados.whatsapp)}" placeholder="(11) 90000-0000"></div>
        <div><label>Clínica / empresa</label><input id="cl-clin" value="${esc(dados.clinica)}" placeholder="Nome da clínica (opcional)"></div>
        <div class="row" style="display:flex;gap:.6rem">
          <div style="flex:1"><label>CNPJ</label><input id="cl-cnpj" inputmode="numeric" value="${esc(dados.cnpj)}" placeholder="Opcional"></div>
          <div style="flex:1"><label>E-mail</label><input id="cl-mail" type="email" value="${esc(dados.email)}" placeholder="Opcional"></div>
        </div>
        <div class="cl-erro" id="cl-erro"></div>
        <button class="cl-go" id="cl-salvar">Salvar e continuar</button>
      </div>
      <p class="cl-nota">Fica só neste navegador (é uma conta leve de demonstração). No site definitivo vira login de verdade com "meus pedidos" no servidor.</p>`;
    body.querySelector('#cl-salvar').addEventListener('click', () => {
      const nome = val('cl-nome'), wa = val('cl-wa');
      const err = body.querySelector('#cl-erro');
      if (nome.length < 2) { err.textContent = 'Escreva seu nome.'; return; }
      if (soDig(wa).length < 10) { err.textContent = 'Escreva um WhatsApp válido com DDD.'; return; }
      setP({ nome, whatsapp: wa, clinica: val('cl-clin'), cnpj: val('cl-cnpj'), email: val('cl-mail') });
      atualizarSaudacao(); render();
    });
  }

  function renderConta(p) {
    const peds = pedidos();
    body.innerHTML = `
      <p class="cl-ola">Olá, ${esc(primeiro(p.nome))} 👋</p>
      <p class="cl-meta">${esc(p.clinica || 'Cliente')}${p.cnpj ? ' · CNPJ ' + esc(p.cnpj) : ''}<br>${esc(p.whatsapp)}${p.email ? ' · ' + esc(p.email) : ''}</p>
      <div class="cl-linha"><button id="cl-edit">Editar dados</button><button class="sair" id="cl-sair">Sair</button></div>
      <div class="cl-ped">
        <h4>Meus pedidos ${peds.length ? '(' + peds.length + ')' : ''}</h4>
        ${peds.length ? peds.map(pedItem).join('') : '<div class="cl-ped-vazio">Você ainda não fez pedidos. Monte o carrinho e finalize pelo WhatsApp — eles aparecem aqui.</div>'}
      </div>`;
    body.querySelector('#cl-edit').addEventListener('click', () => renderForm(p));
    body.querySelector('#cl-sair').addEventListener('click', () => { if (confirm('Sair da conta neste navegador?')) { try { localStorage.removeItem(KEY); } catch (e) {} atualizarSaudacao(); render(); } });
    body.querySelectorAll('.re').forEach((b, i) => b.addEventListener('click', () => reenviar(peds[i])));
  }

  function pedItem(o) {
    const d = new Date(o.data); const data = isNaN(d) ? '' : d.toLocaleDateString('pt-BR');
    const n = (o.itens || []).reduce((s, i) => s + (i.qtd || 1), 0);
    return `<div class="cl-ped-item"><div class="top"><span>${data} · ${n} item(ns)</span><span class="tot">${brl(o.total)}</span></div><button class="re">Reenviar no WhatsApp →</button></div>`;
  }
  function reenviar(o) {
    let m = window.Cliente.blocoPedido() + 'Olá! Quero repetir este pedido:%0A%0A';
    (o.itens || []).forEach(i => { m += `• ${i.qtd || 1}× ${enc(i.nome)} — ${enc(brl((i.preco || 0) * (i.qtd || 1)))}%0A`; });
    m += `%0ATotal: ${enc(brl(o.total))}%0A%0APode confirmar?`;
    window.open('https://wa.me/5511943163804?text=' + m, '_blank', 'noopener');
  }

  const val = id => (body.querySelector('#' + id) || {}).value?.trim() || '';
  const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
  const enc = s => encodeURIComponent(String(s));

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', montar); else montar();
})();
