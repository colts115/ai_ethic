# Simple To-Do App

This is a small, single-file to-do app built with HTML, CSS, and JavaScript.

Features
- Add tasks
- Mark tasks done (toggle)
- Delete tasks
- Clear completed / Clear all
- Persistence using localStorage

Enhancements
- Filter tasks (All / Active / Completed)
- Inline edit (double-click or edit button)
- Smooth add/remove animations and improved styling
- Task counter (active / total)

Files
- `index.html` — app entry point
- `styles.css` — basic styling
- `app.js` — JavaScript logic (add/delete/toggle, localStorage)

How to use
1. Open `index.html` in a browser (double-click or use a local server).
2. Type a task in the input and press Add (or Enter).
3. Click the checkbox or the task text to mark it done.
4. Click the ✕ button to delete a task.
5. Use "Clear completed" to remove done tasks or "Clear all" to remove everything.

Tips for development
- To test with a local static server (recommended):

```powershell
# from c:\Users\hoosi\ai_ethic
python -m http.server 8000
# open http://localhost:8000 in your browser
```

Accessibility notes
- Filter buttons are using role="tab" and aria-selected for basic screen reader hints.
- Tasks can be edited with keyboard when focused (Enter/Escape in edit mode).

Notes
- Tasks are stored in your browser's localStorage under the key `todo.tasks.v1`.
- This is intentionally small and dependency-free for easy embedding.

License: MIT
# ai_ethic