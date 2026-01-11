// Animation utilities for micro-interactions
export const buttonPress = {
  onMouseDown: (e) => {
    e.currentTarget.style.transform = 'scale(0.97)';
    e.currentTarget.style.transition = 'transform 0.1s cubic-bezier(0.4, 0, 0.2, 1)';
  },
  onMouseUp: (e) => {
    e.currentTarget.style.transform = 'scale(1)';
  },
  onMouseLeave: (e) => {
    e.currentTarget.style.transform = 'scale(1)';
  }
};

export const cardHover = {
  onMouseEnter: (e) => {
    e.currentTarget.style.transform = 'translateY(-2px)';
    e.currentTarget.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
  },
  onMouseLeave: (e) => {
    e.currentTarget.style.transform = 'translateY(0)';
  }
};

export const fadeIn = {
  opacity: 0,
  animation: 'fadeIn 0.3s ease-out forwards'
};

export const slideIn = {
  opacity: 0,
  transform: 'translateX(-20px)',
  animation: 'slideIn 0.4s ease-out forwards'
};

// CSS animations to be added to index.css
export const animationCSS = `
@keyframes fadeIn {
  to {
    opacity: 1;
  }
}

@keyframes slideIn {
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes staggerIn {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
`;