const testimonialSlider = document.querySelector('.splide.sportea-testimonials-slider')

if (testimonialSlider) {
    let splide1 = new Splide(testimonialSlider, {
        perPage: 2,
        rewind: true,
        gap: '64px',
        type: 'loop',
        breakpoints: {
            1100: {
                perPage: 1,
            },
        }
    });

    splide1.mount();
}