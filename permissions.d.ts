type Guild = {
    id: bigint,
    roles: Map<bigint,Role>,
    ownerId: bigint,
};

type Member = {
    id: bigint,
    roles: bigint[],
};

type Role = {
    id: bigint,
    position: number,
    permissions: {
        bitfield: bigint,
    },
};

type Channel = {
    guildId: bigint,
    internalOverwrites: bigint,
};

declare module 'discordeno-manual-permissions' {
    export function getMemberPermissions(guild: Guild, member: Member, channel?: Channel): bigint
    export function getRolePermissions(guild: Guild, role: Role, channel: Channel): bigint
    export function highestRole(guild: Guild, member: Member): Role
    export function higherRolePosition(role: Role, otherRole: Role): boolean
    export function isHigherPosition(guild: Guild, member: Member, compareRole: Role): boolean
}