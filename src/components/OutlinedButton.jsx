import PropTypes from "prop-types";

const OutlinedButton = ({ title, onClick }) => {
  return (
    <>
      <button
        onClick={onClick}
        className=" text-text-color text-[16px] font-semibold px-4 py-2 mx-1 w-full border-text-color border-[2px] rounded-full flex flex-1 items-center justify-center active:bg-text-color active:text-white hover:bg-background-color duration-200"
      >
        {title}
      </button>
    </>
  );
};

OutlinedButton.propTypes = {
  title: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default OutlinedButton;
