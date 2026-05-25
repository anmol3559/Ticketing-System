const { getPool, sql } = require("../config/db");


async function logActivity(userId, action, description = "", ip = "") {
    try {
        const pool = await getPool();
        await pool.request()
            .input("userId", sql.Int, userId)
            .input("action", sql.NVarchar, action)
            .input("description", sql.NVarchar, description)
            .input("ip", sql.NVarchar, ip)
            .query(`INSERT INTO "ActivityLog" (user_id, action, description, ip_address, created_at)
                    VALUES (@user_id, @action, @description, @ip, GETDATE())`)
    } catch (err) {
        console.error("Activity log error: ", err.message);
    }
}   