document.addEventListener("DOMContentLoaded", function () {
  const blocks = document.querySelectorAll(".scratch-block");
  if (!blocks.length) return;

  let totalRevealed = 0;
  const timerWrapper = document.getElementById("revealCountdownWrapper");

  blocks.forEach(wrapper => {
    const canvas = wrapper.querySelector(".scratchCanvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let isDrawing = false;
    
    // Attach reveal function to the wrapper so it can be called globally
    wrapper.forceReveal = function() {
      if (wrapper.classList.contains("revealed")) return;
      wrapper.classList.add("revealed");
      canvas.style.transition = "opacity 0.8s ease";
      canvas.style.opacity = "0";
      setTimeout(() => {
        canvas.style.display = "none";
      }, 800);
    };

    function resizeCanvas() {
      canvas.width = wrapper.offsetWidth;
      canvas.height = wrapper.offsetHeight;
      initCanvas();
    }

    function initCanvas() {
      if (wrapper.classList.contains("revealed")) return;
      ctx.globalCompositeOperation = "source-over"; // Reset to draw normal
      ctx.fillStyle = "#7A1A22"; // Rich burgundy
      ctx.fillRect(0, 0, canvas.width, canvas.height);
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
      if (wrapper.classList.contains("revealed")) return;
      isDrawing = true;
      scratch(e);
    }

    function stopDrawing() {
      isDrawing = false;
      checkReveal();
    }

    function scratch(e) {
      if (!isDrawing || wrapper.classList.contains("revealed")) return;
      e.preventDefault(); // Prevent scrolling on touch
      const pos = getMousePos(e);
      
      ctx.globalCompositeOperation = "destination-out"; // Erase
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 25, 0, Math.PI * 2); // Slightly smaller brush for smaller blocks
      ctx.fill();
    }

    function checkReveal() {
      if (wrapper.classList.contains("revealed")) return;
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;
      let transparentPixels = 0;
      
      for (let i = 0; i < pixels.length; i += 16) {
        if (pixels[i + 3] === 0) { 
          transparentPixels++;
        }
      }
      
      const totalPixels = pixels.length / 16;
      const percentCleared = (transparentPixels / totalPixels) * 100;
      
      if (percentCleared > 35) { // Threshold to reveal
        triggerGlobalReveal();
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
      if (!wrapper.classList.contains("revealed")) {
        resizeCanvas();
      }
    });
    
    // Init
    resizeCanvas();
  });

  function triggerGlobalReveal() {
    // Reveal all blocks
    blocks.forEach(b => {
      if (b.forceReveal) b.forceReveal();
    });
    
    // Show timer
    if (timerWrapper && timerWrapper.classList.contains("hidden")) {
      timerWrapper.classList.remove("hidden");
      timerWrapper.classList.add("visible");
    }
  }
});
