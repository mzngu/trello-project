import { Dimensions } from 'react-native';

export const getResponsiveFontSize = (size: number) => {
  const { width, height } = Dimensions.get('window');
  const standardScreenWidth = 375; // iPhone X width
  const standardScreenHeight = 812; // iPhone X height

  const scaleFactor = Math.min(width / standardScreenWidth, height / standardScreenHeight);
  return size * scaleFactor;
};

export const getResponsiveDimension = (size: number, type: 'width' | 'height' = 'width') => {
  const { width, height } = Dimensions.get('window');
  const standardScreenWidth = 375;
  const standardScreenHeight = 812;

  const scaleFactor = type === 'width' 
    ? width / standardScreenWidth 
    : height / standardScreenHeight;

  return size * scaleFactor;
};