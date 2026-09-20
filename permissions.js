import { calculateBasePermissions, calculateCachedChannelOverwrites } from "./helpers.js";

export function getRolePermissions(guild, role, channel) {
    const permissions = calculateCachedChannelOverwrites(guild, channel, null, role);
    return permissions;
}

export function getMemberPermissions(guild, member, channel) {
    let permissions;

    if (channel) {
        permissions = calculateCachedChannelOverwrites(guild, channel, member);
    } else {
        permissions = calculateBasePermissions(guild, member);
    }

    return permissions;
}