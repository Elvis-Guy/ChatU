import { useContext } from "react";
import Register from "./RegisterAndLoginForm";
import { UserContext } from "./UserContext";

export default function Routes() {
  // eslint-disable-next-line no-unused-vars
  const {username, id} =useContext(UserContext);

  if (username) {
    return 'Logged in ' + username;
  }

  return (
    <Register />
  );
}