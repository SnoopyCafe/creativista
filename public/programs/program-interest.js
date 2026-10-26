(() => {
  const dialog = document.getElementById('program-interest-dialog');
  const form = document.getElementById('program-interest-form');
  const status = document.getElementById('program-interest-status');
  const title = document.getElementById('program-interest-title');
  const copy = document.getElementById('program-interest-copy');
  const submit = form.querySelector('[type="submit"]');
  const programs = {
    workshop: {
      interest: 'Intro parent reading workshop',
      title: 'Workshop Registration',
      copy: 'Share your details to ask about registration. We’ll confirm the workshop details and payment instructions before you enroll.',
      placeholder: 'Share a question about the workshop.',
    },
    academy: {
      interest: '4-week reading academy',
      title: 'Reading Academy Interest List',
      copy: 'We’re gathering interested families for the 4-Week Reading Academy. Enrollment details will be shared when available. No payment is due to join.',
      placeholder: 'Tell us what you’d like to know about the Academy.',
    },
    community: {
      interest: 'Homeschool community',
      title: 'Homeschool Community Interest List',
      copy: 'We’re gathering interested families as we prepare to launch. Community access details will be shared when available.',
      placeholder: 'Tell us what you hope to find in the community.',
    },
  };
  let lastTrigger;

  document.querySelectorAll('[data-open-program-interest]').forEach((button) => {
    button.addEventListener('click', () => {
      const program = programs[button.dataset.openProgramInterest] || programs.academy;
      lastTrigger = button;
      form.reset();
      form.elements.interest.value = program.interest;
      form.elements.message.placeholder = program.placeholder;
      title.textContent = program.title;
      copy.textContent = program.copy;
      status.textContent = '';
      status.classList.remove('sent');
      dialog.showModal();
      form.elements.name.focus();
    });
  });

  dialog.querySelector('[data-close-program-interest]').addEventListener('click', () => dialog.close());
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
      interest: fields.get('interest'),
      message: fields.get('message'),
      website: fields.get('website'),
    };
    submit.disabled = true;
    submit.textContent = 'Sending…';
    status.textContent = '';
    try {
      const response = await fetch('/api/program-interest', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'We could not send your interest form. Please try again.');
      form.reset();
      status.textContent = 'Thank you. Your interest form was sent to Creativista.';
      status.classList.add('sent');
    } catch (error) {
      status.textContent = error.message || 'We could not send your interest form. Please email admin@creativistapods.com directly.';
      status.classList.remove('sent');
    } finally {
      submit.disabled = false;
      submit.textContent = 'Submit';
    }
  });
})();
