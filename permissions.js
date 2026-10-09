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

/** Gets the highest role from the member in this guild */
export function highestRole(guild, member) {
    // Get the roles from the member
    const memberRoles = member.roles;
    // This member has no roles so the highest one is the @everyone role
    if (!memberRoles) return guild.roles.get(guild.id);

    let memberHighestRole;

    for (const roleId of memberRoles) {
        const role = guild.roles.get(roleId);
        // Rare edge case handling if undefined
        if (!role) continue;

        // If memberHighestRole is still undefined we want to assign the role,
        // else we want to check if the current role position is higher than the current memberHighestRole
        if (!memberHighestRole || memberHighestRole.position < role.position) memberHighestRole = role;
        else if (memberHighestRole.position === role.position) {
            // Rare edge case handling if the role position is the same
            if (role.id < memberHighestRole.id) {
                memberHighestRole = role;
            }
        }
    }

    // The member has at least one role so memberHighestRole must exist
    return memberHighestRole;
}

/** Checks if the first role is higher than the second role */
export function higherRolePosition(role, otherRole) {
    if (!role || !otherRole) return false;

    // Rare edge case handling
    if (role.position === otherRole.position) return role.id < otherRole.id;

    return role.position > otherRole.position;
}

/** Checks if the member has a higher position than the given role */
// Guild, GuildMember, Role
export function isHigherPosition(guild, member, compareRole) {
    if (guild.ownerId === member.id) return true;

    const memberHighestRole = highestRole(guild, member);

    return higherRolePosition(guild, memberHighestRole || 0n, compareRole);
}