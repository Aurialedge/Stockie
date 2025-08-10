let bookIndex = 0;
let articleIndex = 0;
showSlides('books-slideshow', bookIndex);
showSlides('articles-slideshow', articleIndex);

function showSlides(slideshowClass, slideIndex) {
    let slides = document.querySelectorAll(`.${slideshowClass} .slide`);
    for (let i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }
    slideIndex++;
    if (slideIndex > slides.length) {
        slideIndex = 1;
    }
    slides[slideIndex - 1].style.display = "block";
    setTimeout(() => showSlides(slideshowClass, slideIndex), 5000); // Change slide every 5 seconds
}