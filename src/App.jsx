import "./index.css";
import "./styles/auth.css";
import "./styles/portal.css";
import { Provider } from "react-redux";
import store from "./store/store.js";
import AppRoutes from "./routes/routes.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { LoadingProvider } from "./context/LoadingContext.jsx";
import { LoadingOverlay } from "./components/LoadingOverlay.jsx";

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <LoadingProvider>
          <AppRoutes />
          <LoadingOverlay />
        </LoadingProvider>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
