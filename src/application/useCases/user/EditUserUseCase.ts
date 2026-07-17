import { Session } from "../../../infrastructure/db/entities/session.entity.js";
import {User} from "../../../infrastructure/db/entities/user.entity.js";
import {AppDataSource} from "../../../infrastructure/db/AppDataSource.js";
import {Repository} from "typeorm";
import {generateRandomString} from "../../../shared/utils/GenerateRandomString.js";
import {PasswordHasher} from "../../../shared/utils/PasswordHasher.js";

export class EditUserUseCase {

    private static _instance: EditUserUseCase;

    private _userRepository: Repository<User>;

    private constructor() {
        this._userRepository = AppDataSource.getRepository(User);
    }

    static getInstance(): EditUserUseCase {
        if (!EditUserUseCase._instance) {
            EditUserUseCase._instance = new EditUserUseCase();
        }
        return EditUserUseCase._instance;
    }

    async execute(userId: number, newUsername: string | undefined = undefined, newEmail : string | undefined = undefined, newPassword: string | undefined = undefined): Promise<User> {
        const user: User | null = await this._userRepository.findOneBy({ id: userId });
        if (!user)
            throw Error("User not found");

        const editedUser = { ...user}

        editedUser.username = newUsername ? newUsername : user.username;
        editedUser.email = newEmail ? newEmail : user.email;
        editedUser.hashedPassword = newPassword ? await PasswordHasher.hash(newPassword) : user.hashedPassword

        return await this._userRepository.save(editedUser);
    }
}
