import argon2 from "argon2";

export class PasswordHasher {
    private static readonly OPTIONS: argon2.Options = {
        type: argon2.argon2id,
        memoryCost: 19456, // 19 MiB
        timeCost: 2,        // itérations
        parallelism: 1,
    };

    static async hash(plainPassword: string): Promise<string> {
        return argon2.hash(plainPassword, this.OPTIONS);
    }

    static async verify(hashedPassword: string, plainPassword: string): Promise<boolean> {
        try {
            return await argon2.verify(hashedPassword, plainPassword);
        } catch {
            return false;
        }
    }
}