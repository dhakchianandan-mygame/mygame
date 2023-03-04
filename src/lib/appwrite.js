import { env } from '$env/dynamic/private';
import { Client, Databases, ID, Query } from 'node-appwrite';

const client = new Client();
const databases = new Databases(client);

client.setEndpoint(env.APPWRITE_URL).setProject(env.APPWRITE_PROJECT);

const addSubscription = async (subscription) => {
  const data = await databases.createDocument(
    env.MYGAME_SOC_DATABASE,
    env.MYGAME_SOC_SUBSCRIPTIONS,
    ID.unique(),
    {
      subscription: JSON.stringify(subscription),
    },
  );

  return {
    ...data,
    id: data.$id
  }
};

const removeSubscription = (id) => {
  return databases.deleteDocument(
    env.MYGAME_SOC_DATABASE,
    env.MYGAME_SOC_SUBSCRIPTIONS,
    id,
  );
};

const getSubscription = (id) => {
  return databases.getDocument(
    env.MYGAME_SOC_DATABASE,
    env.MYGAME_SOC_SUBSCRIPTIONS,
    id,
  );
};

const fetchSubscriptions = async () => {
  const { documents } = await databases.listDocuments(
    env.MYGAME_SOC_DATABASE,
    env.MYGAME_SOC_SUBSCRIPTIONS,
  );

  return documents.map((document) => {
    return {
      ...document,
      id: document.$id,
      subscription: JSON.parse(document.subscription),
    };
  });
};

const addNotification = (notification) => {
  return databases.createDocument(
    env.MYGAME_SOC_DATABASE,
    env.MYGAME_SOC_NOTIFICATIONS,
    ID.unique(),
    {
      notification: JSON.stringify(notification),
    },
  );
};

const fetchNotifications = async () => {
  const { documents } = await databases.listDocuments(
    env.MYGAME_SOC_DATABASE,
    env.MYGAME_SOC_NOTIFICATIONS,
    [Query.orderDesc('$createdAt'), Query.limit(5)],
  );

  return documents.map(({ notification }) => {
    return JSON.parse(notification);
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
