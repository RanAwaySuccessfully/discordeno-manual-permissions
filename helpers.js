let calculateBits;

try {
  const util = await import("@discordeno/utils");
  calculateBits = util.calculateBits;
} catch (error) {
    // should be fine...
}

/** Calculates the permissions this member has in the given guild */
export const calculateBasePermissions = (guild, member) => {
    if (!guild || !member) return 0n;

    let permissions = 0n;
    // Calculate the role permissions bits, @everyone role is not in memberRoleIds so we need to pass guildId manually
    permissions |=
        [...member.roles, guild.id]
            .map((id) => guild.roles.get(id)?.permissions)
            // Removes any edge case undefined
            .filter((perm) => perm)
            .reduce((bits, perms) => {
                bits |= perms.bitfield;
                return bits;
            }, 0n) || 0n;

    // If the memberId is equal to the guild ownerId he automatically has every permission so we add ADMINISTRATOR permission
    if (guild.ownerId === member.id) permissions |= 8n;
    // Return the members permission bits as a string
    return permissions;
}

/** Calculates the permissions this member has for the given CachedChannel */
export const calculateCachedChannelOverwrites = (guild, channel, member, role) => {
    if (!guild || !channel) return 0n;
    if (!member && !role) return 0n;

    // Get all the role permissions this member already has
    let permissions = member ? 
        calculateBasePermissions(guild, member) :
        role.permissions.bitfield;

    // First calculate @everyone overwrites since these have the lowest priority
    const overwriteEveryone = channel.permissionOverwrites?.find((overwrite) => {
        return overwrite.id === channel.guildId;
    });

    if (overwriteEveryone) {
        let deny = getPermissionBits(overwriteEveryone.deny);
        let allow = getPermissionBits(overwriteEveryone.allow);

        // First remove denied permissions since denied < allowed
        permissions &= ~deny;
        permissions |= allow;
    }

    const overwrites = channel.permissionOverwrites;

    // In order to calculate the role permissions correctly we need to temporarily save the allowed and denied permissions
    let allow = 0n;
    let deny = 0n;
    let memberRoles;

    if (member) {
        memberRoles = member.roles || [];
    } else {
        memberRoles = [role.id];
    }

    // Second calculate members role overwrites since these have middle priority
    for (const overwrite of overwrites || []) {
        if (!memberRoles.includes(overwrite.id)) continue;

        let denyBits = getPermissionBits(overwrite.deny);
        let allowBits = getPermissionBits(overwrite.allow);

        deny |= denyBits;
        allow |= allowBits;
    }

    // After role overwrite calculate save allowed permissions first we remove denied permissions since "denied < allowed"
    permissions &= ~deny;
    permissions |= allow;

    // Third calculate member specific overwrites since these have the highest priority
    const overwriteCachedMember = overwrites?.find((overwrite) => {
        return overwrite.id === (member ? member.id : role.id);
    });

    if (overwriteCachedMember) {
        let denyBits = getPermissionBits(overwriteCachedMember.deny);
        let allowBits = getPermissionBits(overwriteCachedMember.allow);

        permissions &= ~denyBits;
        permissions |= allowBits;
    }

    return permissions;
}

function getPermissionBits(permissions) {
    if (typeof permissions === "bigint") {
        return permissions;
    }

    return BigInt(calculateBits(permissions));
}