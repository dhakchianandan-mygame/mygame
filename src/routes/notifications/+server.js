import { json, fail } from '@sveltejs/kit';
import { env as public_env } from '$env/dynamic/public';
import { env as private_env } from '$env/dynamic/private';

import webpush from 'web-push';

import {
  addNotification,
  fetchSubscriptions,
  removeSubscription,
} from '$lib/appwrite';

export const POST = async ({ request, url }) => {
  try {
    const source = url.searchParams.get('source');
    let message;
    let title;

    if (source === 'gcp') {
      const { incident } = await request.json();
      console.log("gcp incident", JSON.stringify(incident, null, 2));
      const {
        policy_name: name,
        resource_display_name: resource,
        state,
        observed_value: max = 0,
      } = incident;

      if (state !== 'closed') {
        title = name;
        message = [resource, `backlog: ${max}`].join(',');
      }
    } else {
      let { payload } = Object.fromEntries(await request.formData());
      payload = JSON.parse(payload);

      const {
        counts,
        saved_search: { name },
      } = payload;

      console.log('notification:', name);

      title = name;

      message = counts
        .map(({ source_name: name, timeseries }) => {
          return `${name} : ${Object.values(timeseries).reduce(
            (n1, n2) => n1 + n2,
            0,
          )}`;
        })
        .join(',');
    }

    if (title) {
      const vapid = {
        TTL: 10000,
        vapidDetails: {
          publicKey: public_env.PUBLIC_VAPID_KEY,
          privateKey: private_env.VAPID_PRIVATE_KEY,
          subject: private_env.VAPID_SUBJECT,
        },
      };

      const notification = {
        title,
        options: {
          data: message,
          body: 'mygame',
          timestamp: Date.now(),
        },
      };

      await addNotification(notification);

      (await fetchSubscriptions()).forEach(async ({ id, subscription }) => {
        console.log('sent notification to:', id);
        try {
          await webpush.sendNotification(
            subscription,
            JSON.stringify(notification),
            vapid,
          );
        } catch (error) {
          const { statusCode, body } = error;
          if (statusCode === 410) {
            removeSubscription(id);
          }
          console.error('notification', statusCode, body, subscription);
        }
      });
    }

    return json(
      { success: true },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error('notification', error);
  }

  return fail(400);
};
