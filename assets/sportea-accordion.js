let sporteaFaq = document.getElementsByClassName("sportea-faq-accordion");

for (let i = 0; i < sporteaFaq.length; i++) {



    sporteaFaq[i].addEventListener("click", function () {
        for (let x of sporteaFaq) {
            x.classList.remove('active')
        }

        this.classList.toggle("active");
        let panel = this.nextElementSibling;
    if (panel.style.display === "block") {
            panel.style.display = "none";
        } else {
            panel.style.display = "block";
        }
    });
}