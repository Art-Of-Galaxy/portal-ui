import PropTypes from "prop-types";
import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const InputField = ({ name, type, placeholder, value, onChange, error, disabled }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <input
        type={type === "password" && showPassword ? "text" : type}
        id={name}
        name={name}
        value={value}
        className={`bg-background-color border my-2 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-text-color focus:border-[1.5px] focus:outline-none block w-full p-2.5 
        ${error ? "border-red-500" : ""}`}
        placeholder={placeholder}
        required
        disabled={disabled}
        onChange={onChange}
      />
      {type === "password" && (
        <span
          className="absolute right-3 top-[35%] cursor-pointer text-gray-500"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? <FaEyeSlash /> : <FaEye />}
        </span>
      )}
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

InputField.propTypes = {
  name: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onChange: PropTypes.func.isRequired,
  error: PropTypes.string,
  disabled: PropTypes.bool
};

export default InputField;
