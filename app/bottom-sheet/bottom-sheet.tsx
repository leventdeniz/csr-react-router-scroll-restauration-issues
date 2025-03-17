import React, { useRef, useEffect } from "react";
import styles from './bottom-sheet.module.css';

const useBackgroundTapToDismiss = (
  backgroundElementRef: React.RefObject<HTMLDivElement | null>,
  dismiss: () => void
  ) => {
  useEffect(() => {
    if (!backgroundElementRef.current) return;

    const backgroundElement: HTMLDivElement = backgroundElementRef.current;
    const pointerStart: { x: undefined | number, y: undefined | number } = {x: undefined, y: undefined};

    registerEventListener(backgroundElement);

    function handlePointerDown(event: PointerEvent) {
      event.preventDefault();
      event.stopPropagation();
      pointerStart.x = event.clientX;
      pointerStart.y = event.clientY;
    }

    function handlePointerMove(event: Event) {
      event.preventDefault();
      event.stopPropagation();
    }

    function handlePointerUp(event: PointerEvent) {
      if (pointerStart.x === undefined || pointerStart.y === undefined) return;
      const pointerEnd = {x: event.clientX, y: event.clientY};
      const pointerDelta = {
        x: Math.abs(pointerEnd.x - pointerStart.x || 0),
        y: Math.abs(pointerEnd.y - pointerStart.y || 0)
      };
      const didMove = pointerDelta.x > 5 || pointerDelta.y > 5;
      if (didMove) {
        return;
      }
      dismiss();
    }

    function registerEventListener(target: HTMLElement) {
      target.addEventListener("pointerdown", handlePointerDown, {passive: false});
      ['mousemove', 'touchmove'].forEach(eventName => {
        target.addEventListener(eventName, handlePointerMove, {passive: false});
      });
      target.addEventListener("pointerup", handlePointerUp);
    }

    function unregisterEventListener(target: HTMLElement) {
      target.removeEventListener("pointerdown", handlePointerDown);
      ['mousemove', 'touchmove'].forEach(eventName => {
        target.removeEventListener(eventName, handlePointerMove);
      });
      target.removeEventListener("pointerup", handlePointerUp);
    }

    return () => {
      unregisterEventListener(backgroundElement)
    };
  }, [backgroundElementRef, dismiss]);
};

const usePreventBackgroundScrolling = (needsDisabledScrolling: boolean, scrollableContentElementRef: React.RefObject<HTMLElement | null>) => {
  // disable scrolling. this can cause momentum scrolling
  // when dragging the bottom sheet down
  useEffect(() => {
    if (needsDisabledScrolling) disableScroll();
    if (!needsDisabledScrolling) enableScroll();
  }, [needsDisabledScrolling])

  // prevent momentum scrolling on end of a fast touch move
  useEffect(() => {
    if (needsDisabledScrolling) {
      window.addEventListener('pointermove', preventScrolling, {passive: false});
    } else {
      window.removeEventListener('pointermove', preventScrolling);
    }

    return () => {
      window.removeEventListener('pointermove', preventScrolling);
    }
  }, [needsDisabledScrolling]);

  // allow scrolling on the actual content element
  useEffect(() => {
    if (!scrollableContentElementRef.current) return;
    const scrollableContentElement = scrollableContentElementRef.current;
    scrollableContentElement.addEventListener('pointermove', stopPropagation);

    return () => {
      scrollableContentElement.removeEventListener('pointermove', stopPropagation);
    }
  }, [scrollableContentElementRef])

  function disableScroll() {
    const scrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.top = `-${scrollY}px`;
  }

  function enableScroll() {
    const scrollY = document.body.style.top;
    document.body.style.position = '';
    document.body.style.top = '';
    window.scrollTo(0, parseInt(scrollY || '0') * -1);
  }

  function stopPropagation(event: PointerEvent) {
    event.stopPropagation()
  }

  function preventScrolling(event: PointerEvent) {
    event.preventDefault();
  }
}

