import axios from "axios";
import { UserContextProvider } from "./UserContext";
import Routes from "./Routes";

function App() {
  
  axios.defaults.baseURL = 'http://localhost:4000/';
  axios.defaults.withCredentials =true; // set cookies from our api 

  return (
    <UserContextProvider>
      <Routes />
    </UserContextProvider> 
   
  )
}

export default App
