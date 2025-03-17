document.addEventListener("DOMContentLoaded", () => {
  // Only run on pages other than results.html
  if (window.location.pathname.includes("results.html")) {
    return;
  }

  // ---- DOM Elements ----
  const searchInput = document.querySelector("#search-input");
  const searchForm = document.querySelector("#search-form");

  if (!searchInput || !searchForm) {
    console.error("Missing required elements.");
    return;
  }

  // ---- Helper: Remove any bracket and its content from a string ----
  function removeBracketText(text) {
    // Remove any text within parentheses, curly braces, or square brackets
    return text.replace(/[\(\{\[].*?[\)\}\]]/g, "").trim();
  }

  // ---- Handle form submission: redirect to results.html with the cleaned query ----
  searchForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const query = searchInput.value.trim();
    if (query) {
      const cleanedQuery = removeBracketText(query);
      window.location.href = `results.html?q=${encodeURIComponent(cleanedQuery)}`;
    }
  });
});