const useDragToDismiss = (
  componentElementRef: React.RefObject<HTMLDivElement | null>,
  draggableElementRef: React.RefObject<HTMLDivElement | null>,
  containerElementRef: React.RefObject<HTMLDivElement | null>,
  backgroundElementRef: React.RefObject<HTMLDivElement | null>,
  contentElementRef: React.RefObject<HTMLDivElement | null>,
  isOpen: boolean,
  dismiss: () => void,
  options: { dismissDistancePercentage?: number, elasticDrag?: boolean, height?: string } = {},
  debugElementRef: React.RefObject<HTMLDivElement | null>
): string => {
  const pointerStartY = useRef(0);
  const containerClassName = useRef('');
  const isDragging = useRef(false);

  useEffect(() => {
    if (!isOpen || !draggableElementRef.current || !containerElementRef.current || !backgroundElementRef.current || !componentElementRef.current || !contentElementRef.current) {
      return;
    }

    const componentElement: HTMLDivElement = componentElementRef.current;
    const draggableElement: HTMLDivElement = draggableElementRef.current;
    const containerElement: HTMLDivElement = containerElementRef.current;
    const backgroundElement: HTMLDivElement = backgroundElementRef.current;
    const contentElement: HTMLDivElement = contentElementRef.current;

    let moveDistance = 0; // used to determine if the user dragged the element far enough to dismiss it
    let moveDirection: 'none' | 'up' | 'down' = 'none';
    let pointerPreviousY = 0; // used to determine the direction of the move
    pointerStartY.current = 0;
    isDragging.current = false;
    let containerHeight = containerElement.clientHeight;


    const settings = {
      ...{dismissDistancePercentage: 20, elasticDrag: false, height: '60vh'},
      ...options
    }

    containerElement.style.maxHeight = settings.height;

    let dismissDistance = containerHeight * (settings.dismissDistancePercentage / 100);

    const eventHandler = {
      registerEventHandler: (target: HTMLElement) => {
        // we add the starting eventlistener right on the handle but the move and end listener on the documnet
        // this way we can ensure that we can still drag the element even if the pointer leaves the handle
        ['mousedown', 'touchstart'].forEach(eventName => target.addEventListener(eventName, eventHandler.handlePointerDown, {passive: false}));
        ['mousemove', 'touchmove'].forEach(eventName => document.addEventListener(eventName, eventHandler.handlePointerMove, {
          passive: false,
          capture: true
        }));
        ['mouseup', 'touchend'].forEach(eventName => document.addEventListener(eventName, eventHandler.handlePointerUp));
      },
      unregisterEventHandler: (target: HTMLElement) => {
        ['mousedown', 'touchstart'].forEach(eventName => target.removeEventListener(eventName, eventHandler.handlePointerDown));
        ['mousemove', 'touchmove'].forEach(eventName => document.removeEventListener(eventName, eventHandler.handlePointerMove, {capture: true}));
        ['mouseup', 'touchend'].forEach(eventName => document.removeEventListener(eventName, eventHandler.handlePointerUp));
      },
      handlePointerDown: (event: Event) => {
        // prevents momentum scrolling
        event.preventDefault();

        const pointerY = event instanceof TouchEvent
                         ? event.touches[0].clientY
                         : event instanceof MouseEvent
                           ? event.clientY : 0;

        dragging.startDrag(pointerY);
        if(debugElementRef.current){
          debugElementRef.current.innerHTML = `${moveDistance}`;
          debugElementRef.current.innerHTML += `\n${dismissDistance}`;
        }
      },
      handlePointerMove: (event: Event) => {
        if (!isDragging.current) return;

        const clientY =
          event instanceof TouchEvent
          ? event.touches[0].clientY
          : event instanceof MouseEvent
            ? event.clientY : 0;

        dragging.moveDrag(clientY);
        if(debugElementRef.current){
          debugElementRef.current.innerHTML = `${moveDistance}`;
          debugElementRef.current.innerHTML += `\n${dismissDistance}`;
        }
      },
      handlePointerUp: () => {
        if (!isDragging.current) return;
        dragging.endDrag();
        if(debugElementRef.current){
          debugElementRef.current.innerHTML = `${moveDistance}`;
          debugElementRef.current.innerHTML += `\n${dismissDistance}`;
        }
        if (moveDistance <= dismissDistance || moveDirection === 'up') return;
        dismiss();
      }
    }

    const dragging = {
      startDrag: (pointerY: number) => {
        isDragging.current = true;
        componentElement.classList.add(styles.isUserInteracting);
        containerClassName.current = styles.isUserInteracting;
        moveDistance = 0;
        pointerStartY.current = pointerY;
        containerHeight = containerElement.clientHeight;
        dragging.updateBackgroundOpacity(moveDistance);
      },
      moveDrag: (clientY: number) => {
        if(settings.elasticDrag){
          dragging.elasticDrag(clientY);
        } else {
          moveDistance = Math.max(0, clientY - pointerStartY.current)
        }
        
        moveDirection = clientY > pointerPreviousY ? 'down' : 'up';
        pointerPreviousY = clientY;
        if(moveDistance > 0){
          containerElement.style.transform = `translateY(${moveDistance}px)`;
        }
        dragging.updateBackgroundOpacity(moveDistance)
      },
      endDrag: () => {
        isDragging.current = false;
        componentElement.classList.remove(styles.isUserInteracting);
        containerClassName.current = '';
        backgroundElement.style.opacity = '';
        containerElement.removeAttribute('style');
        containerElement.style.maxHeight = settings.height;
      },
      elasticDrag: (clientY: number) => {
        moveDistance = clientY - pointerStartY.current;

        if(moveDistance < 0){
          moveDistance /= 3;
          containerElement.style.height = `${containerHeight - moveDistance}px`;
          containerElement.style.maxHeight = `${containerHeight - moveDistance}px`;
        }
      },
      updateBackgroundOpacity: (moveDistance: number) => {
        const opacity = Math.max(0.3, 1 - (moveDistance / containerElement.clientHeight));
        if (opacity === 1) {
          backgroundElement.style.opacity = '';
          return;
        }
        backgroundElement.style.opacity = `${opacity}`;
      }
    }

    eventHandler.registerEventHandler(draggableElement);
    
    // Add event handlers for content element
    const contentEventHandler = {
      isAtTop: false,
      
      handleScroll: (event: Event) => {
        const target = event.target as HTMLElement;

        const isInteractiveElement = 
          target.tagName === 'INPUT' || 
          target.tagName === 'BUTTON' || 
          target.tagName === 'SELECT' || 
          target.tagName === 'TEXTAREA' || 
          target.tagName === 'A' || 
          target.hasAttribute('role') || 
          target.contentEditable === 'true' ||
          target.closest('button, a, input, select, textarea, [role="button"]') !== null;
          
        if (isInteractiveElement) {
          return;
        }
      },
      
      handlePointerUp: () => {
        // console.log('pointer up');
        // contentEventHandler.isAtTop = false;
      },

      handlePointerMove: (event: Event) => {
        const target = event.target as HTMLElement;
        const isInteractiveElement = 
          target.tagName === 'INPUT' || 
          target.tagName === 'BUTTON' || 
          target.tagName === 'SELECT' || 
          target.tagName === 'TEXTAREA' || 
          target.tagName === 'A' || 
          target.hasAttribute('role') || 
          target.contentEditable === 'true' ||
          target.closest('button, a, input, select, textarea, [role="button"]') !== null;
          
        if (isInteractiveElement) {
          return;
        }

        const pointerY = event instanceof TouchEvent
        ? event.touches[0].clientY
        : event instanceof MouseEvent
          ? event.clientY : 0;
        const contentElementScrollValue = contentElement.scrollTop || 0;

        if (contentElementScrollValue <= 0) {
           // prevents momentum scrolling
           event.preventDefault();

           if (!isDragging.current) {
            console.log('start drag');
            dragging.startDrag(pointerY);
           }
        }
      },
      
      handleContentPointerDown: (event: Event) => {
        return;
      },
      
      registerContentEventHandler: (target: HTMLElement) => {
        target.addEventListener('scroll', contentEventHandler.handleScroll);
        ['mousedown', 'touchstart'].forEach(eventName => 
          target.addEventListener(eventName, contentEventHandler.handleContentPointerDown, {passive: false})
        );
        ['mousemove', 'touchmove'].forEach(eventName => 
          target.addEventListener(eventName, contentEventHandler.handlePointerMove, {passive: false,  capture: true})
        );
        ['mouseup', 'touchend'].forEach(eventName => 
          document.addEventListener(eventName, contentEventHandler.handlePointerUp)
        );
      },
      
      unregisterContentEventHandler: (target: HTMLElement) => {
        target.removeEventListener('scroll', contentEventHandler.handleScroll);
        ['mousedown', 'touchstart'].forEach(eventName => 
          target.removeEventListener(eventName, contentEventHandler.handleContentPointerDown)
        );
        ['mousemove', 'touchmove'].forEach(eventName => 
          target.removeEventListener(eventName, contentEventHandler.handlePointerMove)
        );
        ['mouseup', 'touchend'].forEach(eventName => 
          document.removeEventListener(eventName, contentEventHandler.handlePointerUp)
        );
      }
    };
    
    contentEventHandler.registerContentEventHandler(contentElement);

    return () => {
      eventHandler.unregisterEventHandler(draggableElement);
      contentEventHandler.unregisterContentEventHandler(contentElement);
    };
  }, [isOpen, dismiss, draggableElementRef, containerElementRef, backgroundElementRef, componentElementRef, contentElementRef, options]);

  return containerClassName.current;
};

