type Guild = {
    id: bigint,
    roles: Map<bigint,Role>,
    ownerId: string,
};

type Member = {
    id: bigint,
    roles: bigint[],
};

type Role = {
    id: bigint,
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
}