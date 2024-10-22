import { motion } from 'framer-motion';

/**
 * A canvas element that is used to render a Granim gradient.
 *
 * The canvas is delayed by 0.1 seconds to allow the parent component
 * to render first. This prevents the gradient from briefly appearing
 * by itself. The delay is arbitrary and can be adjusted.
 *
 * @param id
 * @constructor
 */
export const GradientCanvas = ({ id }: { id: string }) => {
  return (
    <motion.canvas
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.1 }}
      id={id}
      className={'aw-absolute aw-size-full aw-rounded-[10px]'}
    />
  );
};