interface BottomSheetProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  height?: string;
}

const BottomSheet = ({ children, isOpen, onClose, height = '60vh' }: BottomSheetProps) => {
  const componentElementRef = useRef<HTMLDivElement>(null);
  const backgroundElementRef = useRef<HTMLDivElement>(null);
  const containerElementRef = useRef<HTMLDivElement>(null);
  const contentElementRef = useRef<HTMLDivElement>(null);
  const handleElementRef = useRef<HTMLDivElement>(null);
  const debugElementRef = useRef<HTMLDivElement>(null);

  useBackgroundTapToDismiss(backgroundElementRef, onClose);

  const transitioningClassName = useDragToDismiss(
    componentElementRef,
    handleElementRef,
    containerElementRef,
    backgroundElementRef,
    contentElementRef,
    isOpen,
    onClose,
    { elasticDrag: true },
    debugElementRef
  );

  usePreventBackgroundScrolling(isOpen, contentElementRef);

  useEffect(() => {
    if (isOpen && contentElementRef) {
      contentElementRef.current?.scrollTo(0, 1);
    }
  }, [isOpen]);

  return (
    <div className={[styles.bottomSheet, transitioningClassName, isOpen ? styles.open : ''].join(' ')} ref={componentElementRef}>
      <div ref={debugElementRef} className={styles.debug} />
      <div
        className={styles.background}
        ref={backgroundElementRef}
      />

      <div 
        className={[styles.content].join(' ')}
        ref={containerElementRef}
        style={{ maxHeight: height }}
      >
        <div className={styles.handle} ref={handleElementRef} />
        <div className="overflow-y-auto" ref={contentElementRef}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default BottomSheet;
