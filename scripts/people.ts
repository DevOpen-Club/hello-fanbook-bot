import { FANBOOK_CREDITS, FANBOOK_CREDIT_IDS, FANBOOK_GUILD_ID, FANBOOK_ROLES, Level, errorToString, exec, fanbook, logger } from './utils.js';

interface OperateOptions {
  type: 'onboard' | 'dismiss';
  level: Level;
  fanbookUserId: bigint;
}

async function processFanbookRole({ type, level, fanbookUserId }: OperateOptions) {
  try {
    switch (type) {
      case 'onboard':
        await fanbook.addMemberRole(
          FANBOOK_GUILD_ID,
          fanbookUserId,
          [FANBOOK_ROLES[level]],
        );
        break;
      case 'dismiss':
        await fanbook.removeMemberRole(
          FANBOOK_GUILD_ID,
          fanbookUserId,
          [FANBOOK_ROLES[level]],
        );
        break;
    }
    logger.success('成功处理 Fanbook 身份组变更');
  } catch (e) {
    logger.fail('处理 Fanbook 身份组失败：%s', errorToString(e));
  }
}

async function processFanbookCredit({ type, level, fanbookUserId }: OperateOptions) {
  const credit = FANBOOK_CREDITS[level], id = FANBOOK_CREDIT_IDS[level];
  if (!credit || !id) {
    logger.success('无需处理 Fanbook 荣誉变更');
    return;
  }
  try {
    switch (type) {
      case 'onboard':
        await fanbook.setUserCredit(
          fanbookUserId,
          credit,
          { guild: FANBOOK_GUILD_ID, card: id },
        );
        break;
      case 'dismiss':
        await fanbook.deleteGuildUserCredit(
          fanbookUserId,
          id,
          { guild: `${FANBOOK_GUILD_ID}` },
        );
        break;
    }
    logger.success('成功处理 Fanbook 荣誉');
  } catch (e) {
    logger.fail('处理 Fanbook 荣誉失败：%s', errorToString(e));
  }
}

async function operate(options: OperateOptions) {
  const { type, level, fanbookUserId } = options;
  logger.box(
    `操作类型：${type}\n` +
    `职位：${level}\n` +
    `Fanbook User ID：${fanbookUserId}`,
  );
  await Promise.allSettled([
    processFanbookRole(options),
    processFanbookCredit(options),
  ]);
}

await exec(async () => {
  logger.start('开始处理职位变更');
  const [fanbookUser] = await fanbook.getMembersByShortIds(
    FANBOOK_GUILD_ID,
    [Number(process.env.FANBOOK_ID)],
  );
  await operate({
    type: process.env.TYPE === '添加' ? 'onboard' : 'dismiss',
    level: process.env.LEVEL as Level,
    fanbookUserId: fanbookUser.user.id,
  });
  logger.info('处理完成');
});
