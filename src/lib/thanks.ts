// A form leaves a one-time note before opening its thank-you page, so the page can tell a
// real submission from someone opening the address directly.

const key = (form: string) => `thanks:${form}`;

export function markThanks(form: string) {
  try {
    sessionStorage.setItem(key(form), "1");
  } catch {
    // Storage blocked: the thank-you page then shows anyway.
  }
}

/** True once per submission (or always, when storage is blocked). */
export function takeThanks(form: string) {
  try {
    const ok = sessionStorage.getItem(key(form)) === "1";
    sessionStorage.removeItem(key(form));
    return ok;
  } catch {
    return true;
  }
}
