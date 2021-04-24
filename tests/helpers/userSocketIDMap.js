const userSocketIdMap = new Map();
// https://medium.com/@albanero/socket-io-track-online-users-d8ed1df2cb88

function addClientToMap(userName, socketId) {
  if (!userSocketIdMap.has(userName)) {
    // when user is joining first time
    userSocketIdMap.set(userName, new Set([socketId]));
  } else {
    // user had already joined from one client and now joining using another client;
    userSocketIdMap.get(userName).add(socketId);
  }
}

function removeClientFromMap(userName, socketId) {
  if (userSocketIdMap.has(userName)) {
    const userSocketIdSet = userSocketIdMap.get(userName);
    userSocketIdSet.delete(socketId);
    // if there are no clients for a user, remove that user from online list(map);
    if (userSocketIdSet.size === 0) {
      userSocketIdMap.delete(userName);
    }
  }
}

module.exports = { userSocketIdMap, addClientToMap, removeClientFromMap };
