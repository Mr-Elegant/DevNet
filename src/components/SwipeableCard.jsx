import { motion, useMotionValue, useTransform, useAnimation } from "framer-motion";
import { useEffect } from "react";

const SwipeableCard = ({
  children,
  onSwipe,
  onCardLeftScreen,
  onDragStateChange,
  swipeThreshold = 120,
  active = false,
  forceSwipe = null,
}) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Custom rotation and opacity maps for smooth organic feedback
  const rotate = useTransform(x, [-250, 250], [-25, 25]);
  const opacity = useTransform(x, [-250, -150, 0, 150, 250], [0.6, 0.9, 1, 0.9, 0.6]);

  const controls = useAnimation();

  // Handles programmatic button triggers (Ignore / Connect)
  useEffect(() => {
    if (forceSwipe && active) {
      const animateOffScreen = async () => {
        onDragStateChange(forceSwipe); // Show LIKE/NOPE stamps during animation
        await controls.start({
          x: forceSwipe === "left" ? -450 : 450,
          opacity: 0,
          rotate: forceSwipe === "left" ? -20 : 20,
          transition: { duration: 0.25, ease: "easeOut" }
        });
        onSwipe(forceSwipe);
        onCardLeftScreen();
      };
      animateOffScreen();
    }
  }, [forceSwipe, active, controls]);

  const handleDrag = (event, info) => {
    if (!active) return;
    const dragX = info.offset.x;

    if (dragX < -40) {
      onDragStateChange("left");
    } else if (dragX > 40) {
      onDragStateChange("right");
    } else {
      onDragStateChange(null);
    }
  };

  const handleDragEnd = async (event, info) => {
    if (!active) return;
    const dragX = info.offset.x;

    if (dragX < -swipeThreshold) {
      // Dragged left past threshold
      onDragStateChange(null);
      await controls.start({
        x: -450,
        opacity: 0,
        rotate: -20,
        transition: { duration: 0.2, ease: "easeOut" }
      });
      onSwipe("left");
      onCardLeftScreen();
    } else if (dragX > swipeThreshold) {
      // Dragged right past threshold
      onDragStateChange(null);
      await controls.start({
        x: 450,
        opacity: 0,
        rotate: 20,
        transition: { duration: 0.2, ease: "easeOut" }
      });
      onSwipe("right");
      onCardLeftScreen();
    } else {
      // Snap back to center with spring simulation
      onDragStateChange(null);
      controls.start({
        x: 0,
        y: 0,
        opacity: 1,
        rotate: 0,
        transition: { type: "spring", stiffness: 350, damping: 22 }
      });
    }
  };

  return (
    <motion.div
      drag={active ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.8}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      style={{ x, y, rotate, opacity }}
      animate={controls}
      className={`absolute w-full h-full ${active ? "cursor-grab active:cursor-grabbing touch-none select-none z-30" : "pointer-events-none z-10"}`}
    >
      {children}
    </motion.div>
  );
};

export default SwipeableCard;
