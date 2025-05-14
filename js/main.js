
document.addEventListener("DOMContentLoaded", () => {
    const gameCards = document.querySelectorAll(".game-card");
  
    const observer = new IntersectionObserver(
        (entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("fade-in");
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.5 } 
    );

    gameCards.forEach(card => {
        observer.observe(card);
    });
});


function scrollToGames() {
    const gameSection = document.getElementById("games");
    gameSection.scrollIntoView({ behavior: "smooth" });
  }