import { useCallback, useEffect, useState } from "react";

import { httpGetDestinations } from "./requests";

function useDestinations(enabled) {
  const [destinations, saveDestinations] = useState([]);

  const getDestinations = useCallback(async () => {
    const response = await httpGetDestinations();
    if (response.ok) saveDestinations(response.data);
  }, []);

  useEffect(() => {
    if (enabled) getDestinations();
  }, [enabled, getDestinations]);

  return destinations;
}

export default useDestinations;
