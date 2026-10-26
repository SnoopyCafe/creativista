(() => {
  const dialog = document.getElementById('reading-interest-dialog');
  const form = document.getElementById('reading-interest-form');
  const status = document.getElementById('reading-interest-status');
  const submit = form.querySelector('[type="submit"]');
  let lastTrigger;

  document.querySelectorAll('[data-open-interest]').forEach((button) => {
    button.addEventListener('click', () => {
      lastTrigger = button;
      status.textContent = '';
      dialog.showModal();
      form.elements.name.focus();
    });
  });

  dialog.querySelector('[data-close-interest]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener('close', () => lastTrigger?.focus());

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const fields = new FormData(form);
    const payload = {
      name: fields.get('name'),
      email: fields.get('email'),
      schedule: fields.get('schedule'),
      tuitionAcknowledged: fields.get('tuitionAcknowledged') === 'on',
      message: fields.get('message'),
      website: fields.get('website'),
    };
    submit.disabled = true;
    submit.textContent = 'Sending…';
    status.textContent = '';
    try {
      const response = await fetch('/api/reading-interest', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'We could not send your inquiry. Please try again.');
      form.reset();
      status.textContent = 'Thank you. Your interest form was sent to Creativista.';
      status.classList.add('sent');
    } catch (error) {
      status.textContent = error.message || 'We could not send your inquiry. Please email admin@creativistapods.com directly.';
      status.classList.remove('sent');
    } finally {
      submit.disabled = false;
      submit.textContent = 'Submit';
    }
  });
})();
