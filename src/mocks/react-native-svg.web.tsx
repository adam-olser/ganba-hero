/**
 * Mock for react-native-svg on web
 * Uses native SVG elements
 */
import React from 'react';

// Create components that render native SVG elements
export const Svg = (props: any) => {
  const { children, width, height, viewBox, fill, ...rest } = props;
  return (
    <svg 
      width={width} 
      height={height} 
      viewBox={viewBox} 
      fill={fill || 'none'}
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
    >
      {children}
    </svg>
  );
};

export const Path = (props: any) => {
  const { d, stroke, strokeWidth, strokeLinecap, strokeLinejoin, fill, ...rest } = props;
  return (
    <path 
      d={d}
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap={strokeLinecap}
      strokeLinejoin={strokeLinejoin}
      fill={fill || 'none'}
      {...rest}
    />
  );
};

export const Circle = (props: any) => {
  const { cx, cy, r, stroke, strokeWidth, fill, ...rest } = props;
  return (
    <circle 
      cx={cx}
      cy={cy}
      r={r}
      stroke={stroke}
      strokeWidth={strokeWidth}
      fill={fill || 'none'}
      {...rest}
    />
  );
};

export const Rect = (props: any) => {
  const { x, y, width, height, rx, ry, stroke, strokeWidth, fill, ...rest } = props;
  return (
    <rect 
      x={x}
      y={y}
      width={width}
      height={height}
      rx={rx}
      ry={ry}
      stroke={stroke}
      strokeWidth={strokeWidth}
      fill={fill || 'none'}
      {...rest}
    />
  );
};

export const G = (props: any) => {
  const { children, ...rest } = props;
  return <g {...rest}>{children}</g>;
};

export const Line = (props: any) => {
  const { x1, y1, x2, y2, stroke, strokeWidth, ...rest } = props;
  return (
    <line 
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke={stroke}
      strokeWidth={strokeWidth}
      {...rest}
    />
  );
};

export const Text = (props: any) => {
  const { children, x, y, fill, fontSize, textAnchor, ...rest } = props;
  return (
    <text 
      x={x}
      y={y}
      fill={fill}
      fontSize={fontSize}
      textAnchor={textAnchor}
      {...rest}
    >
      {children}
    </text>
  );
};

export const Defs = (props: any) => <defs {...props} />;
export const LinearGradient = (props: any) => <linearGradient {...props} />;
export const RadialGradient = (props: any) => <radialGradient {...props} />;
export const Stop = (props: any) => <stop {...props} />;
export const ClipPath = (props: any) => <clipPath {...props} />;
export const Mask = (props: any) => <mask {...props} />;
export const Use = (props: any) => <use {...props} />;
export const Symbol = (props: any) => <symbol {...props} />;
export const Ellipse = (props: any) => <ellipse {...props} />;
export const Polygon = (props: any) => <polygon {...props} />;
export const Polyline = (props: any) => <polyline {...props} />;
export const TSpan = (props: any) => <tspan {...props} />;
export const TextPath = (props: any) => <textPath {...props} />;
export const Pattern = (props: any) => <pattern {...props} />;
export const Image = (props: any) => <image {...props} />;
export const ForeignObject = (props: any) => <foreignObject {...props} />;
export const Marker = (props: any) => <marker {...props} />;

export default Svg;

