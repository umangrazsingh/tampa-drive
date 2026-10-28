// Keeps content in the middle of the page with a max width.
const Centered = ({ className = "", children, ...rest }) => {
  return <div className={`centered ${className}`} {...rest}>
    {children}
  </div>;
};

export default Centered;
