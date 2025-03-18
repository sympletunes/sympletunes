document.addEventListener("DOMContentLoaded", function () {
    let index = 0;
    // Array of slide objects, one for each slide.
    // Update the "src" and "link" values as needed.
    const slidesData = [
        { src: "amason-airpod-ad.png", link: "https://www.amazon.com/Bcaikair-Bluetooth-Headphones-Waterproof-Microphone/dp/B0DQ45TTYV?crid=1WB31LU7EB9OH&dib=eyJ2IjoiMSJ9.eCvdjoBEEi5oIwq6AqA9IGKXXfaii7tBBbAWAaI5mh9HL2MSk4zyDPXBI1dnZZYY0Jf2x57HUOOVUaTtBeCcq-pnfSFQAiwZWKNU_Zc6LhyKzxgjUP-OodO_Kvecxosz9dIKI5Gzc5qHu7hTXJ7-IV_QsnH5YGeMPCcIcygOIeWdP1tvS6QFvLNWrm-dx0cGO8-IwTRvbTLaXFJMamsRKOHEzUeHTyQFsnu2af1J9as.Orl_043u7DJUlbIpY9IfxnanDHrqXLunv2qoDldYo-Q&dib_tag=se&keywords=apple%2Bairpods&qid=1742179616&sprefix=apple%2Bair%2Caps%2C3012&sr=8-4&th=1&linkCode=ll1&tag=sympletunesmu-20&linkId=39c9ab713333db0de4c9a3dac72a0d48&language=en_US&ref_=as_li_ss_tl" },
        { src: "advertise-with-us.jpg", link: "advertising_guidelines.html" },
        { src: "amason-airpod-ad-2.png", link: "https://www.amazon.com/Bluetooth-Headphones-Cancelling-Earphones-Waterproof/dp/B0CX1TJ228?crid=2VCTQH2RXCA2Q&dib=eyJ2IjoiMSJ9.YOiEBjXaXMxR9-dDx4acpDkSSa7pIq88ciDGK6b0Eghr5Ubk6YdnnHkgNmrWpPlwOWL3wRGh8zudYuKjpC16ukyTABB-8DFdVl7gl5M-ZUri11REjHuRANcQhVHht8Lpnje4Lbi2h1XNhpgLDyL8Y4pO3osOeYvD-PYzl6o0LYO7nZeP9vxDC7yOAqo0vyHcDI7Nfy0chqoULmN5gZzlZSgnrOhcw4-2ld-D_W9m9y8.HboxBzZRe-5XLfHWoA3alMJ1jQO9AMa1hZ_bI6GFSvI&dib_tag=se&keywords=samsung%2Bgalaxy%2Bs22%2Bultra&qid=1742180008&sprefix=samsung%2Bgalaxy%2Bs22%2Caps%2C596&sr=8-7-spons&sp_csd=d2lkZ2V0TmFtZT1zcF9tdGY&th=1&linkCode=ll1&tag=sympletunesmu-20&linkId=ebd394b4c97e74f1027ed333ca0845d1&language=en_US&ref_=as_li_ss_tl" },
        { src: "image2.jpg", link: "image2.jpg" },
        { src: "image3.jpg", link: "image3.jpg" },
        { src: "valentine2.jpg", link: "valentine2.jpg" },
        { src: "foot.jpg", link: "foot.jpg" },
        { src: "image1.jpg", link: "image1.jpg" },
        { src: "image2.jpg", link: "image2.jpg" },
        { src: "image3.jpg", link: "image3.jpg" }
    ];

    const slider = document.getElementById("trackSlider");
    const dotsContainer = document.getElementById("dotsContainer");

    if (!slider || !dotsContainer) {
        console.error("Slider or dotsContainer not found!");
        return;
    }

    // Generate slides dynamically using slidesData.
    slidesData.forEach((data, i) => {
        let slide = document.createElement("div");
        slide.classList.add("slide");

        // Create an anchor element to wrap the image.
        let link = document.createElement("a");
        // Link to the specified URL or image.
        link.href = data.link;
        link.target = "_blank"; // Opens in a new tab

        // Create the image element.
        let img = document.createElement("img");
        img.src = data.src;
        img.alt = `Slide ${i + 1}`;

        // Append image to the link, then the link to the slide.
        link.appendChild(img);
        slide.appendChild(link);
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
          
          // Remove any previous active class
          slide.classList.remove("active");
          
          if (position === 1) {
            slide.style.opacity = "1";
            slide.style.transform = "scale(1) translateX(0%)";
            slide.style.zIndex = "3";
            // Mark the center slide as active
            slide.classList.add("active");
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
