//variables
var navBar = document.querySelector("nav");
window.onscroll = () => {
  if (window.scrollY >= 10) navBar.classList.add("scroll");
  else navBar.classList.remove("scroll");
};
// toogle classes

//variables
var burgerBtn = document.querySelector(".burger-button");
var nav = document.querySelector(".navigation");

burgerBtn.addEventListener("click", () => {
  burgerBtn.classList.toggle("rotate");
  nav.classList.toggle("open");
});

var circles = document.querySelectorAll(".circle");

circles.forEach((circle) => {
  var perc = circle.dataset.perc;

  var bar = new ProgressBar.Circle(circle, {
    strokeWidth: 6,
    easing: "easeInOut",
    duration: 1400,
    color: "#FA225B",
    trailColor: "transparent",
    trailWidth: 0,
    svgStyle: null,
  });

  bar.animate(perc);
});
// swipperJs

var swiper = new Swiper(".swiper-container", {
  slidesPerView: 5,
  spaceBetween: 30,
  slidesPerGroup: 1,
  loop: true,
  loopFillGroupWithBlank: true,
});

var submit = document.getElementById("submit");
submit.onclick = function (e) {
  e.preventDefault();
  window.location.href = "thanks.html";
};
