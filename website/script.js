const links = document.querySelectorAll('a[href^="#"]');
const interestForm = document.querySelector("#interest-form");

links.forEach((link) => {
  link.addEventListener("click", (event) => {
    const target = document.querySelector(link.getAttribute("href"));

    if (!target) {
      return;
    }

    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth" });
  });
});

if (interestForm) {
  interestForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = document.querySelector("#visitor-name").value.trim();
    const contact = document.querySelector("#visitor-contact").value.trim();
    const role = document.querySelector("#visitor-role").value;
    const note = document.querySelector("#visitor-note").value.trim() || "No note provided.";
    const formNote = document.querySelector("#form-note");

    const title = `[Interest] ${name}`;
    const body = [
      "New Pill Pal interest/contact request",
      "",
      `Name: ${name}`,
      `Contact: ${contact}`,
      `Role: ${role}`,
      "",
      "Note:",
      note,
    ].join("\n");

    const issueUrl = new URL("https://github.com/Ameer-sys/About-Pill-Pal/issues/new");
    issueUrl.searchParams.set("title", title);
    issueUrl.searchParams.set("body", body);

    formNote.textContent = "Opening GitHub with your details filled in...";
    window.open(issueUrl.toString(), "_blank", "noopener,noreferrer");
  });
}
