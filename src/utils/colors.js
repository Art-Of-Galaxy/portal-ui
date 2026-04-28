export const brandColors = {
  // Primary colors
  primary: {
    blue: '#377cc7',
    green: '#0de39b'
  },

  // Gradients
  gradients: {
    // Full gradient (for long buttons and large text)
    full: {
      base: 'bg-gradient-to-r from-[#5541ff] to-[#00ff89]',
      hover: 'hover:from-[#4a39ff] hover:to-[#00f280]'
    },
    // Mid gradient (for middle/small buttons and text)
    mid: {
      base: 'bg-gradient-to-r from-[#377cc7] to-[#0de39b]',
      hover: 'hover:from-[#2d6eb9] hover:to-[#0cd892]'
    }
  },

  // Text gradients
  text: {
    gradient: 'bg-clip-text text-transparent'
  },

  // Background colors
  background: {
    dark: '#0A1628',
    card: '#1A2737',
    cardHover: '#1E2E42'
  }
};

// Helper function to get gradient classes
export const getGradientClasses = (size, includeHover = true) => {
  const gradient = brandColors.gradients[size];
  return includeHover ? `${gradient.base} ${gradient.hover}` : gradient.base;
};

// Helper function to get text gradient classes
export const getTextGradientClasses = (size) => {
  return `${brandColors.text.gradient} ${brandColors.gradients[size].base}`;
};
