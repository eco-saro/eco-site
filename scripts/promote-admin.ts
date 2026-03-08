import db from "../lib/mongodb";
import { User } from "../models/user";
import fs from "fs";
import path from "path";

// Load .env.local manualy since ts-node doesn't do it automatically
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, "utf8");
    envFile.split("\n").forEach(line => {
        const index = line.indexOf("=");
        if (index !== -1) {
            const key = line.substring(0, index).trim();
            const value = line.substring(index + 1).trim().replace(/['"]/g, "");
            if (key) {
                process.env[key] = value;
            }
        }
    });
}

async function promoteToAdmin(email: string) {
    try {
        console.log("Connecting to database...");
        console.log("MONGODB_URI:", process.env.MONGODB_URI ? "Defined" : "Not Defined");
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
