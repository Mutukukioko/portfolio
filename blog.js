/* ============================================================
   hkioko — blog interactions
   Toggle Machines/Projects, load entries by id, hash deep-links.
   Vanilla JS. textContent only where user-facing. No inline HTML.
   ============================================================ */

(function () {
    'use strict';

    var doc = document;

    function $(id) { return doc.getElementById(id); }

    var toggleMachines = $('toggle-machines');
    var toggleProjects = $('toggle-projects');
    var machineList = $('machine-list');
    var projectList = $('project-list');
    var entries = doc.querySelectorAll('.entry');
    var viewer = $('viewer');

    function currentCategory() {
        return toggleMachines.getAttribute('aria-pressed') === 'true' ? 'machines' : 'projects';
    }

    function entryToCategory(id) {
        var item = doc.querySelector('.list-item[data-entry="' + id + '"]');
        var list = item ? item.closest('.entry-list') : null;
        return list === machineList ? 'machines' : 'projects';
    }

    function showList(cat) {
        var machines = cat === 'machines';
        toggleMachines.setAttribute('aria-pressed', String(machines));
        toggleProjects.setAttribute('aria-pressed', String(!machines));
        machineList.hidden = !machines;
        projectList.hidden = machines;
    }

    function setActiveItem(id) {
        doc.querySelectorAll('.list-item').forEach(function (item) {
            var on = item.getAttribute('data-entry') === id;
            item.classList.toggle('active', on);
            if (on) { item.setAttribute('aria-current', 'true'); }
            else { item.removeAttribute('aria-current'); }
        });
    }

    function activate(id) {
        var entry = doc.getElementById(id);
        if (!entry) { return; }

        entries.forEach(function (el) {
            el.hidden = (el !== entry);
        });

        showList(entryToCategory(id));
        setActiveItem(id);

        var title = entry.querySelector('.post-title');
        doc.title = title
            ? '$> ' + title.textContent + ' — hkioko'
            : '$> blog — hkioko';
    }

    /* deep-link shareable URLs: #cap, #ad-lab, … */
    function restore() {
        var hash = location.hash.slice(1);
        if (hash && doc.getElementById(hash)) { activate(hash); }
        else { activate('cap'); }
    }

    doc.querySelectorAll('.list-item').forEach(function (item) {
        item.addEventListener('click', function (e) {
            var id = item.getAttribute('data-entry');
            if (id) {
                e.preventDefault();
                activate(id);
                history.replaceState(null, '', '#' + id);
                viewer.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    toggleMachines.addEventListener('click', function () { showList('machines'); });
    toggleProjects.addEventListener('click', function () { showList('projects'); });

    restore();
})();