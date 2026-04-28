import PropTypes from "prop-types";
import { Rocket } from "lucide-react";

export default function ComingSoon({ title = "Coming soon", description }) {
  return (
    <div className="portal-page">
      <div className="portal-coming-soon">
        <div className="portal-coming-soon-card">
          <div className="portal-coming-soon-icon">
            <Rocket size={26} />
          </div>
          <h1>{title}</h1>
          <p>
            {description ||
              "We're still building this experience. It will be available here as soon as it's ready."}
          </p>
          <span className="portal-coming-soon-tag">Coming soon</span>
        </div>
      </div>
    </div>
  );
}

ComingSoon.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
};
