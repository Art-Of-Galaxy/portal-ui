import PropTypes from "prop-types";

const TextButton = ({ onClick, title }) => {
  return (
    <div
      className=" text-muted-color text-[14px] font-normal"
      onClick={onClick}
    >
      {title}
    </div>
  );
};

TextButton.propTypes = {
  title: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default TextButton;
