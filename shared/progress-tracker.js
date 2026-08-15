/*
 * Shared progress tracker, loaded by the quiz sub-apps embedded under
 * /embeds/quizzes/*. Writes quiz results to a localStorage key that the
 * hub's "אזור אישי" page (src/lib/progress.ts) reads — this works because
 * every embed is served from the same origin as the hub (GitHub Pages).
 */
(function () {
  var KEY = "md_quiz_progress_v1";

  function read() {
    try {
      var raw = window.localStorage.getItem(KEY);
      var parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  function write(list) {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(list));
    } catch (e) {
      /* localStorage unavailable (e.g. private mode) - ignore */
    }
  }

  window.MDProgress = {
    record: function (entry) {
      var list = read();
      list.push(
        Object.assign(
          {
            ts: Date.now(),
            quiz: "unknown",
            quizLabel: "unknown",
            correct: 0,
            total: 0,
            wrongQuestions: [],
          },
          entry,
        ),
      );
      write(list);
    },
    all: read,
  };
})();
