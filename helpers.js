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
    const overwriteEveryone = channel.internalOverwrites?.find((overwrite) => {
        const [_, id] = separateOverwrites(overwrite);

        return id === channel.guildId;
    });

    if (overwriteEveryone) {
        const [_type, _id, allow, deny] = separateOverwrites(overwriteEveryone);

        // First remove denied permissions since denied < allowed
        permissions &= ~deny;
        permissions |= allow;
    }

    const overwrites = channel.internalOverwrites;

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
        const [_type, id, allowBits, denyBits] = separateOverwrites(overwrite);

        if (!memberRoles.includes(id)) continue;

        deny |= denyBits;
        allow |= allowBits;
    }

    // After role overwrite calculate save allowed permissions first we remove denied permissions since "denied < allowed"
    permissions &= ~deny;
    permissions |= allow;

    // Third calculate member specific overwrites since these have the highest priority
    const overwriteCachedMember = overwrites?.find((overwrite) => {
        const [_, id] = separateOverwrites(overwrite);

        return id === (member ? member.id : role.id);
    });

    if (overwriteCachedMember) {
        const [_type, _id, allowBits, denyBits] = separateOverwrites(overwriteCachedMember);

        permissions &= ~denyBits;
        permissions |= allowBits;
    }

    return permissions;
}

const Mask = (1n << 64n) - 1n;

function separateOverwrites(v) {
    return [Number(unpack64(v, 3)), unpack64(v, 2), unpack64(v, 0), unpack64(v, 1)];
}

function unpack64(v, shift) {
    return (v >> BigInt(shift * 64)) & Mask
}