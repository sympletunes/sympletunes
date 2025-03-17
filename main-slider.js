document.addEventListener("DOMContentLoaded", function () {
    let index = 0;
    const slidesData = [
        "valentine2.jpg", "foot.jpg", "image1.jpg", "image2.jpg", "image3.jpg",
        "valentine2.jpg", "foot.jpg", "image1.jpg", "image2.jpg", "image3.jpg"
    ];

    const slider = document.getElementById("trackSlider");
    const dotsContainer = document.getElementById("dotsContainer");

    if (!slider || !dotsContainer) {
        console.error("Slider or dotsContainer not found!");
        return;
    }

    // Generate slides dynamically
    slidesData.forEach((src, i) => {
        let slide = document.createElement("div");
        slide.classList.add("slide");
        slide.innerHTML = `<img src="${src}" alt="Slide ${i + 1}">`;
        slider.appendChild(slide);
    });

    let slides = document.querySelectorAll(".slide");
    const totalSlides = slides.length;

    function updateDots() {
        dotsContainer.innerHTML = "";
        slides.forEach((_, i) => {
            let dot = document.createElement("span");
            dot.classList.add("dot");
            if (i === index) dot.classList.add("active-dot");
            dot.addEventListener("click", () => goToSlide(i));
            dotsContainer.appendChild(dot);
        });
    }

    function slide(direction) {
        index = (index + direction + totalSlides) % totalSlides;
        updateSlider();
    }

    function goToSlide(slideIndex) {
        index = slideIndex;
        updateSlider();
    }

    function updateSlider() {
        slides.forEach((slide, i) => {
            let position = (i - index + totalSlides) % totalSlides;

            slide.style.transition = "transform 0.6s ease-in-out, opacity 0.6s ease-in-out";
            slide.style.opacity = "0.5";
            slide.style.transform = `scale(0.8) translateX(${(position - 1) * 50}%)`;
            slide.style.zIndex = "1";

            if (position === 1) {
                slide.style.opacity = "1";
                slide.style.transform = "scale(1) translateX(0%)";
                slide.style.zIndex = "3";
            } else if (position === 0 || position === 2) {
                slide.style.opacity = "0.8";
                slide.style.transform = `scale(0.9) translateX(${(position - 1) * 50}%)`;
                slide.style.zIndex = "2";
            }
        });

        updateDots();
    }

    function autoSlide() {
        slide(1);
        setTimeout(autoSlide, 5000);
    }

    updateDots();
    updateSlider();
    setTimeout(autoSlide, 4000);

    document.querySelector(".slider-btn.left").addEventListener("click", () => slide(-1));
    document.querySelector(".slider-btn.right").addEventListener("click", () => slide(1));
});
