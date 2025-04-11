import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useLoader } from "../contexts/LoaderContext";

const Layout = ({ children }) => {
  const location = useLocation();
  const { setLoading } = useLoader();

  useEffect(() => {
    // Start loader
    setLoading(true);

    const timeout = setTimeout(() => {
      // Stop loader after 500ms (simulate transition)
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timeout);
  }, [location.pathname]);

  return <>{children}</>;
};

export default Layout;
