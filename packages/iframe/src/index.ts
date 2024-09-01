// Create button
const button = document.createElement("button");
button.innerHTML =
  '<img src="https://www.callmyai.app/images/opengraph-image.png" alt="CallMyAI" width="48" height="48" style="object-fit: cover; border-radius: 50%;">';
button.style.position = "fixed";
button.style.bottom = "10px";
button.style.right = "20px";
button.style.width = "65px";
button.style.height = "65px";
button.style.borderRadius = "50%";
button.style.backgroundColor = "black";
button.style.color = "white";
button.style.border = "1px solid #90EE90"; // Light green border
button.style.fontSize = "14px";
button.style.cursor = "pointer";
button.style.zIndex = "9999";
button.style.transition = "transform 0.3s ease";
button.style.display = "flex";
button.style.alignItems = "center";
button.style.justifyContent = "center";
button.style.boxShadow = "0 0 10px 2px rgba(144, 238, 144, 0.3)"; // Slight green blur shadow

let isOpen = false;
let startY: number, currentY: number;

// @ts-ignore
button.onmouseover = function (this: HTMLButtonElement) {
  this.style.transform = "scale(0.85)";
};

// @ts-ignore
button.onmouseout = function (this: HTMLButtonElement) {
  this.style.transform = "scale(1)";
};

// Create iframe (initially hidden)
const iframe = document.createElement("iframe");
iframe.src = "http://localhost:3000/embed/bishu";
iframe.style.position = "fixed";
iframe.style.border = "2px solid black";
iframe.style.display = "none";
iframe.style.zIndex = "10000";
iframe.style.overflow = "hidden";
iframe.style.scrollbarWidth = "none";
iframe.style.transition = "all 0.3s ease-in-out";
iframe.style.boxShadow = "0 0 15px 2px rgba(0, 255, 0, 0.5)";

// Create close button for mobile
const closeButton = document.createElement("button");
closeButton.innerHTML = "&#10005;"; // Cross symbol
closeButton.style.position = "absolute";
closeButton.style.top = "18%";
closeButton.style.left = "50%";
closeButton.style.transform = "translateX(-50%)";
closeButton.style.backgroundColor = "black";
closeButton.style.border = "none";
closeButton.style.color = "white";
closeButton.style.fontSize = "24px";
closeButton.style.cursor = "pointer";
closeButton.style.display = "none";
closeButton.style.zIndex = "10001";
closeButton.style.width = "40px";
closeButton.style.height = "40px";
closeButton.style.borderRadius = "50%";
closeButton.style.display = "flex";
closeButton.style.alignItems = "center";
closeButton.style.justifyContent = "center";

function setIframeStyles(animate = false): void {
  if (window.innerWidth <= 768) {
    // Mobile devices
    iframe.style.bottom = isOpen ? "0" : "-100%";
    iframe.style.left = "0";
    iframe.style.width = "100%";
    iframe.style.height = animate ? "0" : "75%";
    iframe.style.borderRadius = "20px 20px 0 0";
    closeButton.style.display = isOpen ? "block" : "none";
  } else {
    // Desktop devices
    iframe.style.bottom = "100px";
    iframe.style.right = "20px";
    iframe.style.width = animate ? "0" : "400px";
    iframe.style.height = animate ? "0" : "600px";
    iframe.style.borderRadius = "10px";
    closeButton.style.display = "none";
  }
}

// Add click event to button
button.onclick = (event: MouseEvent) => {
  isOpen = !isOpen;
  if (isOpen) {
    iframe.style.display = "block";
    setTimeout(() => {
      setIframeStyles(true);
      setTimeout(() => {
        setIframeStyles(false);
      }, 50);
    }, 0);
    // @ts-ignore
    this.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>';
  } else {
    if (window.innerWidth <= 768) {
      iframe.style.bottom = "-100%";
    } else {
      setIframeStyles(true);
      setTimeout(() => {
        iframe.style.display = "none";
      }, 300);
    }
    // @ts-ignore
    this.innerHTML =
      '<img src="https://www.callmyai.app/images/opengraph-image.png" alt="CallMyAI" width="48" height="48" style="object-fit: cover; border-radius: 50%;">';
  }
};

// Add click event to close button
// @ts-ignore
closeButton.onclick = function (this: HTMLButtonElement) {
  isOpen = false;
  iframe.style.bottom = "-100%";
  button.innerHTML =
    '<img src="https://www.callmyai.app/images/opengraph-image.png" alt="CallMyAI" width="48" height="48" style="object-fit: cover; border-radius: 50%;">';
  this.style.display = "none";
};

// Handle window resize
window.addEventListener("resize", () => setIframeStyles(false));

// Add touch events for dragging down to close
iframe.addEventListener("touchstart", (e: TouchEvent) => {
  startY = e.touches[0].clientY;
});

iframe.addEventListener("touchmove", (e: TouchEvent) => {
  if (!isOpen) return;
  currentY = e.touches[0].clientY;
  const deltaY = currentY - startY;
  if (deltaY > 0) {
    iframe.style.transform = `translateY(${deltaY}px)`;
  }
});

iframe.addEventListener("touchend", () => {
  if (!isOpen) return;
  const deltaY = currentY - startY;
  if (deltaY > 100) {
    // If dragged down more than 100px, close the iframe
    isOpen = false;
    iframe.style.bottom = "-100%";
    button.innerHTML =
      '<img src="https://www.callmyai.app/images/opengraph-image.png" alt="CallMyAI" width="48" height="48" style="object-fit: cover; border-radius: 50%;">';
    closeButton.style.display = "none";
  } else {
    iframe.style.transform = "translateY(0)";
  }
});

// Initial setup
setIframeStyles(false);

// Add elements to page
document.body.appendChild(button);
document.body.appendChild(iframe);
document.body.appendChild(closeButton);
