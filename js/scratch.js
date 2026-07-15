document.addEventListener("DOMContentLoaded", function () {
  const canvas = document.getElementById("scratchCanvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const wrapper = document.querySelector(".scratch-wrapper");
  
  let isDrawing = false;
  let isRevealed = false;
  
  function resizeCanvas() {
    canvas.width = wrapper.offsetWidth;
    canvas.height = wrapper.offsetHeight;
    initCanvas();
  }
  
  function initCanvas() {
    if (isRevealed) return;
    ctx.globalCompositeOperation = "source-over"; // Reset to draw normal
    ctx.fillStyle = "#7A1A22"; // Rich burgundy
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.font = "bold 20px 'Outfit', sans-serif";
    ctx.fillStyle = "#F5E6D3"; // Light cream text
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Scratch to reveal the date!", canvas.width / 2, canvas.height / 2);
  }

  function getMousePos(evt) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    let clientX, clientY;
    if (evt.touches && evt.touches.length > 0) {
      clientX = evt.touches[0].clientX;
      clientY = evt.touches[0].clientY;
    } else {
      clientX = evt.clientX;
      clientY = evt.clientY;
    }
    
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  }

  function startDrawing(e) {
    if (isRevealed) return;
    isDrawing = true;
    scratch(e);
  }

  function stopDrawing() {
    isDrawing = false;
    checkReveal();
  }

  function scratch(e) {
    if (!isDrawing || isRevealed) return;
    e.preventDefault(); // Prevent scrolling on touch
    const pos = getMousePos(e);
    
    ctx.globalCompositeOperation = "destination-out"; // Erase
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 35, 0, Math.PI * 2);
    ctx.fill();
  }

  function checkReveal() {
    if (isRevealed) return;
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let transparentPixels = 0;
    
    // Check alpha channel of every 4th pixel for performance
    for (let i = 0; i < pixels.length; i += 16) {
      if (pixels[i + 3] === 0) { 
        transparentPixels++;
      }
    }
    
    const totalPixels = pixels.length / 16;
    const percentCleared = (transparentPixels / totalPixels) * 100;
    
    if (percentCleared > 35) { // Threshold to reveal
      isRevealed = true;
      wrapper.classList.add("revealed");
      
      // Fade out canvas
      canvas.style.transition = "opacity 0.8s ease";
      canvas.style.opacity = "0";
      
      setTimeout(() => {
        canvas.style.display = "none";
        // Show timer
        const timerWrapper = document.getElementById("revealCountdownWrapper");
        if (timerWrapper) {
          timerWrapper.classList.remove("hidden");
          timerWrapper.classList.add("visible");
        }
      }, 800);
    }
  }

  // Event Listeners
  canvas.addEventListener("mousedown", startDrawing);
  canvas.addEventListener("mousemove", scratch);
  canvas.addEventListener("mouseup", stopDrawing);
  canvas.addEventListener("mouseleave", stopDrawing);
  
  canvas.addEventListener("touchstart", startDrawing, { passive: false });
  canvas.addEventListener("touchmove", scratch, { passive: false });
  canvas.addEventListener("touchend", stopDrawing);
  
  // Handle resize
  window.addEventListener("resize", () => {
    if (!isRevealed) {
      resizeCanvas();
    }
  });
  
  // Init
  resizeCanvas();
});
