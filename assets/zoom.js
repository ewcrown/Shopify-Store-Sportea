// Function to initialize the magnifying effect
const magnifyImage = (options) => {
    // Helper function to apply styles to an element
    let applyStyles = (element, styles) => {
      for (const property in styles)
        element.style[property] = styles[property] || "";
    };
  
    // Helper function to clamp a value between a minimum and maximum
    let clamp = (value, min, max) => value > max ? max : value < min ? min : value;
  
    // Extract and set default options
    let config = {
      src: options.src, // Source URL of the image
      zoom: options.zoom || 3, // Zoom level
      target: options.target, // Target DOM element to append the image and magnifier
      width: options.width || "auto", // Width of the image container
      magnifierSize: options.magnifierSize || 200, // Size of the magnifier lens
      magnifierStyles: options.magnifierStyles || {}, // Custom styles for the magnifier lens
      overflow: options.overflow === undefined ? true : options.overflow // Allow overflow or not
    };
  
    // Create the image container
    const container = document.createElement("div");
    container.style.cssText = `position: relative; width: ${config.width}px;`;
    config.target.append(container);
  
    // Variables to track mouse position and image dimensions
    let mouseX = 0, mouseY = 0, imageWidth = 0, imageHeight = 0;
  
    // Create the main image element
    const mainImage = new Image();
    mainImage.src = config.src;
    mainImage.style.cssText = "width: 100%; display: block;";
    container.append(mainImage);
  
    // Create the magnifier lens
    const magnifierLens = options.magnifierElement || document.createElement("div");
    if (!options.magnifierElement) {
      applyStyles(magnifierLens, {
        position: "absolute",
        display: "none",
        width: `${config.magnifierSize}px`,
        height: `${config.magnifierSize}px`,
        boxShadow: "inset 0 0 30px 3px rgba(0, 0, 0, 0.25)",
        pointerEvents: "none",
        backgroundImage: `url(${config.src})`,
        backgroundRepeat: "no-repeat",
        backgroundColor: "#ffffff",
        ...config.magnifierStyles
      });
      container.append(magnifierLens);
    } else {
      applyStyles(magnifierLens, {
        backgroundRepeat: "no-repeat",
        ...config.magnifierStyles
      });
    }
  
    // Function to update the magnifier position and background
    magnifierLens.move = () => {
      let lensWidth = magnifierLens.getBoundingClientRect().width;
      let lensHeight = magnifierLens.getBoundingClientRect().height;
      let borderWidth = parseInt(magnifierLens.style.borderWidth) || 0;
      let left = mouseX - lensWidth / 2;
      let top = mouseY - lensHeight / 2;
      let backgroundX = -(mouseX * config.zoom - lensWidth / 2 + borderWidth);
      let backgroundY = -(mouseY * config.zoom - lensHeight / 2 + borderWidth);
  
      if (!config.overflow) {
        left = clamp(left, 0, imageWidth - lensWidth);
        top = clamp(top, 0, imageHeight - lensHeight);
        backgroundX = clamp(backgroundX, -imageWidth * config.zoom + lensWidth - borderWidth, -borderWidth);
        backgroundY = clamp(backgroundY, -imageHeight * config.zoom + lensHeight - borderWidth, -borderWidth);
      }
  
      if (options.magnifierElement) {
        applyStyles(magnifierLens, {
          backgroundPositionX: `${backgroundX}px`,
          backgroundPositionY: `${backgroundY}px`,
          backgroundSize: `${imageWidth * config.zoom}px ${imageHeight * config.zoom}px`
        });
      } else {
        applyStyles(magnifierLens, {
          left: `${left}px`,
          top: `${top}px`,
          backgroundPositionX: `${backgroundX}px`,
          backgroundPositionY: `${backgroundY}px`,
          backgroundSize: `${imageWidth * config.zoom}px ${imageHeight * config.zoom}px`
        });
      }
    };
  
    // Function to initialize image dimensions and event listeners
    const initialize = () => {
      imageWidth = mainImage.width;
      imageHeight = mainImage.height;
      mainImage.addEventListener("mousemove", onMouseMove);
      mainImage.addEventListener("mouseleave", onMouseLeave);
      mainImage.addEventListener("mouseover", onMouseOver);
    };
  
    // Event handler for mouse move
    const onMouseMove = (event) => {
      mouseX = event.pageX - container.offsetLeft;
      mouseY = event.pageY - container.offsetTop;
      magnifierLens.move && magnifierLens.move();
    };
  
    // Event handler for mouse leave
    const onMouseLeave = () => {
      if (options.magnifierElement) {
        applyStyles(magnifierLens, {
          backgroundImage: ""
        });
      } else {
        magnifierLens.style.display = "none";
      }
    };
  
    // Event handler for mouse over
    const onMouseOver = () => {
      if (options.magnifierElement) {
        applyStyles(magnifierLens, {
          backgroundImage: `url(${config.src})`
        });
      } else {
        magnifierLens.style.display = "block";
      }
    };
  
    // Initialize the image and event listeners when the image loads
    mainImage.onload = initialize;
  };
  
  // Export the magnifyImage function
  export {
    magnifyImage as default,
    magnifyImage as magnifyImg
  };
  
  // Initialize the magnifyImage function on window object for global use
  let globalWindow = window;
  globalWindow.magnifyImg = magnifyImage;
  