import {
  BrowserRouter as Router,
} from "react-router-dom";

import AppLayout from "./pages/AppLayout";

const App = () => {
  return <Router>
    <AppLayout />
  </Router>;
};

export default App;
