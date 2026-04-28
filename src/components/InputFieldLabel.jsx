import PropTypes from "prop-types";

const InputFieldLabel = ({ text }) => {
  return <div className="text-text-color text-[16px] font-medium">{text}</div>;
};

InputFieldLabel.propTypes = {
  text: PropTypes.string.isRequired, 
};
export default InputFieldLabel;
