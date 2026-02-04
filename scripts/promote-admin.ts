import db from "../lib/mongodb";
import { User } from "../models/user";
import fs from "fs";
import path from "path";

// Load .env.local manualy since ts-node doesn't do it automatically
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, "utf8");
    envFile.split("\n").forEach(line => {
        const [key, value] = line.split("=");
        if (key && value) {
            process.env[key.trim()] = value.trim().replace(/['"]/g, "");
        }
    });
}

async function promoteToAdmin(email: string) {
    try {
        await db();
        const user = await User.findOne({ email });

        if (!user) {
            console.error(`User with email ${email} not found.`);
            process.exit(1);
        }

        user.role = "admin";
        await user.save();

        console.log(`Successfully promoted ${user.name} (${email}) to admin.`);
        process.exit(0);
    } catch (error) {
        console.error("Error promoting user:", error);
        process.exit(1);
    }
}

const email = process.argv[2];
if (!email) {
    console.error("Please provide an email address: npx ts-node scripts/promote-admin.ts user@example.com");
    process.exit(1);
}

promoteToAdmin(email);
