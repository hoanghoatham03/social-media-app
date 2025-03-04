import { useEffect, useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../../api/auth";
import { Loader2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { setAuthUser } from "../../redux/authSlice";
import { Instagram } from "lucide-react";

const Login = () => {
  const [input, setInput] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const { user } = useSelector((store) => store.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const changeEventHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  const signupHandler = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await login(input.email, input.password);
      if (res.success) {
        console.log("res", res);
        dispatch(setAuthUser(res.data.user));
        localStorage.setItem("accessToken", res.data.accessToken);
        localStorage.setItem("isLoggedIn", "true");
        navigate("/");
        toast.success("Login successfully");
        setInput({
          email: "",
          password: "",
        });
      }
    } catch (error) {
      console.log(error);
      toast.error("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && localStorage.getItem("isLoggedIn") === "true") {
      console.log("code is running");
      console.log(localStorage.getItem("isLoggedIn"));
      navigate("/");
    }
  }, [user]);

  return (
    <div className="flex items-center w-screen h-screen justify-center">
      <form
        onSubmit={signupHandler}
        className="shadow-2xl flex flex-col gap-5 p-8 rounded-lg"
      >
        <div className="my-4">
          <h1 className="text-center font-bold text-xl flex items-center justify-center gap-2 text-gray-700 mb-2">
            <Instagram className="w-6 h-6" /> Instagram
          </h1>
          <p className="text-sm text-center">
            Login to see photos & videos from your friends
          </p>
        </div>
        <div>
          <span className="font-medium">Email</span>
          <Input
            type="email"
            name="email"
            value={input.email}
            onChange={changeEventHandler}
            className="focus-visible:ring-transparent my-2"
          />
        </div>
        <div>
          <span className="font-medium">Password</span>
          <Input
            type="password"
            name="password"
            value={input.password}
            onChange={changeEventHandler}
            className="focus-visible:ring-transparent my-2"
          />
        </div>
        {loading ? (
          <Button>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Please wait
          </Button>
        ) : (
          <Button type="submit">Login</Button>
        )}

        <span className="text-center">
          Don&apos;t have an account?{" "}
          <Link to="/signup" className="text-gray-700 font-bold">
            Signup
          </Link>
        </span>
      </form>
    </div>
  );
};

export default Login;
