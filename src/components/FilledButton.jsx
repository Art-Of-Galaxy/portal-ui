import PropTypes from "prop-types";

const FilledButton = ({ title, onClick }) => {
  return (
    <>
      <button
        onClick={onClick}
        className=" text-white text-[16px] font-semibold px-4 sm:px-10 py-3 mx-1 bg-primary-color rounded-full flex flex-1 w-[100%] items-center justify-center active:bg-text-color active:text-white duration-200"
      >
        {title}
      </button>
    </>
  );
};
FilledButton.propTypes = {
  title: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
};


export default FilledButton;
