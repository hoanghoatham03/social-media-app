import { useState, useEffect } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { register } from "../../api/auth";
import { useNavigate, Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Instagram } from "lucide-react";

const Signup = () => {
  const [input, setInput] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const changeEventHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  const signupHandler = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const response = await register(
        input.username,
        input.email,
        input.password
      );
      console.log(response);
      toast.success("Signup successfully");
      navigate("/login");
      setInput({
        username: "",
        email: "",
        password: "",
      });
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {}, []);

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
            Signup to see photos & videos from your friends
          </p>
        </div>
        <div>
          <span className="font-medium">Username</span>
          <Input
            type="text"
            name="username"
            value={input.username}
            onChange={changeEventHandler}
            className="focus-visible:ring-transparent my-2"
          />
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
        {isLoading ? (
          <Button>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Please wait
          </Button>
        ) : (
          <Button type="submit">Signup</Button>
        )}

        <span className="text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-gray-700 font-bold">
            Login
          </Link>{" "}
        </span>
      </form>
    </div>
  );
};

export default Signup;
