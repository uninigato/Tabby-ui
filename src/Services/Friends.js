import { request } from "./Client";

// { friends: [], incoming: [], outgoing: [] }
export function getFriendsOverview() {
  return request("/api/friends");
}

export function sendFriendRequest(fullTag) {
  return request("/api/friends/requests", {
    method: "POST",
    body: { fullTag },
  });
}

export function acceptFriendRequest(friendshipId) {
  return request(`/api/friends/requests/${friendshipId}/accept`, {
    method: "POST",
  });
}

// One call for three cases: decline an incoming request,
// cancel an outgoing one, or unfriend
export function removeFriendship(friendshipId) {
  return request(`/api/friends/${friendshipId}`, { method: "DELETE" });
}