// Navigation remains visible when JavaScript is unavailable.
const toggle = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#site-navigation");
if (toggle && navigation) {
  document.documentElement.classList.add("js");
  const setOpen = (open) => {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.querySelector("span").textContent = open ? "Close" : "Menu";
    navigation.classList.toggle("is-open", open);
  };
  toggle.addEventListener("click", () => {
    setOpen(toggle.getAttribute("aria-expanded") !== "true");
  });
  navigation.addEventListener("click", (event) => {
    if (event.target.closest("a")) setOpen(false);
  });
  document.addEventListener("keydown", (event) => {
    if (
      event.key === "Escape" &&
      toggle.getAttribute("aria-expanded") === "true"
    ) {
      setOpen(false);
      toggle.focus();
    }
  });
  // Reset disclosure state when moving between mobile and desktop layouts.
  window
    .matchMedia("(max-width: 800px)")
    .addEventListener("change", () => setOpen(false));
}
