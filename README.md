# discordeno-manual-permissions
Discordeno helper functions for dealing with permissions on Discordeno v19 or higher.

Contains copy-pasted code from previous versions of Discordeno itself.

[Apache 2.0 License](LICENSE)

## How to use

Install it via `npm install github:ranawaysuccessfully/discordeno-manual-permissions`. Once you're done, you can just import the functions you need:

```js
import { getMemberPermissions, getRolePermissions } from "discordeno-manual-permissions";

// Get user permissions in guild:
permissions = getMemberPermissions(guild, member);

// Get user permissions in channel:
permissions = getMemberPermissions(guild, member, channel);

// Get role permissions in channel:
permissions = getRolePermissions(guild, role, channel);
```

The return value is of type BigInt (permission bitfield) and can be fed into Discordeno's `new Permissions(permissions)` constructor.

You can then use its methods like `.contains`, `.has`, `.hasAll`, `.missing`, `.remove`, etc. [Check the Discordeno documentation for more information.](https://discordeno.js.org/api_reference/generated/@discordeno/bot/classes/Permissions)

### Without cache

Review your bot's `desiredProperties` and check that it has at least these:

```js
{
    channel: {
        id: true,
        guildId: true,
        parentId: true,
        permissionOverwrites: true,
        type: true,
    },
    guild: {
        id: true,
        roles: true,
        ownerId: true,
    },
    member: {
        id: true,
        roles: true,
    },
    role: {
        id: true,
        position: true,
        permissions: true,
    }
}
```

You may fetch the required properties as follows:

```js
guild = await bot.helpers.getGuild(guildId);
member = await bot.helpers.getMember(guildId, userId);
channel = await bot.helpers.getChannel(channelId);
role = await bot.helpers.getRole(roleId);
```

For threads, you need to supply the parent channel instead:

```js
channel = await bot.helpers.getChannel(channelId);

const isThread = [ChannelTypes.AnnouncementThread, ChannelTypes.PrivateThread, ChannelTypes.PublicThread].includes(channel.type);
if (isThread) {
    channel = await bot.helpers.getChannel(channel.parentId);
}
```

The example above has `ChannelTypes` imported from Discordeno itself.

### With cache

You may simply provide the cached objects, as long as they contain the required fields (see `desiredProperties` above).

The example below is using [dd-cache-proxy](https://github.com/AwesomeStickz/dd-cache-proxy).

```js
guild = await bot.cache.guilds.get(guildId);
member = await bot.cache.members.get(guildId, userId);
channel = await bot.cache.channels.get(channelId);
role = await bot.cache.roles.get(roleId);
```

For threads, you need to supply the parent channel instead:

```js
thread = await bot.cache.channels.get(channelId);
channel = await bot.cache.channels.get(thread.parentId);
```