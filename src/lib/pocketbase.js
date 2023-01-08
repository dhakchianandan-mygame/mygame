import PocketBase from 'pocketbase';
import { env } from '$env/dynamic/private';

const pb = new PocketBase(env.POCKETBASE_URL);

const addSubscription = (subscription) => {
  return pb.collection('mygame_subscriptions').create({ subscription });
};

const removeSubscription = (id) => {
  return pb.collection('mygame_subscriptions').delete(id);
};

const getSubscription = (id) => {
  return pb.collection('mygame_subscriptions').getOne(id);
};

const addNotification = (notification) => {
  return pb.collection('mygame_notifications').create({ notification });
};

const fetchSubscriptions = () => {
  return pb.collection('mygame_subscriptions').getFullList();
};

const fetchNotifications = async () => {
  let { items } = await pb.collection('mygame_notifications').getList(1, 5, {
    sort: '-created',
  });

  return items.map(({ notification }) => {
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
