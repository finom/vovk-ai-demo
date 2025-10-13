import type { VovkBody, VovkParams } from "vovk";
import type UserController from "./UserController";
import DatabaseService from "../database/DatabaseService";

export default class UserService {
  static getUsers = () => DatabaseService.prisma.user.findMany();

  static findUsers = (search: string) =>
    DatabaseService.prisma.user.findMany({
      where: {
        OR: [
          { id: search },
          { fullName: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ],
      },
    });

  static createUser = (data: VovkBody<typeof UserController.createUser>) =>
    DatabaseService.prisma.user.create({
      data: {
        ...data,
        imageUrl: `https://i.pravatar.cc/300?u=${data.email}`,
      },
    });

  static updateUser = (
    id: VovkParams<typeof UserController.updateUser>["id"],
    data: VovkBody<typeof UserController.updateUser>,
  ) =>
    DatabaseService.prisma.user.update({
      where: { id },
      data,
    });

  static deleteUser = (
    id: VovkParams<typeof UserController.updateUser>["id"],
  ) => DatabaseService.prisma.user.delete({ where: { id } });
}
