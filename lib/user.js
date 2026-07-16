const DEFAULT_USER_ID = 'default'

export async function getDefaultUser(prisma) {
  let user = await prisma.user.findUnique({ where: { id: DEFAULT_USER_ID } })
  if (!user) {
    user = await prisma.user.create({
      data: {
        id: DEFAULT_USER_ID,
        email: 'default@conursei.local',
        name: 'Usuário',
      },
    })
  }
  return user
}

export { DEFAULT_USER_ID }
