import React, { useContext } from 'react';
import { SwitchTransition, Transition } from 'react-transition-group';
import { useLocation } from 'react-router-dom';
import gsap from 'gsap';

import TransitionContext from '../context/TransitionContext';

const TransitionComponent = ({ children }) => {
  const location = useLocation();
  const { toggleCompleted } = useContext(TransitionContext);
  return (
    <SwitchTransition>
      <Transition
        key={location.pathname}
        timeout={500}
        onEnter={(node) => {
  toggleCompleted(false);
  gsap.set(node, { autoAlpha: 0, scale: 0.8, xPercent: -100 });
  gsap
    .timeline({
      paused: true,
      onComplete: () => {
        // Ждём пока браузер пересчитает layout
        requestAnimationFrame(() => {
          toggleCompleted(true);
        });
      },
    })
    .to(node, { autoAlpha: 1, xPercent: 0, duration: 0.25 })
    .to(node, { scale: 1, duration: 0.25 })
    .play();
}}

      >
        {children}
      </Transition>
    </SwitchTransition>
  );
};

export default TransitionComponent;
