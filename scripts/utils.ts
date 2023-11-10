import consola, { LogLevels } from 'consola';
import FanbookCreditMember from '../assets/fanbook/credits/member.json' assert { type: 'json' };
import FanbookCreditCollaborator from '../assets/fanbook/credits/collaborator.json' assert { type: 'json' };
import { Bot, GuildCredit } from 'fanbook-api-node-sdk';

export type Fn = () => any;

export const logger = consola.create({
  level: LogLevels.verbose,
});
export function errorToString(e: unknown) {
  // 不直接打印 e，因为 FanbookApiError 会携带机器人 token
  if (typeof e === 'object' && e !== null && 'stack' in e) {
    // 有 stack 字段的对象，优先使用 stack
    if (e.stack) return e.stack;
  }
  return String(e);
}
export async function exec(fn: Fn) {
  try {
    const ret = fn();
    if (ret instanceof Promise) await ret;
  } catch (e) {
    logger.fatal(errorToString(e));
  }
}

export type Level = 'Collaborator' | 'Maintainer' | 'Member';

if (!process.env.FANBOOK_BOT_TOKEN) {
  logger.fatal('Fanbook bot token is not given');
  process.exit(1);
}
export const fanbook = new Bot(process.env.FANBOOK_BOT_TOKEN);
export const FANBOOK_GUILD_ID = 481087610740391936n;
export const FANBOOK_ROLES: Record<Level, bigint> = {
  Collaborator: 561398112867172353n,
  Maintainer: 481087610820083712n,
  Member: 481091752074522624n,
};
export const FANBOOK_CREDIT_IDS: Partial<Record<Level, string>> = {
  Collaborator: FanbookCreditCollaborator.id,
  Member: FanbookCreditMember.id,
};
export const FANBOOK_CREDITS: Partial<Record<Level, GuildCredit>> = {
  Collaborator: FanbookCreditCollaborator.data,
  Member: FanbookCreditMember.data,
};
