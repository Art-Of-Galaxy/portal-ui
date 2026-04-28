import React from 'react';
import { cn } from '../../../utils/cn';

interface ColorGroup {
  title: string;
  colors: { hex: string; name: string }[];
}

const colorGroups: ColorGroup[] = [
  {
    title: 'Recommended Colors',
    colors: [
      { hex: '#D1D9C4', name: 'Sage' },
      { hex: '#E8E1E1', name: 'Light Gray' },
      { hex: '#E9A193', name: 'Coral' },
      { hex: '#F7CAC9', name: 'Pink' },
      { hex: '#C5DAC1', name: 'Mint' },
      { hex: '#F3E5AB', name: 'Cream' },
      { hex: '#8B7355', name: 'Brown' },
      { hex: '#C5E6DF', name: 'Aqua' },
      { hex: '#F5F5F5', name: 'White' },
      { hex: '#E6B8AF', name: 'Rose' }
    ]
  },
  {
    title: 'Warm Colors',
    colors: [
      { hex: '#FF4D4D', name: 'Red' },
      { hex: '#FF8533', name: 'Orange' },
      { hex: '#FFA500', name: 'Dark Orange' },
      { hex: '#FFD700', name: 'Gold' },
      { hex: '#FFFF00', name: 'Yellow' },
      { hex: '#ADFF2F', name: 'Yellow Green' },
      { hex: '#7FFF00', name: 'Chartreuse' }
    ]
  },
  {
    title: 'Cool Colors',
    colors: [
      { hex: '#FF1493', name: 'Pink' },
      { hex: '#9400D3', name: 'Purple' },
      { hex: '#4169E1', name: 'Royal Blue' },
      { hex: '#0080FF', name: 'Blue' },
      { hex: '#40E0D0', name: 'Turquoise' },
      { hex: '#2F4F4F', name: 'Dark Slate' },
      { hex: '#00FF7F', name: 'Spring Green' }
    ]
  },
  {
    title: 'Grayscale',
    colors: [
      { hex: '#000000', name: 'Black' },
      { hex: '#333333', name: 'Dark Gray' },
      { hex: '#666666', name: 'Gray' },
      { hex: '#999999', name: 'Medium Gray' },
      { hex: '#CCCCCC', name: 'Light Gray' },
      { hex: '#EEEEEE', name: 'Off White' },
      { hex: '#FFFFFF', name: 'White' }
    ]
  }
];

export function ColorPalette() {
  return (
    <div className="space-y-6">
      {colorGroups.map((group) => (
        <div key={group.title} className="space-y-2">
          <h3 className="text-sm font-medium text-gray-400">{group.title}</h3>
          <div className="grid grid-cols-5 md:grid-cols-7 gap-2">
            {group.colors.map((color) => (
              <ColorSwatch key={color.hex} {...color} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ColorSwatch({ hex, name }: { hex: string; name: string }) {
  const [isSelected, setIsSelected] = React.useState(false);
  const isDark = getLuminance(hex) < 0.5;
  return (
    <label className="cursor-pointer group">
      <input
        type="checkbox"
        name="colors"
        value={hex}
        className="sr-only"
        onChange={(e) => setIsSelected(e.target.checked)}
      />
      <div className="space-y-1">
        <div
          className={cn(
            'w-full aspect-square rounded-lg transition-all',
            'ring-2 ring-offset-2 ring-offset-brand-dark',
            isSelected ? 'ring-brand-blue' : 'ring-transparent',
            'group-hover:ring-brand-blue/50'
          )}
          style={{ backgroundColor: hex }}
        />
        <p 
          className={cn(
            'text-xs text-center transition-colors',
            isSelected ? 'text-white' : 'text-gray-400',
            'group-hover:text-white'
          )}
        >
          {name}
        </p>
      </div>
    </label>
  );
}

// Helper function to calculate color luminance
function getLuminance(hex: string): number {
  const rgb = hex.match(/\w\w/g)?.map(x => parseInt(x, 16)) || [0, 0, 0];
  const [r, g, b] = rgb.map(x => {
    x = x / 255;
    return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}