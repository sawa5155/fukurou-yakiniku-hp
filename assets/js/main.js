/* ==========================================================================
   焼肉 福朗 — main.js
   1. モバイル／PC のドロワー（ハンバーガー）
   1-2. ご予約モーダル（店舗の選択）
   2. オープニング（初回・リロード時の黒幕とロゴ）
   3. スクロール表示アニメーション
   4. 現在地ナビハイライト
   5. ヒーローの背景動画（回線・動きの設定を見て読み込み）
   6. ヒーロー写真の固定レイヤーの後始末
   7. お問い合わせフォームのバリデーション／送信
   8. 西暦の自動更新

   ※ ヘッダーは常に透明。スクロールによる背景色の付与は行いません。
   ※ ヒーロー写真の固定と暗転、空間セクションの固定背景の帯は
     いずれも CSS のみで実現しています（JS は関与しません）。
   ========================================================================== */
(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));


  /* ----------------------------------------------------------------------
     1. ドロワー（PC・モバイル共通）
     ---------------------------------------------------------------------- */
  const toggle = $('#navToggle');
  const gnav   = $('#gnav');

  if (toggle && gnav) {
    const setNav = (open) => {
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
      gnav.classList.toggle('is-open', open);
      document.body.classList.toggle('is-locked', open);
    };

    toggle.addEventListener('click', () => {
      setNav(toggle.getAttribute('aria-expanded') !== 'true');
    });

    // ナビ内リンクをタップしたら閉じる。
    // パネルは右端だけなので、その外（背面の幕）を押したときも閉じる。
    gnav.addEventListener('click', (e) => {
      if (e.target.closest('a') || !e.target.closest('.gnav__inner')) setNav(false);
    });

    // Esc で閉じる
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setNav(false);
        toggle.focus();
      }
    });

    // ドロワーは PC・モバイルとも同じ右側パネルなので、幅変更によるリセットは行わない。
    // 代わりに、開いている間はドロワー内にフォーカスを閉じ込める。
    const FOCUSABLE = 'a[href], button:not([disabled]), input, select, textarea';
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab' || toggle.getAttribute('aria-expanded') !== 'true') return;
      const items = [toggle, ...gnav.querySelectorAll(FOCUSABLE)]
        .filter((el) => el.offsetParent !== null);
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    });
  }


  /* ----------------------------------------------------------------------
     1-2. ご予約モーダル（店舗の選択）
     ----------------------------------------------------------------------
     ご予約への入り口は 2 か所（画面左下のレールと、ドロワーの中のボタン）。
     どちらも素の状態では食べログへのリンクで、JS があるときだけ
     クリックを横取りして店舗選択のモーダルを開く。
     こうしておくと JS が落ちても予約導線は死なない。
     入り口は data-reserve-open で見分けるので、増やすときは属性を付けるだけ。
     修飾キー付き・中クリックは「別タブで開く」意図なので横取りしない。 */
  const reserveRail    = $('#reserveRail');
  const reserveOpeners = $$('[data-reserve-open]');
  const reserveModal   = $('#reserveModal');

  if (reserveOpeners.length && reserveModal) {
    const reserveClose = $('.reserve-modal__close', reserveModal);
    const RESERVE_FOCUSABLE = 'a[href], button:not([disabled])';

    // 閉じたあとの戻り先。最後に押した入り口を覚えておく。
    let reserveOpener = reserveRail || reserveOpeners[0];

    const setReserve = (open) => {
      const wasInside = reserveModal.contains(document.activeElement);

      reserveModal.classList.toggle('is-open', open);
      reserveModal.setAttribute('aria-hidden', String(!open));
      reserveOpeners.forEach((el) => el.setAttribute('aria-expanded', String(open)));
      document.body.classList.toggle('is-reserve-open', open);

      if (open) {
        // 画面が低いとカードが収まらずスクロールできる状態で開く。
        // × は最後にあるので、そのままフォーカスすると下端まで送られてしまう。
        reserveModal.scrollTop = 0;
        if (reserveClose) reserveClose.focus({ preventScroll: true });
      } else if (wasInside || document.activeElement === document.body) {
        // 閉じたあとの行き先は必ず開いた場所（＝ご予約）に戻す。
        // ドロワー内のボタンから開いた場合、閉じる頃にはドロワーも
        // 閉じていてフォーカスを受け取れないので、レールに逃がす。
        const back = reserveOpener.getClientRects().length ? reserveOpener : reserveRail;
        if (back) back.focus();
      }
    };

    reserveOpeners.forEach((opener) => {
      opener.addEventListener('click', (e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        e.preventDefault();
        reserveOpener = opener;
        setReserve(true);
      });
    });

    // 幕と × で閉じる（カード内の予約リンク・電話は別タブ／発信なので閉じない）
    reserveModal.addEventListener('click', (e) => {
      if (e.target.closest('[data-reserve-close]')) setReserve(false);
    });

    document.addEventListener('keydown', (e) => {
      if (!reserveModal.classList.contains('is-open')) return;

      if (e.key === 'Escape') { setReserve(false); return; }

      // 開いている間はモーダル内にフォーカスを閉じ込める。
      // 表示判定に offsetParent は使えない（× は position: fixed のため
      // 常に null になり、輪から漏れる）。描画矩形の有無で見る。
      if (e.key !== 'Tab') return;
      const items = $$(RESERVE_FOCUSABLE, reserveModal)
        .filter((el) => el.getClientRects().length > 0);
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    });
  }


  /* ----------------------------------------------------------------------
     2. オープニング（初回・リロード時の黒幕とロゴ）
     ----------------------------------------------------------------------
     黒幕とロゴの動きは CSS アニメーションだけで完結しています
     （JS が落ちても forwards で必ず消えます）。ここでやるのは2点だけ。

       ・演出中はスクロールを止める
       ・黒幕が抜けきってから、ヒーローの見出しとレールを出す
         （黒幕の裏で先に出てしまうと「ファーストビューがフェードイン」に
          ならず、幕が上がった瞬間に完成した状態で現れてしまう）

     終了の合図は animationend。取りこぼすと黒幕の裏で固まるため、
     尺 + 余裕のタイマーでも同じ後始末を呼ぶ二重の作りにしています。 */
  const opening = $('#opening');
  const openingDone = [];
  let openingFinished = false;

  const finishOpening = () => {
    if (openingFinished) return;
    openingFinished = true;
    document.body.classList.remove('is-opening');
    openingDone.forEach((fn) => fn());
  };

  const openingActive =
    Boolean(opening) && !reduceMotion &&
    getComputedStyle(opening).display !== 'none';

  if (openingActive) {
    document.body.classList.add('is-opening');

    // CSS の --opening-total を読み、保険のタイマーに使う
    const raw = getComputedStyle(document.documentElement)
      .getPropertyValue('--opening-total').trim();
    const total = /ms$/.test(raw) ? parseFloat(raw)
                : /s$/.test(raw) ? parseFloat(raw) * 1000
                : 2900;

    // animationend は子（ロゴ）からも伝播してくるので、黒幕自身の分だけ拾う
    opening.addEventListener('animationend', (e) => {
      if (e.target === opening) finishOpening();
    });
    window.setTimeout(finishOpening, (Number.isFinite(total) ? total : 2900) + 400);
  } else {
    finishOpening();
  }


  /* ----------------------------------------------------------------------
     3. スクロール表示アニメーション
     ---------------------------------------------------------------------- */
  const revealTargets = $$('[data-reveal]');

  revealTargets.forEach((el) => {
    const d = el.dataset.revealDelay;
    if (d) el.style.setProperty('--reveal-delay', d);
  });

  // ヒーロー内の要素はオープニングが明けてから出す。
  // 「徳島｜焼肉」（.hero__rail）は追従させるため body 直下に出してあるが、
  // 見え方はファーストビューの一部なので、同じ扱いにする。
  const isHeroReveal = (el) => Boolean(el.closest('.hero')) || el.matches('.hero__rail');

  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealTargets.forEach((el) => el.classList.add('is-in'));
  } else {
    const show = (el) => {
      if (isHeroReveal(el) && !openingFinished) {
        openingDone.push(() => el.classList.add('is-in'));
        return;
      }
      el.classList.add('is-in');
    };

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        show(entry.target);
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.06 });

    /* 画面の隅に置いたレール（ご予約・産地）は交差判定に載せない。

       いずれも最初から画面内にいるので観測する意味が無いうえ、
       下端に寄せてあるぶん rootMargin の除外帯（画面下 12%）に丸ごと
       入ってしまうことがあり、そうなると永久に is-in が付かず
       透明のままになる（＝ボタンが消えたように見える）。
       出るタイミングは show() に任せる（ヒーロー内はオープニング明け）。 */
    const isCornerRail = (el) => el.matches('.reserve-rail, .hero__rail');

    revealTargets.forEach((el) => {
      if (isCornerRail(el)) show(el);
      else io.observe(el);
    });

    /* ページ最下部の要素を取りこぼさないための保険。

       rootMargin の下端インセット（-12%）のぶん、画面下端の約12%は
       「見えた」と判定されない。ところが文書の末尾にある要素は、
       最後までスクロールしてもその帯から出られないため、
       高さが下端インセットを超えない限り交差率 threshold に届かず、
       永久に is-in が付かない（＝ずっと透明のまま）。
       フッター下段のような低い要素がこれに当たる。

       そこで最下部まで来たら、残っている要素は無条件で出す。 */
    const revealTail = () => {
      const doc = document.documentElement;
      if (window.scrollY + window.innerHeight < doc.scrollHeight - 4) return;
      revealTargets.forEach((el) => {
        if (el.classList.contains('is-in')) return;
        show(el);
        io.unobserve(el);
      });
    };
    window.addEventListener('scroll', revealTail, { passive: true });
    window.addEventListener('resize', revealTail);
    revealTail();
  }


  /* ----------------------------------------------------------------------
     4. 現在地ナビハイライト
     ---------------------------------------------------------------------- */
  const navLinks = $$('[data-navlink]');

  if (navLinks.length && 'IntersectionObserver' in window) {
    const map = new Map();
    navLinks.forEach((link) => {
      const target = document.getElementById(link.hash.slice(1));
      if (target) map.set(target, link);
    });

    const visible = new Set();

    const paint = () => {
      // 画面内にあるセクションのうち最も上のものを現在地とする
      const top = Array.from(visible).sort(
        (a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top
      )[0];
      navLinks.forEach((l) => l.classList.remove('is-active'));
      if (top && map.has(top)) map.get(top).classList.add('is-active');
    };

    const spy = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) visible.add(e.target);
        else visible.delete(e.target);
      });
      paint();
    }, { rootMargin: '-45% 0px -45% 0px' });

    map.forEach((_, section) => spy.observe(section));
  }


  /* ----------------------------------------------------------------------
     5. ヒーローの背景動画
     ---------------------------------------------------------------------- */
  /* 動画は装飾なので、次の場合は読み込まずポスター画像のままにする。
       ・「動きを減らす」設定（prefers-reduced-motion）
       ・データセーバーが有効（navigator.connection.saveData）
       ・回線が 2G / slow-2G
     元素材をそのまま流すため、書き出し違いの出し分けはしていない。 */
  const heroVideo = $('#heroVideo');

  if (heroVideo) {
    const conn = navigator.connection || navigator.mozConnection || {};
    const slow = /(^|-)2g$/.test(conn.effectiveType || '');
    const skip = reduceMotion || conn.saveData === true || slow;

    if (!skip) {
      heroVideo.src = heroVideo.dataset.src;
      // 自動再生が拒否されてもポスターが残るだけなので、失敗は無視する
      heroVideo.play().catch(() => {});
    }

    // 画面外では再生を止めて負荷を下げる
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([e]) => {
        if (skip || !heroVideo.src) return;
        if (e.isIntersecting) heroVideo.play().catch(() => {});
        else heroVideo.pause();
      }, { threshold: 0 }).observe(heroVideo);
    }
  }


  /* ----------------------------------------------------------------------
     6. ヒーロー写真の固定レイヤーの後始末
     ---------------------------------------------------------------------- */
  /* 写真の固定（.hero__media が position: fixed）と暗転
     （「想い」セクションの背景グラデーション）は CSS だけで成立しています。
     ここでは暗転しきったあとに固定レイヤーの描画を止めて負荷を下げるだけ。
     判定は「想い」の次のセクションが見えたかどうか、で行います。 */
  const hero = $('.hero');
  const omoi = $('.section--omoi');

  if (hero && omoi) {
    // CSS と同じ --veil-end を読み、暗転しきる位置を割り出す
    const veilEnd = () => {
      const raw = getComputedStyle(document.documentElement)
        .getPropertyValue('--veil-end').trim();
      const pct = parseFloat(raw);
      return Number.isFinite(pct) ? pct / 100 : 0.76;
    };

    let raf = null;
    let covered = null;

    const tick = () => {
      raf = null;
      const r = omoi.getBoundingClientRect();
      // 暗転しきる位置が画面上端を越えたら、固定レイヤーは完全に隠れている
      const should = r.top + r.height * veilEnd() <= 0;
      if (should !== covered) {
        covered = should;
        hero.classList.toggle('is-covered', should);
      }
    };

    const schedule = () => { if (raf === null) raf = window.requestAnimationFrame(tick); };
    tick();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
  }


  /* ----------------------------------------------------------------------
     7. お問い合わせフォーム
     ---------------------------------------------------------------------- */
  const form = $('#contactForm');

  if (form) {
    const statusEl = $('#formStatus');

    const RULES = {
      name:    { label: 'お名前',            required: true },
      email:   { label: 'メールアドレス',    required: true, type: 'email' },
      tel:     { label: '電話番号',          required: false, type: 'tel' },
      type:    { label: 'お問い合わせ種別',  required: true, verb: '選択' },
      message: { label: 'お問い合わせ内容',  required: true, min: 10 },
      agree:   { label: '個人情報の取り扱い', required: true, type: 'check' }
    };

    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    const TEL_RE   = /^[0-9０-９+\-()\s]{9,20}$/;

    const fieldOf = (input) => input.closest('.field');
    const errOf   = (input) => {
      const f = fieldOf(input);
      return f ? f.querySelector('[data-err]') : null;
    };

    const setError = (input, msg) => {
      const f = fieldOf(input);
      const e = errOf(input);
      if (f) f.classList.toggle('is-invalid', Boolean(msg));
      if (e) e.textContent = msg || '';
      if (msg) input.setAttribute('aria-invalid', 'true');
      else input.removeAttribute('aria-invalid');
    };

    const validate = (input) => {
      const rule = RULES[input.name];
      if (!rule) return true;

      if (rule.type === 'check') {
        if (rule.required && !input.checked) {
          setError(input, `${rule.label}に同意してください。`);
          return false;
        }
        setError(input, '');
        return true;
      }

      const v = input.value.trim();

      if (rule.required && !v) {
        setError(input, `${rule.label}を${rule.verb || '入力'}してください。`);
        return false;
      }
      if (v && rule.type === 'email' && !EMAIL_RE.test(v)) {
        setError(input, 'メールアドレスの形式をご確認ください。');
        return false;
      }
      if (v && rule.type === 'tel' && !TEL_RE.test(v)) {
        // ラベルに「電話番号」と出ているので主語は省く。付けると 2 カラム時に
        // 1 行に収まらず、この欄だけエラー文が折り返してしまう。
        setError(input, '数字とハイフンでご入力ください。');
        return false;
      }
      if (v && rule.min && v.length < rule.min) {
        setError(input, `${rule.label}は${rule.min}文字以上でご入力ください。`);
        return false;
      }
      setError(input, '');
      return true;
    };

    // 入力中の再検証（一度エラーになった項目のみ）
    Object.keys(RULES).forEach((name) => {
      const input = form.elements[name];
      if (!input) return;
      const ev = input.type === 'checkbox' || input.tagName === 'SELECT' ? 'change' : 'blur';
      input.addEventListener(ev, () => validate(input));
      input.addEventListener('input', () => {
        const f = fieldOf(input);
        if (f && f.classList.contains('is-invalid')) validate(input);
      });
    });

    const setStatus = (msg, kind) => {
      if (!statusEl) return;
      statusEl.textContent = msg;
      statusEl.className = 'form__status' + (kind ? ' is-' + kind : '');
    };

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // ハニーポットに入力があれば無言で終了（ボット対策）
      if (form.elements._gotcha && form.elements._gotcha.value) return;

      let firstBad = null;
      Object.keys(RULES).forEach((name) => {
        const input = form.elements[name];
        if (input && !validate(input) && !firstBad) firstBad = input;
      });

      if (firstBad) {
        setStatus('入力内容にエラーがあります。ご確認ください。', 'error');
        firstBad.focus();
        firstBad.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
        return;
      }

      const endpoint = form.dataset.endpoint;

      /* 送信先が未設定の場合（＝納品直後の状態）はここで案内を出します。
         index.html の <form data-endpoint="..."> に送信先URLを設定すると
         実際に POST 送信されます。 */
      if (!endpoint) {
        setStatus(
          '※ 送信先が未設定です。index.html の data-endpoint に送信先URLをご設定ください。' +
          '（お急ぎの場合は 088-612-8032 までお電話ください）',
          'note'
        );
        return;
      }

      const btn = form.querySelector('button[type="submit"]');
      const label = btn ? btn.querySelector('span') : null;
      const original = label ? label.textContent : '';

      if (btn) btn.disabled = true;
      if (label) label.textContent = '送信中…';
      setStatus('送信しています…', 'note');

      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { Accept: 'application/json' },
          body: new FormData(form)
        });

        if (!res.ok) throw new Error('HTTP ' + res.status);

        form.reset();
        $$('.field', form).forEach((f) => f.classList.remove('is-invalid'));
        $$('[data-err]', form).forEach((el) => { el.textContent = ''; });
        setStatus('お問い合わせを受け付けました。3営業日以内にご返信いたします。', 'ok');
      } catch (err) {
        setStatus(
          '送信に失敗しました。お手数ですが 088-612-8032 までお電話ください。',
          'error'
        );
      } finally {
        if (btn) btn.disabled = false;
        if (label) label.textContent = original;
      }
    });
  }


  /* ----------------------------------------------------------------------
     8. コピーライトの西暦
     ---------------------------------------------------------------------- */
  const year = $('#year');
  if (year) year.textContent = String(new Date().getFullYear());

})();
