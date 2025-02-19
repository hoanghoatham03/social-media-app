import React, { useState, useEffect } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { register } from "../../api/auth";

const Signup = () => {
  const [input, setInput] = useState({
    username: "",
    email: "",
    password: "",
  });

  const changeEventHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  const signupHandler = async (e) => {
    e.preventDefault();
    try {
      const response = await register(input.username, input.email, input.password);
      console.log(response);
      toast.success("Signup successfully");
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {}, []);

  return (
    <div className="flex items-center w-screen h-screen justify-center">
     
        <form
          onSubmit={signupHandler}
          className="shadow-lg flex flex-col gap-5 p-8"
        >
          <div className="my-4">
            <h1 className="text-center font-bold text-xl">LOGO</h1>
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
          <Button type="submit">Signup</Button>

          <span className="text-center">Already have an account? </span>
        </form>
     
    </div>
  );
};

export default Signup;
