/* Carrinho da loja Dix — client-side, sem backend nem gateway.
   Finaliza o pedido montando a mensagem no WhatsApp do vendedor (como B2B de saúde faz).
   Compartilhado por plataforma.html e produto.html. Expõe window.Cart. */
(function () {
  const WHATS = '5511943163804';
  const KEY = 'dixcart.v1';
  const brl = n => 'R$ ' + Number(n).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  let itens = [];
  try { itens = JSON.parse(localStorage.getItem(KEY) || '[]'); if (!Array.isArray(itens)) itens = []; } catch (e) { itens = []; }
  const salvar = () => { try { localStorage.setItem(KEY, JSON.stringify(itens)); } catch (e) {} };

  const total = () => itens.reduce((s, i) => s + Number(i.preco) * i.qtd, 0);
  const conta = () => itens.reduce((s, i) => s + i.qtd, 0);

  function acharNoCatalogo(slug) {
    const cat = window.__CATALOGO || [];
    return cat.find(p => p.p === slug) || null;
  }

  const Cart = {
    add(slug) {
      const p = acharNoCatalogo(slug); if (!p) return;
      this.addItem(p);
    },
    addItem(p) {
      if (!(Number(p.preco) > 0)) { this.consultItem(p); return; }
      const ex = itens.find(i => i.p === p.p);
      if (ex) ex.qtd++; else itens.push({ p: p.p, nome: p.nome, preco: Number(p.preco), img: p.img || '', qtd: 1 });
      salvar(); render(); toast(`Adicionado: ${p.nome}`); abrir();
    },
    consult(slug) { const p = acharNoCatalogo(slug); if (p) this.consultItem(p); },
    consultItem(p) {
      const msg = `Olá! Tenho interesse neste item da plataforma Dix:%0A%0A• ${enc(p.nome)}%0A%0APode me passar condições e prazo?`;
      window.open(`https://wa.me/${WHATS}?text=${msg}`, '_blank', 'noopener');
    },
    setQty(slug, q) { const i = itens.find(x => x.p === slug); if (!i) return; i.qtd = Math.max(1, q); salvar(); render(); },
    remove(slug) { itens = itens.filter(x => x.p !== slug); salvar(); render(); },
    limpar() { itens = []; salvar(); render(); },
    checkout() {
      if (!itens.length) return;
      let m = 'Olá! Quero fazer um pedido na plataforma Dix:%0A%0A';
      itens.forEach(i => { m += `• ${i.qtd}× ${enc(i.nome)} — ${enc(brl(i.preco * i.qtd))}%0A`; });
      m += `%0ATotal: ${enc(brl(total()))}%0A%0APode confirmar disponibilidade e forma de pagamento?`;
      window.open(`https://wa.me/${WHATS}?text=${m}`, '_blank', 'noopener');
    },
    abrir: () => abrir(), fechar: () => fechar(),
    conta, total
  };
  const enc = s => encodeURIComponent(String(s)).replace(/%20/g, '%20');

  // ---- UI ----
  const css = `
    .dc-fab{position:fixed;right:22px;bottom:92px;z-index:70;width:56px;height:56px;border-radius:50%;
      background:var(--primary,#01376B);color:#fff;border:0;cursor:pointer;box-shadow:0 12px 28px -8px rgba(1,55,107,.6);
      display:flex;align-items:center;justify-content:center;transition:transform .12s}
    .dc-fab:hover{transform:scale(1.06)} .dc-fab.hide{display:none}
    .dc-badge{position:absolute;top:-4px;right:-4px;min-width:20px;height:20px;padding:0 5px;border-radius:999px;
      background:#3DC04E;color:#fff;font:700 12px/20px "IBM Plex Sans",sans-serif;text-align:center;box-shadow:0 0 0 2px var(--bg,#fff)}
    .dc-ov{position:fixed;inset:0;background:rgba(6,16,28,.5);z-index:80;opacity:0;pointer-events:none;transition:opacity .2s}
    .dc-ov.on{opacity:1;pointer-events:auto}
    .dc-draw{position:fixed;top:0;right:0;height:100%;width:min(410px,92vw);z-index:81;background:var(--surface,#fff);
      color:var(--ink,#0E1B2A);box-shadow:-16px 0 40px rgba(6,16,28,.25);transform:translateX(100%);transition:transform .24s;
      display:flex;flex-direction:column;font-family:"IBM Plex Sans",system-ui,sans-serif}
    .dc-draw.on{transform:none}
    .dc-hd{display:flex;align-items:center;justify-content:space-between;padding:1.1rem 1.2rem;border-bottom:1px solid var(--line,#E2E9F1)}
    .dc-hd h3{font-family:Archivo,sans-serif;font-weight:800;font-size:1.15rem;margin:0}
    .dc-x{border:0;background:none;font-size:1.5rem;line-height:1;cursor:pointer;color:var(--ink-soft,#4A5A6B)}
    .dc-body{flex:1;overflow:auto;padding:.6rem 1.2rem}
    .dc-empty{color:var(--ink-faint,#8494A6);text-align:center;padding:3rem 1rem;font-size:.95rem}
    .dc-it{display:flex;gap:.8rem;padding:.9rem 0;border-bottom:1px solid var(--line-soft,#EEF2F7)}
    .dc-it .im{flex:0 0 auto;width:56px;height:56px;border-radius:10px;background:#fff center/contain no-repeat;border:1px solid var(--line,#E2E9F1)}
    .dc-it .nm{font-size:.88rem;font-weight:600;line-height:1.3}
    .dc-it .pr{font-size:.82rem;color:var(--ink-soft,#4A5A6B);margin-top:.15rem}
    .dc-qt{display:inline-flex;align-items:center;gap:.5rem;margin-top:.4rem}
    .dc-qt button{width:24px;height:24px;border:1px solid var(--line,#E2E9F1);background:var(--surface,#fff);border-radius:6px;cursor:pointer;font-size:1rem;line-height:1;color:var(--ink,#0E1B2A)}
    .dc-qt .rm{margin-left:.6rem;border:0;background:none;color:#C0392B;font-size:.78rem;cursor:pointer}
    .dc-ft{border-top:1px solid var(--line,#E2E9F1);padding:1.1rem 1.2rem;background:var(--surface,#fff)}
    .dc-tot{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:.5rem}
    .dc-tot b{font-family:Archivo;font-weight:800;font-size:1.3rem}
    .dc-note{font-size:.75rem;color:var(--ink-faint,#8494A6);margin:.1rem 0 .9rem}
    .dc-go{width:100%;border:0;border-radius:12px;padding:.9rem;background:#25D366;color:#fff;font:700 1rem "IBM Plex Sans",sans-serif;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:.5rem}
    .dc-go:hover{filter:brightness(.96)}
    .dc-toast{position:fixed;left:50%;bottom:26px;transform:translateX(-50%) translateY(20px);z-index:90;background:var(--ink,#0E1B2A);color:#fff;
      padding:.7rem 1.1rem;border-radius:10px;font-size:.88rem;opacity:0;transition:opacity .2s,transform .2s;box-shadow:0 10px 30px rgba(0,0,0,.3);max-width:80vw}
    .dc-toast.on{opacity:1;transform:translateX(-50%) translateY(0)}
  `;

  let fab, badge, ov, draw, body, footWrap, toastEl;
  function montar() {
    const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

    fab = document.createElement('button'); fab.className = 'dc-fab hide'; fab.setAttribute('aria-label', 'Carrinho');
    fab.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/><path d="M2 3h3l2.4 12.3a1 1 0 001 .8h9.2a1 1 0 001-.8L21 7H6"/></svg><span class="dc-badge" style="display:none">0</span>`;
    badge = fab.querySelector('.dc-badge');
    fab.addEventListener('click', abrir);
    document.body.appendChild(fab);

    ov = document.createElement('div'); ov.className = 'dc-ov'; ov.addEventListener('click', fechar); document.body.appendChild(ov);

    draw = document.createElement('aside'); draw.className = 'dc-draw'; draw.setAttribute('role', 'dialog'); draw.setAttribute('aria-label', 'Carrinho');
    draw.innerHTML = `<div class="dc-hd"><h3>Seu pedido</h3><button class="dc-x" aria-label="Fechar">×</button></div>
      <div class="dc-body"></div>
      <div class="dc-ft-wrap"></div>`;
    draw.querySelector('.dc-x').addEventListener('click', fechar);
    body = draw.querySelector('.dc-body'); footWrap = draw.querySelector('.dc-ft-wrap');
    document.body.appendChild(draw);

    toastEl = document.createElement('div'); toastEl.className = 'dc-toast'; document.body.appendChild(toastEl);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') fechar(); });
    render();
    if (location.hash === '#cart' && itens.length) abrir();
  }

  function abrir() { render(); ov.classList.add('on'); draw.classList.add('on'); }
  function fechar() { ov.classList.remove('on'); draw.classList.remove('on'); }

  let toastT;
  function toast(msg) { if (!toastEl) return; toastEl.textContent = msg; toastEl.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove('on'), 2200); }

  function render() {
    if (!fab) return;
    const n = conta();
    badge.textContent = n; badge.style.display = n ? '' : 'none';
    fab.classList.toggle('hide', n === 0);

    if (!itens.length) {
      body.innerHTML = `<div class="dc-empty">Seu pedido está vazio.<br>Adicione produtos e finalize pelo WhatsApp.</div>`;
      footWrap.innerHTML = ''; return;
    }
    body.innerHTML = itens.map(i => `
      <div class="dc-it">
        <div class="im" style="background-image:url('${i.img}')"></div>
        <div style="flex:1">
          <div class="nm">${i.nome}</div>
          <div class="pr">${brl(i.preco)} cada</div>
          <div class="dc-qt">
            <button data-a="menos" data-p="${i.p}" aria-label="menos">−</button>
            <span>${i.qtd}</span>
            <button data-a="mais" data-p="${i.p}" aria-label="mais">+</button>
            <button class="rm" data-a="rm" data-p="${i.p}">remover</button>
          </div>
        </div>
        <div class="pr" style="font-weight:700;white-space:nowrap">${brl(i.preco * i.qtd)}</div>
      </div>`).join('');
    body.querySelectorAll('button[data-a]').forEach(b => b.addEventListener('click', () => {
      const slug = b.dataset.p, it = itens.find(x => x.p === slug); if (!it) return;
      if (b.dataset.a === 'mais') Cart.setQty(slug, it.qtd + 1);
      else if (b.dataset.a === 'menos') Cart.setQty(slug, it.qtd - 1);
      else Cart.remove(slug);
    }));
    footWrap.innerHTML = `<div class="dc-ft">
      <div class="dc-tot"><span>Total</span><b>${brl(total())}</b></div>
      <div class="dc-note">Você finaliza pelo WhatsApp com o vendedor — ele confirma disponibilidade e forma de pagamento. Nada é cobrado agora.</div>
      <button class="dc-go" id="dc-go"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 00-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1012 2z"/></svg> Finalizar pelo WhatsApp</button>
    </div>`;
    footWrap.querySelector('#dc-go').addEventListener('click', () => Cart.checkout());
  }

  window.Cart = Cart;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', montar); else montar();
})();
