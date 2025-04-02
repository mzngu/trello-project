import React, { useState, useEffect } from 'react';
import { Dimensions } from 'react-native';
import * as ScreenOrientation from 'expo-screen-orientation';

export const useResponsive = () => {
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));
  const [orientation, setOrientation] = useState<'PORTRAIT' | 'LANDSCAPE'>('PORTRAIT');

  useEffect(() => {
    // Handle dimension changes
    const onChange = ({ window }) => {
      setDimensions(window);
      setOrientation(window.width > window.height ? 'LANDSCAPE' : 'PORTRAIT');
    };

    // Listen for dimension changes
    const dimensionSubscription = Dimensions.addEventListener('change', onChange);

    // Listen for screen orientation changes
    const orientationSubscription = ScreenOrientation.addOrientationChangeListener((orientation) => {
      switch (orientation.orientationInfo.orientation) {
        case ScreenOrientation.Orientation.LANDSCAPE_LEFT:
        case ScreenOrientation.Orientation.LANDSCAPE_RIGHT:
          setOrientation('LANDSCAPE');
          break;
        case ScreenOrientation.Orientation.PORTRAIT_UP:
        case ScreenOrientation.Orientation.PORTRAIT_DOWN:
          setOrientation('PORTRAIT');
          break;
      }
    });

    return () => {
      dimensionSubscription.remove();
      ScreenOrientation.removeOrientationChangeListener(orientationSubscription);
    };
  }, []);

  return {
    width: dimensions.width,
    height: dimensions.height,
    isLandscape: orientation === 'LANDSCAPE',
    isPortrait: orientation === 'PORTRAIT',
    orientation
  };
};