import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../app/providers/AuthProvider";
import { errorMessage } from "../../../services/api";
export function useLogin(roles, destination) {
  const { login, logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const submit = async (event) => {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      const user = await login(form);
      if (!roles.includes(user.role)) {
        await logout();
        throw new Error(
          "This account does not have access to this application.",
        );
      }
      navigate(destination, { replace: true });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setPending(false);
    }
  };
  return { form, setForm, error, pending, submit };
}
