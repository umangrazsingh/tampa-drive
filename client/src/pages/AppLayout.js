import {
  Switch,
  Route,
  Redirect,
} from "react-router-dom";

import useMember from "../hooks/useMember";
import useDestinations from "../hooks/useDestinations";
import useRides from "../hooks/useRides";

import Header from "../components/Header";
import Footer from "../components/Footer";

import Welcome from "./Welcome";
import Upcoming from "./Upcoming";
import PostRide from "./PostRide";
import History from "./History";

// Loads the data with hooks and hands it to whichever page the URL points at.
const AppLayout = () => {
  const member = useMember();
  const destinations = useDestinations(member.isSignedIn);
  const rides = useRides(member.name, member.isSignedIn);

  return <div className="app">
    <Header
      name={member.name}
      isSignedIn={member.isSignedIn}
      onSwitchUser={member.switchUser} />

    <main className="app-main">
      {!member.isSignedIn
        ? <Welcome member={member} />
        : <Switch>
            <Route exact path="/">
              <Upcoming
                name={member.name}
                rides={rides.upcoming}
                isPending={rides.isPending}
                message={rides.message}
                clearMessage={rides.clearMessage}
                joinRide={rides.joinRide}
                leaveRide={rides.leaveRide}
                cancelRide={rides.cancelRide} />
            </Route>
            <Route exact path="/post">
              <PostRide
                destinations={destinations}
                isPending={rides.isPending}
                message={rides.message}
                clearMessage={rides.clearMessage}
                postRide={rides.postRide} />
            </Route>
            <Route exact path="/history">
              <History rides={rides.history} />
            </Route>
            <Redirect to="/" />
          </Switch>}
    </main>

    <Footer />
  </div>;
};

export default AppLayout;
