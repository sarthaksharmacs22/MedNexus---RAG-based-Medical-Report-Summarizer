const Skeleton = ({ className = '', ...props }) => (
  <div
    className={`animate-pulse rounded-md bg-slate-200/90 dark:bg-slate-700/80 ${className}`}
    role="presentation"
    {...props}
  />
);

export default Skeleton;
