export const scrollTo = (scrollToParam: string) => {
  const scrollPosition = Number.parseInt(scrollToParam, 10);
  const chaptersElement = document.getElementById("chapters");

  if (chaptersElement && !Number.isNaN(scrollPosition)) {
    const elementHeight = chaptersElement.getBoundingClientRect().height;
    const scrollTo =
      chaptersElement.offsetTop + (elementHeight * scrollPosition) / 100;
    window.scrollTo(0, scrollTo);
  }
};
