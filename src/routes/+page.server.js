import {
  addSubscription,
  removeSubscription,
  getSubscription,
  fetchNotifications,
} from '$lib/appwrite';

const load = async ({ cookies }) => {
  const id = cookies.get('id');
  let registered = !!id;

  if (registered) {
    try {
      await getSubscription(id);
    } catch (error) {
      console.log(error);

      cookies.delete('id');
      registered = false;
    }
  }

  return {
    registered,
    notifications: await fetchNotifications(),
  };
};

const actions = {
  subscribe: async ({ request, cookies }) => {
    let { subscription } = Object.fromEntries(await request.formData());
    subscription = JSON.parse(subscription);
    const { id } = await addSubscription(subscription);
    console.log('subscribe:', id);

    // DANGER: httpOnly set to false to handle cookie removal from client.
    cookies.set('id', id, {
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30 * 24,
    });

    return { subscribed: true };
  },
  unsubscribe: async ({ request, cookies }) => {
    const id = cookies.get('id');
    console.log('unsubscribe:', id);
    removeSubscription(id);

    cookies.delete('id');

    return { subscribed: false };
  },
};

export { load, actions };
