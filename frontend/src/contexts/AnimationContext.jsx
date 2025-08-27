import React, { createContext, useContext, useState } from 'react';

const AnimationContext = createContext();

export const AnimationProvider = ({ children }) => {
  const [isExiting, setAnimationExiting] = useState(false);

  return (
    <AnimationContext.Provider value={{ isExiting, setAnimationExiting }}>
      {children}
    </AnimationContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAnimation = () => useContext(AnimationContext);