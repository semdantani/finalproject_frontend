import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/user.context";

const UserAuth = ({ children }) => {
  const { user } = useContext(UserContext);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    // Check for missing token or user
    if (!token || !user) {
      navigate("/login");
      // Note: We intentionally do NOT call setLoading(false) here.
      // Keeping it true prevents the protected 'children' from flashing
      // on the screen for a split second while React Router redirects.
      return;
    }

    // Auth is valid: clear the loading state to render children
    setLoading(false);
  }, [user, navigate]); // FIX: Added missing dependency array

  if (loading) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
};

export default UserAuth;
