import type { VovkBody, VovkParams } from "vovk";
import type UserController from "./UserController";
import PrismaService from "../prisma/PrismaService";

export default class UserService {
  static getUsers = () => PrismaService.client.user.findMany();

  static findUsers = async (search: string) =>
    PrismaService.client.user.findMany({
      where: {
        OR: [
          { id: search },
          { fullName: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ],
      },
    });

  static createUser = (data: VovkBody<typeof UserController.createUser>) =>
    PrismaService.client.user.create({
      data: {
        ...data,
        imageUrl: `https://i.pravatar.cc/300?u=${data.email}`,
      },
    });

  static updateUser = (
    id: VovkParams<typeof UserController.updateUser>["id"],
    data: VovkBody<typeof UserController.updateUser>,
  ) =>
    PrismaService.client.user.update({
      where: { id },
      data,
    });

  static deleteUser = async (
    id: VovkParams<typeof UserController.updateUser>["id"],
  ) =>
    Object.assign(await PrismaService.client.user.delete({ where: { id } }), {
      __isDeleted: true,
    });
}
