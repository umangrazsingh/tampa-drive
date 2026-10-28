import { useCallback, useState } from "react";

import { MEMBER_KEY, httpCreateSession } from "./requests";

// Who is using the site right now. Saved in localStorage so the Welcome page
// only shows once per device.
// Saved shape: { inviteCode, members: ["Aarav", ...], name: "Aarav" | "" }

function loadMember() {
  try {
    return JSON.parse(localStorage.getItem(MEMBER_KEY)) || {};
  } catch (err) {
    return {};
  }
}

function saveMember(member) {
  try {
    localStorage.setItem(MEMBER_KEY, JSON.stringify(member));
  } catch (err) {
    // private browsing etc. The site still works, it just won't remember you.
  }
}

function useMember() {
  const [member, setMember] = useState(loadMember);
  const [isPending, setPending] = useState(false);
  const [error, setError] = useState(null);

  const update = useCallback((changes) => {
    setMember((current) => {
      const next = { ...current, ...changes };
      saveMember(next);
      return next;
    });
  }, []);

  // Step 1 on the Welcome page: check the invite code with the server
  const submitCode = useCallback(async (inviteCode) => {
    setPending(true);
    setError(null);
    const response = await httpCreateSession(inviteCode);
    setPending(false);
    if (response.ok) {
      update({ inviteCode: inviteCode.trim(), members: response.data.members, name: "" });
    } else {
      setError(response.error);
    }
  }, [update]);

  // Step 2: pick your name from the friend list
  const pickName = useCallback((name) => update({ name }), [update]);

  // "switch" in the header: keep the code, forget the name
  const switchUser = useCallback(() => update({ name: "" }), [update]);

  return {
    name: member.name || "",
    members: member.members || [],
    hasCode: Boolean(member.inviteCode),
    isSignedIn: Boolean(member.inviteCode && member.name),
    isPending,
    error,
    submitCode,
    pickName,
    switchUser,
  };
}

export default useMember;
