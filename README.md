# Statistic Counter
Formally known as "Online Friends Count", this is a Replugged plug-in that has been ported from Powercord which introduces an interchangeable statistic counter in-between the home button and servers list.

## Features

- Multiple counters (i.e. number of friends online, total number of friends, incoming friend requests, blocked users, and total number of servers joined).
- Auto rotation with a customizable interval - useful for switching between counters without the need of clicking.

## Planned Features
- [ ] Add a settings page
- [ ] Implement a context menu to quickly change settings

## Settings
To customize the counter, you will need to manually set your preferences by entering the following method under your DevTools console (`Ctrl` + `Shift` + `I` and click on the "Console" tab):

```js
// Replace the `key` and `value` respectively - you can use the table below as a reference
(await replugged.settings.init('xyz.griefmodz.StatisticCounter')).set(key, value);
```

| Key                      | Description                    | Default |
| ------------------------ | ------------------------------ | ------- |
| `autoRotation`           | Rotate between counters        | `false` |
| `autoRotationDelay`      | Delay between rotations        | `3e4`   |
| `autoRotationHoverPause` | Pause the rotation upon hover  | `true`  |
| `preserveLastCounter`    | Remember the last counter      | `false` |
| `online`                 | Enable online counter          | `true`  |
| `friends`                | Enable friends counter         | `true`  |
| `pending`                | Enable pending counter         | `true`  |
| `blocked`                | Enable blocked counter         | `true`  |
| `guilds`                 | Enable servers counter         | `true`  |

## Previews

### Counter
<img alt="Counter" src="https://griefmodz.xyz/uploads/yog4NAGa6G.gif" width="150"/>
