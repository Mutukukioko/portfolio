/* ============================================================
   hkioko — offensive security portfolio
   Vanilla JS. No libraries. No eval. No string-built HTML.
   All user input handled via textContent only.
   ============================================================ */

(function () {
    'use strict';

    var doc = document;

    /* ---------- helpers ---------- */
    function $(id) { return doc.getElementById(id); }

    var REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------- footer year ---------- */
    $('year').textContent = String(new Date().getFullYear());

    /* ---------- ambient network background ---------- */
    (function bg() {
        var canvas = $('bg-canvas');
        var ctx = canvas.getContext('2d');
        var W, H, nodes = [];
        var NODE_COUNT = 60;
        var LINK_DIST = 150;

        function rand(min, max) { return min + Math.random() * (max - min); }

        function size() {
            var dpr = Math.min(window.devicePixelRatio || 1, 2);
            W = window.innerWidth;
            H = window.innerHeight;
            canvas.width = W * dpr;
            canvas.height = H * dpr;
            canvas.style.width = W + 'px';
            canvas.style.height = H + 'px';
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            nodes = [];
            for (var i = 0; i < NODE_COUNT; i++) {
                nodes.push({
                    x: rand(0, W),
                    y: rand(0, H),
                    vx: rand(-0.25, 0.25),
                    vy: rand(-0.25, 0.25)
                });
            }
        }

        function connect(a, b) {
            var dx = a.x - b.x;
            var dy = a.y - b.y;
            return Math.sqrt(dx * dx + dy * dy);
        }

        function frame() {
            ctx.clearRect(0, 0, W, H);

            for (var i = 0; i < nodes.length; i++) {
                var n = nodes[i];
                n.x += n.vx;
                n.y += n.vy;
                if (n.x < 0 || n.x > W) n.vx *= -1;
                if (n.y < 0 || n.y > H) n.vy *= -1;
                n.x = Math.max(0, Math.min(W, n.x));
                n.y = Math.max(0, Math.min(H, n.y));

                for (var j = i + 1; j < nodes.length; j++) {
                    var d = connect(n, nodes[j]);
                    if (d < LINK_DIST) {
                        var a = (1 - d / LINK_DIST) * 0.16;
                        ctx.strokeStyle = 'rgba(56,189,248,' + a.toFixed(3) + ')';
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(n.x, n.y);
                        ctx.lineTo(nodes[j].x, nodes[j].y);
                        ctx.stroke();
                    }
                }
            }

            for (var k = 0; k < nodes.length; k++) {
                ctx.fillStyle = 'rgba(56,189,248,0.5)';
                ctx.beginPath();
                ctx.arc(nodes[k].x, nodes[k].y, 1.6, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        var running = true;
        var raf;

        function loop() {
            frame();
            if (running && !REDUCED) { raf = requestAnimationFrame(loop); }
        }

        function start() {
            cancelAnimationFrame(raf);
            running = true;
            if (!REDUCED) { raf = requestAnimationFrame(loop); }
            else { frame(); }
        }

        var resizeT;
        window.addEventListener('resize', function () {
            clearTimeout(resizeT);
            resizeT = setTimeout(function () { size(); start(); }, 150);
        }, { passive: true });

        doc.addEventListener('visibilitychange', function () {
            if (doc.hidden) { cancelAnimationFrame(raf); running = false; }
            else { start(); }
        });

        size();
        start();
    })();

    /* ---------- typed hero line ---------- */
    (function typed() {
        var el = $('typed-line');
        var phrases = [
            '> Offensive Security Engineer & Certified Pentesting Specialist',
            '> Active Directory attack paths · enumeration → lateral movement → root',
            '> Web application security · BOLA · SQLi · JWT',
            '> Right now: reporting on the two labs below — wanting to do it for you instead.'
        ];
        var pi = 0, ci = 0, deleting = false;
        var speed = 40;

        function tick() {
            var current = phrases[pi];
            el.textContent = '> ' + current.substring(0, ci);
            if (!deleting) {
                ci++;
                if (ci >= current.length) {
                    deleting = true;
                    speed = 18;
                    setTimeout(tick, 1400);
                    return;
                }
            } else {
                ci--;
                if (ci <= 0) {
                    deleting = false;
                    speed = 40;
                    pi = (pi + 1) % phrases.length;
                }
            }
            setTimeout(tick, speed);
        }

        if (REDUCED) {
            el.textContent = phrases[0];
        } else {
            setTimeout(tick, 400);
        }
    })();

    /* ---------- scroll progress ---------- */
    (function progress() {
        var bar = $('scroll-progress');
        var ticking = false;
        function update() {
            var h = doc.documentElement;
            var max = h.scrollHeight - window.innerHeight;
            var p = max > 0 ? (window.pageYOffset / max) : 0;
            bar.style.transform = 'scaleX(' + p.toFixed(4) + ')';
            ticking = false;
        }
        window.addEventListener('scroll', function () {
            if (!ticking) { ticking = true; requestAnimationFrame(update); }
        }, { passive: true });
        update();
    })();

    /* ---------- mobile navigation toggle ---------- */
    (function navToggle() {
        var toggle = $('nav-toggle');
        var links = $('nav-links');
        if (!toggle || !links) { return; }

        function close() {
            links.classList.remove('open');
            toggle.setAttribute('aria-expanded', 'false');
        }

        toggle.addEventListener('click', function () {
            var open = links.classList.toggle('open');
            toggle.setAttribute('aria-expanded', String(open));
        });

        links.addEventListener('click', close);

        doc.addEventListener('click', function (e) {
            if (links.classList.contains('open') &&
                !links.contains(e.target) && !toggle.contains(e.target)) {
                close();
            }
        }, { passive: true });

        window.addEventListener('resize', function () {
            if (window.innerWidth > 900) { close(); }
        }, { passive: true });
    })();

    /* ---------- nav active link ---------- */
    (function navActive() {
        var links = doc.querySelectorAll('.nav-link');
        var sections = [];
        links.forEach(function (link) {
            var id = link.getAttribute('href');
            if (id && id.charAt(0) === '#') {
                var sec = doc.querySelector(id);
                if (sec) { sections.push({ link: link, sec: sec }); }
            }
        });

        var ticking = false;
        function setActive() {
            var y = window.pageYOffset + 140;
            var current = sections[0];
            for (var i = 0; i < sections.length; i++) {
                if (sections[i].sec.offsetTop <= y) { current = sections[i]; }
            }
            sections.forEach(function (s) {
                if (s.link === current.link) { s.link.classList.add('active'); }
                else { s.link.classList.remove('active'); }
            });
            ticking = false;
        }
        window.addEventListener('scroll', function () {
            if (!ticking) { ticking = true; requestAnimationFrame(setActive); }
        }, { passive: true });
        setActive();
    })();

    /* ---------- reveal on scroll ---------- */
    (function reveal() {
        var items = doc.querySelectorAll('.reveal');
        if (!('IntersectionObserver' in window)) {
            items.forEach(function (el) { el.classList.add('visible'); });
            return;
        }
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (e) {
                if (e.isIntersecting) {
                    e.target.classList.add('visible');
                    io.unobserve(e.target);
                }
            });
        }, { threshold: 0.12 });
        items.forEach(function (el) { io.observe(el); });
    })();

    /* ---------- contact form (FormSpree, JSON, CSP-safe) ---------- */
    (function form() {
        var form = $('contact-form');
        var status = $('form-status');
        var submit = $('form-submit');
        var email = $('msg-email');
        var body = $('msg-body');

        function setStatus(msg, kind) {
            status.textContent = msg;
            status.className = 'form-status' + (kind ? ' ' + kind : '');
        }

        form.addEventListener('submit', function (e) {
            e.preventDefault();

            /* honeypot: bots fill hidden fields — silently accept */
            var hp = form.querySelector('input[name="_gotcha"]');
            if (hp && hp.value !== '') {
                setStatus('Message sent ✓', 'ok');
                form.reset();
                return;
            }

            var emailVal = email.value.trim();
            var bodyVal = body.value.trim();
            var emailOk = !emailVal || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal);

            if (!emailOk) {
                setStatus('✗ invalid email address', 'err');
                email.focus();
                return;
            }
            if (bodyVal.length < 10) {
                setStatus('✗ message too short — at least 10 characters', 'err');
                body.focus();
                return;
            }

            submit.disabled = true;
            setStatus('sending …');

            fetch(form.getAttribute('action'), {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify({
                    _subject: 'Portfolio enquiry — hkioko',
                    email: emailVal,
                    message: bodyVal
                })
            }).then(function (res) {
                if (res.ok) {
                    setStatus('Message sent ✓ — I will get back to you.', 'ok');
                    form.reset();
                } else {
                    setStatus('✗ failed to send — use email: kharrylungu@gmail.com', 'err');
                }
            }).catch(function () {
                setStatus('✗ network error — use email: kharrylungu@gmail.com', 'err');
            }).finally(function () {
                submit.disabled = false;
            });
        });
    })();
})();