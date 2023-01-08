<script>
  import { enhance } from '$app/forms';
  import { invalidateAll } from '$app/navigation';
  import { b64ToUint8 } from '$lib/string';
  import { env as public_env } from '$env/dynamic/public';

  export let data;

  console.log('page load', data);

  const subscribe = async ({ data, cancel }) => {
    let permission = Notification.permission;
    if (permission !== 'granted') {
      permission = await Notification.requestPermission();
    }

    if (permission !== 'granted') {
      cancel();
      console.log('notification permission not granted');
      return;
    }

    const registration = await navigator.serviceWorker.getRegistration();
    let subscription = await registration?.pushManager.getSubscription();

    if (subscription && data.registered) {
      cancel();
      console.log('subscription already done');
      return;
    }

    subscription = await registration?.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: b64ToUint8(public_env.PUBLIC_VAPID_KEY),
    });

    data.append('subscription', JSON.stringify(subscription));
  };

  const unsubscribe = async ({ data, cancel }) => {
    const registration = await navigator.serviceWorker.getRegistration();
    let subscription = await registration?.pushManager.getSubscription();

    if (!subscription) {
      cancel();
      console.log('not subscribed yet');
      return;
    }

    data.append('subscription', JSON.stringify(subscription));
    await subscription.unsubscribe();
  };
</script>

<svelte:head>
  <title>mygame</title>
  <meta name="description" content="mygame dashboard" />
</svelte:head>

<h1 class="font-serif text-center font-bold text-2xl mb-8">mygame dashboard</h1>

{#if data.registered}
  <form action="?/unsubscribe" method="post" use:enhance={unsubscribe}>
    <button type="submit" class="action">Unsubscribe alerts</button>
  </form>
{:else}
  <form action="?/subscribe" method="post" use:enhance={subscribe}>
    <button type="submit" class="action">Subscribe alerts</button>
  </form>
{/if}

{#if data.notifications.length}
  <h2 class="mt-4 text-xl font-serif font-semibold">Recent alerts</h2>
  <ul class="mt-4">
    {#each data.notifications as notification}
      <li class="border p-1 rounded mb-1">
        <h3 class="text-sm">{notification.title}</h3>
        <h5 class="text-[8px]">
          {new Date(notification.options.timestamp).toLocaleString('en-US', {
            weekday: 'short',
            day: 'numeric',
            year: 'numeric',
            month: 'long',
            hour: 'numeric',
            minute: 'numeric',
          })}
        </h5>
        {#each notification.options.data.split(',') as message}
          <p class="text-[10px] text-gray-500 truncate">
            {message}
          </p>
        {/each}
      </li>
    {/each}
  </ul>
{/if}

<svelte:window on:focus={invalidateAll} />
