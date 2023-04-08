let subscriptions = [];
let notifications = [];

const key = () => {
  return Math.random().toString(36).substring(2);
};

const addSubscription = (subscription) => {
  const id = key();
  subscriptions.push({ id, subscription });
  return {
    id,
    subscription,
  };
};

const removeSubscription = (id) => {
  subscriptions = subscriptions.filter(
    (subscription) => id !== subscription.id,
  );
};

const getSubscription = (id) => {
  const subscription = subscriptions.find(
    (subscription) => id === subscription.id,
  );
  if (subscription) {
    return subscription;
  } else {
    throw new Error();
  }
};

const addNotification = (notification) => {
  if (notifications.length > 10) {
    notifications = notifications.splice(0, 9);
  }
  return notifications.unshift({ id: key(), notification });
};

const fetchSubscriptions = () => {
  return subscriptions;
};

const fetchNotifications = async () => {
  return notifications.slice(0, 5).map(({ notification }) => {
    return notification;
  });
};

export {
  addSubscription,
  removeSubscription,
  getSubscription,
  fetchSubscriptions,
  addNotification,
  fetchNotifications,
};
