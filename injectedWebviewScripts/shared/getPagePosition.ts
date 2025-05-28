export const updateScrollPercentageToQueryParam = () => {
  const element = document.getElementById("chapters");
  let scrollPercentage: number | undefined;

  if (element) {
    const rect = element.getBoundingClientRect();

    const viewportTop = window.scrollY || window.pageYOffset;

    const elementAbsoluteTop = viewportTop + rect.top;
    const elementHeight = rect.height;

    if (elementHeight === 0) {
      return 0;
    }

    const scrollDistanceIntoElement = viewportTop - elementAbsoluteTop;

    let progress = 0;
    if (scrollDistanceIntoElement <= 0) {
      progress = 0;
    } else if (scrollDistanceIntoElement >= elementHeight) {
      progress = 100;
    } else {
      progress = (scrollDistanceIntoElement / elementHeight) * 100;
    }

    scrollPercentage = Math.max(0, Math.min(100, progress));
  }

  if (scrollPercentage === undefined || Number.isNaN(scrollPercentage)) {
    return;
  }

  const roundedScrollPercentage = Math.floor(scrollPercentage).toString();

  const url = new URL(window.location.href);

  const currentPercentage = url.searchParams.get("scroll");

  if (
    currentPercentage !== null &&
    currentPercentage === roundedScrollPercentage
  ) {
    return;
  }

  url.searchParams.set("scroll", roundedScrollPercentage);

  window.history.replaceState({}, "", url.toString());
};
