const { getPool, sql } = require("../config/db");

// Create a new ticket
async function createTicket(req, res) {
    const { title, description, priority } = req.body;
    try {
        const pool = await getPool();
        const result = await pool.request()
            .input("user_id", sql.Int, req.user.id)
            .input("title", sql.NVarchar, title)
            .input("description", sql.NVarchar, description)
            .input("priority", sql.NVarchar, priority || 'low')
            .query(`
                INSERT INTO Ticket (user_id, title, description, priority)
                OUTPUT INSERTED.*
                VALUES (@user_id, @title, @description, @priority)
            `);
        
        res.status(201).json(result.recordset[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
}

// Get all tickets for the logged-in user (or all tickets if admin/agent)
async function getAllUserTickets(req, res) {
    try {
        const pool = await getPool();
        
        let query = "SELECT * FROM Ticket ORDER BY created_at DESC";
        const request = pool.request();
        
        // If standard user, filter to only their own tickets
        if (req.user.role === 'user') {
            query = "SELECT * FROM Ticket WHERE user_id = @user_id ORDER BY created_at DESC";
            request.input("user_id", sql.Int, req.user.id);
        }
        
        const result = await request.query(query);
        res.json(result.recordset);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
}

// Get a specific ticket by ID
async function getTicketById(req, res) {
    const { id } = req.params;
    try {
        const pool = await getPool();
        const result = await pool.request()
            .input("id", sql.Int, id)
            .query("SELECT * FROM Ticket WHERE id = @id");
            
        if (result.recordset.length === 0) {
            return res.status(404).json({ message: "Ticket not found" });
        }
        
        const ticket = result.recordset[0];
        
        // Authorization check: user must own the ticket or be admin/agent
        if (ticket.user_id !== req.user.id && req.user.role === 'user') {
            return res.status(403).json({ message: "Unauthorized to view this ticket" });
        }
        
        res.json(ticket);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
}

// Update a ticket (status or priority)
async function updateTicket(req, res) {
    const { id } = req.params;
    const { status, priority } = req.body;
    try {
        const pool = await getPool();
        
        // Check if ticket exists
        const ticketCheck = await pool.request()
            .input("id", sql.Int, id)
            .query("SELECT user_id FROM Ticket WHERE id = @id");
            
        if (ticketCheck.recordset.length === 0) {
            return res.status(404).json({ message: "Ticket not found" });
        }
        
        // Only agents/admins or the ticket owner can update
        if (ticketCheck.recordset[0].user_id !== req.user.id && req.user.role === 'user') {
            return res.status(403).json({ message: "Unauthorized to update this ticket" });
        }

        // Update the ticket
        const result = await pool.request()
            .input("id", sql.Int, id)
            .input("status", sql.NVarchar, status)
            .input("priority", sql.NVarchar, priority)
            .query(`
                UPDATE Ticket 
                SET status = ISNULL(@status, status), 
                    priority = ISNULL(@priority, priority),
                    updated_at = GETDATE()
                OUTPUT INSERTED.*
                WHERE id = @id
            `);
            
        res.json(result.recordset[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
}

// Delete a ticket
async function deleteTicket(req, res) {
    const { id } = req.params;
    try {
        const pool = await getPool();
        
        // Check if ticket exists
        const ticketCheck = await pool.request()
            .input("id", sql.Int, id)
            .query("SELECT user_id FROM Ticket WHERE id = @id");
            
        if (ticketCheck.recordset.length === 0) {
            return res.status(404).json({ message: "Ticket not found" });
        }
        
        // Only owner or admin can delete
        if (ticketCheck.recordset[0].user_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: "Unauthorized to delete this ticket" });
        }
        
        await pool.request()
            .input("id", sql.Int, id)
            .query("DELETE FROM Ticket WHERE id = @id");
            
        res.json({ message: "Ticket deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
}

module.exports = { 
    createTicket, 
    getAllUserTickets, 
    getTicketById, 
    updateTicket, 
    deleteTicket 
};
