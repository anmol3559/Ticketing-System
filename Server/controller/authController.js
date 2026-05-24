const bcrypt = require("bcrypt");
const { getPool, sql } = require("../config/db");
const jwt = require("jsonwebtoken");

async function register(req, res) {
    const { name, email, password } = req.body;
    try {
        const pool = await getPool();
        const existing = await pool.request()
            .input("email", sql.NVarchar, email)
            .input("SELECT id FROM User WHERE email = @email");

        if (existing.recordset.length > 0)
            return res.status(400).json({ message: "Email already exists" })

        const hash = await bcrypt.hash(password, 10)
        const result = await pool.request()
            .input("name", sql.NVarchar, name)
            .input("email", sql.NVarchar, email)
            .input("password", sql.NVarchar, hash)
            .query(`INSERT INTO "User" (name, email, password)
                    OUTPUT INSERTED.id, INSERTED.name, INSERTED.email, INSERTED.role   
                    VALUES (@name, @email, @password)`)

        const user = result.recordset[0]

        const token = jwt.sign(
            { id: user.id, name: user.name, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );
        res.status(201).json({ token, user })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: error.message })

    }

}

async function login(req, res) {
    const { email, password } = req.body;
    try {
        const pool = await getPool();
        const result = await pool.request()
            .input("email", sql.NVarchar, email)
            .query(`SELECT * FROM "User" WHERE email = @email AND is_active = 1`)

        if (result.recordset.length === 0)
            return res.status(401).json({ message: "Invalid credentials" })

        const user = result.recordset[0]
        const isPasswordValid = await bcrypt.compare(password, user.password)
        if (!isPasswordValid)
            return res.status(401).json({ message: "Invalid credentials" })

        await pool.request()
            .input("id", sql.Int, user.id)
            .query(`UPDATE "User" SET last_login = GETDATE() WHERE id = @id`)


        const token = jwt.sign(
            { id: user.id, name: user.name, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );
        res.json({
            token,
            user: { id: user.id, name: user.name, email: user.email, role: user.role }
        })
        //res.status(200).json({ token, user })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: error.message })
    }
}

async function profile(req, res) {
    try {
        const pool = await getPool();
        const result = await pool.request()
            .request()
            .input('id', sql.Int, req.user.id)
            .query(`SELECT id, name, email, role, created_at, last_login FROM "User" WHERE id = @id`)
        res.json(result.recordset[0])
        if (result.recordset.length === 0)
            return res.status(404).json({ message: "User not found" })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: err.message })
    }
}

module.exports = { register, login, profile };






